import axios from "axios";

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
               model: "inclusionai/ling-3.0-flash:free",

                messages: [
                    {
                        role: "system",
                        content: `
You are UniSphere AI.

You only answer academic and university related questions.

If the question is unrelated politely refuse.

Answer clearly and shortly.
`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return res.json({
            success: true,
            reply: response.data.choices[0].message.content
        });

    } catch (error) {

        console.error(error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            message: "AI Server Error"
        });
    }
};