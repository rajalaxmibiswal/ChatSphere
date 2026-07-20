import db from "../lib/db.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// Get users for sidebar
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await db.execute(
      `SELECT id, fullName, email, profilePic, bio
       FROM users
       WHERE id != ?`,
      [userId]
    );

    const unseenMessages = {};

    for (const user of users) {
      const [messages] = await db.execute(
        `SELECT COUNT(*) AS total
         FROM messages
         WHERE senderId = ?
         AND receiverId = ?
         AND seen = false`,
        [user.id, userId]
      );

      if (messages[0].total > 0) {
        unseenMessages[user.id] =
          messages[0].total;
      }
    }

    res.json({
      success: true,
      users,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get messages
export const getMessages = async (req, res) => {
  try {
    const selectedUserId =
      req.params.id;

    const myId = req.user.id;

    const [messages] = await db.execute(
      `
      SELECT *
      FROM messages
      WHERE
      (senderId = ? AND receiverId = ?)
      OR
      (senderId = ? AND receiverId = ?)
      ORDER BY createdAt ASC
      `,
      [
        myId,
        selectedUserId,
        selectedUserId,
        myId,
      ]
    );

    await db.execute(
      `
      UPDATE messages
      SET seen = true
      WHERE senderId = ?
      AND receiverId = ?
      `,
      [selectedUserId, myId]
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark message as seen
export const markMessageAsSeen = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    await db.execute(
      `
      UPDATE messages
      SET seen = true
      WHERE id = ?
      `,
      [id]
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// send Messages
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const receiverId = req.params.id;

    const text = req.body?.text || "";
    const image = req.body?.image || null;
    
    let imageUrl = null;

    if (image) {
      const uploadResponse =
        await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }

    const [result] = await db.execute(
      `INSERT INTO messages
      (senderId, receiverId, text, image)
      VALUES (?, ?, ?, ?)`,
      [senderId, receiverId, text, imageUrl]
    );

    const [newMessage] = await db.execute(
      `SELECT * FROM messages WHERE id = ?`,
      [result.insertId]
    );

    const receiverSocketId =
      userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "newMessage",
        newMessage[0]
      );
    }

    res.status(201).json({
      success: true,
      newMessage: newMessage[0],
    });

  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};