import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Flash = { success?: string; error?: string };

// Calling setState in this effect is intentional to sync flashes from Inertia props
/* eslint-disable react-hooks/set-state-in-effect */
export default function Toasts() {
    const page = usePage();
    const flash = ((page.props) as { flash?: Flash }).flash || {};
    const initialMessage = flash.success || flash.error || null;
    const initialType: 'success' | 'error' = flash.success ? 'success' : flash.error ? 'error' : 'success';

    const [message, setMessage] = useState<string | null>(initialMessage);
    const [type, setType] = useState<'success' | 'error'>(initialType);

    useEffect(() => {
        const f = ((page.props) as { flash?: Flash }).flash || {};
        const m = f.success || f.error || null;
        setMessage(m);
        setType(f.success ? 'success' : f.error ? 'error' : 'success');
        if (m) {
            const id = setTimeout(() => setMessage(null), 3500);
            return () => clearTimeout(id);
        }
        return undefined;
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
