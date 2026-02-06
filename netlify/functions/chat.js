

const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

exports.handler = async (event, context) => {
    // 1. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Allow': 'POST' }
        };
    }

    try {
        // 2. Parse the incoming body
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing request body' }) };
        }

        const { message } = JSON.parse(event.body);

        if (!message) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Message field is required' }) };
        }

        // 3. Get API Key from Environment Variables
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('SERVER ERROR: GEMINI_API_KEY is missing in Netlify environment variables.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Internal Server Configuration Error' })
            };
        }

        // 4. Initialize Google Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 5. Define the System Prompt
        const systemPrompt = `You are the Official AI Assistant of Mustaf Upziye, a senior software developer and ICT specialist.
        
        Your Goal: Answer questions about Mustaf's portfolio, skills, and projects based on the user's input.
        Tone: Professional, friendly, and concise.
        
        Rules:
        1. Language: Reply in Somali if the user asks in Somali. Reply in English if the user asks in English.
        2. Content: Focus ONLY on Mustaf's professional life, skills, and projects.
        3. Identity: Always stay in character as his assistant.
        
        User Question: "${message}"`;

        // 6. Generate Content
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const botReply = response.text();

        // 7. Return Success Response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply: botReply })
        };

    } catch (error) {
        console.error('Lambda Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
        };
    }
};
