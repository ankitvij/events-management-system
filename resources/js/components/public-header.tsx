import { Link, usePage } from '@inertiajs/react';
import * as React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';
import { useAppearance } from '@/hooks/use-appearance';

export default function PublicHeader() {
    const page = usePage();
    const { resolvedAppearance, updateAppearance } = useAppearance();
    return (
        <>
            <header className="sticky top-0 z-50 border-b border-sidebar-border/80">
                <div className="mx-auto flex w-full max-w-7xl flex-nowrap items-center justify-between gap-2 px-4 py-3 min-[800px]:h-16 min-[800px]:gap-0 min-[800px]:py-0 sm:px-6 lg:px-8">
                    <div className="flex items-center bg-[#121c26] rounded">
                        <Link href="/" className="flex items-center">
                            <AppLogoIcon alt="ChancePass" className="h-15 w-auto" />
                        </Link>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-[800px]:flex-row min-[800px]:items-center min-[800px]:gap-3">
                        <div className="flex items-center gap-3">
                            {page.props?.customer ? (
                                <>
                                    <Link href="/customer/orders" className="btn-primary text-sm">My orders</Link>
                                    <a
                                        href="#"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                                            await fetch('/customer/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': token }, credentials: 'same-origin' });
                                            window.location.reload();
                                        }}
                                        className="btn-primary text-sm"
                                    >
                                        Log out
                                    </a>
                                </>
                            ) : (
                                <>
                                    <Link href="/events/create" className="btn-primary">Create event</Link>
                                    <SignInPrompt />
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 min-[800px]:ml-4">
                            <CartButton />
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => updateAppearance(resolvedAppearance === 'light' ? 'dark' : 'light')}
                            >
                                {resolvedAppearance === 'light' ? '🌙' : '☀️'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
