import { useForm } from '@inertiajs/react';
import React from 'react';
import ActionButton from '@/components/ActionButton';

type Props = { eventSlug: string };

type FormData = { name: string; price: number; quantity_total: number; quantity_available: number; active: boolean };

export default function TicketCreateForm({ eventSlug }: Props) {
    const form = useForm<FormData>({ name: '', price: 0, quantity_total: 0, quantity_available: 0, active: true });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(`/events/${eventSlug}/tickets`, {
            onSuccess: () => {
                form.reset('name', 'price', 'quantity_total', 'quantity_available', 'active');
            },
        });
    };

    return (
        <form onSubmit={onSubmit} className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Type <span className="text-red-600">*</span></label>
                    <input required name="name" placeholder="Type" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className={`w-full border rounded px-2 py-1 ${ (form.errors as any).name ? 'border-red-500' : 'border-gray-200' }`} />
                    {(form.errors as any).name && <div className="text-sm text-red-600 mt-1">{(form.errors as any).name}</div>}
                    <div className="mt-2">
                        <label className="block text-sm font-medium">Price (€) <span className="text-red-600">*</span></label>
                        <input required name="price" type="number" step="0.01" placeholder="0.00" value={String(form.data.price)} onChange={(e) => form.setData('price', parseFloat(e.target.value || '0'))} className={`w-full border rounded px-2 py-1 ${ (form.errors as any).price ? 'border-red-500' : 'border-gray-200' }`} />
                        {(form.errors as any).price && <div className="text-sm text-red-600 mt-1">{(form.errors as any).price}</div>}
                    </div>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">Total <span className="text-red-600">*</span></label>
                    <input required name="quantity_total" type="number" placeholder="0" value={String(form.data.quantity_total)} onChange={(e) => form.setData('quantity_total', parseInt(e.target.value || '0', 10))} className={`w-full border rounded px-2 py-1 ${ (form.errors as any).quantity_total ? 'border-red-500' : 'border-gray-200' }`} />
                    {(form.errors as any).quantity_total && <div className="text-sm text-red-600 mt-1">{(form.errors as any).quantity_total}</div>}
                </div>

                <div className="md:col-span-1">
                    <label className="block text-sm font-medium">Available <span className="text-red-600">*</span></label>
                    <input required name="quantity_available" type="number" placeholder="0" value={String(form.data.quantity_available)} onChange={(e) => form.setData('quantity_available', parseInt(e.target.value || '0', 10))} className={`w-full border rounded px-2 py-1 ${ (form.errors as any).quantity_available ? 'border-red-500' : 'border-gray-200' }`} />
                    {(form.errors as any).quantity_available && <div className="text-sm text-red-600 mt-1">{(form.errors as any).quantity_available}</div>}
                </div>

                <div className="md:col-span-1">
                    <ActionButton type="submit">Create</ActionButton>
                </div>
            </div>
        </form>
    );
}
