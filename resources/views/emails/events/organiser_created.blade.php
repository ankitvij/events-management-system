@component('mail::message')
@php
	$eventImage = $event->image_thumbnail_url ?: $event->image_url;
	if (is_string($eventImage) && str_starts_with($eventImage, '/')) {
		$eventImage = url($eventImage);
	}
@endphp

@if(!empty($eventImage))
<div style="margin-bottom:16px;text-align:center;">
<img src="{{ $eventImage }}" alt="{{ $event->title }}" style="max-width:100%;height:auto;border-radius:8px;" />
</div>
@endif

# Your event is ready to manage

Hi {{ $organiser->name ?? 'there' }},

Your event **{{ $event->title }}** has been created.

**Event details**
- Date: {{ optional($event->start_at)->toFormattedDateString() }}@if($event->end_at) – {{ optional($event->end_at)->toFormattedDateString() }}@endif
- Location: {{ trim(($event->city ? $event->city . ', ' : '') . ($event->country ?? '')) ?: 'Not specified yet' }}

You can manage this event using the link below:

@component('mail::button', ['url' => $editUrl])
Manage Event
@endcomponent

@if($editPassword)
**Password (required to edit):** {{ $editPassword }}
@endif

If the button does not work, copy and paste this link: {{ $editUrl }}

<div style="margin-top:18px;text-align:left;">
<img src="{{ config('app.brand.logo_url') ?: asset(config('app.brand.logo_path')) }}" alt="{{ config('app.brand.logo_alt') }}" style="height:42px;width:auto;" />
</div>

Thanks,
{{ config('app.name') }}
@endcomponent
