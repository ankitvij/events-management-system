import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import ListControls from '@/components/list-controls';
import type { BreadcrumbItem } from '@/types';

type Props = { pages: any };

export default function Index({ pages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
    ];

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);

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
        router.get(`/pages${sp.toString() ? `?${sp.toString()}` : ''}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ListControls path="/pages" links={pages.links} showSearch searchPlaceholder="Search pages..." />
                    </div>
                    <Link href="/pages/create" className="btn-primary">New Page</Link>
                </div>

                <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-sm text-muted">
                    <button
                        onClick={() => applySort('title')}
                        className="md:col-span-8 text-left"
                        aria-sort={params?.get('sort') === 'title_asc' ? 'ascending' : params?.get('sort') === 'title_desc' ? 'descending' : 'none'}
                    >
                        Title
                        <span className="ml-1 text-xs">{params?.get('sort')?.startsWith('title_') ? (params.get('sort')?.endsWith('_asc') ? '▲' : '▼') : ''}</span>
                    </button>
                    <div className="md:col-span-2">Active</div>
                    <div className="md:col-span-2" />
                </div>

                <div>
                    <div className="mb-4">
                        {pages.links?.map((link: any) => (
                            link.url ? (
                                <Link key={link.label} href={link.url} className={link.active ? 'font-medium px-2' : 'text-muted px-2'} as="a" preserveScroll>
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Link>
                            ) : (
                                <span key={link.label} className="px-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                            )
                        ))}
                    </div>

                    <div className="grid gap-3">
                    {pages.data?.map((page: any) => (
                        <div key={page.id} className="border rounded p-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <Link href={`/pages/${page.id}`} className="text-lg font-medium">{page.title}</Link>
                                    {!page.active && <div className="text-sm text-muted">Inactive</div>}
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/pages/${page.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                    <form action={`/pages/${page.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="text-sm text-red-600" type="submit">Delete</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    {pages.links?.map((link: any) => (
                        link.url ? (
                            <Link key={link.label} href={link.url} className={link.active ? 'font-medium px-2' : 'text-muted px-2'} as="a" preserveScroll>
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
