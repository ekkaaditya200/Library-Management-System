// const express = require("express");
import express, { application } from "express"; //For type module
import { config } from "dotenv";
config({ path: "./config/config.env" });

import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./database/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js"
import bookRouter from "./routes/bookRouter.js"
import borrowRouter from "./routes/borrowRouter.js"
import userRouter from "./routes/userRouter.js"
import expressFileupload from 'express-fileupload'
import { notifyUsers } from "./services/notifyUsers.js";
import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";

export const app = express();


app.use(cookieParser());

app.use(express.json()); //To use any middleware - To use json data sent by frontend if we are not using body parser
app.use(express.urlencoded({ extended: true }));

app.use(expressFileupload({
  useTempFiles:true,
  tempFileDir:"/tmp/"
}))

app.use(
  cors({
    origin: [process.env.FRONTEND],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/",(req,res)=>{
  res.send("BackEnd is Live Now!");
})
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);
app.use("/api/v1/borrow", borrowRouter);
app.use("/api/v1/user", userRouter);


notifyUsers();
removeUnverifiedAccounts();
connectDB();

app.use(errorMiddleware) //This is middleware as it has not () at the end
