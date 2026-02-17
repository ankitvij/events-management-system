import { Link } from '@inertiajs/react';
import type { KeyboardEvent, MouseEventHandler, ReactNode } from 'react';

type Props = {
    href?: string;
    onClick?: MouseEventHandler<Element>;
    children: ReactNode;
    className?: string;
    title?: string;
    'aria-label': string;
    danger?: boolean;
    disabled?: boolean;
};

export default function ActionIcon({
    href,
    onClick,
    children,
    className = '',
    title,
    'aria-label': ariaLabel,
    danger = false,
    disabled = false,
}: Props) {
    const baseClass = 'inline-flex items-center justify-center transition-colors';
    const toneClass = danger ? 'text-destructive hover:opacity-80' : 'text-muted hover:text-foreground';
    const stateClass = disabled ? 'cursor-not-allowed opacity-50 pointer-events-none' : 'cursor-pointer';
    const classes = `${baseClass} ${toneClass} ${stateClass} ${className}`.trim();

    if (href) {
        return (
            <Link
                href={href}
                className={classes}
                onClick={onClick}
                title={title}
                aria-label={ariaLabel}
            >
                {children}
            </Link>
        );
    }

    return (
        <span
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={onClick}
            onKeyDown={(event: KeyboardEvent<HTMLSpanElement>) => {
                if (disabled) {
                    return;
                }

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.currentTarget.click();
                }
            }}
            className={classes}
            title={title}
            aria-label={ariaLabel}
        >
            {children}
        </span>
    );
}
