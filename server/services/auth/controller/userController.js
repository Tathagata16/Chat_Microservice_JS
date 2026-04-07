import User from "../model/userModel.js"

export const getAllUsers = async (req,res) =>{
    try{
        const users = await User.find({}).select("-password");
        res.status(200).json(users);
    }catch(error){
        res.status(500).json({message: "error fetching all users"});
    }
}