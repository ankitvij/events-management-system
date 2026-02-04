import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type LinkItem = {
    url?: string | null;
    label?: string;
    active?: boolean;
};

type Props = {
    path?: string;
    links?: LinkItem[];
    showSearch?: boolean;
    searchPlaceholder?: string;
    showSort?: boolean;
    showActive?: boolean;
};

export default function ListControls({
    path,
    links = [],
    showSearch = true,
    searchPlaceholder = 'Search...',
    showSort = false,
    showActive = false,
}: Props) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initial = params?.get('q') ?? '';
    const [search, setSearch] = useState(initial);
    const timeoutRef = useRef<number | null>(null);
    const firstRender = useRef(true);
    const base = path ?? (typeof window !== 'undefined' ? window.location.pathname : '');

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const delay = 300;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            const qs = new URLSearchParams(window.location.search);
            if (search) qs.set('q', search); else qs.delete('q');
            router.get(`${base}${qs.toString() ? `?${qs.toString()}` : ''}`);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [search, base]);

    function applyFilters(updates: Record<string, string | null>) {
        if (typeof window === 'undefined') return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === '') sp.delete(k); else sp.set(k, v);
        });
        const q = sp.toString();
        router.get(`${base}${q ? `?${q}` : ''}`);
    }

    return (
        <div className="mb-4 flex items-center justify-between">
            <div>
                {links?.map((l: LinkItem, idx: number) => {
                    // Replace explicit Previous/Next text with arrows for compact pagination
                    let label = l.label || '';
                    // Use « and » for previous/next and collapse repeated arrows
                    label = label.replace(/Previous/gi, '«').replace(/Next/gi, '»');
                    // fallback for common entities -> normalize to « and »
                    label = label.replace(/&laquo;|«/g, '«').replace(/&raquo;|»/g, '»').replace(/&lsaquo;|‹/g, '«').replace(/&rsaquo;|›/g, '»');
                    // collapse any repeated arrows to a single char
                    label = label.replace(/«+/g, '«').replace(/»+/g, '»');
                    return l.url ? (
                        <Link key={idx} href={l.url} className={`px-3 py-1 rounded ${l.active ? 'bg-gray-900 text-white' : 'bg-white border'}`}>
                            <span dangerouslySetInnerHTML={{ __html: label }} />
                        </Link>
                    ) : (
                        <span key={idx} className="px-3 py-1 rounded text-muted" dangerouslySetInnerHTML={{ __html: label }} />
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                {showSearch && (
                    <input name="q" value={search} onChange={e => setSearch(e.target.value)} placeholder={searchPlaceholder} className="input" />
                )}

                {/* city/country filters removed — controlled centrally where needed */}

                {showSort && (
                    <select value={params?.get('sort') ?? ''} onChange={e => applyFilters({ sort: e.target.value || null, page: null })} className="input">
                        <option value="">Sort: Latest</option>
                        <option value="start_asc">Sort: Start (soonest)</option>
                        <option value="start_desc">Sort: Start (latest)</option>
                        <option value="created_desc">Sort: Newest</option>
                        <option value="title_asc">Sort: Title (A–Z)</option>
                    </select>
                )}

                {showActive && (
                    <select value={params?.get('active') ?? 'all'} onChange={e => applyFilters({ active: e.target.value || null, page: null })} className="input">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}
            </div>
        </div>
    );
}
