import { getDailyLog, getFoodPresets, getSettings } from "@/app/actions";
import FoodLogger from "@/components/FoodLogger";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FoodPage() {
    const dailyLog = await getDailyLog(new Date());
    const presets = await getFoodPresets();
    const settings = await getSettings();

    return (
        <main className="min-h-screen bg-white text-zinc-900 p-6">
            <div className="max-w-2xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">Log Food</h1>
                </header>

                <FoodLogger
                    dailyLogId={dailyLog.id}
                    initialPresets={presets}
                    initialMeals={dailyLog.meals}
                    settings={settings}
                />
            </div>
        </main>
    );
}
