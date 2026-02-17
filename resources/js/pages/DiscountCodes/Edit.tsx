import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DiscountCode } from '@/types/entities';

type EventOption = {
    id: number;
    title: string;
    tickets: Array<{ id: number; name: string; price?: number | string | null }>;
};

type PromoterOption = { id: number; name: string; email?: string | null };

type DiscountRow = {
    event_id: number | '';
    ticket_id: number | '';
    discount_type: 'euro' | 'percentage';
    discount_value: number;
};

type Props = {
    discountCode: DiscountCode;
    events: EventOption[];
    promoters: PromoterOption[];
};

export default function DiscountCodesEdit({ discountCode, events, promoters }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Discount Codes', href: '/discount-codes' },
        { title: discountCode.code, href: `/discount-codes/${discountCode.id}/edit` },
    ];

    const form = useForm<{
        code: string;
        promoter_user_id: number | '';
        active: boolean;
        discounts: DiscountRow[];
    }>({
        code: discountCode.code,
        promoter_user_id: discountCode.promoter_user_id ?? '',
        active: !!discountCode.active,
        discounts: (discountCode.discounts ?? []).map((row) => ({
            event_id: row.event_id,
            ticket_id: row.ticket_id,
            discount_type: row.discount_type,
            discount_value: Number(row.discount_value),
        })),
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/discount-codes/${discountCode.id}`);
    }

    function addRow() {
        form.setData('discounts', [...form.data.discounts, { event_id: '', ticket_id: '', discount_type: 'percentage', discount_value: 10 }]);
    }

    function removeRow(index: number) {
        form.setData('discounts', form.data.discounts.filter((_, i) => i !== index));
    }

    function updateRow(index: number, key: keyof DiscountRow, value: string | number) {
        const next = [...form.data.discounts];
        if (key === 'event_id') {
            next[index] = { ...next[index], event_id: value === '' ? '' : Number(value), ticket_id: '' };
        } else if (key === 'ticket_id') {
            next[index] = { ...next[index], ticket_id: value === '' ? '' : Number(value) };
        } else if (key === 'discount_value') {
            next[index] = { ...next[index], discount_value: Number(value) };
        } else if (key === 'discount_type') {
            next[index] = { ...next[index], discount_type: value as DiscountRow['discount_type'] };
        }
        form.setData('discounts', next);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${discountCode.code}`} />

            <form onSubmit={submit} className="p-4 space-y-4">
                {Object.keys(form.errors).length > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                        <p className="font-semibold">Please fix the following:</p>
                        <ul className="list-disc pl-5">
                            {Object.values(form.errors).map((err, idx) => (
                                <li key={idx}>{err}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium">Code <span className="text-red-600">*</span></label>
                    <input className="input" required value={form.data.code} onChange={(e) => form.setData('code', e.target.value.toUpperCase())} />
                </div>

                <div>
                    <label className="block text-sm font-medium">Promoter (optional)</label>
                    <select className="input" value={form.data.promoter_user_id} onChange={(e) => form.setData('promoter_user_id', e.target.value === '' ? '' : Number(e.target.value))}>
                        <option value="">None</option>
                        {promoters.map((promoter) => (
                            <option key={promoter.id} value={promoter.id}>{promoter.name}{promoter.email ? ` (${promoter.email})` : ''}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" checked={form.data.active} onChange={(e) => form.setData('active', e.target.checked)} />
                        <span>Active</span>
                    </label>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Discount rows</h3>
                        <button type="button" className="btn-secondary" onClick={addRow}>Add row</button>
                    </div>

                    {form.data.discounts.map((row, index) => {
                        const eventOption = events.find((event) => event.id === row.event_id);
                        const ticketOptions = eventOption?.tickets ?? [];

                        return (
                            <div key={index} className="box grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-sm font-medium">Event</label>
                                    <select className="input" value={row.event_id} onChange={(e) => updateRow(index, 'event_id', e.target.value)}>
                                        <option value="">Select event</option>
                                        {events.map((event) => (
                                            <option key={event.id} value={event.id}>{event.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium">Ticket</label>
                                    <select className="input" value={row.ticket_id} onChange={(e) => updateRow(index, 'ticket_id', e.target.value)}>
                                        <option value="">Select ticket</option>
                                        {ticketOptions.map((ticket) => (
                                            <option key={ticket.id} value={ticket.id}>{ticket.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Type</label>
                                    <select className="input" value={row.discount_type} onChange={(e) => updateRow(index, 'discount_type', e.target.value)}>
                                        <option value="percentage">Percentage</option>
                                        <option value="euro">Euro</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium">Value</label>
                                    <input className="input" type="number" min={0} step="0.01" value={row.discount_value} onChange={(e) => updateRow(index, 'discount_value', e.target.value)} />
                                </div>

                                <div className="md:col-span-1">
                                    <button type="button" className="btn-danger" onClick={() => removeRow(index)} disabled={form.data.discounts.length === 1}>Remove</button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div>
                    <ActionButton type="submit" className={form.processing ? 'opacity-60 pointer-events-none' : ''}>Save</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}
