import { getDailyLog } from "@/app/actions";
import WorkoutLogger from "@/components/WorkoutLogger";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkoutPage() {
    const dailyLog = await getDailyLog(new Date());

    return (
        <main className="min-h-screen bg-white text-zinc-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-zinc-900 mb-8">
                    Log Workout
                </h1>

                <WorkoutLogger dailyLogId={dailyLog.id} initialWorkouts={dailyLog.workouts} />
            </div>
        </main>
    );
}
