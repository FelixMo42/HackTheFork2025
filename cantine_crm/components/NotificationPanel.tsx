"use client"

import { useNotifications, Notification } from '@/lib/notifications';
import { CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
    const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

    if (!isOpen) return null;

    const handleNotificationClick = (notification: Notification) => {
        markAsRead(notification.id);
        onClose();
    };

    const getStatusIcon = (status: Notification['status']) => {
        switch (status) {
            case 'in-progress':
                return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'failed':
                return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusText = (status: Notification['status']) => {
        switch (status) {
            case 'in-progress':
                return 'Génération en cours...';
            case 'completed':
                return 'Rapport généré';
            case 'failed':
                return 'Échec de génération';
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        return `Il y a ${days}j`;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute right-0 top-12 z-50 w-96 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 notification-panel">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                    Tout marquer lu
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Effacer
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p className="text-sm">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={`/canteens/${notification.canteenId}`}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`block p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-indigo-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getStatusIcon(notification.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {notification.canteenName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {getStatusText(notification.status)}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTimestamp(notification.timestamp)}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2 bg-indigo-600 rounded-full" />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
