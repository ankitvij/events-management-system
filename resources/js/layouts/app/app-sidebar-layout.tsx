import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import GuestSidebar from '@/components/guest-sidebar';
import PublicHeader from '@/components/public-header';
import type { AppLayoutProps, SharedData } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const page = usePage<SharedData>();
    const showSidebar = !!page.props?.auth?.user;
    return (
        <>
            <AppShell variant="sidebar">
                {showSidebar && <AppSidebar />}
                <AppContent
                    variant="sidebar"
                    className={showSidebar ? 'overflow-x-hidden' : 'overflow-visible pt-0 min-[1000px]:!py-0'}
                >
                    {showSidebar && <AppSidebarHeader breadcrumbs={breadcrumbs} />}
                    {showSidebar ? children : (
                        <div className="mx-auto w-full max-w-screen-2xl px-0 sm:px-4 lg:px-6">
                            <div className="mt-0 flex items-start gap-0">
                                <GuestSidebar />
                                <div className="min-w-0 flex-1 rounded-r-2xl bg-[#f3f4f6] max-[999px]:rounded-none max-[999px]:[&_.pagination]:ml-14">
                                    <PublicHeader />
                                    <div className="p-0 min-[1000px]:p-4">{children}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </AppContent>
            </AppShell>
        </>
    );
}
