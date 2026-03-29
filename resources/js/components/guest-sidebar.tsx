import { Link, usePage } from '@inertiajs/react';
import { Calendar, Megaphone, Mic2, Moon, PlusCircle, ShoppingCart, Store, Sun, Ticket, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
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
    const page = usePage();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 1000 : false,
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const wasMobileRef = useRef(isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1000;
            setIsMobile(mobile);

            if (mobile !== wasMobileRef.current) {
                setIsMobileOpen(false);
                setCollapsed(false);
                wasMobileRef.current = mobile;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const onToggle = () => {
            setIsMobileOpen((value) => !value);
        };

        window.addEventListener('guest-menu:toggle', onToggle);

        return () => {
            window.removeEventListener('guest-menu:toggle', onToggle);
        };
    }, []);

    const sidebarWidthClass = isMobile ? 'w-64' : (collapsed ? 'w-24' : 'w-64');

    return (
        <>
            {isMobile && isMobileOpen && (
                <button
                    type="button"
                    className="fixed inset-x-0 bottom-0 top-[10rem] z-40 bg-black/45 min-[1000px]:hidden"
                    aria-label="Close guest menu overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`guest-sidebar-shell self-start p-3 transition-all duration-200 ${sidebarWidthClass} ${isMobile ? 'fixed bottom-0 left-0 top-[10rem] z-40 min-h-[calc(100svh-10rem)] w-[82vw] max-w-[20rem] rounded-r-3xl rounded-l-none border-r border-zinc-800' : 'sticky top-0 z-40 shrink-0 min-h-[100svh]'} ${isMobile && !isMobileOpen ? 'hidden' : ''} min-[1000px]:block`}
            >
                {!isMobile && (
                    <Link href="/" className="block rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2">
                        <AppLogoIcon alt="ChancePass" className="h-12 w-auto" />
                    </Link>
                )}

                {isMobile && (
                    <div className="mt-3 border-b border-zinc-800 pb-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Menu</p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-100">My account</p>
                    </div>
                )}

                <nav className="mt-3 flex flex-col gap-2">
                    {guestMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = page.url === item.href || page.url.startsWith(`${item.href}/`);
                        const isCreateEvent = item.href === '/events/create';

                        return (
                            <Link
                                key={`${item.href}:${item.label}`}
                                href={item.href}
                                className={`guest-sidebar-link ${isActive ? 'guest-sidebar-link-active' : ''} ${!isActive && isCreateEvent ? 'guest-sidebar-link-warm' : ''}`}
                                onClick={() => {
                                    if (isMobile) {
                                        setIsMobileOpen(false);
                                    }
                                }}
                            >
                                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                {(!collapsed || isMobile) && <span>{item.label}</span>}
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        className="guest-sidebar-link"
                        onClick={() => updateAppearance(resolvedAppearance === 'light' ? 'dark' : 'light')}
                        aria-label="Toggle theme"
                        title="Toggle theme"
                    >
                        {resolvedAppearance === 'light' ? (
                            <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        ) : (
                            <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        {(!collapsed || isMobile) && <span>Theme</span>}
                    </button>
                </nav>
            </aside>
        </>
    );
}
