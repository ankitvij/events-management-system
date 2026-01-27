<?php

$dbFile = __DIR__.'/../database/database.sqlite';
$pdo = new PDO('sqlite:'.$dbFile);
$res = $pdo->query('SELECT count(*) as c FROM events');
$row = $res ? $res->fetch(PDO::FETCH_ASSOC) : null;
echo 'events_count: '.($row['c'] ?? 0).PHP_EOL;
