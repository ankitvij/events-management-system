import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function MailFailuresWidget() {
    const page = usePage();
    const isAdmin = !!page.props?.auth?.user && (page.props.auth.user.role === 'admin' || page.props.auth.user.is_super_admin);
    const [lines, setLines] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (! isAdmin) return;
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetch('/admin/logs/mail-failures');
                if (! res.ok) throw new Error('failed');
                const json = await res.json();
                if (mounted) setLines(json.lines || []);
            } catch (e) {
                // ignore
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        const iv = setInterval(load, 30000);
        return () => { mounted = false; clearInterval(iv); };
    }, [isAdmin]);

    if (! isAdmin) return null;

    return (
        <div className="px-3 py-2 text-xs">
            <div className="flex items-center justify-between mb-2">
                <strong>Mail failures</strong>
                <span className="text-muted">{loading ? 'Refreshing…' : ''}</span>
            </div>
            <div className="max-h-48 overflow-auto bg-muted/10 p-2 rounded">
                {lines.length === 0 && <div className="text-muted">No recent failures.</div>}
                {lines.map((l, i) => (
                    <pre key={i} className="whitespace-pre-wrap break-words text-[11px] mb-1">{l}</pre>
                ))}
            </div>
        </div>
    );
}
