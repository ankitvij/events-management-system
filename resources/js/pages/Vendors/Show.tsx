import { Head, Link } from '@inertiajs/react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Vendor } from '@/types/entities';

type Props = {
    vendor: Vendor & {
        equipment?: { id: number; name: string; price: number }[];
        services?: { id: number; name: string; price: number }[];
    };
};

export default function VendorsShow({ vendor }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vendors', href: '/vendors' },
        { title: vendor.name, href: `/vendors/${vendor.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={vendor.name} />

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{vendor.name}</h1>
                        <div className="text-sm text-muted">{vendor.email}</div>
                        <div className="text-sm text-muted">{vendor.type}{vendor.city ? ` · ${vendor.city}` : ''}</div>
                        <div className="text-sm text-muted">Status: {vendor.active ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div className="flex gap-2">
                        <ActionButton href={`/vendors/${vendor.id}/edit`}>Edit</ActionButton>
                        <Link href="/vendors" className="btn-secondary">Back</Link>
                    </div>
                </div>

                {vendor.description ? (
                    <div className="box">
                        <div className="whitespace-pre-wrap text-sm">{vendor.description}</div>
                    </div>
                ) : null}

                <div className="box">
                    <h2 className="text-sm font-medium">Equipment</h2>
                    <div className="mt-3 grid gap-2">
                        {vendor.equipment?.length ? vendor.equipment.map((e) => (
                            <div key={e.id} className="flex items-center justify-between rounded border p-3">
                                <div className="font-medium">{e.name}</div>
                                <div className="text-sm text-muted">€{Number(e.price ?? 0).toFixed(2)}</div>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No equipment listed.</div>
                        )}
                    </div>
                </div>

                <div className="box">
                    <h2 className="text-sm font-medium">Services</h2>
                    <div className="mt-3 grid gap-2">
                        {vendor.services?.length ? vendor.services.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded border p-3">
                                <div className="font-medium">{s.name}</div>
                                <div className="text-sm text-muted">€{Number(s.price ?? 0).toFixed(2)}</div>
                            </div>
                        )) : (
                            <div className="text-sm text-muted">No services listed.</div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
