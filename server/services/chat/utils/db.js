import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected in chat service ✅")
    }catch(error){
        console.log("error in connecting db in chat service ", error.message);
    }
}