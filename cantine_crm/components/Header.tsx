"use client"

import { Bell, Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export function Header() {
    const searchParams = useSearchParams()

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        Rechercher
                    </label>
                    <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                            <Search className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <input
                            id="search-field"
                            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                            placeholder="Rechercher des municipalités..."
                            type="search"
                            name="search"
                            defaultValue={searchParams.get('search')?.toString()}
                        />
                    </div>
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Voir les notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <span className="sr-only">Your profile</span>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            JD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
