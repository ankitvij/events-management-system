import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import type { SharedData } from '@/types';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user ?? null;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                data-test="sidebar-menu-button"
                            >
                                {user ? (
                                    <>
                                        <UserInfo user={user} />
                                        <ChevronsUpDown className="ml-auto size-4" />
                                    </>
                                ) : (
                                    <div className="flex w-full items-center justify-between">
                                        <span className="text-sm">Guest</span>
                                        <div className="ml-auto flex space-x-2">
                                            <a href="/login" className="text-sm">
                                                Log in
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        {user && (
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                align="end"
                                side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                            >
                                <UserMenuContent user={user} />
                            </DropdownMenuContent>
                        )}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
