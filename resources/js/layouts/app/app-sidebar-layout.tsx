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
            {!showSidebar && <PublicHeader />}
            <AppShell variant="sidebar">
                {showSidebar && <AppSidebar />}
                <AppContent
                    variant="sidebar"
                    className={showSidebar ? 'overflow-x-hidden' : 'overflow-x-hidden pt-0'}
                >
                    {showSidebar && <AppSidebarHeader breadcrumbs={breadcrumbs} />}
                    {showSidebar ? children : (
                        <div className="mx-auto w-full max-w-screen-2xl px-2 sm:px-4 lg:px-6">
                            <div className="mt-6 flex items-start gap-4">
                                <GuestSidebar />
                                <div className="min-w-0 flex-1">{children}</div>
                            </div>
                        </div>
                    )}
                </AppContent>
            </AppShell>
        </>
    );
}
