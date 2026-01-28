import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
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
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    {showSidebar && <AppSidebarHeader breadcrumbs={breadcrumbs} />}
                    {children}
                </AppContent>
            </AppShell>
        </>
    );
}
