import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminDashboard({ auth }) {
    // Data tiruan untuk metrik Admin
    const adminStats = [
        { title: 'Total Siswa Aktif', value: '1,248', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-blue-500', bg: 'bg-blue-50' },
        { title: 'Bank Soal Tersedia', value: '342', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { title: 'Ujian Sedang Berjalan', value: '4', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'Rata-rata Kelulusan', value: '86%', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    const daftarUjianAktif = [
        { id: 1, mapel: 'Matematika Lanjut', kelas: 'XII IPA 1', peserta: 32, selesai: 28, status: 'Berjalan' },
        { id: 2, mapel: 'Bahasa Inggris', kelas: 'XI IPS 2', peserta: 25, selesai: 25, status: 'Selesai Penilaian' },
    ];

    const hasilTerbaru = [
        { id: 1, siswa: 'Budi Santoso', nis: '123456', mapel: 'Fisika Dasar', nilai: 95, waktu: '10 menit yang lalu' },
        { id: 2, siswa: 'Siti Aminah', nis: '123457', mapel: 'Fisika Dasar', nilai: 88, waktu: '15 menit yang lalu' },
        { id: 3, siswa: 'Andi Wijaya', nis: '123458', mapel: 'Fisika Dasar', nilai: 76, waktu: '22 menit yang lalu' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-2xl text-slate-800 leading-tight tracking-tight">CBT Admin Control Panel</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Header Tindakan Cepat */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div>
                            <h3 className="text-xl font-extrabold text-slate-900">Halo Tutor, {auth.user.name}!</h3>
                            <p className="text-slate-500 text-sm">Pantau ujian yang sedang berjalan dan kelola bank soal hari ini.</p>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-2.5 px-5 rounded-xl transition">
                                + Bank Soal Baru
                            </button>
                            <button className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition">
                                + Buat Jadwal Ujian
                            </button>
                        </div>
                    </div>

                    {/* Metrik Utama */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {adminStats.map((stat, index) => (
                            <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-md">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon}></path>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                    <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Kolom Kiri: Pemantauan Ujian */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900">Pemantauan Ujian Hari Ini</h3>
                                <button className="text-indigo-600 text-sm font-semibold hover:underline">Kelola Jadwal</button>
                            </div>
                            <ul className="divide-y divide-slate-100">
                                {daftarUjianAktif.map((ujian) => (
                                    <li key={ujian.id} className="p-6 hover:bg-slate-50 transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{ujian.mapel}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{ujian.kelas}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${ujian.status === 'Berjalan' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {ujian.status}
                                            </span>
                                        </div>

                                        {/* Progress Bar Peserta */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-slate-500 font-medium">Progres Pengumpulan</span>
                                                <span className="font-bold text-slate-700">{ujian.selesai} / {ujian.peserta} Siswa</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                <div className={`h-2.5 rounded-full ${ujian.status === 'Berjalan' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(ujian.selesai / ujian.peserta) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Kolom Kanan: Laporan Nilai Masuk */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900">Aktivitas Siswa Terbaru</h3>
                                <button className="text-indigo-600 text-sm font-semibold hover:underline">Lihat Rapor</button>
                            </div>
                            <ul className="divide-y divide-slate-50">
                                {hasilTerbaru.map((hasil) => (
                                    <li key={hasil.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                {hasil.siswa.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{hasil.siswa} <span className="text-xs text-slate-400 font-normal">({hasil.nis})</span></p>
                                                <p className="text-xs text-slate-500">{hasil.mapel} • {hasil.waktu}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xl font-extrabold ${hasil.nilai >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {hasil.nilai}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
