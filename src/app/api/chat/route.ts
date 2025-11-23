import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Fetch today's context
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const [dailyLog, settings, latestWeightLog, latestBodyFatLog] = await Promise.all([
            prisma.dailyLog.findFirst({
                where: {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                include: {
                    workouts: { include: { exercises: true } },
                    meals: true,
                },
            }),
            prisma.settings.findFirst(),
            prisma.dailyLog.findFirst({
                where: { weight: { not: null } },
                orderBy: { date: 'desc' },
                select: { weight: true }
            }),
            prisma.dailyLog.findFirst({
                where: { bodyFat: { not: null } },
                orderBy: { date: 'desc' },
                select: { bodyFat: true }
            })
        ]);

        const currentWeight = dailyLog?.weight || latestWeightLog?.weight || "Not logged";
        const currentBodyFat = dailyLog?.bodyFat || latestBodyFatLog?.bodyFat || "Not logged";

        const defaultPrompt = `
    User Context:
    Date: ${new Date().toLocaleDateString()}
    Weight: ${currentWeight} kg (Goal: ${settings?.targetWeight || 80}kg)
    Body Fat: ${currentBodyFat} % (Goal: ${settings?.bodyFatGoal || 15}%)
    Calories: ${dailyLog?.meals.reduce((acc, m) => acc + m.calories, 0) || 0} kcal (Goal: ${settings?.calorieGoal || 2200})
    Protein: ${dailyLog?.meals.reduce((acc, m) => acc + m.protein, 0) || 0} g (Goal: ${settings?.proteinGoal || 180}g)
    Workouts: ${dailyLog?.workouts.map(w => w.type).join(", ") || "None"}
    
    Protocol:
    - Protein ${settings?.proteinGoal || 180}g+ daily
    - Weight training 3x/week (Mon/Wed/Fri)
    - Low GI carbs only
    - Fasting 18:00-11:00
    
    You are a strict but encouraging fitness coach. Use the context to give specific advice.
  `;

        const context = settings?.customPrompt
            ? settings.customPrompt
                .replace("{{WEIGHT}}", String(currentWeight))
                .replace("{{BODY_FAT}}", String(currentBodyFat))
                .replace("{{GOALS}}", `Target Weight: ${settings?.targetWeight}kg, Body Fat Goal: ${settings?.bodyFatGoal}%`)
            + `\n\nContext Data:\n${defaultPrompt}` // Append default context data for reference
            : defaultPrompt;

        const systemMessage = {
            role: "system",
            content: context,
        };

        const model = settings?.aiModel || "openai/gpt-4o-mini";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: model,
                messages: [systemMessage, ...messages],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }
}
