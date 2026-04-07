import jwt from 'jsonwebtoken'
import User from '../model/userModel.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({ message: "user doesn't have a token" });
        }
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const userId = payload.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "no existing user with this email" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(500).json({ message: "error in auth middleware" });
    }
}






