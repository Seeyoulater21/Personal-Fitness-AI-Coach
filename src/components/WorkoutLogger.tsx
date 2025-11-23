"use client";

import { useState } from "react";
import { logWorkout, deleteWorkoutLog } from "@/app/actions";
import { Plus, Save, Trash2, Dumbbell, Timer, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const WORKOUT_TEMPLATES = {
    A: [
        { name: "Dead Hang", sets: 3, reps: "30-45s", weight: 0 },
        { name: "Negative Pull-up", sets: 3, reps: "3-5", weight: 0 },
        { name: "Squat (Barbell)", sets: 4, reps: "8-10", weight: 40 },
        { name: "Bench Press (Barbell)", sets: 3, reps: "8-10", weight: 0 },
        { name: "Bent Over Row (Barbell)", sets: 3, reps: "10-12", weight: 0 },
        { name: "Overhead Press (Dumbbell)", sets: 3, reps: "10-12", weight: 0 },
        { name: "Face Pull (Cable)", sets: 3, reps: "12-15", weight: 0 },
        { name: "Cable Crunch", sets: 3, reps: "15", weight: 0 },
    ],
    B: [
        { name: "Band-Assisted Pull-up", sets: 3, reps: "6-10", weight: 0 },
        { name: "Romanian Deadlift", sets: 4, reps: "8-10", weight: 0 },
        { name: "Incline Bench Press", sets: 3, reps: "8-10", weight: 0 },
        { name: "Goblet Squat", sets: 3, reps: "10-12", weight: 0 },
        { name: "Lateral Raise", sets: 3, reps: "12-15", weight: 0 },
        { name: "Bicep Curl", sets: 3, reps: "10-12", weight: 0 },
        { name: "Triceps Pushdown", sets: 3, reps: "10-12", weight: 0 },
    ],
    C: [
        { name: "Dead Hang", sets: 3, reps: "45-60s", weight: 0 },
        { name: "Negative Pull-up", sets: 2, reps: "5", weight: 0 },
        { name: "Overhead Press (Dumbbell)", sets: 4, reps: "8-10", weight: 0 },
        { name: "Front Squat", sets: 3, reps: "8-10", weight: 0 },
        { name: "Bench Press (Dumbbell)", sets: 3, reps: "8-10", weight: 0 },
        { name: "Bent Over Row", sets: 3, reps: "10-12", weight: 0 },
        { name: "Reverse Fly", sets: 3, reps: "12-15", weight: 0 },
        { name: "Plank", sets: 3, reps: "60s", weight: 0 },
    ],
};

export default function WorkoutLogger({ dailyLogId, initialWorkouts }: { dailyLogId: string, initialWorkouts: any[] }) {
    const router = useRouter();
    const [mode, setMode] = useState<"SELECT" | "WEIGHTS" | "CARDIO">("SELECT");
    const [selectedTemplate, setSelectedTemplate] = useState<"A" | "B" | "C" | null>(null);
    const [exercises, setExercises] = useState<any[]>([]);
    const [cardioDuration, setCardioDuration] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workouts, setWorkouts] = useState(initialWorkouts);

    const handleSelectTemplate = (type: "A" | "B" | "C") => {
        setSelectedTemplate(type);
        setExercises(WORKOUT_TEMPLATES[type]);
    };

    const handleExerciseChange = (index: number, field: string, value: any) => {
        const newExercises = [...exercises];
        newExercises[index] = { ...newExercises[index], [field]: value };
        setExercises(newExercises);
    };

    const handleAddExercise = () => {
        setExercises([...exercises, { name: "", sets: 3, reps: "10", weight: 0 }]);
    };

    const handleRemoveExercise = (index: number) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleSubmitWeights = async () => {
        if (!selectedTemplate) return;
        setIsSubmitting(true);
        try {
            const newWorkout = await logWorkout(dailyLogId, `Workout ${selectedTemplate}`, exercises);
            setWorkouts([...workouts, newWorkout]);
            setMode("SELECT");
            setSelectedTemplate(null);
            router.refresh();
        } catch (error) {
            console.error("Failed to log workout", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitCardio = async () => {
        if (!cardioDuration) return;
        setIsSubmitting(true);
        try {
            const newWorkout = await logWorkout(dailyLogId, "Cardio", [{ name: "Cardio", sets: 1, reps: `${cardioDuration} mins`, weight: 0 }]);
            setWorkouts([...workouts, newWorkout]);
            setMode("SELECT");
            setCardioDuration("");
            router.refresh();
        } catch (error) {
            console.error("Failed to log cardio", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteWorkout = async (id: string) => {
        if (!confirm("Delete this workout?")) return;
        setWorkouts(workouts.filter(w => w.id !== id));
        await deleteWorkoutLog(id);
        router.refresh();
    };

    if (mode === "SELECT") {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={() => setMode("WEIGHTS")}
                        className="p-8 rounded-2xl border border-zinc-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all text-center group shadow-sm flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform">
                            <Dumbbell className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">Weight Training</h3>
                            <p className="text-zinc-500 text-sm mt-1">Log a structured workout (A, B, or C)</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setMode("CARDIO")}
                        className="p-8 rounded-2xl border border-zinc-200 bg-white hover:border-orange-500 hover:bg-orange-50 transition-all text-center group shadow-sm flex flex-col items-center gap-4"
                    >
                        <div className="p-4 bg-orange-100 text-orange-600 rounded-full group-hover:scale-110 transition-transform">
                            <Timer className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">Cardio</h3>
                            <p className="text-zinc-500 text-sm mt-1">Log a cardio session duration</p>
                        </div>
                    </button>
                </div>

                {/* Today's Workouts List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-900">Today's Workouts</h3>
                    {workouts.length === 0 && (
                        <p className="text-zinc-400 italic">No workouts logged yet today.</p>
                    )}
                    {workouts.map((workout) => (
                        <div key={workout.id} className="p-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-between shadow-sm">
                            <div>
                                <h4 className="font-bold text-zinc-900">{workout.type}</h4>
                                <p className="text-sm text-zinc-500">
                                    {workout.exercises?.length || 0} exercises
                                </p>
                            </div>
                            <button
                                onClick={() => handleDeleteWorkout(workout.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (mode === "CARDIO") {
        return (
            <div className="max-w-md mx-auto space-y-6">
                <button onClick={() => setMode("SELECT")} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <Timer className="w-6 h-6 text-orange-500" />
                        Log Cardio
                    </h2>
                    <div>
                        <label className="text-sm text-zinc-500 block mb-1">Duration (minutes)</label>
                        <input
                            type="number"
                            value={cardioDuration}
                            onChange={(e) => setCardioDuration(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 focus:border-orange-500 outline-none text-zinc-900 text-lg"
                            placeholder="e.g. 30"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleSubmitCardio}
                        disabled={isSubmitting || !cardioDuration}
                        className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : "Log Cardio"}
                    </button>
                </div>
            </div>
        );
    }

    // WEIGHTS MODE
    if (!selectedTemplate) {
        return (
            <div className="space-y-6">
                <button onClick={() => setMode("SELECT")} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-2xl font-bold text-zinc-900">Select Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["A", "B", "C"] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => handleSelectTemplate(type)}
                            className="p-8 rounded-xl border border-zinc-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all text-center group shadow-sm"
                        >
                            <h3 className="text-2xl font-bold mb-2 text-zinc-900 group-hover:text-purple-600">Workout {type}</h3>
                            <p className="text-zinc-500 text-sm">Click to start</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedTemplate(null)} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-purple-600">Logging Workout {selectedTemplate}</h2>
                </div>
            </div>

            <div className="space-y-4">
                {exercises.map((exercise, index) => (
                    <div key={index} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="flex-1">
                            <label className="text-xs text-zinc-500 block mb-1">Exercise</label>
                            <input
                                type="text"
                                value={exercise.name}
                                onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-300 focus:border-purple-500 outline-none py-1 text-zinc-900"
                            />
                        </div>
                        <div className="w-20">
                            <label className="text-xs text-zinc-500 block mb-1">Sets</label>
                            <input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-300 focus:border-purple-500 outline-none py-1 text-zinc-900"
                            />
                        </div>
                        <div className="w-24">
                            <label className="text-xs text-zinc-500 block mb-1">Reps</label>
                            <input
                                type="text"
                                value={exercise.reps}
                                onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-300 focus:border-purple-500 outline-none py-1 text-zinc-900"
                            />
                        </div>
                        <div className="w-24">
                            <label className="text-xs text-zinc-500 block mb-1">Weight (kg)</label>
                            <input
                                type="number"
                                value={exercise.weight}
                                onChange={(e) => handleExerciseChange(index, "weight", e.target.value)}
                                className="w-full bg-transparent border-b border-zinc-300 focus:border-purple-500 outline-none py-1 text-zinc-900"
                            />
                        </div>
                        <button
                            onClick={() => handleRemoveExercise(index)}
                            className="p-2 text-zinc-400 hover:text-red-500 mt-4 md:mt-0"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleAddExercise}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                </button>
                <button
                    onClick={handleSubmitWeights}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors disabled:opacity-50 shadow-lg"
                >
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Complete Workout"}
                </button>
            </div>
        </div>
    );
}
