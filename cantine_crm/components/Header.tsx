"use client"

import { Bell } from 'lucide-react'
import { Suspense, useState } from 'react'
import { SearchInput } from './SearchInput'
import { NotificationPanel } from './NotificationPanel'
import { useNotifications } from '@/lib/notifications'

export function Header() {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const { unreadCount } = useNotifications();

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <Suspense fallback={<div className="flex flex-1" />}>
                    <SearchInput />
                </Suspense>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <div className="relative">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative"
                            onClick={() => setIsPanelOpen(!isPanelOpen)}
                        >
                            <span className="sr-only">Voir les notifications</span>
                            <Bell className="h-6 w-6" aria-hidden="true" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white notification-badge">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <NotificationPanel
                            isOpen={isPanelOpen}
                            onClose={() => setIsPanelOpen(false)}
                        />
                    </div>
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

