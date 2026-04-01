import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ auth, stats, daftarUjianAktif, hasilTerbaru }) {

    const adminStats = [
        { title: 'Total Siswa Aktif', value: stats.totalSiswa, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Total Bank Soal', value: stats.totalSoal, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { title: 'Ujian Aktif', value: stats.ujianBerjalan, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'Rata-rata Nilai', value: stats.lulusPercent, icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-bold text-2xl text-slate-800 tracking-tight">Panel Kontrol Admin</h2>}
        >
            <Head title="Dashboard Admin" />

            <div className="py-8 space-y-8">
                {/* Metrik Utama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {adminStats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}></path>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">{stat.title}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* List Ujian Aktif */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Ujian Sedang Berjalan</h3>
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">LIVE</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {daftarUjianAktif.length > 0 ? daftarUjianAktif.map((u) => (
                                <li key={u.id} className="p-6 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{u.mapel}</h4>
                                        <p className="text-sm text-slate-500">{u.peserta} Siswa sedang mengerjakan</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                                        <span className="text-sm font-bold text-amber-600 tracking-tight">Monitoring</span>
                                    </div>
                                </li>
                            )) : (
                                <li className="p-10 text-center text-slate-400 font-medium">Belum ada aktivitas ujian saat ini.</li>
                            )}
                        </ul>
                    </div>

                    {/* Aktivitas Terbaru */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900">Hasil Terbaru</h3>
                        </div>
                        <ul className="divide-y divide-slate-50">
                            {hasilTerbaru.map((hasil) => (
                                <li key={hasil.id} className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                            {hasil.siswa.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 leading-tight">{hasil.siswa}</p>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">{hasil.mapel} • {hasil.waktu}</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-black text-rose-600">{hasil.nilai}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
