import { Inertia } from '@inertiajs/inertia';
import { useForm } from '@inertiajs/react';
import React from 'react';

type Props = {
    eventId: number;
    ticket: {
        id: number;
        name: string;
        price: number;
        quantity_total: number;
        quantity_available: number;
        active: boolean;
    };
};

type FormData = { name: string; price: number; quantity_total: number; quantity_available: number; active: boolean };

export default function TicketItem({ eventId, ticket }: Props) {
    const form = useForm<FormData>({
        name: ticket.name,
        price: ticket.price,
        quantity_total: ticket.quantity_total,
        quantity_available: ticket.quantity_available,
        active: ticket.active,
    });

    const onSave = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/events/${eventId}/tickets/${ticket.id}`);
    };

    const onDelete = () => {
        if (!confirm('Delete this ticket?')) return;
        Inertia.delete(`/events/${eventId}/tickets/${ticket.id}`);
    };

    return (
        <form onSubmit={onSave} className="w-full">
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full" />
                    <div className="flex gap-2 mt-1 text-xs text-muted">
                        <input type="number" value={String(form.data.price)} onChange={(e) => form.setData('price', parseFloat(e.target.value || '0'))} className="w-24" />
                        <input type="number" value={String(form.data.quantity_total)} onChange={(e) => form.setData('quantity_total', parseInt(e.target.value || '0', 10))} className="w-24" />
                        <input type="number" value={String(form.data.quantity_available)} onChange={(e) => form.setData('quantity_available', parseInt(e.target.value || '0', 10))} className="w-24" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm">
                        <input type="checkbox" checked={form.data.active} onChange={(e) => form.setData('active', e.target.checked)} /> Active
                    </label>
                    <button type="submit" className="btn">Save</button>
                    <button type="button" onClick={onDelete} className="btn-ghost">Delete</button>
                </div>
            </div>
        </form>
    );
}
