@component('mail::message')
<div style="margin-bottom:12px;text-align:left;">
<img src="{{ asset('images/logo.png') }}" alt="{{ config('app.name') }} logo" style="height:42px;width:auto;" />
</div>

# Congratulations, your event is live!

Hi {{ $organiser->name ?? 'there' }},

Your event **{{ $event->title }}** has been created.

**Event details**
- Date: {{ optional($event->start_at)->toFormattedDateString() }}@if($event->end_at) – {{ optional($event->end_at)->toFormattedDateString() }}@endif
- Location: {{ trim(($event->city ? $event->city . ', ' : '') . ($event->country ?? '')) ?: 'Not specified yet' }}

You can update this event using the link below:

@component('mail::button', ['url' => $editUrl])
Update Event
@endcomponent

@if($editPassword)
**Password (required to edit):** {{ $editPassword }}
@endif

If the button does not work, copy and paste this link: {{ $editUrl }}

Thanks,
{{ config('app.name') }}
@endcomponent
