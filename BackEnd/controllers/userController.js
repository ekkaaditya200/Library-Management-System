//! 5:14:00
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { fineCalculate } from "../utils/fineCalculate.js";
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'

export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({accountVerified:true});
  if (!users) {
    return next(new ErrorHandler("No users found", 404));
  }
  res.status(200).json({
    success: true,
    users,
  });
});


export const registerNewAdmin = catchAsyncErrors(async (req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Admin avatar is required.", 400));
    }
    const {name, email, password} = req.body;
    if(!name || !email || !password){
        return next(new ErrorHandler("Please fill in all fields.", 400));
    }
    const isRegistered = await User.findOne({email, accountVerified:true});
    if(isRegistered){
        return next(new ErrorHandler("User already exists.", 400));
    }
    if(password.length < 8 || password.length >16){
        return next(new ErrorHandler("Password must be between 8 and 16 characters.", 400));
    }
    const {avatar} = req.files;
    const allowFormats = ["image/jpeg", "image/png", "image/webp, image/heic"];

    if(!allowFormats.includes(avatar.mimetype)){
        return next(new ErrorHandler("Invalid file format. Only JPEG, PNG and WEBP are allowed.", 400))
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,{
            folder:"LIBRARY_MANAGEMENT_SYSTEM_ADMIN_AVATARS"
        }
    )

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary error:", cloudinaryResponse.error) || "Unknown Cloudinary Error.";

        return next(new ErrorHandler("Failed to upload avatar.", 500));
    }

    const admin = await User.create({
        name,
        email,
        password:hashedPassword,
        role:"Admin",
        accountVerified:true,
        avatar:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        },
    });

    res.status(201).json({
        success:true,
        message:"Admin Registered Succesfully!",
        admin,
    })
})