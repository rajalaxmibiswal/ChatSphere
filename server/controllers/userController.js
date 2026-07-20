import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../lib/db.js";
import cloudinary from "../lib/cloudinary.js";

// Signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const [result] = await db.execute(
      `
      INSERT INTO users
      (fullName, email, password)
      VALUES (?, ?, ?)
      `,
      [fullName, email, hashedPassword]
    );

    const token = jwt.sign(
      {
        userId: result.insertId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Signup Successful",
      token,
      user: {
        id: result.insertId,
        fullName,
        email,
        profilePic: "",
        bio: "",
      },
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
      },
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Profile
export const updateProfile = async (
  req,
  res
) => {
  try {
    const { profilePic, bio } = req.body;

    let imageUrl = null;

    if (profilePic) {
      const uploadResponse =
        await cloudinary.uploader.upload(
          profilePic
        );

      imageUrl =
        uploadResponse.secure_url;
    }

    if (imageUrl) {
      await db.execute(
        `
        UPDATE users
        SET profilePic = ?, bio = ?
        WHERE id = ?
        `,
        [
          imageUrl,
          bio,
          req.user.id,
        ]
      );
    } else {
      await db.execute(
        `
        UPDATE users
        SET bio = ?
        WHERE id = ?
        `,
        [
          bio,
          req.user.id,
        ]
      );
    }

    const [updatedUser] =
      await db.execute(
        `
        SELECT
          id,
          fullName,
          email,
          profilePic,
          bio
        FROM users
        WHERE id = ?
        `,
        [req.user.id]
      );

    res.json({
      success: true,
      user: updatedUser[0],
      message:
        "Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check Authentication
export const checkAuth = async (
  req,
  res
) => {
  try {
    const [users] = await db.execute(
      `
      SELECT
        id,
        fullName,
        email,
        profilePic,
        bio
      FROM users
      WHERE id = ?
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};