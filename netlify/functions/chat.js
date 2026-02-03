

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { message } = JSON.parse(event.body);
        const api_key = process.env.GEMINI_API_KEY;

        if (!api_key) {
            return { statusCode: 500, body: JSON.stringify({ error: 'API Key not configured in Netlify' }) };
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${api_key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are the Official AI Assistant of Mustaf Upziye, a software developer and ICT Computer Science specialist. 
            Instruction: Respond to: "${message}". 
            Language Rule: Use Somali if the user speaks Somali, otherwise use English. 
            Style: Concise, professional, and friendly. 
            Topic: Only answer about Mustaf's skills, projects, and experience.`
                    }]
                }]
            })
        });

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I'm having trouble connecting right now.";

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
