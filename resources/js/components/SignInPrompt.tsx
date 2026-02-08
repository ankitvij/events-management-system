import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Props = {
    buttonClassName?: string;
    buttonLabel?: string;
};

export default function SignInPrompt({ buttonClassName = 'btn-primary', buttonLabel = 'Sign in' }: Props) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

    const getCsrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');

        const trimmed = email.trim();
        if (!trimmed) {
            setError('Email is required.');
            return;
        }

        setProcessing(true);
        try {
            const resp = await fetch('/customer/email-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': getCsrf(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ email: trimmed }),
            });

            if (!resp.ok) {
                const payload = await resp.json().catch(() => ({}));
                setError(payload?.message ?? 'Could not verify email.');
                return;
            }

            const payload = await resp.json();
            const target = payload.exists ? '/customer/login' : '/customer/register';
            window.location.href = `${target}?email=${encodeURIComponent(trimmed)}`;
        } catch (e) {
            setError('Could not verify email.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <button type="button" className={buttonClassName} onClick={() => setOpen(true)}>
                {buttonLabel}
            </button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sign in</DialogTitle>
                    <DialogDescription>Enter your email to continue.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        autoFocus
                        required
                    />
                    {error ? <div className="text-sm text-red-600">{error}</div> : null}
                    <DialogFooter>
                        <button type="submit" className="btn-primary" disabled={processing}>
                            {processing ? 'Checking...' : 'Continue'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
