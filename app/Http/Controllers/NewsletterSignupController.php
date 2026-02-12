<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSignup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterSignupController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255', 'unique:newsletter_signups,email'],
        ]);

        NewsletterSignup::query()->create([
            'email' => $data['email'],
        ]);

        return redirect()->back()->with('newsletter_success', 'Thanks! You are subscribed.');
    }
}
