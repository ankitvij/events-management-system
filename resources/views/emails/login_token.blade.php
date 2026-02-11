<div style="font-family: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; line-height:1.5;">
    @if($intro)
        <p>{{ $intro }}</p>
    @else
        <p>Use the link below to finish signing in.</p>
    @endif

    <p style="margin:16px 0;">
        <a href="{{ $login_url }}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:6px;text-decoration:none;">Sign in</a>
    </p>

    <p>If you did not request this link, you can ignore this email.</p>
</div>
