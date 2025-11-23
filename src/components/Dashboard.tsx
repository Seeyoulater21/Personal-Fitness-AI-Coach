"use client";

import { useState } from "react";
import { updateWeight, updateBodyFat } from "@/app/actions";
import { Dumbbell, Utensils, Scale, Bot, Settings as SettingsIcon, Activity } from "lucide-react";
import Link from "next/link";
import HabitTracker from "./HabitTracker";
import WeightChart from "./WeightChart";
import BodyFatChart from "./BodyFatChart";

import { DailyLog as PrismaDailyLog, WorkoutLog, ExerciseLog, FoodLog } from "@prisma/client";

type DailyLogWithRelations = PrismaDailyLog & {
    workouts: (WorkoutLog & { exercises: ExerciseLog[] })[];
    meals: FoodLog[];
};

export default function Dashboard({ dailyLog, progressHistory }: { dailyLog: DailyLogWithRelations, progressHistory: any[] }) {
    const [weight, setWeight] = useState(dailyLog.weight || "");
    const [bodyFat, setBodyFat] = useState(dailyLog.bodyFat || "");

    const handleWeightBlur = async () => {
        if (weight && weight !== dailyLog.weight) {
            await updateWeight(dailyLog.id, Number(weight));
        }
    };

    const handleBodyFatBlur = async () => {
        if (bodyFat && bodyFat !== dailyLog.bodyFat) {
            await updateBodyFat(dailyLog.id, Number(bodyFat));
        }
    };

    // Calculate totals
    const totalCalories = dailyLog.meals.reduce((acc, meal) => acc + meal.calories, 0);
    const totalProtein = dailyLog.meals.reduce((acc, meal) => acc + meal.protein, 0);

    return (
        <div className="w-full max-w-5xl mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-900">
                        Overview
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        {new Date(dailyLog.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/data" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors" title="Manage Data">
                        <Activity className="w-6 h-6" />
                    </Link>
                    <Link href="/settings" className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors" title="Settings">
                        <SettingsIcon className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* Habit Tracker */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Consistency</h2>
                <HabitTracker />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Weight Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group md:col-span-2">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Scale className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h2 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">Weight</h2>
                            <div className="flex items-baseline gap-2">
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    onBlur={handleWeightBlur}
                                    placeholder="--"
                                    className="bg-transparent text-5xl font-bold w-32 focus:outline-none focus:ring-0 placeholder-zinc-300 text-zinc-900"
                                />
                                <span className="text-zinc-400 text-xl">kg</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <WeightChart data={progressHistory} />
                    </div>
                </div>

                {/* Body Fat Card */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group md:col-span-2">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h2 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-wider">Body Fat</h2>
                            <div className="flex items-baseline gap-2">
                                <input
                                    type="number"
                                    value={bodyFat}
                                    onChange={(e) => setBodyFat(e.target.value)}
                                    onBlur={handleBodyFatBlur}
                                    placeholder="--"
                                    className="bg-transparent text-5xl font-bold w-32 focus:outline-none focus:ring-0 placeholder-zinc-300 text-zinc-900"
                                />
                                <span className="text-zinc-400 text-xl">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10">
                        <BodyFatChart data={progressHistory} />
                    </div>
                </div>

                {/* Nutrition Summary */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm md:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Utensils className="w-32 h-32 text-orange-500" />
                    </div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Nutrition</h2>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-zinc-900">{totalCalories} <span className="text-sm text-zinc-400 font-normal">kcal</span></p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-zinc-500">Protein</span>
                                <span className="font-medium text-zinc-900">{totalProtein.toFixed(1)} / 180g</span>
                            </div>
                            <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((totalProtein / 180) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                        <Link
                            href="/food"
                            className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 transition-all font-medium"
                        >
                            Log Meal
                        </Link>
                    </div>
                </div>

                {/* Workout Summary */}
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm md:col-span-2 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Workout</h2>
                        <Link
                            href="/workout"
                            className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-full text-sm font-medium transition-colors"
                        >
                            {dailyLog.workouts.length > 0 ? "Log Another" : "Start Workout"}
                        </Link>
                    </div>

                    {dailyLog.workouts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {dailyLog.workouts.map((workout) => (
                                <div key={workout.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                            <Dumbbell className="w-5 h-5" />
                                        </div>
                                        <p className="font-bold text-lg text-zinc-900">{workout.type}</p>
                                    </div>
                                    <p className="text-sm text-zinc-500 pl-12">{workout.exercises.length} exercises completed</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl">
                            <Dumbbell className="w-12 h-12 mx-auto text-zinc-300 mb-4" />
                            <p className="text-zinc-400">No workout logged today</p>
                        </div>
                    )}
                </div>
            </div>

            <Link
                href="/coach"
                className="fixed bottom-8 right-8 p-4 bg-zinc-900 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 group"
            >
                <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </Link>
        </div>
    );
}
