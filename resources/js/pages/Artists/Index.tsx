import { Head, Link, router, usePage } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import ListControls from '@/components/list-controls';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Artist, Pagination, PaginationLink } from '@/types/entities';

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

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/artists" links={artists.links} showSearch searchPlaceholder="Search artists..." />
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href={canManage ? '/artists/create' : '/artists/signup'}>New Artist</ActionButton>
                    </div>
                </div>

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
                    {artists.links?.map((link: PaginationLink) => (
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
