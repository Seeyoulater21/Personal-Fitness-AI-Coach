
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const systemMessage = {
        role: "system",
        content: `You are a nutrition assistant. You only answer with macronutrients for the requested food. 
        Format strictly as follows:
        kcal : [number]
        protien : [number]
        fat : [number]
        carb : [number]
        
        Do not add conversational text. If the food is not found or unclear, provide the best estimate for a standard serving.
        Example output:
        kcal : 70
        protien : 6
        fat : 5
        carb : 0`,
    };

    // List of models to try in order (using valid OpenRouter free/experimental IDs)
    const models = [
        "google/gemini-2.0-flash-exp:free",
        "google/gemini-2.0-pro-exp-02-05:free",
        "google/gemini-exp-1206:free",
        "google/gemini-2.0-flash-thinking-exp:free"
    ];

    console.log("Nutrition Chat API v2.0 - Request received");

    for (const model of models) {
        try {
            console.log(`Attempting with model: ${model}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/Seeyoulater21/Personal-Fitness-AI-Coach",
                    "X-Title": "Personal Fitness Coach",
                },
                body: JSON.stringify({
                    model: model,
                    messages: [systemMessage, ...messages],
                    temperature: 0.1,
                    max_tokens: 200,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`Model ${model} failed:`, response.status, errorText);
                continue; // Try next model
            }

            const data = await response.json();
            return NextResponse.json(data);
        } catch (error) {
            console.error(`Error with model ${model}:`, error);
            // Continue to next model
        }
    }

    return NextResponse.json({ error: "All AI models failed to respond." }, { status: 500 });
}
