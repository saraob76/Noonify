import { useRef, useState, useEffect } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice";
import toast from "react-hot-toast";
import api from "../api/axios";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { userId } = useParams();
  const { userId: currentUserId, getToken } = useAuth();
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  // ========================
  // FETCH MESSAGES
  // ========================
  useEffect(() => {
    const fetchUserMessages = async () => {
      try {
        const token = await getToken();
        dispatch(fetchMessages({ token, userId }));
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchUserMessages();
    return () => dispatch(resetMessages());
  }, [userId]);

  // ========================
  // SEND MESSAGE
  // ========================
  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const token = await getToken();
      const formData = new FormData();

      formData.append("to_user_id", userId);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const { data } = await api.post(
        "/api/message/send",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIX
          },
        }
      );

      if (data.success) {
        setText("");
        setImage(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ========================
  // SSE REALTIME 🔥
  // ========================
  useEffect(() => {
    if (!currentUserId) return;

    const eventSource = new EventSource(
      `http://localhost:4000/api/message/${currentUserId}` // ✅ FIX
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (
          data.sender === userId ||
          data.receiver === userId
        ) {
          dispatch(addMessage(data));
        }
      } catch (err) {
        console.log(err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [userId, currentUserId]);

  // ========================
  // USER (🔥 FIX جذري)
  // ========================
  useEffect(() => {
    // لا تعتمد على connections ❌
    setUser({
      _id: userId,
      full_name: "User",
      username: "chat_user",
      profile_picture: "https://i.pravatar.cc/150",
    });
  }, [userId]);

  // ========================
  // AUTO SCROLL
  // ========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ========================
  // LOADING
  // ========================
  if (!user) {
    return <div className="p-10 text-center">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-200 shadow-sm">
        <img src={user.profile_picture} className="size-11 rounded-full border-2 border-[#172357] object-cover" />
        <div>
          <p  className="font-semibold text-[#172357]">{user.full_name}</p>
          <p className="text-sm text-slate-500">@{user.username}</p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser =
              message.sender === currentUserId;

            return (
              <div
                key={index}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-3 max-w-sm rounded-2xl ${
  isCurrentUser
    ? "bg-[#172357] text-white shadow-md"
    : "bg-white text-slate-700 border border-slate-200 shadow-sm"
}`}
                >
                  {message.message_type === "image" && (
                    <img src={message.media_url} className="mb-2 rounded-xl max-w-full shadow" />
                  )}
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white flex items-center gap-3">
        <input
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#172357] focus:ring-2 focus:ring-[#172357]/20 transition"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <input
          type="file"
          hidden
          id="image"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label htmlFor="image">
          <ImageIcon className="cursor-pointer text-slate-500 hover:text-[#172357] transition" />
        </label>

        <button
    onClick={sendMessage}
    className="bg-[#172357] hover:bg-[#20398a] text-white p-3 rounded-xl transition shadow-md"
>
    <SendHorizonal size={18} />
</button>
      </div>
    </div>
  );
};

export default ChatBox;