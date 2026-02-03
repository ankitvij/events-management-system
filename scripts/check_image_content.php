<?php
$f = __DIR__ . '/../public/storage/images/events/event_0.jpg';
if (!file_exists($f)) {
    echo "MISSING $f\n";
    exit(1);
}
echo "FILE: $f\n";
echo "SIZE: " . filesize($f) . " bytes\n";
$h = fopen($f, 'rb');
$bytes = fread($h, 20);
fclose($h);
echo "HEX HEAD: " . bin2hex($bytes) . "\n";
$info = @getimagesize($f);
var_export($info);
echo "\n";
?>
