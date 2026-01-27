import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function Toasts() {
    const page = usePage();
    const flash = (page.props as any).flash || {};
    const [message, setMessage] = useState<string | null>(flash.success || flash.error || null);
    const [type, setType] = useState<'success'|'error'>(flash.success ? 'success' : flash.error ? 'error' : 'success');

    useEffect(() => {
        const f = (page.props as any).flash || {};
        const m = f.success || f.error || null;
        setMessage(m);
        setType(f.success ? 'success' : 'error');
        if (m) {
            const id = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(id);
        }
    }, [page.props]);

    if (!message) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`rounded-md px-4 py-2 shadow ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {message}
            </div>
        </div>
    );
}
