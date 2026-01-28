import { Link } from '@inertiajs/react';
import * as React from 'react';

export default function PublicHeader() {
    return (
        <header className="w-full border-b border-sidebar-border/80 bg-background">
            <div className="mx-auto flex h-20 items-center justify-between w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center space-x-3">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                        <span className="text-white font-bold">CP</span>
                    </div>
                    <div className="text-lg font-semibold">ChancePass</div>
                </Link>
                <div>
                    <Link href="/login" className="text-sm text-blue-600 mr-3">Log in</Link>
                    <Link href="/events/create" className="text-sm text-blue-600 mr-3">Create your event</Link>
                    <Link href="/register" className="text-sm text-blue-600">Sign up</Link>
                </div>
            </div>
        </header>
    );
}
