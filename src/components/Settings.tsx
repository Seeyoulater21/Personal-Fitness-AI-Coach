"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions";
import { Save, Target, Bot } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Settings({ settings }: { settings: any }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [goals, setGoals] = useState({
        targetWeight: settings.targetWeight,
        bodyFatGoal: settings.bodyFatGoal || 15,
        calorieGoal: settings.calorieGoal,
        proteinGoal: settings.proteinGoal,
        carbGoal: settings.carbGoal,
        fatGoal: settings.fatGoal,
    });
    const [aiModel, setAiModel] = useState(settings.aiModel || "openai/gpt-4o-mini");
    const [customPrompt, setCustomPrompt] = useState(settings.customPrompt || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateSettings({
                targetWeight: goals.targetWeight,
                bodyFatGoal: goals.bodyFatGoal,
                calorieGoal: goals.calorieGoal,
                proteinGoal: goals.proteinGoal,
                carbGoal: goals.carbGoal,
                fatGoal: goals.fatGoal,
                aiModel,
                customPrompt,
            });
            alert("Settings saved!");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl" >
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Goals
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Target Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={goals.targetWeight}
                            onChange={(e) => setGoals({ ...goals, targetWeight: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                            placeholder="e.g. 75"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Body Fat Goal (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={goals.bodyFatGoal}
                            onChange={(e) => setGoals({ ...goals, bodyFatGoal: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                            placeholder="e.g. 15"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Calories</label>
                        <input
                            type="number"
                            value={goals.calorieGoal}
                            onChange={(e) => setGoals({ ...goals, calorieGoal: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Protein (g)</label>
                        <input
                            type="number"
                            value={goals.proteinGoal}
                            onChange={(e) => setGoals({ ...goals, proteinGoal: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Carbs (g)</label>
                        <input
                            type="number"
                            value={goals.carbGoal}
                            onChange={(e) => setGoals({ ...goals, carbGoal: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Fats (g)</label>
                        <input
                            type="number"
                            value={goals.fatGoal}
                            onChange={(e) => setGoals({ ...goals, fatGoal: e.target.value })}
                            className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Coach Configuration
                </h2>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">AI Model</label>
                    <select
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all bg-white"
                    >
                        <option value="openai/gpt-4o-mini">GPT-4o Mini (Fast & Smart)</option>
                        <option value="google/gemini-flash-1.5">Gemini Flash 1.5 (Large Context)</option>
                        <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Human-like)</option>
                    </select>
                    <p className="text-xs text-zinc-500 mt-2">Select the AI model that powers your coach.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">System Prompt (Pre-prompt)</label>
                    <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={6}
                        className="w-full p-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-900 transition-all"
                        placeholder="Define how the AI should behave. Use placeholders like {{WEIGHT}}, {{BODY_FAT}}, {{GOALS}} to inject dynamic data."
                    />
                    <p className="text-xs text-zinc-500 mt-2">
                        Customize the AI's personality and instructions. Leave blank to use the default strict coach persona.
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving..." : "Save Settings"}
            </button>
        </form >
    );
}
