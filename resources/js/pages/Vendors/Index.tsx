import { Head, Link, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, PaginationLink, Vendor } from '@/types/entities';

type Props = {
    vendors: Pagination<Vendor>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vendors', href: '/vendors' },
];

export default function VendorsIndex({ vendors }: Props) {
    const page = usePage<{ flash?: { success?: string; error?: string } }>();
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendors" />

            <div className="p-4">
                {page.props?.flash?.success && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {page.props.flash.success}
                    </div>
                )}
                {page.props?.flash?.error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/vendors" links={vendors.links} showSearch searchPlaceholder="Search vendors..." />
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href={canManage ? '/vendors/create' : '/vendors/signup'}>New Vendor</ActionButton>
                    </div>
                </div>

                <div className="grid gap-3">
                    {vendors.data?.map((v: Vendor) => (
                        <div key={v.id} className="box">
                            <div className="flex justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/vendors/${v.id}`} className="text-lg font-medium break-words">
                                            {v.name}
                                        </Link>
                                        {!v.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted break-words">{v.email}</div>
                                    <div className="text-sm text-muted">{v.type}{v.city ? ` · ${v.city}` : ''}</div>
                                </div>

                                {canManage ? (
                                    <div className="flex gap-2 items-center shrink-0">
                                        <div className="flex gap-2">
                                            <Link href={`/vendors/${v.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                            <form action={`/vendors/${v.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit">Delete</button>
                                            </form>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {vendors.links?.map((link: PaginationLink) => (
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
            </div>
        </AppLayout>
    );
}
