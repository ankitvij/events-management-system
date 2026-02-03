import { Link } from '@inertiajs/react';
import React from 'react';

export default function CartSidebar({ cart }: { cart?: any }) {
    const count = cart?.items?.length ?? 0;
    return (
        <div className="p-4 border rounded">
            <h3 className="font-semibold">Cart</h3>
            <div className="text-sm text-muted">Items: {count}</div>
            <div className="mt-2">
                <Link href="/cart" className="text-blue-600">View cart</Link>
            </div>
        </div>
    );
}
