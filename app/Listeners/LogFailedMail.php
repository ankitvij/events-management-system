<?php

namespace App\Listeners;

use Illuminate\Mail\Events\MessageFailed;
use Illuminate\Support\Facades\Log;

class LogFailedMail
{
    /**
     * Handle the event.
     */
    public function handle(MessageFailed $event): void
    {
        try {
            $messageClass = is_object($event->message) ? get_class($event->message) : gettype($event->message);

            $to = null;
            if (is_object($event->message)) {
                if (method_exists($event->message, 'getTo')) {
                    $to = $event->message->getTo();
                } elseif (property_exists($event->message, 'getHeaders')) {
                    $to = method_exists($event->message, 'getTo') ? $event->message->getTo() : null;
                }
            }

            $exceptionMessage = null;
            if (property_exists($event, 'exception') && $event->exception instanceof \Throwable) {
                $exceptionMessage = $event->exception->getMessage();
            }

            Log::error('Mail sending failed', [
                'message_class' => $messageClass,
                'to' => $to,
                'exception' => $exceptionMessage,
            ]);

            // Also append to a dedicated mail-failures log for admin review
            try {
                $entry = '['.now()->toDateTimeString().'] '.json_encode([
                    'message_class' => $messageClass,
                    'to' => $to,
                    'exception' => $exceptionMessage,
                ]).PHP_EOL;
                @file_put_contents(storage_path('logs/mail-failures.log'), $entry, FILE_APPEND | LOCK_EX);
            } catch (\Throwable $_e) {
                // ignore
            }
        } catch (\Throwable $e) {
            Log::error('Failed to log mail failure: '.$e->getMessage());
        }
    }
}
