exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            console.error('Missing GEMINI_API_KEY');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured in Netlify Settings.' })
            };
        }

        // Call Google Gemini API using native fetch (Node 18+)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the Official AI Assistant of Mustaf Upziye, a senior software developer. 
                        Respond concisely. Language: Somali if user uses Somali, otherwise English. 
                        Context: Answer questions about Mustaf's skills, projects, and software expertise.
                        User Message: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Gemini API call failed', details: data })
            };
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I'm having trouble generating a response.";

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reply: aiResponse })
        };

    } catch (error) {
        console.error('Error in AI function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
        };
    }
};
