import type { ReactNode } from 'react';

type Props = {
    buttonClassName?: string;
    buttonLabel?: ReactNode;
    ariaLabel?: string;
};

export default function SignInPrompt({
    buttonClassName = 'btn-primary',
    buttonLabel = 'Sign in',
    ariaLabel = 'Sign in',
}: Props) {
    return (
        <a href="/customer/login" className={buttonClassName} aria-label={ariaLabel} title={ariaLabel}>
            {buttonLabel}
        </a>
    );
}
