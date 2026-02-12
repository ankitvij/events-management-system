import { Head, Link, router } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Customer, PaginationLink } from '@/types/entities';

type Props = {
    customers: Pagination<Customer>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

export default function CustomersIndex({ customers }: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    function toggleActive(id: number, value: boolean) {
        router.put(`/customers/${id}`, { active: value });
    }

    function applySort(key: string) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        const cur = sp.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) next = `${key}_desc`;
        else if (cur === `${key}_desc`) next = '';
        else next = `${key}_asc`;
        if (next === '') sp.delete('sort'); else sp.set('sort', next);
        sp.delete('page');
        router.get(`/customers${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/customers" links={customers.links} showSearch searchPlaceholder="Search customers..." />
                    </div>

                    <div className="flex gap-2">
                        <ActionButton href="/customers/create">New Customer</ActionButton>
                    </div>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('name')}
                        className="md:col-span-6 text-left min-w-max whitespace-nowrap"
                    >
                        Name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-4 min-w-max whitespace-nowrap">Email / Phone</div>
                    <div className="md:col-span-1 min-w-max whitespace-nowrap">Active</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="mb-4">
                        {customers.links?.map((link) => (
                            link.url ? (
                                <Link
                                    key={String(link.label)}
                                    href={link.url}
                                    className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                    as="a"
                                    preserveScroll
                                >
                                    <span dangerouslySetInnerHTML={{ __html: String(link.label) }} />
                                </Link>
                            ) : (
                                <span key={String(link.label)} className="px-2" dangerouslySetInnerHTML={{ __html: String(link.label) }} />
                            )
                        ))}
                    </div>

                    <div className="grid gap-3">
                    {customers.data?.map((customer: Customer) => (
                        <div key={customer.id} className="box">
                            <div className="flex justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/customers/${customer.id}`} className="text-lg font-medium">{customer.name}</Link>
                                        {!customer.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{customer.email || customer.phone}</div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="flex items-center mr-3">
                                        <input type="checkbox" checked={!!customer.active} onChange={e => toggleActive(customer.id, e.target.checked)} />
                                        <span className="ml-2 text-sm text-muted">Active</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <Link href={`/customers/${customer.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                        <form action={`/customers/${customer.id}`} method="post" className="inline">
                                            <input type="hidden" name="_method" value="delete" />
                                            <button className="btn-danger" type="submit">Delete</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {customers.links?.map((link: PaginationLink) => (
                        link.url ? (
                            <Link
                                key={link.label}
                                href={link.url}
                                className={link.active ? 'font-medium px-2' : 'text-muted px-2'}
                                as="a"
                                preserveScroll
                            >
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            </Link>
                        ) : (
                            <span key={link.label} className="px-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                        )
                    ))}
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
