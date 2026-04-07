import jwt from "jsonwebtoken";

export const authMiddleware = async(req, res, next) =>{
    try {
        const token = req.cookies.token;

        if (!token) return res.status(401).send("Unauthorized");


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { _id: decoded.userId };
        next();
    } catch (error) {
        return res.status(500).json({ message: "error in auth middleware" });
    }
}

