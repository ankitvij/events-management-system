import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Availability = {
    id: number;
    date: string;
    is_available: boolean;
};

type LineItem = {
    id: number;
    name: string;
    price: number;
};

type Props = {
    vendor: { id: number; name: string; email: string };
    availabilities: Availability[];
    equipment: LineItem[];
    services: LineItem[];
};

export default function VendorCalendar({ vendor, availabilities, equipment, services }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vendor', href: '/vendor/calendar' },
        { title: 'Calendar', href: '/vendor/calendar' },
    ];

    const page = usePage<{ flash?: { success?: string; error?: string } }>();

    const form = useForm({
        date: '',
        is_available: true,
    });

    const equipmentForm = useForm({
        name: '',
        price: '',
    });

    const serviceForm = useForm({
        name: '',
        price: '',
    });

    function submitAvailability(e: FormEvent) {
        e.preventDefault();
        form.post('/vendor/calendar', { preserveScroll: true, onSuccess: () => form.reset('date') });
    }

    function submitEquipment(e: FormEvent) {
        e.preventDefault();
        equipmentForm.post('/vendor/equipment', { preserveScroll: true, onSuccess: () => equipmentForm.reset('name', 'price') });
    }

    function submitService(e: FormEvent) {
        e.preventDefault();
        serviceForm.post('/vendor/services', { preserveScroll: true, onSuccess: () => serviceForm.reset('name', 'price') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vendor Calendar" />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Calendar</h1>
                        <div className="text-sm text-muted">Signed in as {vendor.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href="/vendor/bookings">Booking requests</ActionButton>
                        <button type="button" className="btn-secondary" onClick={() => router.post('/vendors/logout')}>Logout</button>
                    </div>
                </div>

                {page.props?.flash?.success && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                        {page.props.flash.success}
                    </div>
                )}
                {page.props?.flash?.error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {page.props.flash.error}
                    </div>
                )}

                <div className="box">
                    <h2 className="text-sm font-medium">Add date</h2>
                    <form onSubmit={submitAvailability} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium">Date</label>
                            <input id="date" name="date" type="date" required value={form.data.date} onChange={e => form.setData('date', e.target.value)} className="input" />
                        </div>
                        <div>
                            <label htmlFor="is_available" className="block text-sm font-medium">Status</label>
                            <select id="is_available" name="is_available" className="input" value={form.data.is_available ? '1' : '0'} onChange={e => form.setData('is_available', e.target.value === '1')}>
                                <option value="1">Available</option>
                                <option value="0">Not available</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary" disabled={form.processing}>Save</button>
                        </div>
                    </form>
                    {Object.keys(form.errors).length > 0 && (
                        <div className="mt-3 text-sm text-red-600">
                            {Object.values(form.errors).map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Your dates</h2>
                    <div className="mt-3 grid gap-2">
                        {availabilities.length ? availabilities.map((a) => (
                            <div key={a.id} className="flex items-center justify-between rounded border p-3">
                                <div>
                                    <div className="font-medium">{a.date}</div>
                                    <div className="text-sm text-muted">{a.is_available ? 'Available' : 'Not available'}</div>
                                </div>
                                <button type="button" className="btn-danger" onClick={() => router.delete(`/vendor/calendar/${a.id}`, { preserveScroll: true })}>Remove</button>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No dates added yet.</div>
                        )}
                    </div>
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Equipment</h2>
                    <form onSubmit={submitEquipment} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium" htmlFor="equipment_name">Name</label>
                            <input id="equipment_name" className="input" required value={equipmentForm.data.name} onChange={e => equipmentForm.setData('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium" htmlFor="equipment_price">Price</label>
                            <input id="equipment_price" className="input" type="number" min={0} step="0.01" value={equipmentForm.data.price} onChange={e => equipmentForm.setData('price', e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary" disabled={equipmentForm.processing}>Add</button>
                        </div>
                    </form>
                    {Object.keys(equipmentForm.errors).length > 0 && (
                        <div className="mt-3 text-sm text-red-600">
                            {Object.values(equipmentForm.errors).map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 grid gap-2">
                        {equipment.length ? equipment.map((e) => (
                            <div key={e.id} className="flex items-center justify-between rounded border p-3">
                                <div className="min-w-0">
                                    <div className="font-medium break-words">{e.name}</div>
                                    <div className="text-sm text-muted">€{Number(e.price ?? 0).toFixed(2)}</div>
                                </div>
                                <button type="button" className="btn-danger" onClick={() => router.delete(`/vendor/equipment/${e.id}`, { preserveScroll: true })}>Remove</button>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No equipment added yet.</div>
                        )}
                    </div>
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Services</h2>
                    <form onSubmit={submitService} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium" htmlFor="service_name">Name</label>
                            <input id="service_name" className="input" required value={serviceForm.data.name} onChange={e => serviceForm.setData('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium" htmlFor="service_price">Price</label>
                            <input id="service_price" className="input" type="number" min={0} step="0.01" value={serviceForm.data.price} onChange={e => serviceForm.setData('price', e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary" disabled={serviceForm.processing}>Add</button>
                        </div>
                    </form>
                    {Object.keys(serviceForm.errors).length > 0 && (
                        <div className="mt-3 text-sm text-red-600">
                            {Object.values(serviceForm.errors).map((err, idx) => (
                                <div key={idx}>{err}</div>
                            ))}
                        </div>
                    )}

                    <div className="mt-3 grid gap-2">
                        {services.length ? services.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded border p-3">
                                <div className="min-w-0">
                                    <div className="font-medium break-words">{s.name}</div>
                                    <div className="text-sm text-muted">€{Number(s.price ?? 0).toFixed(2)}</div>
                                </div>
                                <button type="button" className="btn-danger" onClick={() => router.delete(`/vendor/services/${s.id}`, { preserveScroll: true })}>Remove</button>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No services added yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
