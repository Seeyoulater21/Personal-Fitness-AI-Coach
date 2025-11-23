import { getSettings } from "@/app/actions";
import Settings from "@/components/Settings";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const settings = await getSettings();

    return (
        <main className="min-h-screen bg-white text-zinc-900 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-zinc-900 mb-8">
                    Settings
                </h1>
                <Settings settings={settings} />
            </div>
        </main>
    );
}
