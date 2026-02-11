type Props = {
    buttonClassName?: string;
    buttonLabel?: string;
};

export default function SignInPrompt({ buttonClassName = 'btn-primary', buttonLabel = 'Sign in' }: Props) {
    return (
        <a href="/customer/login" className={buttonClassName}>
            {buttonLabel}
        </a>
    );
}
