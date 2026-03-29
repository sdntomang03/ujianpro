import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    // Data tiruan ala aplikasi Premium
    const stats = [
        { title: 'Ujian Diselesaikan', value: '12', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { title: 'Rata-rata Nilai', value: '88.5', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { title: 'Peringkat Global', value: '#42', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    const jadwalUjian = [
        { id: 1, mapel: 'Matematika Lanjut (TOEF)', tipe: 'Premium Tryout', waktu: '120 Menit', soal: 40, status: 'Tersedia' },
        { id: 2, mapel: 'Bahasa Inggris - Reading', tipe: 'Ujian Harian', waktu: '60 Menit', soal: 50, status: 'Tersedia' },
        { id: 3, mapel: 'Fisika Kuantum Dasar', tipe: 'Ujian Akhir', waktu: '90 Menit', soal: 60, status: 'Terkunci' },
    ];

    const riwayatNilai = [
        { id: 1, mapel: 'Biologi Seluler', tanggal: '28 Mar 2026', nilai: 92, status: 'Lulus' },
        { id: 2, mapel: 'Kimia Organik', tanggal: '25 Mar 2026', nilai: 85, status: 'Lulus' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-slate-800 leading-tight tracking-tight">CBT Pro Dashboard</h2>}
        >
            <Head title="Pro Dashboard" />

            <div className="py-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* 1. Hero Section (Kartu Ucapan Premium) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                        {/* Aksen Background Bergelombang (Opsional) */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20"></div>

                        <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Halo, {auth.user.name}!
                                    </h3>
                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Pro Member
                                    </span>
                                </div>
                                <p className="text-slate-500 text-lg max-w-2xl">
                                    Ini adalah pusat kendali belajarmu. Analisis performamu terlihat sangat bagus minggu ini. Pertahankan prestasimu!
                                </p>
                            </div>
                            <div className="mt-6 sm:mt-0">
                                <button className="bg-slate-900 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-1">
                                    Lihat Analisis Penuh &rarr;
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. Statistik Kartu Cerdas (Smart Stats) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 transition hover:shadow-md">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                    <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 3. Kolom Kiri: Ujian Tersedia (Lebar 2/3) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-slate-900">Ujian Menunggu</h3>
                                <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-800">Lihat Semua</button>
                            </div>

                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {jadwalUjian.map((ujian) => (
                                        <li key={ujian.id} className="p-6 hover:bg-slate-50 transition duration-150">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-start gap-4">
                                                    <div className={`mt-1 w-3 h-3 rounded-full ${ujian.status === 'Tersedia' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-indigo-600 mb-1">{ujian.tipe}</p>
                                                        <h4 className="text-lg font-bold text-slate-900">{ujian.mapel}</h4>
                                                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {ujian.waktu}</span>
                                                            <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> {ujian.soal} Soal</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {ujian.status === 'Tersedia' ? (
                                                        <button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition">
                                                            Mulai Ujian
                                                        </button>
                                                    ) : (
                                                        <button disabled className="bg-slate-100 text-slate-400 font-bold py-2.5 px-6 rounded-xl border border-slate-200 flex items-center gap-2 cursor-not-allowed">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                                            Terkunci
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* 4. Kolom Kanan: Aktivitas Terakhir (Lebar 1/3) */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900">Aktivitas Terakhir</h3>
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                                <ul className="space-y-6">
                                    {riwayatNilai.map((riwayat) => (
                                        <li key={riwayat.id} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                                            <div>
                                                <h4 className="font-bold text-slate-800">{riwayat.mapel}</h4>
                                                <p className="text-sm text-slate-400 mt-1">{riwayat.tanggal}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-extrabold text-slate-900">{riwayat.nilai}</p>
                                                <p className="text-xs font-bold text-emerald-500 uppercase">{riwayat.status}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <button className="w-full mt-6 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 rounded-xl transition border border-slate-200">
                                    Unduh Rapor
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
