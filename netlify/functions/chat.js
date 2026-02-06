

const apiKey = process.env.GEMINI_API_KEY;

exports.handler = async (event, context) => {
    // 1. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. Parse Body
        if (!event.body) {
            return { statusCode: 400, body: JSON.stringify({ error: 'No request body' }) };
        }

        const { message } = JSON.parse(event.body);

        // 3. Check configuration
        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

        if (!apiKey) {
            console.error('SERVER ERROR: GEMINI_API_KEY is missing.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Server configuration missing' })
            };
        }

        // 4. Construct Prompt
        const systemPrompt = `You are the Official AI Assistant of Mustaf Upziye.
        Answer strictly about his portfolio, skills, and projects.
        If asked in Somali, answer in Somali.
        If asked in English, answer in English.
        User Question: "${message}"`;

        // 5. Call API using native fetch
        // ✅ Corrected: Using 'gemini-1.5-flash' which is the standard reliable model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt }]
                    }]
                })
            }
        );

        const data = await response.json();

        // 6. Handle API Errors
        if (!response.ok) {
            console.error('Gemini API Error:', JSON.stringify(data));
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'AI Service Error', details: data })
            };
        }

        // 7. Extract Text
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reply })
        };

    } catch (error) {
        console.error('Function Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Function Error', message: error.message })
        };
    }
};
