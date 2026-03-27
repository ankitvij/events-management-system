@component('mail::message')
@php
	$eventImageUrl = $event->image_thumbnail_url ?: $event->image_url;
@endphp

@include('emails.partials.event_header')

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

@include('emails.partials.chancepass_footer')

Thanks,
{{ config('app.name') }}
@endcomponent
