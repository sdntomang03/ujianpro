<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    protected $guarded = ['id'];

    public function soals(): HasMany
    {
        return $this->hasMany(Soal::class);
    }
}
