import { Link } from '@inertiajs/react';
import { Calendar, Megaphone, Mic2, PlusCircle, ShoppingCart, Store, Ticket, Users } from 'lucide-react';
import { useState } from 'react';

type GuestMenuItem = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
};

const guestMenuItems: GuestMenuItem[] = [
    { href: '/customer/orders', label: 'My orders', icon: ShoppingCart },
    { href: '/customer/orders', label: 'My tickets', icon: Ticket },
    { href: '/events/create', label: 'Create event', icon: PlusCircle },
    { href: '/events', label: 'My events', icon: Calendar },
    { href: '/organisers', label: 'Organisers', icon: Users },
    { href: '/artists', label: 'Artists', icon: Mic2 },
    { href: '/promoters', label: 'Promoters', icon: Megaphone },
    { href: '/vendors', label: 'Vendors', icon: Store },
];

export default function GuestSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={`box sticky top-4 shrink-0 self-start transition-all duration-200 ${collapsed ? 'w-24' : 'w-64'}`}>
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button
                    type="button"
                    className="btn-secondary px-2 py-1"
                    onClick={() => setCollapsed((value) => !value)}
                    aria-label={collapsed ? 'Expand guest menu' : 'Collapse guest menu'}
                >
                    {collapsed ? '»' : '«'}
                </button>
            </div>

            <nav className="mt-3 flex flex-col gap-2">
                {guestMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={`${item.href}:${item.label}`}
                            href={item.href}
                            className="btn-secondary flex items-center justify-start gap-3 text-left"
                        >
                            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
