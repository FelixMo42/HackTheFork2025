"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationStatus = 'in-progress' | 'completed' | 'failed';

export interface Notification {
    id: string;
    canteenName: string;
    canteenId: number;
    status: NotificationStatus;
    timestamp: number;
    read: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (canteenName: string, canteenId: number) => string;
    updateNotification: (id: string, status: NotificationStatus) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'canteen_notifications';
const MAX_NOTIFICATIONS = 20;

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load notifications from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
            } catch (e) {
                console.error('Failed to parse notifications from localStorage', e);
            }
        }
    }, []);

    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
        }
    }, [notifications]);

    const addNotification = (canteenName: string, canteenId: number): string => {
        const id = `${canteenId}-${Date.now()}`;
        const newNotification: Notification = {
            id,
            canteenName,
            canteenId,
            status: 'in-progress',
            timestamp: Date.now(),
            read: false,
        };

        setNotifications(prev => {
            const updated = [newNotification, ...prev];
            // Keep only the most recent notifications
            return updated.slice(0, MAX_NOTIFICATIONS);
        });

        return id;
    };

    const updateNotification = (id: string, status: NotificationStatus) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, status } : notif
            )
        );
    };

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                updateNotification,
                markAsRead,
                markAllAsRead,
                clearAll,
                unreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
