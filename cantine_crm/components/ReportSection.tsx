import { generateCanteenReport } from '@/lib/ai_report';
import ReactMarkdown from 'react-markdown';

interface ReportSectionProps {
    canteenName: string;
    city: string;
    id: number;
    url?: string;
}

export async function ReportSection({ canteenName, city, id, url }: ReportSectionProps) {
    // This fetch might be slow (if not cached), so this component will suspend
    const report = await generateCanteenReport(canteenName, city, id, url);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl ring-1 ring-white/10 sm:rounded-xl p-6 text-white h-full">
            <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold">Blackbox AI Research</h2>
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown>
                    {report}
                </ReactMarkdown>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-400 flex justify-between items-center">
                <span>Generated via Blackbox Agent</span>
                <span className="px-2 py-1 bg-gray-800 rounded">v0.1.0-beta</span>
            </div>
        </div>
    );
}
