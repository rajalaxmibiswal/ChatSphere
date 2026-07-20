import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ✅ GET USERS (MySQL)
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");

      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ GET MESSAGES (MySQL)
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);

      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ SEND MESSAGE (MySQL FIXED)
  const sendMessage = async (messageData) => {
    try {
      const receiverId = selectedUser?.id;

      if (!receiverId) {
        toast.error("No user selected");
        return;
      }

      const { data } = await axios.post(
  `/api/messages/send/${receiverId}`,
  messageData
);

      if (data.success) {

        await getMessages(receiverId);
      }else {
        toast.error(data.message || "Message failed");
      }
    } catch (error) {
      console.log("SEND MESSAGE ERROR:", error.response?.data || error.message);
      toast.error("Message failed to send");
    }
  };

  // ✅ SOCKET LISTENER (MySQL-safe IDs)
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const senderId = newMessage.senderId;

      if (selectedUser && senderId === selectedUser.id) {
        newMessage.seen = true;

        setMessages((prev) => [...prev, newMessage]);

        axios.put(`/api/messages/mark/${newMessage.id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,
        getMessages,
        setMessages,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};