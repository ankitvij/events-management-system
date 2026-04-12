import { Link, usePage } from '@inertiajs/react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, Megaphone, Mic2, Moon, ShoppingCart, Store, Sun, Ticket, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

type GuestMenuItem = {
    href: string;
    label: string;
    createHref?: string;
    moduleKey?: 'agencies_enabled' | 'organisers_enabled' | 'artists_enabled' | 'promoters_enabled' | 'vendors_enabled' | 'venues_enabled';
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
};

const commonMenuItems: GuestMenuItem[] = [
    { href: '/', label: 'Events', createHref: '/events/create', icon: Calendar },
    { href: '/agencies', label: 'Agencies', createHref: '/agencies/create', icon: Users, moduleKey: 'agencies_enabled' },
    { href: '/organisers', label: 'Organisers', createHref: '/organisers/create', icon: Users, moduleKey: 'organisers_enabled' },
    { href: '/artists', label: 'Artists', createHref: '/artists/create', icon: Mic2, moduleKey: 'artists_enabled' },
    { href: '/promoters', label: 'Promoters', createHref: '/promoters/create', icon: Megaphone, moduleKey: 'promoters_enabled' },
    { href: '/vendors', label: 'Vendors', createHref: '/vendors/create', icon: Store, moduleKey: 'vendors_enabled' },
    { href: '/venues', label: 'Venues', createHref: '/venues/create', icon: MapPin, moduleKey: 'venues_enabled' },
];

export default function GuestSidebar() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const page = usePage<{ customer?: { id: number } | null; organiser?: { id: number } | null; auth?: { user?: { id: number; role?: string } | null }; module_settings?: Record<string, boolean> }>();
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 1000 : false,
    );
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [mobileTopOffset, setMobileTopOffset] = useState(150);
    const [collapsed, setCollapsed] = useState(false);
    const [expandedMenuHref, setExpandedMenuHref] = useState<string | null>(null);
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

    useEffect(() => {
        if (!isMobile) {
            setMobileTopOffset(0);

            return;
        }

        const syncHeaderOffset = () => {
            const headerElement = document.querySelector<HTMLElement>('[data-public-header]');
            const measuredTop = Math.round(headerElement?.getBoundingClientRect().bottom ?? 150);
            setMobileTopOffset(Math.max(0, measuredTop));
        };

        syncHeaderOffset();

        window.addEventListener('resize', syncHeaderOffset);
        window.addEventListener('scroll', syncHeaderOffset, { passive: true });

        return () => {
            window.removeEventListener('resize', syncHeaderOffset);
            window.removeEventListener('scroll', syncHeaderOffset);
        };
    }, [isMobile, isMobileOpen]);

    const sidebarWidthClass = isMobile ? 'w-64' : (collapsed ? 'w-24' : 'w-64');
    const isCustomerLoggedIn = !!page.props?.customer;
    const isOrganiserLoggedIn = !!page.props?.organiser || !!page.props?.auth?.user;
    const customerMenuItems: GuestMenuItem[] = isCustomerLoggedIn
        ? [
              { href: '/customer/orders', label: 'My orders', icon: ShoppingCart },
              { href: '/customer/orders#tickets', label: 'My tickets', icon: Ticket },
          ]
        : [];
    const organiserMenuItems: GuestMenuItem[] = isOrganiserLoggedIn
        ? [{ href: '/events', label: 'My events', createHref: '/events/create', icon: Calendar }]
        : [];

    const menuItems: GuestMenuItem[] = [
        ...customerMenuItems,
        ...organiserMenuItems,
        ...commonMenuItems,
    ].filter((item) => {
        if (!item.moduleKey) {
            return true;
        }

        return page.props?.module_settings?.[item.moduleKey] !== false;
    });

    const toggleMenuSection = (href: string) => {
        setExpandedMenuHref((current) => (current === href ? null : href));
    };

    return (
        <>
            {isMobile && isMobileOpen && (
                <button
                    type="button"
                    className="fixed inset-x-0 bottom-0 z-40 bg-black/45 min-[1000px]:hidden"
                    style={{ top: `${mobileTopOffset}px` }}
                    aria-label="Close guest menu overlay"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`guest-sidebar-shell self-start p-3 transition-all duration-200 ${sidebarWidthClass} ${isMobile ? 'fixed left-0 z-50 !w-[70vw] max-w-[70vw] overflow-y-auto overscroll-contain border-r border-zinc-800 shadow-2xl' : 'relative sticky top-[4.25rem] z-40 shrink-0 min-h-[calc(100svh-4.25rem)]'} ${isMobile && !isMobileOpen ? 'hidden' : ''} min-[1000px]:block`}
                style={isMobile ? { top: `${mobileTopOffset}px`, height: `calc(100svh - ${mobileTopOffset}px)` } : undefined}
            >
                {!isMobile && (
                    <button
                        type="button"
                        className="absolute -right-8 top-4 inline-flex h-8 w-8 items-center justify-center rounded-r-md rounded-l-none border border-l-0 border-zinc-700 bg-[#111317] text-zinc-200 transition-colors hover:bg-zinc-800"
                        onClick={() => setCollapsed((value) => !value)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : <ChevronLeft className="h-4 w-4" aria-hidden="true" />}
                    </button>
                )}

                {isMobile && (
                    <div className="relative border-b border-zinc-800 pb-3 pr-0">
                        <div className="flex items-start gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Menu</p>
                                <p className="mt-1 text-2xl font-semibold text-zinc-100">My account</p>
                            </div>
                        </div>
                    </div>
                )}

                {isMobile && (
                    <button
                        type="button"
                        className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-[#111317] text-zinc-200 transition-colors hover:bg-zinc-800"
                        onClick={() => setIsMobileOpen(false)}
                        aria-label="Close guest menu"
                        title="Close"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                )}

                <nav className="mt-3 flex flex-col gap-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = page.url === item.href || page.url.startsWith(`${item.href}/`);
                        const showSubmenu = !!item.createHref && (!collapsed || isMobile);
                        const isExpanded = expandedMenuHref === item.href;

                        return (
                            <div key={`${item.href}:${item.label}`} className="space-y-1">
                                <div className={`guest-sidebar-link ${isActive ? 'guest-sidebar-link-active' : ''} pr-1`}>
                                    <Link
                                        href={item.href}
                                        className="flex min-w-0 flex-1 items-center gap-2.5"
                                        onClick={() => {
                                            if (isMobile) {
                                                setIsMobileOpen(false);
                                            }
                                        }}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {(!collapsed || isMobile) && <span>{item.label}</span>}
                                    </Link>

                                    {showSubmenu && (
                                        <button
                                            type="button"
                                            className="ml-auto inline-flex h-6 w-6 items-center justify-center text-zinc-300 transition-colors hover:text-white"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleMenuSection(item.href);
                                            }}
                                            aria-label={isExpanded ? `Collapse ${item.label} submenu` : `Expand ${item.label} submenu`}
                                            title={isExpanded ? 'Collapse' : 'Expand'}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4" aria-hidden="true" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {showSubmenu && isExpanded && (
                                    <div className="ml-7 flex flex-col gap-1">
                                        <Link
                                            href={item.href}
                                            className="rounded-md px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                                            onClick={() => {
                                                if (isMobile) {
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                        >
                                            View all
                                        </Link>
                                        <Link
                                            href={item.createHref}
                                            className="rounded-md px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                                            onClick={() => {
                                                if (isMobile) {
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                        >
                                            Add new
                                        </Link>
                                    </div>
                                )}
                            </div>
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
