import { Head, Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import ActionButton from '@/components/ActionButton';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { DiscountCode } from '@/types/entities';

type Props = {
    discountCodes: DiscountCode[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Discount Codes', href: '/discount-codes' },
];

export default function DiscountCodesIndex({ discountCodes }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Discount Codes" />

            <div className="p-4">
                <div className="mb-4 flex justify-end">
                    <ActionButton href="/discount-codes/create">New Discount Code</ActionButton>
                </div>

                <div className="grid gap-3">
                    {discountCodes.map((discountCode) => (
                        <div key={discountCode.id} className="box">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
                                <div className="md:col-span-4">
                                    <div className="text-lg font-medium">{discountCode.code}</div>
                                    {!discountCode.active && (
                                        <span className="text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Inactive</span>
                                    )}
                                </div>

                                <div className="md:col-span-5 text-sm text-muted">
                                    <div>Promoter: {discountCode.promoter?.name ?? '—'}</div>
                                    <div>Discount rows: {discountCode.discounts?.length ?? 0}</div>
                                </div>

                                <div className="md:col-span-3 flex items-center justify-start gap-2 md:justify-end">
                                    <Link href={`/discount-codes/${discountCode.id}/edit`} className="btn-secondary" aria-label="Edit discount code" title="Edit discount code">
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                    <form action={`/discount-codes/${discountCode.id}`} method="post" className="inline">
                                        <input type="hidden" name="_method" value="delete" />
                                        <button className="btn-danger" type="submit" aria-label="Delete discount code" title="Delete discount code">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
