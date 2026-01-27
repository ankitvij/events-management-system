import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    organisers: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Organisers', href: '/organisers' },
];

export default function OrganisersIndex({ organisers }: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const q = params?.get('q') ?? '';

    const [search, setSearch] = useState<string>(q);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);

    function toggleActive(id: number, value: boolean) {
        router.put(`/organisers/${id}`, { active: value });
    }

    function onSearch(value: string) {
        setSearch(value);
    }

    useEffect(() => {
        // Skip firing on initial render to avoid duplicate navigation
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const delay = 300;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            router.get(`/organisers?q=${encodeURIComponent(search)}`);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Organisers" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">

                        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search organisers..." className="input" />
                    </div>
                    <Link href="/organisers/create" className="btn-primary">New Organiser</Link>
                </div>

                <div>
                    <div className="mb-4">
                        {organisers.links?.map((link: any) => (
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
                    {organisers.data?.map((org: any) => (
                        <div key={org.id} className="border rounded p-3">
                            <div className="flex justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/organisers/${org.id}`} className="text-lg font-medium">{org.name}</Link>
                                        {!org.active && (
                                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Inactive</span>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted">{org.email}</div>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <label className="flex items-center mr-3">
                                        <input type="checkbox" checked={!!org.active} onChange={e => toggleActive(org.id, e.target.checked)} />
                                        <span className="ml-2 text-sm text-muted">Active</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <Link href={`/organisers/${org.id}/edit`} className="text-sm text-blue-600">Edit</Link>
                                        <form action={`/organisers/${org.id}`} method="post" className="inline">
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
                    {organisers.links?.map((link: any) => (
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
        </AppLayout>
    );
}
