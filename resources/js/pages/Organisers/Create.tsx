import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Create() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Organisers', href: '/organisers' },
        { title: 'Create', href: '/organisers/create' },
    ];

    const form = useForm({
        name: '',
        email: '',
        active: true,
        bank_account_name: '',
        bank_iban: '',
        bank_bic: '',
        bank_reference_hint: '',
        paypal_id: '',
        revolut_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/organisers');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Organiser" />

            <form onSubmit={submit} className="p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input name="name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} className="input" />
                    {form.errors.name && <div className="text-sm text-destructive mt-1">{form.errors.name}</div>}
                </div>

                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} className="input" />
                    {form.errors.email && <div className="text-sm text-destructive mt-1">{form.errors.email}</div>}
                </div>

                <div className="text-base font-semibold">
                    Enter your account details to receive payments.
                </div>

                <div className="box space-y-4">
                    <h3 className="text-sm font-semibold">Bank details</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">Bank account name</label>
                            <input name="bank_account_name" value={form.data.bank_account_name} onChange={e => form.setData('bank_account_name', e.target.value)} className="input" />
                            {form.errors.bank_account_name && <div className="text-sm text-destructive mt-1">{form.errors.bank_account_name}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">IBAN</label>
                            <input name="bank_iban" value={form.data.bank_iban} onChange={e => form.setData('bank_iban', e.target.value)} className="input" />
                            {form.errors.bank_iban && <div className="text-sm text-destructive mt-1">{form.errors.bank_iban}</div>}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">BIC / SWIFT</label>
                            <input name="bank_bic" value={form.data.bank_bic} onChange={e => form.setData('bank_bic', e.target.value)} className="input" />
                            {form.errors.bank_bic && <div className="text-sm text-destructive mt-1">{form.errors.bank_bic}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Reference hint</label>
                            <input name="bank_reference_hint" value={form.data.bank_reference_hint} onChange={e => form.setData('bank_reference_hint', e.target.value)} className="input" placeholder="e.g. Use booking code as reference" />
                            {form.errors.bank_reference_hint && <div className="text-sm text-destructive mt-1">{form.errors.bank_reference_hint}</div>}
                        </div>
                    </div>
                </div>

                <div className="box space-y-3">
                    <h3 className="text-sm font-semibold">Paypal account</h3>
                    <div>
                        <label className="block text-sm font-medium">Paypal account</label>
                        <input name="paypal_id" value={form.data.paypal_id} onChange={e => form.setData('paypal_id', e.target.value)} className="input" />
                        {form.errors.paypal_id && <div className="text-sm text-destructive mt-1">{form.errors.paypal_id}</div>}
                    </div>
                </div>

                <div className="box space-y-3">
                    <h3 className="text-sm font-semibold">Revolut account</h3>
                    <div>
                        <label className="block text-sm font-medium">Revolut account</label>
                        <input name="revolut_id" value={form.data.revolut_id} onChange={e => form.setData('revolut_id', e.target.value)} className="input" />
                        {form.errors.revolut_id && <div className="text-sm text-destructive mt-1">{form.errors.revolut_id}</div>}
                    </div>
                </div>

                <div>
                    <label className="flex items-center gap-2">
                        <input name="active" type="checkbox" checked={!!form.data.active} onChange={e => form.setData('active', e.target.checked)} />
                        <span className="text-sm">Active</span>
                    </label>
                </div>

                <div>
                    <ActionButton type="submit">Create</ActionButton>
                </div>
            </form>
        </AppLayout>
    );
}
