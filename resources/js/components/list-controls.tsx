import { router } from '@inertiajs/react';
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
    showActive?: boolean;
};

export default function ListControls({
    path,
    links: _links = [],
    showSearch = true,
    searchPlaceholder = 'Search...',
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
        if (!updates) return;
        const sp = new URLSearchParams(window.location.search);
        Object.entries(updates).forEach(([k, v]) => {
            if (v === null || v === '') sp.delete(k); else sp.set(k, v);
        });
        const q = sp.toString();
        router.get(`${base}${q ? `?${q}` : ''}`);
    }

    return (
        <div className="mb-4 flex w-full flex-wrap items-center justify-end gap-3">
                {showSearch && (
                    <input name="q" value={search} onChange={e => setSearch(e.target.value)} placeholder={searchPlaceholder} className="input" />
                )}

                {/* city/country filters removed — controlled centrally where needed */}

                {showActive && (
                    <select value={params?.get('active') ?? 'all'} onChange={e => applyFilters({ active: e.target.value || null, page: null })} className="input">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}
        </div>
    );
}
