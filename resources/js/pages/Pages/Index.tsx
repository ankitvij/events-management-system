import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = { pages: any };

export default function Index({ pages }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Pages', href: '/pages' },
    ];

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);

    useEffect(() => {
        const t = setTimeout(() => {
            const qs = new URLSearchParams(window.location.search);
            if (search) qs.set('q', search); else qs.delete('q');
            router.get(`/pages?${qs.toString()}`);
        }, 300);
        return () => clearTimeout(t);
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pages" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">

                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="input" />
                    </div>
                    <Link href="/pages/create" className="btn-primary">New Page</Link>
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
