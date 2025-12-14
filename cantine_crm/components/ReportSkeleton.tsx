export function ReportSkeleton() {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl ring-1 ring-white/10 sm:rounded-xl p-6 text-white h-full animate-pulse">
            <div className="flex items-center space-x-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="h-6 w-48 bg-gray-700 rounded"></div>
            </div>

            <div className="space-y-4">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            </div>

            <div className="mt-8 space-y-4">
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="h-3 w-32 bg-gray-700 rounded"></div>
                <div className="h-6 w-20 bg-gray-800 rounded"></div>
            </div>

            <div className="flex justify-center mt-12 mb-4">
                <span className="text-sm text-indigo-400 font-medium animate-bounce">
                    Analyzing Canteen Data...
                </span>
            </div>
        </div>
    )
}
