@component('mail::message')
<div style="margin-bottom:12px;text-align:left;">
<img src="{{ config('app.brand.logo_url') ?: asset(config('app.brand.logo_path')) }}" alt="{{ config('app.brand.logo_alt') }}" style="height:42px;width:auto;" />
</div>

# {{ !empty($requiresVerification) ? 'Verify your email to activate your event' : 'Congratulations, your event is live!' }}

Hi {{ $organiser->name ?? 'there' }},

Your event **{{ $event->title }}** has been created.

@if(!empty($requiresVerification))
Before we can activate it, please verify your email address.
@endif

**Event details**
- Date: {{ optional($event->start_at)->toFormattedDateString() }}@if($event->end_at) – {{ optional($event->end_at)->toFormattedDateString() }}@endif
- Location: {{ trim(($event->city ? $event->city . ', ' : '') . ($event->country ?? '')) ?: 'Not specified yet' }}

@if(!empty($requiresVerification) && !empty($verifyUrl))
@component('mail::button', ['url' => $verifyUrl])
Verify email & manage event
@endcomponent

@endif

You can manage this event using the link below:

@component('mail::button', ['url' => $editUrl])
Update Event
@endcomponent

@if($editPassword)
**Password (required to edit):** {{ $editPassword }}
@endif

If the button does not work, copy and paste this link: {{ $editUrl }}

@if(!empty($requiresVerification) && !empty($verifyUrl))

Verification link (activate event): {{ $verifyUrl }}
@endif

Thanks,
{{ config('app.name') }}
@endcomponent
