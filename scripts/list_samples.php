<?php

$dbFile = __DIR__.'/../database/database.sqlite';
if (! file_exists($dbFile)) {
    echo "Database file not found: $dbFile\n";
    exit(1);
}

try {
    $pdo = new PDO('sqlite:'.$dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $res = $pdo->query('SELECT COUNT(*) as c FROM organisers');
    $count = $res->fetch(PDO::FETCH_ASSOC)['c'] ?? 0;
    echo "Organisers: $count\n";

    $stmt = $pdo->query('SELECT id, name, email, active FROM organisers LIMIT 5');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['id']} | {$row['name']} | {$row['email']} | active={$row['active']}\n";
    }

    echo "\n";

    $res = $pdo->query('SELECT COUNT(*) as c FROM customers');
    $count = $res->fetch(PDO::FETCH_ASSOC)['c'] ?? 0;
    echo "Customers: $count\n";

    $stmt = $pdo->query('SELECT id, name, email, phone, active FROM customers LIMIT 10');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "{$row['id']} | {$row['name']} | {$row['email']} | {$row['phone']} | active={$row['active']}\n";
    }
} catch (Exception $e) {
    echo 'Error: '.$e->getMessage()."\n";
    exit(1);
}
