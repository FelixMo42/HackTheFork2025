"use client"

import { Bell } from 'lucide-react'
import { Suspense } from 'react'
import { SearchInput } from './SearchInput'

export function Header() {
    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <Suspense fallback={<div className="flex flex-1" />}>
                    <SearchInput />
                </Suspense>
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

