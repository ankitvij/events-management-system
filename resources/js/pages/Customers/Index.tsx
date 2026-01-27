import { Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    customers: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/customers' },
];

export default function CustomersIndex({ customers }: Props) {
    const page = usePage();

    function toggleActive(id: number, value: boolean) {
        router.put(`/customers/${id}`, { active: value });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">

                    <Link href="/customers/create" className="btn-primary">New Customer</Link>
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
