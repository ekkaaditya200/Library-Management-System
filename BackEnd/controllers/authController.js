import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { sendVerificationCode } from "../utils/sendVerificationCode.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utils/sendToken.js";
import { generateForgotPasswordEmailTemplate } from "../utils/emailTemplate.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new ErrorHandler("Please enter all field.", 400));
    }

    const isRegistered = await User.findOne({ email, accountVerified: true });
    if (isRegistered) {
      return next(new ErrorHandler("User already registered.", 400));
    }

    const registrationAttemptByUser = await User.find({
      email,
      accountVerified: false,
    });

    if (registrationAttemptByUser.length >= 5) {
      return next(
        new ErrorHandler(
          "You have exceeded the number of registration attempts. Please contact support.",
          400
        )
      );
    }

    if (password.length < 8 || password.length > 16) {
      return next(
        new ErrorHandler("Password must be between 8 and 16 character", 400)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const verificationCode = await user.generateVerificationCode();
    await user.save();

    sendVerificationCode(verificationCode, email, res);
  } catch (error) {
    next(error);
  }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new ErrorHandler("Email or OTP is missing.", 400));
  }
  try {
    const userAllEntries = await User.find({
      email,
      accountVerified: false,
    }).sort({ createdAt: -1 });

    if (!userAllEntries) {
      return next(new ErrorHandler("User not Found.", 400));
    }

    let user;

    if (userAllEntries.length > 1) {
      user = userAllEntries[0];
      await User.deleteMany({
        _id: { $ne: user._id },
        email,
        accountVerified: false,
      });
    } else {
      user = userAllEntries[0];
    }

    if (user.verificationCode !== Number(otp)) {
      return next(new ErrorHandler("Invalid OTP", 400));
    }

    const currentTime = Date.now();

    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime(); //Get the currect formate

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler("OTP expired.", 400));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;

    await user.save({ validateModifiedOnly: true });
    console.log("Came here", email, otp);
    sendToken(user, 200, "Account Verified.", res);
    console.log("Token Sent");
  } catch (error) {
    return next(new ErrorHandler("Internal Server Error.", 500));
  }
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }
  const user = await User.findOne({ email, accountVerified: true }).select(
    "+password"
  );
  if (!user) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password.", 400));
  }

  sendToken(user, 200, "User Login Successfully.", res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

export const deleteUser = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndDelete({ email });
    res.status(200).json({ message: "User Delete Succesufully." });
  } catch (error) {
    res.status(400).json({ message: "Error in Deleting the User" });
  }
};

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user; // From Middleware isAuthenticated
  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("Email is required", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
    accountVerified: true,
  });

  if (!user) {
    return next(new ErrorHandler("Invalid email.", 400));
  }

  //! Time - 2:55:00
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  console.log(resetPasswordUrl);
  const message = generateForgotPasswordEmailTemplate(resetPasswordUrl);
  try {
    await sendEmail({
      email: user.email,
      subject: "AILMS Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email Sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Rest Password Token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password does not match.", 400)
    );
  }

  console.log(req.body.password, req.body.confirmPassword);

  if (
    req.body.password.length < 8 ||
    req.body.password.length > 16 ||
    req.body.confirmPassword.length < 8 ||
    req.body.confirmPassword.length > 16
  ) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters.", 400)
    );
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  sendToken(user, 200, "Password reset successfully", res);
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please enter all fields.", 400));
  }
  const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Current Password is incorrect.", 400));
  }
  if (
    newPassword.length < 8 ||
    newPassword.length > 16 ||
    confirmNewPassword.length < 8 ||
    confirmNewPassword.length > 16
  ) {
    return next(
      new ErrorHandler("Password must be between 8 and 16 characters.", 400)
    );
  }
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password does not match.", 400)
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({
    success:true,
    message:"Password Updated Successfully!",
  });
});
