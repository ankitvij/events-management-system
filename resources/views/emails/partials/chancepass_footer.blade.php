@php
    $chancepassLogo = config('app.brand.logo_url') ?: asset(config('app.brand.logo_path'));
@endphp

<div style="margin-top: 18px; text-align: center;">
    <img src="{{ $chancepassLogo }}" alt="Chancepass logo" style="height: 42px; width: auto;" />
</div>
