<div style="margin-bottom:12px;text-align:left;">
    <img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }} logo" style="height:42px;width:auto;" />
</div>

<h1 style="margin:0 0 12px; font-size:20px;">Verify your artist account</h1>

<p style="margin:0 0 12px;">
    Hi {{ $artist->name ?? 'there' }},
</p>

<p style="margin:0 0 12px;">
    Please verify your email address to activate your artist account.
</p>

<p style="margin:0 0 16px;">
    <a href="{{ $verifyUrl }}" style="display:inline-block; background:#111827; color:#ffffff; padding:10px 14px; text-decoration:none; border-radius:6px;">
        Verify email
    </a>
</p>

<p style="margin:0 0 8px; color:#4b5563; font-size:14px;">
    If the button does not work, copy and paste this link:
</p>
<p style="margin:0; font-size:14px; word-break:break-all;">
    {{ $verifyUrl }}
</p>

<p style="margin:16px 0 0; color:#4b5563; font-size:14px;">
    Thanks,<br />
    {{ config('app.name') }}
</p>
