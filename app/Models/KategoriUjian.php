<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriUjian extends Model
{
    use HasFactory;

    protected $fillable = ['nama_kategori', 'deskripsi'];

    // 1 Kategori Ujian memiliki BANYAK Ujian
    public function ujians()
    {
        return $this->hasMany(Ujian::class);
    }
}
