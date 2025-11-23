"use client";

import { useState } from "react";
import { logFood, addFoodPreset, deleteFoodPreset, deleteFoodLog } from "@/app/actions";
import { Plus, Save, Trash2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FoodLogger({ dailyLogId, initialPresets, initialMeals, settings }: { dailyLogId: string, initialPresets: any[], initialMeals: any[], settings: any }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [presets, setPresets] = useState(initialPresets);
    const [meals, setMeals] = useState(initialMeals);
    const [food, setFood] = useState({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
    });

    // Calculate totals
    const totalCalories = meals.reduce((acc, meal) => acc + (meal.calories || 0), 0);
    const totalProtein = meals.reduce((acc, meal) => acc + (meal.protein || 0), 0);

    // Goals (default to user request if not set)
    const calorieGoal = settings?.calorieGoal || 2100;
    const proteinGoal = settings?.proteinGoal || 180;

    const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);
    const proteinProgress = Math.min((totalProtein / proteinGoal) * 100, 100);

    const handlePresetClick = (preset: any) => {
        setFood({
            name: preset.name,
            calories: preset.calories.toString(),
            protein: preset.protein.toString(),
            carbs: preset.carbs.toString(),
            fats: preset.fats.toString(),
        });
    };

    const handleSavePreset = async () => {
        if (!food.name || !food.calories) return;

        // Optimistic update
        const newPreset = { ...food, id: "temp-" + Date.now() };
        setPresets([...presets, newPreset]);

        await addFoodPreset(food);
        router.refresh();
    };

    const handleDeletePreset = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Delete this preset?")) return;

        setPresets(presets.filter(p => p.id !== id));
        await deleteFoodPreset(id);
    };

    const handleDeleteMeal = async (id: string) => {
        if (!confirm("Delete this meal?")) return;
        setMeals(meals.filter(m => m.id !== id));
        await deleteFoodLog(id);
        router.refresh();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await logFood(dailyLogId, food);
            setMeals([...meals, { ...food, id: "temp-" + Date.now() }]); // Optimistic add
            setFood({ name: "", calories: "", protein: "", carbs: "", fats: "" }); // Reset form
            router.refresh();
        } catch (error) {
            console.error("Failed to log food", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteDay = () => {
        // Show success message (could be a toast, for now using alert as a simple popup as requested)
        // Ideally this would be a nice UI modal or toast, but "pop up" often implies a simple alert or modal.
        // Given the "don't need to go data page" request, a simple confirmation is good.
        alert("Day Completed! Great job hitting your logs.");
        router.push("/"); // Go back home as it's a natural flow, or stay on page. User said "don't need to go data page".
        // Let's just stay on page or go home. Going home seems logical after completing a task.
        // Actually, user just said "pop up", maybe they want to stay.
        // Let's just show alert and do nothing else for now to be safe, or maybe redirect home.
        // "don't need to go data page" implies they want to stay or go somewhere else.
        // Let's redirect to home for better flow.
        router.push("/");
    };

    return (
        <div className="space-y-8">
            {/* Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-zinc-500">Protein</span>
                        <span className="text-lg font-bold text-zinc-900">
                            {Math.round(totalProtein)} <span className="text-sm text-zinc-400 font-normal">/ {proteinGoal}g</span>
                        </span>
                    </div>
                    <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${proteinProgress}%` }}
                        />
                    </div>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-medium text-zinc-500">Calories</span>
                        <span className="text-lg font-bold text-zinc-900">
                            {Math.round(totalCalories)} <span className="text-sm text-zinc-400 font-normal">/ {calorieGoal}</span>
                        </span>
                    </div>
                    <div className="h-3 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                            style={{ width: `${calorieProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-fit">
                    <h2 className="text-lg font-bold text-zinc-900 mb-4">Add Food</h2>
                    <div>
                        <label className="text-sm text-zinc-500 block mb-1">Food Name</label>
                        <input
                            type="text"
                            required
                            value={food.name}
                            onChange={(e) => setFood({ ...food, name: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-zinc-900"
                            placeholder="e.g., Chicken Breast"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-zinc-500 block mb-1">Calories</label>
                            <input
                                type="number"
                                required
                                value={food.calories}
                                onChange={(e) => setFood({ ...food, calories: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-zinc-900"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-500 block mb-1">Protein (g)</label>
                            <input
                                type="number"
                                required
                                value={food.protein}
                                onChange={(e) => setFood({ ...food, protein: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-zinc-900"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-500 block mb-1">Carbs (g)</label>
                            <input
                                type="number"
                                required
                                value={food.carbs}
                                onChange={(e) => setFood({ ...food, carbs: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-zinc-900"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-zinc-500 block mb-1">Fats (g)</label>
                            <input
                                type="number"
                                required
                                value={food.fats}
                                onChange={(e) => setFood({ ...food, fats: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 focus:border-orange-500 outline-none text-zinc-900"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleSavePreset}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-colors font-medium"
                            title="Save as Preset"
                        >
                            <Plus className="w-4 h-4" />
                            Save Preset
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors disabled:opacity-50 font-medium shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? "Saving..." : "Add Food"}
                        </button>
                    </div>
                </form>

                {/* Right Column: Presets & Today's List */}
                <div className="space-y-6">
                    {/* Presets */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900">Quick Add</h3>
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                            {presets.length === 0 && (
                                <p className="text-zinc-400 text-sm italic">No presets yet.</p>
                            )}
                            {presets.map((preset, index) => (
                                <div
                                    key={preset.id || index}
                                    onClick={() => handlePresetClick(preset)}
                                    className="p-3 text-left bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg transition-colors flex justify-between items-center group shadow-sm cursor-pointer"
                                >
                                    <div>
                                        <span className="text-zinc-900 block font-medium">{preset.name}</span>
                                        <span className="text-xs text-zinc-500 group-hover:text-orange-600">
                                            {preset.calories} kcal | {preset.protein}g P
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeletePreset(preset.id, e)}
                                        className="p-2 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Food List */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-zinc-900">Today's Food</h3>
                        <div className="space-y-2">
                            {meals.length === 0 && (
                                <p className="text-zinc-400 text-sm italic">No food logged today.</p>
                            )}
                            {meals.map((meal, index) => (
                                <div key={meal.id || index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                                    <div>
                                        <p className="font-medium text-zinc-900">{meal.name}</p>
                                        <p className="text-xs text-zinc-500">
                                            {meal.calories} kcal | {meal.protein}g P | {meal.carbs}g C | {meal.fats}g F
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Complete Day Button */}
            <div className="pt-4 border-t border-zinc-100">
                <button
                    onClick={handleCompleteDay}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <CheckCircle className="w-5 h-5" />
                    Complete Day
                </button>
            </div>
        </div>
    );
}
