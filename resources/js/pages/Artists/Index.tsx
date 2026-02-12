import { Head, Link, router, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import CompactPagination from '@/components/compact-pagination';
import ListControls from '@/components/list-controls';
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
    const canManage = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);

    function toggleActive(id: number, value: boolean) {
        router.put(`/artists/${id}`, { active: value }, { preserveScroll: true });
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

                <div className="mb-4 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
                    <div className="w-full min-[900px]:w-auto">
                        <ListControls path="/artists" links={artists.links} showSearch searchPlaceholder="Search artists..." />
                    </div>
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

                <div className="grid gap-3">
                    {artists.data?.map((a: Artist) => (
                        <div key={a.id} className="box">
                            <div className="flex justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Link href={`/artists/${a.id}`} className="text-lg font-medium break-words">
                                            {a.name}
                                        </Link>
                                        {!a.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted break-words">{a.email}</div>
                                    <div className="text-sm text-muted">{a.city}</div>
                                </div>

                                {canManage ? (
                                    <div className="flex gap-2 items-center shrink-0">
                                        <label className="flex items-center mr-3">
                                            <input type="checkbox" checked={!!a.active} onChange={e => toggleActive(a.id, e.target.checked)} />
                                            <span className="ml-2 text-sm text-muted">Active</span>
                                        </label>

                                        <div className="flex gap-2">
                                            <Link href={`/artists/${a.id}/edit`} className="btn-secondary px-3 py-1 text-sm">Edit</Link>
                                            <form action={`/artists/${a.id}`} method="post" className="inline">
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
                    <CompactPagination links={artists.links} />
                </div>
            </div>
        </AppLayout>
    );
}
