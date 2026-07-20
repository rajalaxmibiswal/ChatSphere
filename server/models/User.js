import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

export const createUser = async (
    email,
    fullName,
    password,
    profilePic = "",
    bio = ""
) => {
    

    const query = `
    INSERT INTO users
    (email, fullName, password, profilePic, bio)
    VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(
        query,
        [email, fullName, password, profilePic, bio]
    );

    return result;

};

export default db;