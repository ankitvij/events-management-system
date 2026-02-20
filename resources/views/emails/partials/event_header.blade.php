@php
    $resolvedEventImage = $eventImageUrl ?? null;

    if (empty($resolvedEventImage) && isset($event) && $event) {
        $resolvedEventImage = $event->image_thumbnail_url ?? $event->image_url ?? null;
    }

    if (empty($resolvedEventImage) && isset($order) && $order) {
        $firstOrderItem = collect($order->items ?? [])->first();
        $orderEvent = $firstOrderItem?->event;
        $resolvedEventImage = $orderEvent?->image_thumbnail_url ?? $orderEvent?->image_url ?? null;
    }

    if (empty($resolvedEventImage)) {
        $resolvedEventImage = asset('images/default-event.svg');
    }

    if (is_string($resolvedEventImage) && str_starts_with($resolvedEventImage, '/')) {
        $resolvedEventImage = url($resolvedEventImage);
    }
@endphp

<div style="margin: 0 0 14px 0; text-align: center;">
    <img src="{{ $resolvedEventImage }}" alt="Event image" style="max-width: 100%; height: auto; border-radius: 8px; display: inline-block;" />
</div>
