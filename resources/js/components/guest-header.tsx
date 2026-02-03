import { Link } from '@inertiajs/react';
import * as React from 'react';

export default function GuestHeader() {
    return (
        <header className="w-full border-b bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo.svg" alt="ChancePass" className="h-8 w-auto" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        <span className="text-lg font-semibold">ChancePass</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900">Log in</Link>
                        <Link href="/events/create" className="text-sm text-blue-600 hover:underline">Create your event</Link>
                        <Link href="/register" className="btn-primary">Sign up</Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
