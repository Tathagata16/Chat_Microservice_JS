import User from "../model/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';



export const signup = async (req, res) => {
    try {
        const { username, email, password, avatar, bio } = req.body;
        console.log(req.body);
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already Exists" });
        }

        //now there is no existing user -> create existing user then
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar,
            bio,
        })
        //new user created;

        //make a jwt token to send through cookies
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            maxAge: 3600 * 1000 * 24 * 7,
            httpOnly: true,//to be changed in prod
            secure: false,
            sameSite: 'lax'
        });

        res.status(200).json({ message: "user created successfully" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error",user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email
            } });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        };

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No user with this email" });
        }

        //now user is there.compare password;
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            maxAge: 3600 * 1000 * 24 * 7,
            httpOnly: true,//to be changed in prod
            secure: false,
            sameSite: 'lax'
        });

        res.status(200).json({
            message: "Login successfull", user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error in login controller" });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error in logout controller" });
    }
}