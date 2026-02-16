<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class LoginTokenMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $loginUrl,
        public string $subjectLine,
        public ?string $intro = null,
        public string $buttonLabel = 'Login',
    ) {}

    public function build(): static
    {
        return $this
            ->subject($this->subjectLine)
            ->view('emails.login_token', [
                'login_url' => $this->loginUrl,
                'intro' => $this->intro,
                'button_label' => $this->buttonLabel,
            ]);
    }
}
