import AICoach from "@/components/AICoach";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CoachPage() {
    return (
        <main className="min-h-screen bg-white text-zinc-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-zinc-900 mb-8">
                    AI Coach
                </h1>
                <AICoach />
            </div>
        </main>
    );
}
