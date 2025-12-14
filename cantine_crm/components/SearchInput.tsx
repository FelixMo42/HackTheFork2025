"use client"

import { Search } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export function SearchInput() {
    const searchParams = useSearchParams()

    return (
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
    )
}
