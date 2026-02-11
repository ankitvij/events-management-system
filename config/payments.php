<?php

return [
    'bank_transfer' => [
        'enabled' => true,
        'method' => 'bank_transfer',
        'display_name' => 'Bank transfer (pay in 7 days)',
        'instructions' => env('BANK_TRANSFER_INSTRUCTIONS', 'Transfer the total amount to our bank account and include your booking code in the reference.'),
        'account_name' => env('BANK_TRANSFER_ACCOUNT_NAME', 'Account Name'),
        'iban' => env('BANK_TRANSFER_IBAN', 'IBAN-HERE'),
        'bic' => env('BANK_TRANSFER_BIC', 'BIC/SWIFT-HERE'),
        'reference_hint' => env('BANK_TRANSFER_REFERENCE_HINT', 'Use your booking code as the payment reference.'),
    ],
    'paypal_transfer' => [
        'enabled' => true,
        'method' => 'paypal_transfer',
        'display_name' => 'Paypal (pay in 7 days)',
        'instructions' => env('PAYPAL_TRANSFER_INSTRUCTIONS', 'Send the total via PayPal and include your booking code in the note.'),
        'account_id' => env('PAYPAL_TRANSFER_ID', 'PAYPAL-ID-HERE'),
    ],
    'revolut_transfer' => [
        'enabled' => true,
        'method' => 'revolut_transfer',
        'display_name' => 'Revolut (pay in 7 days)',
        'instructions' => env('REVOLUT_TRANSFER_INSTRUCTIONS', 'Send the total via Revolut and include your booking code in the reference.'),
        'account_id' => env('REVOLUT_TRANSFER_ID', 'REVOLUT-ID-HERE'),
    ],
];
