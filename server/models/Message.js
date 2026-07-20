import db from "../lib/db.js";

const Message = {

    // Create message

    create: async ({
        senderId,
        receiverId,
        text,
        image
    }) => {

        const [result] = await db.execute(
            `INSERT INTO messages
            (senderId, receiverId, text, image)
            VALUES (?, ?, ?, ?)`,
            [
                senderId,
                receiverId,
                text,
                image
            ]
        );

        return result;
    },

    // Get messages

    findMessages: async (
        senderId,
        receiverId
    ) => {

        const [messages] = await db.execute(
            `SELECT * FROM messages
             WHERE
             (senderId = ? AND receiverId = ?)
             OR
             (senderId = ? AND receiverId = ?)
             ORDER BY createdAt ASC`,
            [
                senderId,
                receiverId,
                receiverId,
                senderId
            ]
        );

        return messages;
    },

    // Mark seen

    markAsSeen: async (id) => {

        await db.execute(
            `UPDATE messages
             SET seen = 1
             WHERE id = ?`,
            [id]
        );
    }

};

export default Message;