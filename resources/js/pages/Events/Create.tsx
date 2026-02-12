import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type TicketDraft = {
    name: string;
    price: string;
    quantity_total: string;
};

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Events', href: '/events' },
        { title: 'Create', href: '/events/create' },
    ];

    const form = useForm<{
        title: string;
        start_at: string;
        city: string;
        image: File | null;
        organiser_id: number | null;
        organiser_name: string;
        organiser_email: string;
        edit_password: string;
        tickets: TicketDraft[];
    }>({
        title: '',
        start_at: '',
        city: '',
        image: null,
        organiser_id: null,
        organiser_name: '',
        organiser_email: '',
        edit_password: '',
        tickets: [{ name: '', price: '0', quantity_total: '1' }],
    });

    const page = usePage<{
        organisers?: Array<{ id: number; name: string }>;
        showOrganisers?: boolean;
        showHomeHeader?: boolean;
    }>();
    const organisers = page.props.organisers ?? [];
    const showOrganisers = page.props.showOrganisers ?? false;
    const showHomeHeader = page.props.showHomeHeader ?? false;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/events', { forceFormData: true });
    }

    function updateTicket(index: number, field: keyof TicketDraft, value: string) {
        const next = [...form.data.tickets];
        next[index] = { ...next[index], [field]: value };
        form.setData('tickets', next);
    }

    function addTicket() {
        form.setData('tickets', [...form.data.tickets, { name: '', price: '0', quantity_total: '1' }]);
    }

    function removeTicket(index: number) {
        const next = form.data.tickets.filter((_, i) => i !== index);
        form.setData('tickets', next.length > 0 ? next : [{ name: '', price: '0', quantity_total: '1' }]);
    }

    function ticketError(index: number, field: keyof TicketDraft): string | null {
        const key = `tickets.${index}.${field}`;
        return (form.errors as Record<string, string>)[key] ?? null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />

            <div className={showHomeHeader ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8' : 'p-4'}>
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
                    <label htmlFor="title" className="block text-sm font-medium">Title <span className="text-red-600">*</span></label>
                    <input id="title" name="title" required value={form.data.title} onChange={e => form.setData('title', e.target.value)} className="input" />
                    {form.errors.title && <p className="mt-1 text-sm text-red-600">{form.errors.title}</p>}
                </div>

                <div>
                    <label htmlFor="city" className="block text-sm font-medium">City <span className="text-red-600">*</span></label>
                    <input id="city" name="city" required value={form.data.city} onChange={e => form.setData('city', e.target.value)} className="input" />
                    {form.errors.city && <p className="mt-1 text-sm text-red-600">{form.errors.city}</p>}
                </div>

                <div>
                    <label htmlFor="start_at" className="block text-sm font-medium">Start date <span className="text-red-600">*</span></label>
                    <input id="start_at" name="start_at" type="date" required value={form.data.start_at} onChange={e => form.setData('start_at', e.target.value)} className="input" />
                    {form.errors.start_at && <p className="mt-1 text-sm text-red-600">{form.errors.start_at}</p>}
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium">Image <span className="text-red-600">*</span></label>
                    <input id="image" required name="image" type="file" onChange={e => form.setData('image', e.target.files?.[0] ?? null)} accept="image/*" />
                    {form.errors.image && <p className="mt-1 text-sm text-red-600">{form.errors.image}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Ticket types <span className="text-red-600">*</span></label>
                    {form.errors.tickets && <p className="mt-1 text-sm text-red-600">{form.errors.tickets}</p>}

                    <div className="mt-2 space-y-3">
                        {form.data.tickets.map((t, idx) => (
                            <div key={idx} className="rounded border border-border bg-muted/20 p-3">
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                    <div>
                                        <label htmlFor={`ticket_${idx}_name`} className="block text-sm font-medium">Name <span className="text-red-600">*</span></label>
                                        <input
                                            id={`ticket_${idx}_name`}
                                            value={t.name}
                                            onChange={e => updateTicket(idx, 'name', e.target.value)}
                                            className="input"
                                            required
                                        />
                                        {ticketError(idx, 'name') && <p className="mt-1 text-sm text-red-600">{ticketError(idx, 'name')}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor={`ticket_${idx}_price`} className="block text-sm font-medium">Price</label>
                                        <input
                                            id={`ticket_${idx}_price`}
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={t.price}
                                            onChange={e => updateTicket(idx, 'price', e.target.value)}
                                            className="input"
                                        />
                                        {ticketError(idx, 'price') && <p className="mt-1 text-sm text-red-600">{ticketError(idx, 'price')}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor={`ticket_${idx}_quantity_total`} className="block text-sm font-medium">Quantity <span className="text-red-600">*</span></label>
                                        <input
                                            id={`ticket_${idx}_quantity_total`}
                                            type="number"
                                            min={1}
                                            step={1}
                                            value={t.quantity_total}
                                            onChange={e => updateTicket(idx, 'quantity_total', e.target.value)}
                                            className="input"
                                            required
                                        />
                                        {ticketError(idx, 'quantity_total') && <p className="mt-1 text-sm text-red-600">{ticketError(idx, 'quantity_total')}</p>}
                                    </div>
                                </div>

                                {form.data.tickets.length > 1 && (
                                    <div className="mt-3">
                                        <button type="button" className="btn-secondary" onClick={() => removeTicket(idx)}>
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div>
                            <button type="button" className="btn-secondary" onClick={addTicket}>
                                Add ticket type
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium">Organisers</label>
                    {showOrganisers ? (
                        <>
                            <div className="mb-3">
                                <label htmlFor="organiser_id" className="block text-sm font-medium">Main organiser <span className="text-red-600">*</span></label>
                                <select
                                    id="organiser_id"
                                    className="input"
                                    required
                                    value={form.data.organiser_id ?? ''}
                                    onChange={e => form.setData('organiser_id', e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Select organiser</option>
                                    {organisers.map((o: any) => (
                                        <option key={o.id} value={o.id}>{o.name}</option>
                                    ))}
                                </select>
                                <p className="text-sm text-muted mt-1">Required: used as the primary organiser for bank details and display.</p>
                                {form.errors.organiser_id && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_id}</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-muted">You are creating an event as a guest. Please provide an organiser name and email to create an organiser record for this event.</p>
                            <label htmlFor="organiser_name" className="block text-sm font-medium mt-2">Organiser name <span className="text-red-600">*</span></label>
                            <input id="organiser_name" required name="organiser_name" value={form.data.organiser_name} onChange={e => form.setData('organiser_name', e.target.value)} placeholder="Organiser name" className="input mt-1" />
                            {form.errors.organiser_name && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_name}</p>}
                            <label htmlFor="organiser_email" className="block text-sm font-medium mt-2">Organiser email <span className="text-red-600">*</span></label>
                            <input id="organiser_email" required name="organiser_email" type="email" value={form.data.organiser_email} onChange={e => form.setData('organiser_email', e.target.value)} placeholder="organiser@example.com" className="input mt-1" />
                            {form.errors.organiser_email && <p className="mt-1 text-sm text-red-600">{form.errors.organiser_email}</p>}
                            <label htmlFor="edit_password" className="block text-sm font-medium mt-2">Password (optional)</label>
                            <input id="edit_password" name="edit_password" type="password" value={form.data.edit_password} onChange={e => form.setData('edit_password', e.target.value)} placeholder="Set a password to protect the edit link" className="input mt-1" />
                            {form.errors.edit_password && <p className="mt-1 text-sm text-red-600">{form.errors.edit_password}</p>}
                        </>
                    )}
                </div>

                <div>
                    <ActionButton type="submit">Create</ActionButton>
                </div>
                </form>
            </div>
        </AppLayout>
    );
}
