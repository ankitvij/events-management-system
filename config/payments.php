<?php

return [
    'bank_transfer' => [
        'enabled' => true,
        'method' => 'bank_transfer',
        'display_name' => 'Bank transfer',
        'instructions' => env('BANK_TRANSFER_INSTRUCTIONS', 'Transfer the total amount to our bank account and include your booking code in the reference.'),
        'account_name' => env('BANK_TRANSFER_ACCOUNT_NAME', 'Account Name'),
        'iban' => env('BANK_TRANSFER_IBAN', 'IBAN-HERE'),
        'bic' => env('BANK_TRANSFER_BIC', 'BIC/SWIFT-HERE'),
        'reference_hint' => env('BANK_TRANSFER_REFERENCE_HINT', 'Use your booking code as the payment reference.'),
    ],
];
