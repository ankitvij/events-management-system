import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Vendor } from '@/types/entities';

type Props = {
    vendors: Pagination<Vendor>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vendors', href: '/vendors' },
];

export default function VendorsIndex({ vendors }: Props) {
    const page = usePage<{ flash?: { success?: string; error?: string } }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    function toggleActive(id: number, value: boolean) {
        router.put(`/vendors/${id}/active`, { active: value }, { preserveScroll: true });
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
        router.get(`/vendors${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

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

                <div className="mb-4 flex justify-end">
                    <div className="flex flex-wrap gap-2">
                        {canManage ? (
                            <ActionButton href="/vendors/create">New Vendor</ActionButton>
                        ) : (
                            <>
                                <ActionButton href="/vendors/signup">Signup as Vendor</ActionButton>
                                <Link href="/login" className="btn-secondary">Sign in as Vendor</Link>
                            </>
                        )}
                    </div>
                </div>

                <CompactPagination links={vendors.links} />

                <div className="mb-2 hidden md:grid md:grid-cols-12 gap-4 text-sm text-muted">
                    <div className="md:col-span-6 flex items-center gap-3">
                        <button onClick={() => applySort('name')} className="btn-primary shrink-0">
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search vendors..."
                            className="input w-full"
                        />
                    </div>
                    <button onClick={() => applySort('email')} className="btn-primary md:col-span-4 w-full justify-start min-w-max whitespace-nowrap">
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2" />
                </div>

                <div className="grid gap-3">
                    {vendors.data?.map((v: Vendor) => (
                        <div key={v.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="min-w-0 md:col-span-6">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/vendors/${v.id}`} className="text-lg font-medium break-words">
                                            {v.name}
                                        </Link>
                                        {!v.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{v.type}{v.city ? ` · ${v.city}` : ''}</div>
                                </div>
                                <div className="text-sm text-muted break-words md:col-span-4">{v.email}</div>

                                <div className="md:col-span-2">
                                    {canManage ? (
                                        <div className="flex gap-2 items-center justify-start md:justify-end">
                                        <ActiveToggleButton
                                            active={!!v.active}
                                            onToggle={() => toggleActive(v.id, !v.active)}
                                            label="vendor"
                                        />
                                        <div className="flex gap-2">
                                            <Link href={`/vendors/${v.id}/edit`} className="btn-secondary px-3 py-1 text-sm" aria-label="Edit vendor" title="Edit vendor"><Pencil className="h-4 w-4" /></Link>
                                            <form action={`/vendors/${v.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit" aria-label="Delete vendor" title="Delete vendor"><Trash2 className="h-4 w-4" /></button>
                                            </form>
                                        </div>
                                    </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <CompactPagination links={vendors.links} />
                </div>
            </div>
        </AppLayout>
    );
}
