"use client";

import { useState } from "react";
import { DailyLog, WorkoutLog, ExerciseLog, FoodLog } from "@prisma/client";
import { Download, Upload, Trash2, Edit2, Save, X, Plus, ArrowLeft } from "lucide-react";
import Papa from "papaparse";
import { updateWeight, updateBodyFat, updateFoodLog, deleteFoodLog } from "@/app/actions";
import { useRouter } from "next/navigation";

type DailyLogWithRelations = DailyLog & {
    workouts: (WorkoutLog & { exercises: ExerciseLog[] })[];
    meals: FoodLog[];
};

export default function DataManager({ initialLogs }: { initialLogs: DailyLogWithRelations[] }) {
    const router = useRouter();
    const [logs, setLogs] = useState(initialLogs);
    const [importing, setImporting] = useState(false);
    const [editingLog, setEditingLog] = useState<DailyLogWithRelations | null>(null);

    const handleExport = () => {
        const data = logs.map(log => ({
            Date: new Date(log.date).toLocaleDateString(),
            Weight: log.weight,
            BodyFat: log.bodyFat,
            Calories: log.meals.reduce((acc, m) => acc + m.calories, 0),
            Protein: log.meals.reduce((acc, m) => acc + m.protein, 0),
            Carbs: log.meals.reduce((acc, m) => acc + m.carbs, 0),
            Fats: log.meals.reduce((acc, m) => acc + m.fats, 0),
            Workouts: log.workouts.map(w => w.type).join(", "),
            Notes: log.notes
        }));

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "fitness_data.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setImporting(true);
        Papa.parse(file, {
            header: true,
            complete: async (results) => {
                console.log("Imported data:", results.data);
                // TODO: Implement server action to save imported data
                alert("Import functionality coming soon! (Parsed data logged to console)");
                setImporting(false);
            },
            error: (error) => {
                console.error("CSV Error:", error);
                alert("Failed to parse CSV");
                setImporting(false);
            }
        });
    };

    const handleWeightChange = async (id: string, value: string) => {
        const newLogs = logs.map(log => {
            if (log.id === id) {
                return { ...log, weight: value ? parseFloat(value) : null };
            }
            return log;
        });
        setLogs(newLogs);
    };

    const handleWeightBlur = async (id: string, value: string) => {
        if (value) {
            await updateWeight(id, parseFloat(value));
        }
    };

    const handleBodyFatChange = async (id: string, value: string) => {
        const newLogs = logs.map(log => {
            if (log.id === id) {
                return { ...log, bodyFat: value ? parseFloat(value) : null };
            }
            return log;
        });
        setLogs(newLogs);
    };

    const handleBodyFatBlur = async (id: string, value: string) => {
        if (value) {
            await updateBodyFat(id, parseFloat(value));
        }
    };

    const handleUpdateMeal = async (mealId: string, field: string, value: string) => {
        if (!editingLog) return;
        const updatedMeals = editingLog.meals.map(m =>
            m.id === mealId ? { ...m, [field]: parseFloat(value) || 0 } : m
        );
        setEditingLog({ ...editingLog, meals: updatedMeals });

        const mealToUpdate = updatedMeals.find(m => m.id === mealId);
        if (mealToUpdate) {
            await updateFoodLog(mealId, mealToUpdate);
        }
    };

    const handleDeleteMeal = async (mealId: string) => {
        if (!editingLog || !confirm("Delete this meal?")) return;
        const updatedMeals = editingLog.meals.filter(m => m.id !== mealId);
        setEditingLog({ ...editingLog, meals: updatedMeals });
        await deleteFoodLog(mealId);
    };

    const closeEditModal = () => {
        setEditingLog(null);
        router.refresh(); // Refresh to update table totals
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/")} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-zinc-900">Data Management</h1>
                        <p className="text-zinc-500 mt-1">Export, import, and manage your fitness data.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-900 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        {importing ? "Importing..." : "Import CSV"}
                        <input type="file" accept=".csv" onChange={handleImport} className="hidden" disabled={importing} />
                    </label>
                </div>
            </header>

            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                            <tr>
                                <th className="px-6 py-4 font-medium text-zinc-500">Date</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Weight (kg)</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Body Fat (%)</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Calories</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Protein (g)</th>
                                <th className="px-6 py-4 font-medium text-zinc-500">Workouts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4 text-zinc-900">
                                        {new Date(log.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        <input
                                            type="number"
                                            value={log.weight || ""}
                                            onChange={(e) => handleWeightChange(log.id, e.target.value)}
                                            onBlur={(e) => handleWeightBlur(log.id, e.target.value)}
                                            className="w-20 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-orange-500 focus:outline-none transition-colors"
                                            placeholder="-"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        <input
                                            type="number"
                                            value={log.bodyFat || ""}
                                            onChange={(e) => handleBodyFatChange(log.id, e.target.value)}
                                            onBlur={(e) => handleBodyFatBlur(log.id, e.target.value)}
                                            className="w-20 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-orange-500 focus:outline-none transition-colors"
                                            placeholder="-"
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 group cursor-pointer" onClick={() => setEditingLog(log)}>
                                        <div className="flex items-center gap-2">
                                            {log.meals.reduce((acc, m) => acc + m.calories, 0)}
                                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 group cursor-pointer" onClick={() => setEditingLog(log)}>
                                        <div className="flex items-center gap-2">
                                            {log.meals.reduce((acc, m) => acc + m.protein, 0).toFixed(1)}
                                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-400" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600">
                                        {log.workouts.map(w => w.type).join(", ") || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Meals Modal */}
            {editingLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
                        <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Edit Meals - {new Date(editingLog.date).toLocaleDateString()}</h3>
                            <button onClick={closeEditModal} className="p-2 hover:bg-zinc-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {editingLog.meals.length === 0 && (
                                <p className="text-zinc-400 text-center py-8">No meals logged for this day.</p>
                            )}
                            {editingLog.meals.map(meal => (
                                <div key={meal.id} className="flex items-center gap-4 p-3 border border-zinc-100 rounded-xl bg-zinc-50">
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900">{meal.name}</p>
                                    </div>
                                    <div className="flex gap-2 text-sm">
                                        <div className="w-20">
                                            <label className="text-xs text-zinc-500 block">Kcal</label>
                                            <input
                                                type="number"
                                                value={meal.calories}
                                                onChange={(e) => handleUpdateMeal(meal.id, 'calories', e.target.value)}
                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-xs text-zinc-500 block">Prot</label>
                                            <input
                                                type="number"
                                                value={meal.protein}
                                                onChange={(e) => handleUpdateMeal(meal.id, 'protein', e.target.value)}
                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-xs text-zinc-500 block">Carb</label>
                                            <input
                                                type="number"
                                                value={meal.carbs}
                                                onChange={(e) => handleUpdateMeal(meal.id, 'carbs', e.target.value)}
                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1"
                                            />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-xs text-zinc-500 block">Fat</label>
                                            <input
                                                type="number"
                                                value={meal.fats}
                                                onChange={(e) => handleUpdateMeal(meal.id, 'fats', e.target.value)}
                                                className="w-full bg-white border border-zinc-200 rounded px-2 py-1"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteMeal(meal.id)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                            <button
                                onClick={closeEditModal}
                                className="px-6 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
