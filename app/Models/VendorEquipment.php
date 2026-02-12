<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorEquipment extends Model
{
    /** @use HasFactory<\Database\Factories\VendorEquipmentFactory> */
    use HasFactory;

    protected $table = 'vendor_equipment';

    protected $fillable = [
        'vendor_id',
        'name',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
