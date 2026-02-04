import { Link } from '@inertiajs/react';
import React from 'react';

type Props = {
    href?: string;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    className?: string;
};

const base = 'bg-black text-white px-6 py-2 rounded-full text-lg font-semibold shadow-sm cursor-pointer';

export default function ActionButton({ href, onClick, type = 'button', children, className = '' }: Props) {
    const cls = `${base} ${className}`.trim();
    if (href) {
        return (
            <Link href={href} className={cls}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={cls}>
            {children}
        </button>
    );
}
