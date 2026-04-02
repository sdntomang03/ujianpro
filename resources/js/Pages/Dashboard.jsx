import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
// Import satu per satu untuk memastikan tidak ada yang terlewat
import {
    Lock, Crown, Star, ArrowRight, Trophy,
    Target, FileText, Clock, BookOpen
} from 'lucide-react';

export default function Dashboard({ auth, statistik = [], ujianTersedia = [], riwayatUjian = [], userPaket }) {

    // Ambil level kekuatan siswa saat ini
    const userLevel = userPaket?.level || 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Dashboard Siswa</h2>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white border border-slate-200 px-4 py-1.5 rounded-2xl shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Tahun Ajaran 2025/2026
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 pb-10">

                {/* 1. HERO BANNER */}
                <div className={`relative overflow-hidden rounded-[2.5rem] shadow-xl transition-all duration-500 ${
                    userLevel >= 30 ? 'bg-slate-900 text-white' :
                    userLevel >= 20 ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white' :
                    'bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 text-white'
                }`}>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-10 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>

                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-sm font-black uppercase tracking-widest">
                                {userLevel >= 30 ? <Star size={16} className="fill-sky-400 text-sky-400" /> :
                                 userLevel >= 20 ? <Crown size={16} className="fill-amber-300 text-amber-300" /> :
                                 <BookOpen size={16} />}
                                Member {userPaket?.nama_paket || 'Reguler'} - {auth?.user?.jenjang || 'UMUM'}
                            </div>

                            <h3 className="text-4xl md:text-5xl font-black leading-tight">
                                Halo, {auth?.user?.name?.split(' ')[0] || 'Siswa'}! 👋
                            </h3>
                            <p className="text-indigo-100 text-lg max-w-xl leading-relaxed font-medium opacity-90">
                                Semakin sering berlatih, semakin dekat kamu dengan impianmu. Cek progres belajarmu hari ini!
                            </p>
                        </div>

                        <div className="relative group hidden lg:block text-6xl">
                             🚀
                        </div>
                    </div>
                </div>

                {/* 2. STATISTIK CEPAT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.isArray(statistik) && statistik.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${stat.bg} ${stat.color}`}>
                                {/* Logic Ikon Aman */}
                                {stat.title?.toLowerCase().includes('selesai') ? <FileText /> :
                                 stat.title?.toLowerCase().includes('rata') ? <Target /> : <Trophy />}
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. KONTEN UTAMA */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* KOLOM KIRI */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                                Ujian Terbaru
                            </h3>
                            {/* Pastikan route() tersedia, jika tidak gunakan href="/ujian" */}
                            <Link href="/daftar-ujian" className="group flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-all">
                                Lihat Semua <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {!ujianTersedia || ujianTersedia.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-slate-100 text-center text-slate-400">
                                Belum ada ujian yang tersedia.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {ujianTersedia.map((ujian) => {
                                    const isLocked = userLevel < (ujian.min_level || 0);
                                    return (
                                        <div key={ujian.id} className="relative bg-white rounded-[2.5rem] p-6 border border-slate-200 transition-all hover:shadow-2xl flex flex-col h-full overflow-hidden">

                                            {/* Badge Eksklusif */}
                                            {ujian.min_level >= 30 && (
                                                <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 shadow-lg">
                                                    <Star size={12} className="fill-sky-400 text-sky-400" /> Platinum
                                                </div>
                                            )}
                                            {(ujian.min_level >= 20 && ujian.min_level < 30) && (
                                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl z-10 flex items-center gap-1.5 shadow-lg">
                                                    <Crown size={12} /> Premium
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100">
                                                    {ujian.mapel}
                                                </span>
                                            </div>

                                            <h4 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 leading-tight">
                                                {ujian.judul}
                                            </h4>

                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-8 mt-2">
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                                    <Clock size={14} className="text-indigo-400" /> {ujian.durasi}
                                                </div>
                                                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                                                    <FileText size={14} className="text-emerald-400" /> {ujian.soal} Soal
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                {isLocked ? (
                                                    <Link
                                                        href="/upgrade"
                                                        className="flex justify-center items-center gap-2 w-full bg-slate-50 border border-slate-200 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-100 transition-all text-sm uppercase tracking-wider"
                                                    >
                                                        <Lock size={16} /> Upgrade To {ujian.min_paket_nama}
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/ujian/${ujian.id}/persiapan`}
                                                        className="relative flex justify-center items-center gap-2 w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm uppercase tracking-wider shadow-lg"
                                                    >
                                                        Mulai Ujian <ArrowRight size={16} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* KOLOM KANAN */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 px-2">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                            Riwayat Nilai
                        </h3>

                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            {!riwayatUjian || riwayatUjian.length === 0 ? (
                                <div className="p-10 text-center text-sm font-bold text-slate-400">
                                    Belum ada ujian <br/>yang diselesaikan.
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {riwayatUjian.map((riwayat) => (
                                        <div key={riwayat.id} className="p-6 hover:bg-slate-50 transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-black text-slate-800 text-sm leading-tight line-clamp-2 pr-4">{riwayat.judul}</h4>
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                                                    riwayat.status === 'Lulus' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                                }`}>
                                                    {Math.round(riwayat.nilai)}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-slate-400">{riwayat.tanggal}</span>
                                                <span className={riwayat.status === 'Lulus' ? 'text-emerald-500' : 'text-rose-500'}>{riwayat.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
