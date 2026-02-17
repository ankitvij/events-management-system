import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Agency = {
    id: number;
    name: string;
    email?: string | null;
    active?: boolean;
    artists_count?: number;
    organisers_count?: number;
    events_count?: number;
    users_count?: number;
    vendors_count?: number;
};

export default function ShowAgency({ agency }: { agency: Agency }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agencies', href: '/agencies' },
        { title: agency.name, href: `/agencies/${agency.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={agency.name} />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">{agency.name}</h1>
                    <ActionIcon href={`/agencies/${agency.id}/edit`} aria-label="Edit agency" title="Edit agency"><Pencil className="h-4 w-4" /></ActionIcon>
                </div>

                <div className="box grid gap-2 text-sm">
                    <div><strong>Email:</strong> {agency.email ?? '—'}</div>
                    <div><strong>Status:</strong> {agency.active ? 'Active' : 'Inactive'}</div>
                </div>

                <div className="box grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div><strong>Artists:</strong> {agency.artists_count ?? 0}</div>
                    <div><strong>Organisers:</strong> {agency.organisers_count ?? 0}</div>
                    <div><strong>Events:</strong> {agency.events_count ?? 0}</div>
                    <div><strong>Promoters/Users:</strong> {agency.users_count ?? 0}</div>
                    <div><strong>Vendors:</strong> {agency.vendors_count ?? 0}</div>
                </div>
            </div>
        </AppLayout>
    );
}
