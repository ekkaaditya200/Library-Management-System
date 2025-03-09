export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken();
  res.cookie("token", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === "production", // Only true in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    httpOnly: true,
  });
  res.status(statusCode).json({
    success: true,
    user,
    message,
    token,
  });
};
