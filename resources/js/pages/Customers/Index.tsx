import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import ListControls from '@/components/list-controls';
import type { BreadcrumbItem } from '@/types';

type Props = {
    customers: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

export default function CustomersIndex({ customers }: Props) {
    const page = usePage();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);

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

                    <Link href="/customers/create" className="btn-primary">New Customer</Link>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('name')}
                        className="md:col-span-6 text-left"
                        aria-sort={params?.get('sort') === 'name_asc' ? 'ascending' : params?.get('sort') === 'name_desc' ? 'descending' : 'none'}
                    >
                        Name
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-4">Email / Phone</div>
                    <div className="md:col-span-1">Active</div>
                    <div className="md:col-span-1" />
                </div>

                <div>
                    <div className="mb-4">
                        {customers.links?.map((link: any) => (
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

                    <div className="grid gap-3">
                    {customers.data?.map((customer: any) => (
                        <div key={customer.id} className="border rounded p-3">
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
                                        <Link href={`/customers/${customer.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                        <form action={`/customers/${customer.id}`} method="post" className="inline">
                                            <input type="hidden" name="_method" value="delete" />
                                            <button className="text-sm text-red-600" type="submit">Delete</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {customers.links?.map((link: any) => (
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
