import { Inertia } from '@inertiajs/inertia';
import { useForm } from '@inertiajs/react';
import React from 'react';
import ActionButton from '@/components/ActionButton';

type Props = {
    eventSlug: string;
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

export default function TicketItem({ eventSlug, ticket }: Props) {
    const form = useForm<FormData>({
        name: ticket.name,
        price: ticket.price,
        quantity_total: ticket.quantity_total,
        quantity_available: ticket.quantity_available,
        active: ticket.active,
    });

    const onSave = (e: React.FormEvent) => {
        e.preventDefault();
        form.put(`/events/${eventSlug}/tickets/${ticket.id}`);
    };

    const onDelete = () => {
        if (!confirm('Delete this ticket?')) return;
        Inertia.delete(`/events/${eventSlug}/tickets/${ticket.id}`);
    };

    return (
        <form onSubmit={onSave} className="w-full">
            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <label className="block text-sm font-medium">Type</label>
                    <input name="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full" />
                    <div className="grid grid-cols-5 gap-2 mt-2 text-xs text-muted">
                        <div>
                            <label className="block text-xs">Price (€)</label>
                            <input name="price" type="number" step="0.01" value={String(form.data.price)} onChange={(e) => form.setData('price', parseFloat(e.target.value || '0'))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-xs">Total</label>
                            <input name="quantity_total" type="number" value={String(form.data.quantity_total)} onChange={(e) => form.setData('quantity_total', parseInt(e.target.value || '0', 10))} className="w-full" />
                        </div>
                        <div>
                            <label className="block text-xs">Available</label>
                            <div className="flex items-center">
                                <input name="quantity_available" type="number" value={String(form.data.quantity_available)} onChange={(e) => form.setData('quantity_available', parseInt(e.target.value || '0', 10))} className="w-full" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs">Sold</label>
                            <div className="flex items-center">
                                {Number(form.data.quantity_total || 0) - Number(form.data.quantity_available || 0)}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex items-center gap-2">
                    <label className="text-sm">
                        <input type="checkbox" checked={form.data.active} onChange={(e) => form.setData('active', e.target.checked)} /> Active
                    </label>
                    <ActionButton type="submit">Save</ActionButton>
                    <button type="button" onClick={onDelete} className="btn-danger">Delete</button>
                </div>
            </div>
        </form>
    );
}
