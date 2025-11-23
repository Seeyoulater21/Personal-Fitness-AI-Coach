"use client";

import { useEffect, useState } from "react";
import { getWorkoutHistory } from "@/app/actions";

type ContributionDay = {
    date: string;
    count: number;
};

export default function HabitTracker() {
    const [history, setHistory] = useState<ContributionDay[]>([]);

    useEffect(() => {
        getWorkoutHistory().then(setHistory);
    }, []);

    // Generate last 365 days
    const days = Array.from({ length: 365 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (364 - i));
        return d.toISOString().split("T")[0];
    });

    const getIntensity = (date: string) => {
        const day = history.find((h) => h.date === date);
        if (!day) return "bg-zinc-900";
        if (day.count >= 2) return "bg-green-500";
        if (day.count >= 1) return "bg-green-800";
        return "bg-zinc-900";
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-1 min-w-max">
                {/* Group by weeks for better visualization if needed, but simple grid for now */}
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {days.map((date) => (
                        <div
                            key={date}
                            className={`w-3 h-3 rounded-sm ${getIntensity(date)} transition-colors hover:ring-1 ring-white/50`}
                            title={date}
                        />
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 justify-end">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-zinc-900" />
                <div className="w-3 h-3 rounded-sm bg-green-800" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
}
