"use client"

import { useNotifications } from '@/lib/notifications';
import { useEffect, useRef } from 'react';

interface NotificationTrackerProps {
    canteenName: string;
    canteenId: number;
    onNotificationId?: (id: string) => void;
}

export function NotificationTracker({ canteenName, canteenId }: NotificationTrackerProps) {
    const { addNotification, updateNotification } = useNotifications();
    const notificationIdRef = useRef<string | null>(null);
    const hasAddedRef = useRef(false);

    useEffect(() => {
        // Add notification when component mounts (report generation starts)
        if (!hasAddedRef.current) {
            notificationIdRef.current = addNotification(canteenName, canteenId);
            hasAddedRef.current = true;
        }

        // Update notification to completed when the report finishes loading
        const timer = setTimeout(() => {
            if (notificationIdRef.current) {
                updateNotification(notificationIdRef.current, 'completed');
            }
        }, 100);

        return () => {
            clearTimeout(timer);
        };
    }, [canteenName, canteenId, addNotification, updateNotification]);

    return null; // This component doesn't render anything
}
