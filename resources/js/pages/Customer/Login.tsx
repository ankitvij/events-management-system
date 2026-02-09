import { Head, useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/auth-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { request } from '@/routes';
import { useState } from 'react';

export default function CustomerLogin() {
    const initialEmail = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('email') ?? ''
        : '';
    const initialBookingCode = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('booking_code') ?? ''
        : '';
    const form = useForm({ email: initialEmail, password: '' });
    const bookingForm = useForm({ email: initialEmail, booking_code: initialBookingCode });
    const [processing, setProcessing] = useState(false);
    const [bookingProcessing, setBookingProcessing] = useState(false);

    function submit(e: any) {
        e.preventDefault();
        setProcessing(true);
        form.post('/customer/login', {
            onFinish: () => setProcessing(false),
        });
    }

    function submitBooking(e: any) {
        e.preventDefault();
        setBookingProcessing(true);
        bookingForm.post('/customer/login/booking', {
            onFinish: () => setBookingProcessing(false),
        });
    }

    return (
        <AuthLayout title="Customer login" description="Login to view your orders">
            <Head title="Customer login" />

            <form onSubmit={submit} className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} required />
                    <InputError message={form.errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} required />
                    <InputError message={form.errors.password} />
                </div>

                <Button type="submit" disabled={processing}>{processing ? 'Signing in...' : 'Sign in'}</Button>
            </form>

            <div className="mt-8 border-t pt-6">
                <h3 className="text-sm font-semibold">Use booking code</h3>
                <p className="mt-1 text-xs text-muted">Sign in with the booking code sent in your order email.</p>
                <form onSubmit={submitBooking} className="mt-4 grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="booking-email">Email</Label>
                        <Input id="booking-email" value={bookingForm.data.email} onChange={e => bookingForm.setData('email', e.target.value)} required />
                        <InputError message={bookingForm.errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="booking-code">Booking code</Label>
                        <Input id="booking-code" value={bookingForm.data.booking_code} onChange={e => bookingForm.setData('booking_code', e.target.value)} required />
                        <InputError message={bookingForm.errors.booking_code} />
                    </div>

                    <Button type="submit" disabled={bookingProcessing}>{bookingProcessing ? 'Signing in...' : 'Sign in with booking code'}</Button>
                </form>
            </div>
        </AuthLayout>
    );
}
