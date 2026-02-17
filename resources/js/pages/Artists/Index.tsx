import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import ActiveToggleButton from '@/components/active-toggle-button';
import CompactPagination from '@/components/compact-pagination';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Artist, Pagination } from '@/types/entities';

type Props = {
    artists: Pagination<Artist>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Artists', href: '/artists' },
];

export default function ArtistsIndex({ artists }: Props) {
    const page = usePage<{ flash?: { success?: string; error?: string } }>();
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    function toggleActive(id: number, value: boolean) {
        router.put(`/artists/${id}/active`, { active: value }, { preserveScroll: true });
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
        router.get(`/artists${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artists" />

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
                            <ActionButton href="/artists/create">New Artist</ActionButton>
                        ) : (
                            <>
                                <ActionButton href="/artists/signup">Signup as Artist</ActionButton>
                                <Link href="/login" className="btn-secondary">Sign in as Artist</Link>
                            </>
                        )}
                    </div>
                </div>

                <CompactPagination links={artists.links} />

                <div className="mb-2 hidden md:grid md:grid-cols-12 gap-4 text-sm text-muted">
                    <div className="md:col-span-6 flex items-center gap-3">
                        <button onClick={() => applySort('name')} className="btn-primary shrink-0">
                            Name
                            <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('name_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                        </button>
                        <input
                            value={params?.get('q') ?? ''}
                            onChange={(e) => applyFilters({ q: e.target.value || null, page: null })}
                            placeholder="Search artists..."
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
                    {artists.data?.map((a: Artist) => (
                        <div key={a.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="min-w-0 md:col-span-6">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/artists/${a.id}`} className="text-lg font-medium break-words">
                                            {a.name}
                                        </Link>
                                        {!a.active && (
                                            <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{a.city}</div>
                                </div>
                                <div className="text-sm text-muted break-words md:col-span-4">{a.email}</div>

                                <div className="md:col-span-2">
                                    {canManage ? (
                                        <div className="flex flex-wrap gap-2 items-center justify-start md:justify-end">
                                        <ActiveToggleButton
                                            active={!!a.active}
                                            onToggle={() => toggleActive(a.id, !a.active)}
                                            label="artist"
                                        />

                                        <div className="flex gap-2">
                                            <Link href={`/artists/${a.id}/edit`} className="btn-secondary px-3 py-1 text-sm" aria-label="Edit artist" title="Edit artist"><Pencil className="h-4 w-4" /></Link>
                                            <form action={`/artists/${a.id}`} method="post" className="inline">
                                                <input type="hidden" name="_method" value="delete" />
                                                <button className="btn-danger" type="submit" aria-label="Delete artist" title="Delete artist"><Trash2 className="h-4 w-4" /></button>
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
                    <CompactPagination links={artists.links} />
                </div>
            </div>
        </AppLayout>
    );
}
