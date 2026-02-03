<?php
$dsn = 'mysql:host=127.0.0.1;dbname=laravel;charset=utf8mb4';
$user = 'root';
$pass = 'root';
try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (Exception $e) {
    echo "DB CONNECT ERROR: " . $e->getMessage() . PHP_EOL;
    exit(1);
}
$stmt = $pdo->query("SELECT id, IFNULL(image,'' ) as image, IFNULL(image_thumbnail,'') as image_thumbnail FROM events ORDER BY id");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $id = $row['id'];
    $img = $row['image'];
    $thumb = $row['image_thumbnail'];
    $imgPath = $img !== '' ? __DIR__ . '/../public/storage/' . $img : '';
    $thumbPath = $thumb !== '' ? __DIR__ . '/../public/storage/' . $thumb : '';
    $imgExists = $imgPath ? (file_exists($imgPath) ? '1' : '0') : '0';
    $thumbExists = $thumbPath ? (file_exists($thumbPath) ? '1' : '0') : '0';
    echo "$id\t$img\t$imgExists\t$thumb\t$thumbExists\n";
}
