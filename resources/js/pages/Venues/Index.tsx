import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionIcon from '@/components/action-icon';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Pagination, Venue } from '@/types/entities';

type Props = {
    venues: Pagination<Venue>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Venues', href: '/venues' },
];

export default function VenuesIndex({ venues }: Props) {
    const page = usePage<{ flash?: { success?: string; error?: string }; auth?: { user?: { role?: string; is_super_admin?: boolean } | null } }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.role === 'agency' || page.props.auth.user.is_super_admin);

    function toggleActive(id: number, value: boolean) {
        router.put(`/venues/${id}/active`, { active: value }, { preserveScroll: true });
    }

    function applySort(key: string) {
        const cur = params?.get('sort') ?? '';
        let next = '';
        if (cur === `${key}_asc`) {
            next = `${key}_desc`;
        } else if (cur === `${key}_desc`) {
            next = '';
        } else {
            next = `${key}_asc`;
        }
        applyFilters({ sort: next || null, page: null });
    }

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') {
            return;
        }

        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                sp.delete(key);
            } else {
                sp.set(key, value);
            }
        });

        router.get(`/venues${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Venues" />

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
                            <ActionButton href="/venues/create">New Venue</ActionButton>
                        ) : null}
                    </div>
                </div>

                <div className="mb-3 rounded-xl border border-[#c0cbd9] bg-[#eef2f7] p-3 shadow-sm">
                    <div className="md:hidden">
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search venues..."
                            className="input w-full !bg-white"
                        />
                    </div>
                    <CompactPagination links={venues.links} className="mt-2 justify-center md:justify-start" />
                </div>

                <div className="mb-2 hidden rounded-xl border border-[#c0cbd9] bg-[#eef2f7] p-3 text-sm text-muted md:grid md:grid-cols-12 md:gap-4">
                    <div className="md:col-span-6 flex items-center gap-3">
                        <button onClick={() => applySort('name')} className="btn-primary shrink-0">
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search venues..."
                            className="input w-full !bg-white"
                        />
                    </div>
                    <button onClick={() => applySort('email')} className="btn-primary md:col-span-4 w-full justify-start min-w-max whitespace-nowrap">
                        Email
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('email_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2" />
                </div>

                <div className="grid gap-3">
                    {venues.data?.length ? venues.data.map((venue: Venue) => (
                        <div key={venue.id} className="box border-[#c0cbd9] bg-[#eef2f7]">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="min-w-0 md:col-span-6">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/venues/${venue.id}`} className="text-lg font-semibold break-words">
                                            {venue.name}
                                        </Link>
                                        {!venue.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{venue.city || 'City TBD'}</div>
                                </div>
                                <div className="text-sm text-muted break-words md:col-span-4">{venue.email}</div>

                                <div className="md:col-span-2">
                                    {canManage ? (
                                        <div className="flex gap-2 items-center justify-start md:justify-end">
                                            <ActiveToggleButton
                                                active={!!venue.active}
                                                onToggle={() => toggleActive(venue.id, !venue.active)}
                                                label="venue"
                                            />
                                            <div className="flex gap-2">
                                                <ActionIcon href={`/venues/${venue.id}/edit`} aria-label="Edit venue" title="Edit venue"><Pencil className="h-4 w-4" /></ActionIcon>
                                                <ActionIcon
                                                    danger
                                                    onClick={() => router.delete(`/venues/${venue.id}`)}
                                                    aria-label="Delete venue"
                                                    title="Delete venue"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </ActionIcon>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="rounded-xl border border-dashed border-[#c0cbd9] bg-[#eef2f7] p-4 text-sm text-muted">
                            No venues found.
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <CompactPagination links={venues.links} className="justify-center md:justify-start" />
                </div>
            </div>
        </AppLayout>
    );
}
