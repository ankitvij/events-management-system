import { useEffect, useState } from 'react';

type Props = {
    search?: string;
    onSearch?: (v: string) => void;
    showActive?: boolean;
    active?: string;
    onActiveChange?: (v: string) => void;
    sort?: string;
    onSortChange?: (v: string) => void;
    children?: React.ReactNode; // extra left controls
};

export default function ListControls({ search = '', onSearch, showActive = false, active = 'all', onActiveChange, sort = '', onSortChange, children }: Props) {
    const [q, setQ] = useState(search);

    useEffect(() => {
        setQ(search);
    }, [search]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (onSearch) onSearch(q);
        }, 300);
        return () => clearTimeout(t);
    }, [q]);

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                {children}
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="input" />
                {showActive && (
                    <select value={active} onChange={e => onActiveChange?.(e.target.value)} className="input">
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}
            </div>

            <div className="flex items-center gap-2">
                <select value={sort} onChange={e => onSortChange?.(e.target.value)} className="input">
                    <option value="">Sort: Default</option>
                    <option value="name_asc">Sort: Name (A–Z)</option>
                    <option value="created_desc">Sort: Newest</option>
                </select>
            </div>
        </div>
    );
}
