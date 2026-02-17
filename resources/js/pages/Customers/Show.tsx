import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Customer } from '@/types/entities';

export default function Show({ customer }: { customer: Customer }) {
    const customerTitle = customer.name ?? 'Customer';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/customers' },
        { title: customerTitle, href: `/customers/${customer.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customerTitle} />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold">{customer.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/customers" className="btn-secondary" aria-label="Back to customers" title="Back to customers"><ArrowLeft className="h-4 w-4" /></Link>
                        <ActionIcon href={`/customers/${customer.id}/edit`} aria-label="Edit customer" title="Edit customer"><Pencil className="h-4 w-4" /></ActionIcon>
                        <ActionIcon danger onClick={() => router.delete(`/customers/${customer.id}`)} aria-label="Delete customer" title="Delete customer"><Trash2 className="h-4 w-4" /></ActionIcon>
                    </div>
                </div>

                <div className="space-y-2">
                    <div><strong>Email:</strong> {customer.email || '—'}</div>
                    <div><strong>Phone:</strong> {customer.phone || '—'}</div>
                    <div><strong>Active:</strong> {customer.active ? 'Yes' : 'No'}</div>
                </div>
            </div>
        </AppLayout>
    );
}
