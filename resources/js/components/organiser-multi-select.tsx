import { useState, useMemo } from 'react';

type Organiser = { id: number; name: string };

export default function OrganiserMultiSelect({ organisers, value, onChange }: { organisers: Organiser[]; value: number[]; onChange: (v: number[]) => void; }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        if (!query) return organisers;
        return organisers.filter(o => o.name.toLowerCase().includes(query.toLowerCase()));
    }, [organisers, query]);

    function toggle(id: number) {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    }

    return (
        <div>
            <input
                type="search"
                placeholder="Search organisers..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="input mb-2"
            />

            <div className="max-h-48 overflow-auto border rounded p-2">
                {filtered.length === 0 && <div className="text-sm text-muted">No organisers</div>}
                {filtered.map(o => (
                    <label key={o.id} className="flex items-center gap-2 text-sm py-1">
                        <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
                        <span>{o.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
