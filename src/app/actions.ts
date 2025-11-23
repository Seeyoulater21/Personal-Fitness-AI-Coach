"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDailyLog(date: Date) {
    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const log = await prisma.dailyLog.findFirst({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            workouts: {
                include: {
                    exercises: true,
                },
            },
            meals: true,
        },
    });

    if (!log) {
        // Create a new log if it doesn't exist
        return await prisma.dailyLog.create({
            data: {
                date: startOfDay,
            },
            include: {
                workouts: {
                    include: {
                        exercises: true,
                    },
                },
                meals: true,
            },
        });
    }

    return log;
}

export async function updateWeight(id: string, weight: number) {
    await prisma.dailyLog.update({
        where: { id },
        data: { weight },
    });
    revalidatePath("/");
}

export async function updateBodyFat(id: string, bodyFat: number) {
    await prisma.dailyLog.update({
        where: { id },
        data: { bodyFat },
    });
    revalidatePath("/");
}

export async function getSettings() {
    const settings = await prisma.settings.findFirst();
    if (!settings) {
        return await prisma.settings.create({
            data: {},
        });
    }
    return settings;
}

export async function updateSettings(data: any) {
    const settings = await getSettings();
    await prisma.settings.update({
        where: { id: settings.id },
        data: {
            targetWeight: Number(data.targetWeight),
            bodyFatGoal: Number(data.bodyFatGoal),
            calorieGoal: Number(data.calorieGoal),
            proteinGoal: Number(data.proteinGoal),
            carbGoal: Number(data.carbGoal),
            fatGoal: Number(data.fatGoal),
            aiModel: data.aiModel,
            customPrompt: data.customPrompt,
        },
    });
    revalidatePath("/");
}

export async function logWorkout(dailyLogId: string, type: string, exercises: any[]) {
    const workout = await prisma.workoutLog.create({
        data: {
            dailyLogId,
            type,
            exercises: {
                create: exercises.map((ex) => ({
                    name: ex.name,
                    sets: Number(ex.sets),
                    reps: ex.reps,
                    weight: Number(ex.weight),
                })),
            },
        },
    });
    revalidatePath("/");
    return workout;
}

export async function deleteWorkoutLog(id: string) {
    await prisma.workoutLog.delete({
        where: { id },
    });
    revalidatePath("/");
    revalidatePath("/workout");
}

export async function logFood(dailyLogId: string, food: any) {
    await prisma.foodLog.create({
        data: {
            dailyLogId,
            name: food.name,
            calories: Number(food.calories),
            protein: Number(food.protein),
            carbs: Number(food.carbs),
            fats: Number(food.fats),
            mealType: food.mealType || "Any",
        },
    });
    revalidatePath("/");
    revalidatePath("/food");
    revalidatePath("/data");
}

export async function updateFoodLog(id: string, data: any) {
    await prisma.foodLog.update({
        where: { id },
        data: {
            name: data.name,
            calories: Number(data.calories),
            protein: Number(data.protein),
            carbs: Number(data.carbs),
            fats: Number(data.fats),
        },
    });
    revalidatePath("/");
    revalidatePath("/food");
    revalidatePath("/data");
}

export async function deleteFoodLog(id: string) {
    await prisma.foodLog.delete({
        where: { id },
    });
    revalidatePath("/");
    revalidatePath("/food");
    revalidatePath("/data");
}

export async function getWorkoutHistory() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const logs = await prisma.dailyLog.findMany({
        where: {
            date: {
                gte: oneYearAgo,
            },
            workouts: {
                some: {},
            },
        },
        select: {
            date: true,
            workouts: {
                select: {
                    id: true,
                },
            },
        },
    });

    return logs.map(log => ({
        date: log.date.toISOString().split('T')[0],
        count: log.workouts.length,
    }));
}

export async function getProgressHistory() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.dailyLog.findMany({
        where: {
            date: {
                gte: thirtyDaysAgo,
            },
            OR: [
                { weight: { not: null } },
                { bodyFat: { not: null } },
            ],
        },
        orderBy: {
            date: 'asc',
        },
        select: {
            date: true,
            weight: true,
            bodyFat: true,
        },
    });

    return logs.map(log => ({
        date: log.date.toISOString(),
        weight: log.weight,
        bodyFat: log.bodyFat,
    }));
}

export async function getAllLogs() {
    return await prisma.dailyLog.findMany({
        orderBy: {
            date: 'desc',
        },
        include: {
            workouts: {
                include: {
                    exercises: true,
                },
            },
            meals: true,
        },
    });
}

export async function getFoodPresets() {
    return await prisma.foodPreset.findMany({
        orderBy: {
            name: 'asc',
        },
    });
}

export async function addFoodPreset(data: any) {
    await prisma.foodPreset.create({
        data: {
            name: data.name,
            calories: Number(data.calories),
            protein: Number(data.protein),
            carbs: Number(data.carbs),
            fats: Number(data.fats),
        },
    });
    revalidatePath("/food");
}

export async function deleteFoodPreset(id: string) {
    await prisma.foodPreset.delete({
        where: { id },
    });
    revalidatePath("/food");
}
