import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Folder, LayoutGrid, Users, Shield } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import CartSidebar from '@/components/CartSidebar';
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Events',
        href: '/events',
        icon: Calendar,
    },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/ankit/events-management-system',
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

    const items = [...mainNavItems];
    // show organisers/customers to any authenticated user
    if (page.props?.auth?.user) {
        items.splice(2, 0, { title: 'Organisers', href: '/organisers', icon: Folder });
        items.splice(3, 0, { title: 'Customers', href: '/customers', icon: Folder });
    }

    // show Users only to admins/super_admin
    if (isAdmin) {
        items.push({ title: 'Users', href: '/users', icon: Users });
    }

    if (isSuper) {
        items.push({ title: 'Roles', href: '/roles', icon: Shield });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
                <div className="mb-4">
                    <CartSidebar cart={page.props?.cart} />
                </div>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
