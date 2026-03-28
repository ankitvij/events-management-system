import { Link, usePage } from '@inertiajs/react';
import { Calendar, User } from 'lucide-react';
import * as React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';

export default function PublicHeader() {
    const page = usePage();
    return (
        <>
            <header className="sticky top-0 z-50 border-b border-sidebar-border/80">
                <div className="w-full px-2 py-1 sm:px-3 min-[1000px]:px-4 min-[1000px]:py-2">
                    <div className="flex flex-col gap-1 min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:justify-end min-[1000px]:gap-0">
                    <div className="flex w-full items-center justify-between rounded-xl bg-[#18181b] px-3 py-2 min-[1000px]:hidden">
                        <Link href="/" className="flex items-center pl-12">
                            <AppLogoIcon alt="ChancePass" className="h-7 w-auto" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <SignInPrompt
                                buttonClassName="guest-icon-btn"
                                buttonLabel={<User className="h-4 w-4" aria-hidden="true" />}
                                ariaLabel="Sign in"
                            />
                            <CartButton />
                        </div>
                    </div>

                    <div className="hidden guest-surface items-center justify-end gap-1 px-2 py-1 min-[1000px]:ml-auto min-[1000px]:flex min-[1000px]:gap-2 min-[1000px]:px-3 min-[1000px]:py-1.5">
                        <div className="flex items-center gap-1 min-[800px]:gap-2">
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
                                    <Link href="/events/create" className="guest-icon-btn" aria-label="Create event" title="Create event">
                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <SignInPrompt
                                        buttonClassName="guest-icon-btn"
                                        buttonLabel={<User className="h-4 w-4" aria-hidden="true" />}
                                        ariaLabel="Sign in"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-1 min-[800px]:ml-2 min-[800px]:gap-2">
                            <CartButton />
                        </div>
                    </div>
                    </div>
                </div>
            </header>
        </>
    );
}
