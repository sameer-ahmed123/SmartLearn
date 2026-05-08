import { useNotifications } from '@/context/NotificationContext';
import { Bell } from 'lucide-react';

export const NotificationBell = ({ onClick, className }: { onClick: () => void, className: string }) => {
    const { unreadCount } = useNotifications();

    return (
        <button className={className} onClick={onClick}>
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount}
                </span>
            )}
        </button>
    );
};