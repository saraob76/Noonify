import { useState } from "react";
import axios from "axios";

const AIAssistant = () => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {

    if (!message.trim()) return;

    const userMessage = {
        sender: "user",
        text: message
    };

    setMessages(prev => [...prev, userMessage]);

    const currentMessage = message;

    setMessage("");

    setLoading(true);

    try {

        const { data } = await axios.post(
            "http://localhost:4000/api/ai/chat",
            {
                message: currentMessage
            }
        );

        setMessages(prev => [
            ...prev,
            {
                sender: "ai",
                text: data.reply
            }
        ]);

    } catch (error) {

        setMessages(prev => [
            ...prev,
            {
                sender: "ai",
                text: "❌ AI Server Error"
            }
        ]);

        console.log(error);

    }

    setLoading(false);

};

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center p-6">

            <div className="bg-white shadow-xl rounded-xl w-full max-w-4xl h-[700px] flex flex-col">

                {/* Header */}

                <div className="bg-indigo-700 text-white text-2xl font-bold p-5 rounded-t-xl">

                    🎓 UniSphere AI Assistant

                </div>

                {/* Chat */}

                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    {messages.length === 0 && (

                        <div className="text-gray-400 text-center mt-20">

                            Ask me anything about your university studies.

                        </div>

                    )}

                    {messages.map((msg, index) => (

                        <div
                            key={index}
                            className={`flex ${msg.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                        >

                            <div
                                className={`max-w-[70%] px-4 py-3 rounded-xl whitespace-pre-wrap ${msg.sender === "user"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 text-black"
                                    }`}
                            >

                                {msg.text}

                            </div>

                        </div>

                    ))}

                </div>

                {/* Input */}

                <div className="border-t p-4 flex gap-3">

                    <input
    type="text"
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={(e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    }}
    placeholder="Ask UniSphere AI..."
    className="flex-1 border rounded-lg px-4 py-3 outline-none"
/>

                    <button
    onClick={sendMessage}
    disabled={loading}
    className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 rounded-lg"
>
    {loading ? "Thinking..." : "Send"}
</button>

                </div>

            </div>

        </div>
    );
};

export default AIAssistant;