import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';

export default function GuestHeader() {
    const [summary, setSummary] = useState<{ count: number; total: number }>({ count: 0, total: 0 });

    const fetchSummary = async () => {
        try {
            const resp = await fetch('/cart/summary', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
            if (!resp.ok) return;
            const json = await resp.json();
            setSummary({ count: json.count ?? 0, total: json.total ?? 0 });
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        fetchSummary();
        const handler = () => fetchSummary();
        window.addEventListener('cart:updated', handler);
        return () => window.removeEventListener('cart:updated', handler);
    }, []);

    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo.svg" alt="ChancePass" className="h-8 w-auto" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <span className="text-lg font-semibold">ChancePass</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/events/create" className="btn-primary">Create event</Link>
                        <SignInPrompt />

                        <div className="ml-4">
                            <CartButton />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
