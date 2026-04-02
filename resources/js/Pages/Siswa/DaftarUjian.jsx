import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BookOpen,
    Clock,
    ChevronRight,
    Layers,
    Calendar,
    Inbox,
    Lock,      // Ikon Gembok
    Crown,     // Ikon Premium
    Star       // Ikon Platinum
} from 'lucide-react';

export default function DaftarUjian({ auth, kategoriUjians, userPaket }) {
    const [kategoriAktif, setKategoriAktif] = useState(
        kategoriUjians.length > 0 ? kategoriUjians[0].id : null
    );

    // Ambil level user saat ini (10, 20, atau 30)
    const userLevel = userPaket?.level || 0;

    const kategoriTerpilih = kategoriUjians.find(k => k.id === kategoriAktif);
    const daftarUjian = kategoriTerpilih ? kategoriTerpilih.ujians : [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            Pusat Ujian
                        </h2>
                        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                            Jenjang: <span className="text-indigo-600 font-bold">{auth.user.jenjang}</span>
                            <span className="text-slate-300">|</span>
                            Paket: <span className="text-indigo-600 font-bold">{userPaket?.nama_paket || 'Reguler'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tahun Ajaran</span>
                            <span className="text-sm font-black text-indigo-600">2025/2026</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Pusat Ujian" />

            <div className="py-8 bg-slate-50/50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- KATEGORI SELECTOR --- */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Layers size={18} className="text-indigo-500" />
                            <span className="text-sm font-black text-slate-700 uppercase tracking-tighter">Kategori Materi</span>
                        </div>
                        <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar scroll-smooth">
                            {kategoriUjians.map((kategori) => (
                                <button
                                    key={kategori.id}
                                    onClick={() => setKategoriAktif(kategori.id)}
                                    className={`relative whitespace-nowrap px-8 py-3.5 rounded-2xl font-bold transition-all duration-300 group ${
                                        kategoriAktif === kategori.id
                                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 -translate-y-1'
                                            : 'bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-400'
                                    }`}
                                >
                                    {kategori.nama_kategori}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- CONTENT SECTION --- */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-black text-slate-800">
                                {kategoriTerpilih?.nama_kategori || 'Semua Ujian'}
                                <span className="ml-2 text-sm font-medium text-slate-400">({daftarUjian.length})</span>
                            </h3>
                        </div>

                        {daftarUjian.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {daftarUjian.map((ujian) => {
                                    // Logika Cek Paket
                                    const minLevel = ujian.minimal_paket?.level || 0;
                                    const isLocked = userLevel < minLevel;
                                    const isPlatinum = minLevel >= 30;
                                    const isPremium = minLevel >= 20 && minLevel < 30;

                                    return (
                                        <div
                                            key={ujian.id}
                                            className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 flex flex-col h-full overflow-hidden ${
                                                isLocked
                                                ? 'border-slate-200 opacity-80 grayscale-[0.5]'
                                                : 'border-slate-100 hover:shadow-2xl hover:shadow-indigo-100'
                                            }`}
                                        >
                                            {/* Badge Paket Eksklusif */}
                                            {isPlatinum && (
                                                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 shadow-lg">
                                                    <Star size={12} className="fill-sky-400 text-sky-400" /> Platinum
                                                </div>
                                            )}
                                            {isPremium && (
                                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 shadow-lg">
                                                    <Crown size={12} /> Premium
                                                </div>
                                            )}

                                            <div className="p-7">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className={`p-3.5 rounded-2xl transition-colors duration-500 ${
                                                        isLocked ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                                    }`}>
                                                        <BookOpen size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200">
                                                            <Clock size={12} />
                                                            {ujian.durasi_menit} Menit
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className={`text-xl font-black mb-3 leading-tight transition-colors ${
                                                    isLocked ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-600'
                                                }`}>
                                                    {ujian.judul_ujian}
                                                </h3>

                                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-8 font-medium">
                                                    {ujian.deskripsi || "Uji kemampuanmu dengan soal-soal standar nasional yang telah disusun secara sistematis."}
                                                </p>

                                                <div className="flex items-center justify-between py-4 border-t border-slate-50 mb-4">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                        <Calendar size={14} />
                                                        E-Exam System
                                                    </div>
                                                </div>

                                                {/* Tombol Aksi Dinamis */}
                                                {isLocked ? (
                                                    <Link
                                                        href="/upgrade" // Arahkan ke halaman upgrade paket
                                                        className="w-full inline-flex justify-center items-center gap-2 bg-slate-100 text-slate-500 font-black py-4 px-6 rounded-2xl transition-all hover:bg-slate-200"
                                                    >
                                                        <Lock size={18} />
                                                        <span>Buka Paket {ujian.minimal_paket?.nama_paket}</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route('ujian.persiapan', ujian.id)}
                                                        className="w-full inline-flex justify-between items-center bg-slate-900 group-hover:bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-200 group-hover:shadow-indigo-200 active:scale-[0.98]"
                                                    >
                                                        <span>Mulai Sekarang</span>
                                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-inner">
                                <div className="p-6 bg-slate-50 rounded-full mb-6">
                                    <Inbox size={48} className="text-slate-300" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-2">Belum Ada Sesi</h3>
                                <p className="text-slate-500 font-medium max-w-xs text-center">
                                    Tenang saja, ujian untuk kategori ini akan segera muncul setelah dijadwalkan oleh pengajar.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </AuthenticatedLayout>
    );
}
