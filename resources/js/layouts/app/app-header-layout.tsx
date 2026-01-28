import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import PublicHeader from '@/components/public-header';
import { AppShell } from '@/components/app-shell';
import type { AppLayoutProps, SharedData } from '@/types';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
}: AppLayoutProps) {
    const page = usePage<SharedData>();
    const user = page.props?.auth?.user ?? null;

    return (
        <AppShell>
            {user ? (
                <AppHeader breadcrumbs={breadcrumbs} />
            ) : (
                <PublicHeader />
            )}
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
