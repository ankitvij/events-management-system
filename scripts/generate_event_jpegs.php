<?php
// Generate simple JPEG placeholders for events and thumbnails
$outDir = __DIR__ . '/../public/storage/images/events';
if (!is_dir($outDir)) mkdir($outDir, 0755, true);

for ($i = 0; $i < 30; $i++) {
    $w = 1200; $h = 800;
    $img = imagecreatetruecolor($w, $h);
    $bg = imagecolorallocate($img, 203, 213, 225); // #cbd5e1
    $fg = imagecolorallocate($img, 51, 65, 85); // #334155
    imagefill($img, 0, 0, $bg);
    $text = "Event {$i}";
    // Add simple text using built-in font centered
    $font = 5; // imagestring font
    $tw = imagefontwidth($font) * strlen($text);
    $th = imagefontheight($font);
    imagestring($img, $font, (int)(($w - $tw) / 2), (int)(($h - $th) / 2), $text, $fg);
    $path = $outDir . "/event_{$i}.jpg";
    imagejpeg($img, $path, 85);
    imagedestroy($img);

    // Thumbnail
    $twW = 400; $twH = 300;
    $t = imagecreatetruecolor($twW, $twH);
    $bg2 = imagecolorallocate($t, 226, 232, 240);
    $fg2 = imagecolorallocate($t, 15, 23, 42);
    imagefill($t, 0, 0, $bg2);
    $ttext = "Event {$i} Thumb";
    $font = 5;
    $ttw = imagefontwidth($font) * strlen($ttext);
    $tth = imagefontheight($font);
    imagestring($t, $font, (int)(($twW - $ttw) / 2), (int)(($twH - $tth) / 2), $ttext, $fg2);
    $tpath = $outDir . "/event_{$i}_thumb.jpg";
    imagejpeg($t, $tpath, 85);
    imagedestroy($t);
}

echo "Generated JPEG placeholders in {$outDir}\n";
