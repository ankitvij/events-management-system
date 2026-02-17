import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Organiser } from '@/types/entities';

export default function Show({ organiser }: { organiser: Organiser }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organisers', href: '/organisers' },
        { title: organiser.name, href: `/organisers/${organiser.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={organiser.name} />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">{organiser.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/organisers" className="btn-secondary" aria-label="Back to organisers" title="Back to organisers"><ArrowLeft className="h-4 w-4" /></Link>
                        <ActionIcon href={`/organisers/${organiser.id}/edit`} aria-label="Edit organiser" title="Edit organiser"><Pencil className="h-4 w-4" /></ActionIcon>
                        <ActionIcon danger onClick={() => router.delete(`/organisers/${organiser.id}`)} aria-label="Delete organiser" title="Delete organiser"><Trash2 className="h-4 w-4" /></ActionIcon>
                    </div>
                </div>

                <div className="space-y-2">
                    <div><strong>Email:</strong> {organiser.email || '—'}</div>
                    <div><strong>Active:</strong> {organiser.active ? 'Yes' : 'No'}</div>
                    {(organiser.bank_account_name || organiser.bank_iban || organiser.bank_bic || organiser.bank_reference_hint) && (
                        <div className="mt-3 space-y-1">
                            <div className="font-semibold">Bank details</div>
                            {organiser.bank_account_name && <div><strong>Account name:</strong> {organiser.bank_account_name}</div>}
                            {organiser.bank_iban && <div><strong>IBAN:</strong> {organiser.bank_iban}</div>}
                            {organiser.bank_bic && <div><strong>BIC/SWIFT:</strong> {organiser.bank_bic}</div>}
                            {organiser.bank_reference_hint && <div><strong>Reference hint:</strong> {organiser.bank_reference_hint}</div>}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
