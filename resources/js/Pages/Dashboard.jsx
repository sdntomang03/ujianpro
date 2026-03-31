import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    // Data Dummy untuk memperlihatkan desain (Nanti bisa diganti dengan data asli dari database)
    const statistik = [
        { title: 'Ujian Diselesaikan', value: '12', icon: '📝', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Nilai Rata-rata', value: '85.5', icon: '🎯', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Sertifikat', value: '3', icon: '🏆', color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const ujianTersedia = [
        { id: 1, judul: 'Tryout Premium Intensif (UTBK 2026)', mapel: 'Campuran', durasi: '90 Menit', soal: 6, status: 'Baru' },
        // Kamu bisa menambah data dummy lain di sini untuk melihat bentuk grid-nya
    ];

    const riwayatUjian = [
        { id: 101, judul: 'Simulasi Matematika Dasar', tanggal: '28 Mar 2026', nilai: 92.00, status: 'Lulus' },
        { id: 102, judul: 'Kuis Bahasa Inggris Peminatan', tanggal: '25 Mar 2026', nilai: 78.50, status: 'Lulus' },
        { id: 103, judul: 'Tryout Fisika Kuantum', tanggal: '20 Mar 2026', nilai: 55.00, status: 'Remedial' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">
                        Dashboard Siswa
                    </h2>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Tahun Ajaran 2025/2026
                    </span>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="flex flex-col gap-8 pb-10">

                {/* 1. HERO BANNER (Elegan & Memotivasi) */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 shadow-lg shadow-indigo-200">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-10 -mb-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>

                    <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="text-white space-y-2">
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                                Halo, {auth.user.name}! 👋
                            </h3>
                            <p className="text-indigo-200 text-lg max-w-xl leading-relaxed font-medium">
                                Siap untuk menguji kemampuanmu hari ini? Teruslah berlatih, karena konsistensi adalah kunci kesuksesan sejati.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center transform rotate-3 shadow-inner">
                                <span className="text-5xl">🚀</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. STATISTIK CEPAT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statistik.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-800 mt-0.5">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. KONTEN UTAMA (Kiri: Ujian Tersedia, Kanan: Riwayat) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* KOLOM KIRI (Lebar 2/3) - Daftar Ujian */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                                Ujian Tersedia
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ujianTersedia.map((ujian) => (
                                <div key={ujian.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest rounded-lg border border-indigo-100">
                                            {ujian.mapel}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">
                                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                                            {ujian.status}
                                        </span>
                                    </div>

                                    <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {ujian.judul}
                                    </h4>

                                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 mb-8">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {ujian.durasi}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            {ujian.soal} Soal
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {/* LINK MENUJU CONTROLLER MULAI UJIAN YANG SUDAH KITA BUAT */}
                                        <Link
                                            href={`/ujian/${ujian.id}/mulai`}
                                            className="block w-full text-center bg-slate-900 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
                                        >
                                            Kerjakan Sekarang &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KOLOM KANAN (Lebar 1/3) - Riwayat Nilai */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                Riwayat Nilai
                            </h3>
                            <Link href="#" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Lihat Semua</Link>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                            <div className="divide-y divide-slate-100">
                                {riwayatUjian.map((riwayat) => {
                                    const isLulus = riwayat.status === 'Lulus';
                                    return (
                                        <div key={riwayat.id} className="p-5 hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 text-sm line-clamp-2 pr-4">{riwayat.judul}</h4>
                                                <div className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-black ${isLulus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {riwayat.nilai.toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-xs font-semibold">
                                                <span className="text-slate-400">{riwayat.tanggal}</span>
                                                <span className={isLulus ? 'text-emerald-600' : 'text-rose-600'}>{riwayat.status}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
