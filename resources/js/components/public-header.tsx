import { Link, usePage } from '@inertiajs/react';
import * as React from 'react';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';

export default function PublicHeader() {
    const page = usePage();
    return (
        <>
            <header className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-white">
                <div className="mx-auto flex h-16 items-center justify-between w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                            <span className="text-white font-bold">CP</span>
                        </div>
                        <div className="text-lg font-semibold">ChancePass</div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div>
                            {page.props?.customer ? (
                                <>
                                    <Link href="/customer/orders" className="text-sm text-blue-600 mr-3">My orders</Link>
                                    <a href="#" onClick={async (e) => {
                                        e.preventDefault();
                                        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                        await fetch('/customer/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': token }, credentials: 'same-origin' });
                                        window.location.reload();
                                    }} className="text-sm text-blue-600 mr-3">Log out</a>
                                </>
                            ) : (
                                <>
                                    <Link href="/events/create" className="btn-primary mr-3">Create event</Link>
                                    <SignInPrompt />
                                </>
                            )}
                        </div>

                        <div className="ml-4">
                            <CartButton />
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
