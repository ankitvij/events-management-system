import { useForm } from '@inertiajs/react';
import React from 'react';

type Props = { eventId: number };

type FormData = { name: string; price: number; quantity_total: number; quantity_available: number; active: boolean };

export default function TicketCreateForm({ eventId }: Props) {
    const form = useForm<FormData>({ name: '', price: 0, quantity_total: 0, quantity_available: 0, active: true });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/events/${eventId}/tickets`, {
            onSuccess: () => {
                form.reset('name', 'price', 'quantity_total', 'quantity_available', 'active');
            },
        });
    };

    return (
        <form onSubmit={onSubmit} className="mt-2">
            <div className="flex gap-2">
                <input placeholder="Name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="flex-1" />
                <input type="number" placeholder="Price" value={String(form.data.price)} onChange={(e) => form.setData('price', parseFloat(e.target.value || '0'))} className="w-28" />
                <input type="number" placeholder="Total" value={String(form.data.quantity_total)} onChange={(e) => form.setData('quantity_total', parseInt(e.target.value || '0', 10))} className="w-28" />
                <button type="submit" className="btn">Create</button>
            </div>
        </form>
    );
}
