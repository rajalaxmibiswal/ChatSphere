import jwt from "jsonwebtoken";
import db from "../lib/db.js";

export const protectRoute = async (
    req,
    res,
    next
) => {

    try {

        const token = req.headers.token;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "No Token"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const [users] = await db.execute(
            `SELECT
                id,
                fullName,
                email,
                profilePic,
                bio
             FROM users
             WHERE id=?`,
            [decoded.userId]
        );

        if (users.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = users[0];

        next();

    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

