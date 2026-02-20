<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
    @include('emails.partials.event_header')
    <h2>Welcome, {{ $name ?: 'there' }}</h2>
    <p>We created your account while completing your recent order.</p>
    <p style="margin-top:12px">Sign in here: <a href="{{ $login_url }}">{{ $login_url }}</a></p>
    <p style="font-size:0.95em;color:#555;">Use your email {{ $email }} with the password you set at checkout.</p>
    <p style="font-size:0.95em;color:#555;">If you didn’t expect this email, reply and we’ll help secure the account.</p>

    @include('emails.partials.chancepass_footer')
</div>
