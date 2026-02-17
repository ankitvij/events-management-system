import { Link } from '@inertiajs/react';
import { Calendar, Megaphone, Menu, Mic2, Moon, PlusCircle, ShoppingCart, Store, Sun, Ticket, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

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
    { href: '/agencies', label: 'Agencies', icon: Users },
    { href: '/organisers', label: 'Organisers', icon: Users },
    { href: '/artists', label: 'Artists', icon: Mic2 },
    { href: '/promoters', label: 'Promoters', icon: Megaphone },
    { href: '/vendors', label: 'Vendors', icon: Store },
];

export default function GuestSidebar() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 1000 : false,
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1000;
            setIsMobile(mobile);

            if (mobile) {
                setIsMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <button
                type="button"
                className="btn-primary fixed left-2 top-20 z-[70] min-[1000px]:hidden"
                onClick={() => setIsMobileOpen((value) => !value)}
                aria-expanded={isMobileOpen}
                aria-label={isMobileOpen ? 'Close guest menu' : 'Open guest menu'}
                title={isMobileOpen ? 'Close guest menu' : 'Open guest menu'}
            >
                {isMobileOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
            </button>

            {isMobile && isMobileOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-[65] bg-black/40 min-[1000px]:hidden"
                    aria-label="Close guest menu overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`box z-[70] self-start transition-all duration-200 ${collapsed ? 'w-24' : 'w-64'} ${isMobile ? 'fixed top-32 left-2' : 'sticky top-4 shrink-0'} ${isMobile && !isMobileOpen ? 'hidden' : ''} min-[1000px]:block`}
            >
                <div className="flex items-center justify-between gap-2">
                    <h2 className="flex items-center">
                        <Menu className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Menu</span>
                    </h2>
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
                                onClick={() => {
                                    if (isMobile) {
                                        setIsMobileOpen(false);
                                    }
                                }}
                            >
                                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        className="btn-secondary flex items-center justify-start gap-3 text-left"
                        onClick={() => updateAppearance(resolvedAppearance === 'light' ? 'dark' : 'light')}
                        aria-label="Toggle theme"
                        title="Toggle theme"
                    >
                        {resolvedAppearance === 'light' ? (
                            <Moon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        ) : (
                            <Sun className="h-5 w-5 shrink-0" aria-hidden="true" />
                        )}
                        {!collapsed && <span>Theme</span>}
                    </button>
                </nav>
            </aside>
        </>
    );
}
