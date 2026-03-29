import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Menu, User } from 'lucide-react';
import * as React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import CartButton from '@/components/CartButton';
import SignInPrompt from '@/components/SignInPrompt';

export default function PublicHeader() {
    const page = usePage();
    const isEventShowPage = page.component === 'Events/Show';

    const toggleGuestMenu = () => {
        window.dispatchEvent(new CustomEvent('guest-menu:toggle'));
    };

    return (
        <>
            <header className="sticky top-0 z-50 border-b-0 max-[999px]:-mx-[5px] min-[1000px]:border-b min-[1000px]:border-sidebar-border/80">
                <div className="w-full px-0 py-0 min-[1000px]:px-4 min-[1000px]:py-2">
                    <div className="flex flex-col gap-1 min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:justify-end min-[1000px]:gap-0">
                    <div className="w-full bg-[#18181b] px-0 py-0 min-[1000px]:hidden">
                        <Link href="/" className="flex flex-col items-center justify-center pt-3 pb-2">
                            <AppLogoIcon alt="ChancePass" className="h-[70px] w-auto" />
                        </Link>

                        <div className="bg-[#242631] px-0 py-2">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[#d1d5db]"
                                        aria-label="Open menu"
                                        title="Open menu"
                                        onClick={toggleGuestMenu}
                                    >
                                        <Menu className="h-4 w-4" aria-hidden="true" />
                                    </button>

                                    {isEventShowPage && (
                                        <button
                                            type="button"
                                            className="inline-flex h-10 items-center gap-1.5 px-1 text-white transition-colors hover:text-[#d1d5db]"
                                            onClick={() => window.history.back()}
                                            aria-label="Go back"
                                            title="Go back"
                                        >
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                            <span className="text-sm">Back</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link href="/events/create" className="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[#d1d5db]" aria-label="Create event" title="Create event">
                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <SignInPrompt
                                        buttonClassName="inline-flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-[#d1d5db]"
                                        buttonLabel={<User className="h-4 w-4" aria-hidden="true" />}
                                        ariaLabel="Sign in"
                                    />
                                    <CartButton />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden guest-surface items-center justify-end gap-1 px-2 py-1 min-[1000px]:ml-auto min-[1000px]:flex min-[1000px]:gap-2 min-[1000px]:px-3 min-[1000px]:py-1.5">
                        <div className="flex items-center gap-1 min-[800px]:gap-2">
                            {page.props?.customer ? (
                                <>
                                    {isEventShowPage && (
                                        <button
                                            type="button"
                                            className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-[#6b7280]"
                                            onClick={() => window.history.back()}
                                            aria-label="Go back"
                                            title="Go back"
                                        >
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
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
                                    {isEventShowPage && (
                                        <button
                                            type="button"
                                            className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-[#6b7280]"
                                            onClick={() => window.history.back()}
                                            aria-label="Go back"
                                            title="Go back"
                                        >
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                        </button>
                                    )}
                                    <Link href="/events/create" className="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-[#6b7280]" aria-label="Create event" title="Create event">
                                        <Calendar className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <SignInPrompt
                                        buttonClassName="inline-flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-[#6b7280]"
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
