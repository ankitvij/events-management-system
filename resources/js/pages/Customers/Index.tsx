import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Customer } from '@/types/entities';

type Props = {
    customers: Pagination<Customer>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

export default function CustomersIndex({ customers }: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    function toggleActive(id: number, value: boolean) {
        router.put(`/customers/${id}/active`, { active: value });
    }

    function applySort(key: string) {
        const cur = params?.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        applyFilters({ sort: next || null, page: null });
    }

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                sp.delete(key);
            } else {
                sp.set(key, value);
            }
        });
        router.get(`/customers${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="p-4">
                <div className="mb-4 flex justify-end">
                    <div className="flex gap-2">
                        <ActionButton href="/customers/create">New Customer</ActionButton>
                    </div>
                </div>

                <CompactPagination links={customers.links} />

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <div className="md:col-span-6 flex items-center gap-3">
                        <button
                            onClick={() => applySort('name')}
                            className="btn-primary shrink-0"
                        >
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search customers..."
                            className="input w-full"
                        />
                    </div>
                    <button
                        onClick={() => applySort('email')}
                        className="btn-primary md:col-span-4 w-full justify-start min-w-max whitespace-nowrap"
                    >
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-1 min-w-max whitespace-nowrap">Active</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="grid gap-3">
                    {customers.data?.map((customer: Customer) => (
                        <div key={customer.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-6">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/customers/${customer.id}`} className="text-lg font-medium">{customer.name}</Link>
                                        {!customer.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-muted md:col-span-4">{customer.email || '—'}</div>
                                <div className="md:col-span-2">
                                <div className="flex gap-2 items-center justify-start md:justify-end">
                                    <ActiveToggleButton
                                        active={!!customer.active}
                                        onToggle={() => toggleActive(customer.id, !customer.active)}
                                        label="customer"
                                    />

                                    <div className="flex gap-2">
                                        <ActionIcon href={`/customers/${customer.id}/edit`} aria-label="Edit customer" title="Edit customer"><Pencil className="h-4 w-4" /></ActionIcon>
                                        <ActionIcon
                                            danger
                                            onClick={() => router.delete(`/customers/${customer.id}`)}
                                            aria-label="Delete customer"
                                            title="Delete customer"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </ActionIcon>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={customers.links} />
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
