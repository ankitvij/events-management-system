import { Link, usePage } from '@inertiajs/react';
import * as React from 'react';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';

export default function PublicHeader() {
    const page = usePage();
    return (
        <>
            <header className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-white">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 min-[600px]:h-16 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between min-[600px]:gap-0 min-[600px]:py-0 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center">
                        <img src="/images/logo.png" alt="ChancePass" className="h-8 w-auto" />
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

                        <div className="ml-4 hidden min-[600px]:block">
                            <CartButton />
                        </div>
                    </div>
                    <div className="flex w-full justify-end min-[600px]:hidden">
                        <CartButton />
                    </div>
                </div>
            </header>
        </>
    );
}
