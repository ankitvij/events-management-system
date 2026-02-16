import { Link } from '@inertiajs/react';
import React from 'react';

type Props = {
    href?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    className?: string;
    title?: string;
    'aria-label'?: string;
};

const base = 'btn-primary';

export default function ActionButton({ href, onClick, type = 'button', children, className = '', title, 'aria-label': ariaLabel }: Props) {
    const cls = `${base} ${className}`.trim();
    if (href) {
        return (
            <Link href={href} className={cls} onClick={onClick} title={title} aria-label={ariaLabel}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} className={cls} title={title} aria-label={ariaLabel}>
            {children}
        </button>
    );
}
