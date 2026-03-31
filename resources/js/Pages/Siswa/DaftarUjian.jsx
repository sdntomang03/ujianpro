import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
// Pastikan import layout ini sesuai dengan lokasi file di project-mu
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DaftarUjian({ auth, kategoriUjians }) {
    // State untuk menyimpan ID kategori yang sedang aktif
    const [kategoriAktif, setKategoriAktif] = useState(
        kategoriUjians.length > 0 ? kategoriUjians[0].id : null
    );

    // Filter data ujian berdasarkan kategori yang sedang aktif
    const kategoriTerpilih = kategoriUjians.find(k => k.id === kategoriAktif);
    const daftarUjian = kategoriTerpilih ? kategoriTerpilih.ujians : [];

    // Fungsi untuk handle klik mulai dengan konfirmasi
    const handleMulaiUjian = (id, judul) => {
        if (confirm(`Apakah Anda yakin ingin memulai ujian "${judul}"? Waktu akan langsung berjalan.`)) {
            router.get(route('ujian.mulai', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        Daftar Ujian Tersedia
                    </h2>
                    <span className="hidden sm:block text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Tahun Ajaran 2025/2026
                    </span>
                </div>
            }
        >
            <Head title="Daftar Ujian Tersedia" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* --- HEADER TEXT --- */}
                    <div className="mb-8 px-4 sm:px-0">
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Daftar Ujian</h1>
                        <p className="text-slate-500 mt-2">Pilih kategori untuk melihat jadwal ujian yang tersedia untukmu saat ini.</p>
                    </div>

                    {/* --- TAB KATEGORI (HORIZONTAL SCROLL) --- */}
                    <div className="flex overflow-x-auto pb-4 mb-6 px-4 sm:px-0 gap-3 no-scrollbar">
                        {kategoriUjians.map((kategori) => (
                            <button
                                key={kategori.id}
                                onClick={() => setKategoriAktif(kategori.id)}
                                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-sm ${
                                    kategoriAktif === kategori.id
                                        ? 'bg-blue-600 text-white shadow-blue-200'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {kategori.nama_kategori}
                            </button>
                        ))}
                    </div>

                    {/* --- DAFTAR UJIAN (GRID CARDS) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                        {daftarUjian.length > 0 ? (
                            daftarUjian.map((ujian) => (
                                <div key={ujian.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                            </div>
                                            <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-lg">
                                                {ujian.durasi_menit} Menit
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                                            {ujian.judul_ujian}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2">
                                            {ujian.deskripsi || "Tidak ada deskripsi untuk ujian ini."}
                                        </p>
                                    </div>

                       <div className="mt-6 pt-4 border-t border-slate-50">
                                        {/* Ganti button dengan Link ke rute persiapan */}
                                        <Link
                                            href={route('ujian.persiapan', ujian.id)}
                                            className="w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-95"
                                        >
                                            Mulai Ujian
                                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-4 text-slate-300">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-700 mb-1">Jadwal Kosong</h3>
                                <p className="text-slate-500">Belum ada ujian yang ditugaskan untuk kategori ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
