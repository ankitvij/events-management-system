Mailgun setup notes

1) Choose Mailgun region and add credentials to your .env

MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.chancepass.com
MAILGUN_SECRET=key-xxxxxxxxxxxxxxxxxxxx
MAIL_FROM_ADDRESS=info@chancepass.com
MAIL_FROM_NAME="ChancePass"

If your Mailgun integration in `config/services.php` uses `mailgun` v3, ensure the following are set there.

2) DNS records (add to your domain host)
- SPF (TXT):
  v=spf1 include:mailgun.org ~all

- DKIM (TXT):
  Mailgun provides two DKIM records ("krs._domainkey" etc). Add the TXT records exactly as provided by Mailgun.

- Tracking/Return-Path (CNAME):
  Mailgun may ask you to add a CNAME for "email.mg.chancepass.com" pointing to mailgun.org (follow Mailgun UI).

3) Verify in Mailgun dashboard
- After DNS propagation verify the domain, enable DKIM and tracking.
- Send a test message from Mailgun UI and confirm receipt.

4) Test send from your app (artisan tinker)
```bash
php artisan tinker
Mail::to('your@example.com')->send(new \App\Mail\OrderConfirmed(App\Models\Order::first()));
```

5) Troubleshooting
- If Mailchannels/Hostinger previously blocked messages, updating SPF/DKIM and switching to Mailgun usually fixes deliverability.
- Check your sending domain reputation and Mailgun logs for rejects.

6) Alternative providers
- Postmark: best-in-class deliverability for transactional mail.
- Amazon SES: cost-effective at scale but requires verification and setup.

If you want, I can add a `config/services.php` Mailgun entry and a `.env.example` snippet and commit them for you.
