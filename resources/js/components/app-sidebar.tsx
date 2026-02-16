import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CreditCard,
    FileText,
    LayoutGrid,
    ScrollText,
    Settings,
    Shield,
    Users,
    Users2,
    UserSquare2,
    ClipboardList,
    Folder,
    Mic2,
    Megaphone,
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/ankitvij/events-management-system',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage();
    const isSuper = !!page.props?.auth?.user?.is_super_admin;

    const isAdmin = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    const items: NavItem[] = [];

    items.push({ title: 'Dashboard', href: dashboard(), icon: LayoutGrid });
    if (isAdmin) {
        items.push({ title: 'Orders', href: '/orders', icon: ClipboardList });
    }
    items.push({ title: 'Events', href: '/events', icon: Calendar });
    if (isAdmin) {
        items.push({ title: 'Pages', href: '/pages', icon: FileText });
    }
    if (isSuper) {
        items.push({ title: 'Roles', href: '/roles', icon: Shield });
    }
    if (isAdmin) {
        items.push({ title: 'Users', href: '/users', icon: Users });
    }
    if (page.props?.auth?.user) {
        items.push({ title: 'Organisers', href: '/organisers', icon: Users2 });
        items.push({ title: 'Customers', href: '/customers', icon: UserSquare2 });
    }
    if (isAdmin) {
        items.push({ title: 'Artists', href: '/artists', icon: Mic2 });
        items.push({ title: 'Vendors', href: '/vendors', icon: Users2 });
        items.push({ title: 'Promoters', href: '/promoters', icon: Megaphone });
    }
    if (isSuper) {
        items.push({ title: 'Payment Methods', href: '/orders/payment-methods', icon: CreditCard });
    }
    if (page.props?.auth?.user) {
        items.push({ title: 'Settings', href: '/settings/profile', icon: Settings });
    }
    if (isSuper) {
        items.push({ title: 'Logs', href: '/admin/error-logs', icon: ScrollText });
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

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
