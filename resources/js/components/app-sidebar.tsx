import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    CreditCard,
    FileText,
    LayoutGrid,
    LogOut,
    ScrollText,
    Settings,
    Shield,
    Users,
    Users2,
    UserSquare2,
    ClipboardList,
    Mic2,
    Megaphone,
    BadgePercent,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage();
    const isSuper = !!page.props?.auth?.user?.is_super_admin;
    const role = page.props?.auth?.user?.role;

    const isManager = !!page.props?.auth?.user && (role === 'admin' || role === 'agency' || page.props.auth.user.is_super_admin);

    const items: NavItem[] = [];

    items.push({ title: 'Dashboard', href: dashboard(), icon: LayoutGrid });
    if (isManager) {
        items.push({ title: 'Orders', href: '/orders', icon: ClipboardList });
    }
    if (page.props?.auth?.user && !isManager) {
        items.push({ title: 'Orders', href: '/orders', icon: ClipboardList });
    }
    items.push({ title: 'Events', href: '/events', icon: Calendar });
    if (isManager) {
        items.push({ title: 'Users', href: '/users', icon: Users });
        items.push({ title: 'Agencies', href: '/agencies', icon: Building2 });
    }
    if (page.props?.auth?.user) {
        items.push({ title: 'Organisers', href: '/organisers', icon: Users2 });
    }
    if (isSuper) {
        items.push({ title: 'Roles', href: '/roles', icon: Shield });
    }
    if (isManager) {
        items.push({ title: 'Artists', href: '/artists', icon: Mic2 });
        items.push({ title: 'Vendors', href: '/vendors', icon: Users2 });
        items.push({ title: 'Promoters', href: '/promoters', icon: Megaphone });
        items.push({ title: 'Customers', href: '/customers', icon: UserSquare2 });
        items.push({ title: 'Pages', href: '/pages', icon: FileText });
    }
    if (page.props?.auth?.user && !isManager) {
        items.push({ title: 'Customers', href: '/customers', icon: UserSquare2 });
    }
    if (page.props?.auth?.user) {
        items.push({ title: 'Discount Codes', href: '/discount-codes', icon: BadgePercent });
    }
    if (isSuper) {
        items.push({ title: 'Payment Methods', href: '/orders/payment-methods', icon: CreditCard });
    }
    if (isSuper) {
        items.push({ title: 'Logs', href: '/admin/error-logs', icon: ScrollText });
    }
    if (page.props?.auth?.user) {
        items.push({ title: 'Settings', href: '/settings/profile', icon: Settings });
        items.push({ title: 'Logout', href: '/logout', method: 'post', icon: LogOut });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="w-auto px-1">
                            <Link href={dashboard()} prefetch className="inline-flex items-center">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>
        </Sidebar>
    );
}
