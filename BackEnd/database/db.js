import mongoose from "mongoose";

export const connectDB = async()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName : "AILMS"
}).then(()=>{
    console.log("Database connected successfylly!")
}).catch((error)=>{
    console.log("Error")
})
}