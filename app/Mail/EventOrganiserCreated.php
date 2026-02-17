<?php

namespace App\Mail;

use App\Models\Event;
use App\Models\Organiser;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EventOrganiserCreated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Event $event,
        public Organiser $organiser,
        public string $editUrl,
        public ?string $editPassword,
        public ?string $verifyUrl = null,
        public bool $requiresVerification = false,
    ) {}

    public function build(): self
    {
        return $this->subject('ChancePass:"'.$this->event->title.'" manage.')
            ->markdown('emails.events.organiser_created', [
                'event' => $this->event,
                'organiser' => $this->organiser,
                'editUrl' => $this->editUrl,
                'editPassword' => $this->editPassword,
                'verifyUrl' => $this->verifyUrl,
                'requiresVerification' => $this->requiresVerification,
            ]);
    }
}
