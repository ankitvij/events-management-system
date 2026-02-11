import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AppLayout from '@/layouts/app-layout';

type PaymentSettings = {
    bank_account_name: string | null;
    bank_iban: string | null;
    bank_bic: string | null;
    bank_reference_hint: string | null;
    bank_instructions: string | null;
    paypal_id: string | null;
    paypal_instructions: string | null;
    revolut_id: string | null;
    revolut_instructions: string | null;
};

export default function PaymentMethods() {
    const page = usePage();
    const settings = (page.props as any)?.payment_settings as PaymentSettings;

    const form = useForm({
        bank_account_name: settings?.bank_account_name ?? '',
        bank_iban: settings?.bank_iban ?? '',
        bank_bic: settings?.bank_bic ?? '',
        bank_reference_hint: settings?.bank_reference_hint ?? '',
        bank_instructions: settings?.bank_instructions ?? '',
        paypal_id: settings?.paypal_id ?? '',
        paypal_instructions: settings?.paypal_instructions ?? '',
        revolut_id: settings?.revolut_id ?? '',
        revolut_instructions: settings?.revolut_instructions ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/orders/payment-methods');
    };

    return (
        <AppLayout>
            <Head title="Payment Methods" />

            <div className="p-4 space-y-4">
                <div>
                    <h1 className="text-xl font-semibold">Payment methods</h1>
                    <p className="text-sm text-muted">Manage the global payment account details used during checkout.</p>
                </div>

                {page.props?.flash?.success && (
                    <div className="rounded-md bg-green-600 p-3 text-sm text-white">
                        {page.props.flash.success}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold">Bank transfer</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">Account name</label>
                                <input
                                    name="bank_account_name"
                                    value={form.data.bank_account_name}
                                    onChange={e => form.setData('bank_account_name', e.target.value)}
                                    className="input"
                                />
                                {form.errors.bank_account_name && <div className="text-sm text-destructive mt-1">{form.errors.bank_account_name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">IBAN</label>
                                <input
                                    name="bank_iban"
                                    value={form.data.bank_iban}
                                    onChange={e => form.setData('bank_iban', e.target.value)}
                                    className="input"
                                />
                                {form.errors.bank_iban && <div className="text-sm text-destructive mt-1">{form.errors.bank_iban}</div>}
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">BIC / SWIFT</label>
                                <input
                                    name="bank_bic"
                                    value={form.data.bank_bic}
                                    onChange={e => form.setData('bank_bic', e.target.value)}
                                    className="input"
                                />
                                {form.errors.bank_bic && <div className="text-sm text-destructive mt-1">{form.errors.bank_bic}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Reference hint</label>
                                <input
                                    name="bank_reference_hint"
                                    value={form.data.bank_reference_hint}
                                    onChange={e => form.setData('bank_reference_hint', e.target.value)}
                                    className="input"
                                />
                                {form.errors.bank_reference_hint && <div className="text-sm text-destructive mt-1">{form.errors.bank_reference_hint}</div>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Instructions</label>
                            <textarea
                                name="bank_instructions"
                                value={form.data.bank_instructions}
                                onChange={e => form.setData('bank_instructions', e.target.value)}
                                className="input min-h-[96px]"
                            />
                            {form.errors.bank_instructions && <div className="text-sm text-destructive mt-1">{form.errors.bank_instructions}</div>}
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                        <h2 className="text-sm font-semibold">PayPal transfer</h2>
                        <div>
                            <label className="block text-sm font-medium">PayPal ID</label>
                            <input
                                name="paypal_id"
                                value={form.data.paypal_id}
                                onChange={e => form.setData('paypal_id', e.target.value)}
                                className="input"
                            />
                            {form.errors.paypal_id && <div className="text-sm text-destructive mt-1">{form.errors.paypal_id}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Instructions</label>
                            <textarea
                                name="paypal_instructions"
                                value={form.data.paypal_instructions}
                                onChange={e => form.setData('paypal_instructions', e.target.value)}
                                className="input min-h-[80px]"
                            />
                            {form.errors.paypal_instructions && <div className="text-sm text-destructive mt-1">{form.errors.paypal_instructions}</div>}
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                        <h2 className="text-sm font-semibold">Revolut transfer</h2>
                        <div>
                            <label className="block text-sm font-medium">Revolut ID</label>
                            <input
                                name="revolut_id"
                                value={form.data.revolut_id}
                                onChange={e => form.setData('revolut_id', e.target.value)}
                                className="input"
                            />
                            {form.errors.revolut_id && <div className="text-sm text-destructive mt-1">{form.errors.revolut_id}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Instructions</label>
                            <textarea
                                name="revolut_instructions"
                                value={form.data.revolut_instructions}
                                onChange={e => form.setData('revolut_instructions', e.target.value)}
                                className="input min-h-[80px]"
                            />
                            {form.errors.revolut_instructions && <div className="text-sm text-destructive mt-1">{form.errors.revolut_instructions}</div>}
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="btn-primary" disabled={form.processing}>Save changes</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
