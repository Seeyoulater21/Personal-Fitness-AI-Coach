import { getDailyLog, getProgressHistory } from "@/app/actions";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
    const dailyLog = await getDailyLog(new Date());
    const progressHistory = await getProgressHistory();

    return (
        <main className="min-h-screen bg-white text-zinc-900">
            <Dashboard dailyLog={dailyLog} progressHistory={progressHistory} />
        </main>
    );
}
