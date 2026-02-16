<?php

namespace App\Mail;

use App\Models\Artist;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ArtistVerifyEmail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Artist $artist,
        public string $verifyUrl,
    ) {}

    public function build(): self
    {
        return $this->subject('Verify your artist account')
            ->view('emails.artists.verify', [
                'artist' => $this->artist,
                'verifyUrl' => $this->verifyUrl,
            ]);
    }
}
