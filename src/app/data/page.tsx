import { getAllLogs } from "@/app/actions";
import DataManager from "@/components/DataManager";

export const dynamic = "force-dynamic";

export default async function DataPage() {
    const logs = await getAllLogs();

    return (
        <main className="min-h-screen bg-white text-zinc-900">
            <DataManager initialLogs={logs} />
        </main>
    );
}
