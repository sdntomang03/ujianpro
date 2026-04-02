<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paket extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Satu paket bisa dimiliki banyak user
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Satu paket bisa menjadi syarat minimal untuk banyak ujian
    public function ujians()
    {
        return $this->hasMany(Ujian::class, 'minimal_paket_id');
    }
}
