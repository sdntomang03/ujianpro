import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { Search, TrendingUp, Users, Award, FileText, ChevronRight, Download, Clock, Folder, BookOpen, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';

export default function LaporanIndex({ auth, kategoriDanUjian, reports, stats, filters }) {

    // State untuk navigasi drill-down (KATEGORI -> UJIAN -> LAPORAN)
    // Jika ada parameter ujian_id dari URL, langsung buka mode LAPORAN
    const [viewMode, setViewMode] = useState(filters.ujian_id ? 'LAPORAN' : 'KATEGORI');
    const [selectedKategori, setSelectedKategori] = useState(null);
    const [selectedUjian, setSelectedUjian] = useState(null);

    // State untuk pencarian di tabel laporan
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Handle pemilihan Ujian dan apply filter ke server
    const handleSelectUjian = (ujian, kategori) => {
        setSelectedUjian(ujian);
        setSelectedKategori(kategori);
        setViewMode('LAPORAN');

        router.get(route('admin.laporan.index'), { ujian_id: ujian.id, search: searchQuery }, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle kembali ke daftar kategori (Reset filter)
    const handleBackToKategori = () => {
        setViewMode('KATEGORI');
        setSelectedKategori(null);
        setSelectedUjian(null);
        setSearchQuery('');

        router.get(route('admin.laporan.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    // Handle pencarian siswa (Debounce)
    const onSearchChange = debounce((val) => {
        router.get(route('admin.laporan.index'), { ujian_id: filters.ujian_id, search: val }, {
            preserveState: true, replace: true
        });
    }, 500);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Laporan Nilai Ujian</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Rekapitulasi hasil ujian peserta</p>
                    </div>
                 {viewMode === 'LAPORAN' && selectedUjian && (
    <button
        onClick={() => {
            // Mengarahkan browser ke URL export, menyertakan ID ujian dan kata kunci pencarian (jika ada)
            window.location.href = route('admin.laporan.export', {
                ujian_id: selectedUjian.id,
                search: searchQuery
            });
        }}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95"
    >
        <Download size={18} /> Export Excel
    </button>
)}
                </div>
            }
        >
            <Head title="Laporan Nilai" />

            <div className="space-y-6">

                {/* BREADCRUMBS NAVIGASI */}
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <button
                        onClick={handleBackToKategori}
                        className={`hover:text-indigo-600 transition-colors flex items-center gap-1 ${viewMode === 'KATEGORI' ? 'text-indigo-600' : ''}`}
                    >
                        <LayoutGrid size={16} /> Daftar Kategori
                    </button>

                    {selectedKategori && (
                        <>
                            <ChevronRight size={16} className="text-slate-300" />
                            <button
                                onClick={() => { setViewMode('UJIAN'); }}
                                className={`hover:text-indigo-600 transition-colors ${viewMode === 'UJIAN' ? 'text-indigo-600' : ''}`}
                            >
                                {selectedKategori.nama_kategori}
                            </button>
                        </>
                    )}

                    {selectedUjian && viewMode === 'LAPORAN' && (
                        <>
                            <ChevronRight size={16} className="text-slate-300" />
                            <span className="text-indigo-600 truncate max-w-[200px]">{selectedUjian.judul_ujian}</span>
                        </>
                    )}
                </div>

                {/* ==========================================
                    TAMPILAN 1: DAFTAR KATEGORI
                ========================================== */}
                {viewMode === 'KATEGORI' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {kategoriDanUjian.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {kategoriDanUjian.map(kat => (
                                    <button
                                        key={kat.id}
                                        onClick={() => {
                                            setSelectedKategori(kat);
                                            setViewMode('UJIAN');
                                        }}
                                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all text-left group flex flex-col items-start gap-4"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Folder size={24} />
                                        </div>
                                        <div className="w-full">
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                                {kat.nama_kategori}
                                            </h3>
                                            <p className="text-sm font-bold text-slate-400 mt-1">
                                                {kat.ujians.length} Ujian Tersedia
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <Folder size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">Belum Ada Kategori</h3>
                                <p className="text-slate-400 mt-2">Buat kategori dan ujian terlebih dahulu.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ==========================================
                    TAMPILAN 2: DAFTAR UJIAN DALAM KATEGORI
                ========================================== */}
                {viewMode === 'UJIAN' && selectedKategori && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={handleBackToKategori} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all">
                                <ArrowLeft size={18} />
                            </button>
                            <div>
                                <h3 className="font-black text-xl text-slate-800">Ujian: {selectedKategori.nama_kategori}</h3>
                                <p className="text-sm font-medium text-slate-500">Pilih ujian untuk melihat laporan nilainya.</p>
                            </div>
                        </div>

                        {selectedKategori.ujians.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedKategori.ujians.map(ujian => (
                                    <div key={ujian.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800 line-clamp-2">{ujian.judul_ujian}</h4>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-2">
                                                    <Users size={12} /> {ujian.peserta_selesai} Peserta Selesai
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleSelectUjian(ujian, selectedKategori)}
                                            className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl font-bold text-sm transition-colors border border-slate-100 hover:border-indigo-100"
                                        >
                                            Lihat Laporan Nilai
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                                <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                                <h3 className="text-lg font-bold text-slate-700">Belum Ada Ujian</h3>
                                <p className="text-slate-400 mt-2">Kategori ini belum memiliki ujian yang terdaftar.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ==========================================
                    TAMPILAN 3: LAPORAN NILAI (TABEL)
                ========================================== */}
                {viewMode === 'LAPORAN' && selectedUjian && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* KARTU STATISTIK */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <StatCard icon={<Users size={22}/>} label="Peserta Selesai" value={stats.total_peserta} color="indigo" />
                            <StatCard icon={<TrendingUp size={22}/>} label="Rata-rata Kelas" value={stats.rata_rata} color="emerald" />
                            <StatCard icon={<Award size={22}/>} label="Nilai Tertinggi" value={stats.nilai_tertinggi} color="amber" />
                            <StatCard icon={<FileText size={22}/>} label="Lulus (KKM 75)" value={stats.lulus_count} color="rose" />
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            {/* TOOLBAR PENCARIAN */}
                            <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                                <div className="relative group w-full sm:w-72">
                                    <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari nama peserta..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            onSearchChange(e.target.value);
                                        }}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* TABEL DATA */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50 bg-white">
                                            <th className="px-8 py-5 w-20 text-center">Rank</th>
                                            <th className="px-6 py-5">Peserta</th>
                                            <th className="px-6 py-5 w-48">Diselesaikan Pada</th>
                                            <th className="px-6 py-5 w-32 text-center">Nilai Akhir</th>
                                            <th className="px-8 py-5 w-24 text-right">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {reports.data.length > 0 ? reports.data.map((row, index) => (
                                            <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group bg-white">
                                                <td className="px-8 py-5">
                                                    <div className={`w-10 h-10 mx-auto rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                                                        index === 0 && reports.current_page === 1 ? 'bg-amber-100 text-amber-700 ring-4 ring-amber-50' :
                                                        index === 1 && reports.current_page === 1 ? 'bg-slate-100 text-slate-600' :
                                                        index === 2 && reports.current_page === 1 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                                                    }`}>
                                                        {index + 1 + ((reports.current_page - 1) * reports.per_page)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-bold text-slate-800">{row.user?.name || 'Siswa Dihapus'}</p>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                        {row.user?.email || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                                                        <Clock size={14} className="text-slate-400" />
                                                        {formatDate(row.waktu_selesai)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className={`inline-block px-4 py-1.5 rounded-2xl font-black text-base shadow-sm ${
                                                        row.nilai_akhir >= 75
                                                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                                                            : row.nilai_akhir === null
                                                            ? 'bg-slate-100 text-slate-400'
                                                            : 'bg-rose-500 text-white shadow-rose-200'
                                                    }`}>
                                                        {row.nilai_akhir !== null ? row.nilai_akhir : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                <Link
    href={route('admin.laporan.show', row.id)}
    className="w-10 h-10 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all flex items-center justify-center ml-auto"
>
    <ChevronRight size={20} />
</Link>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-300">
                                                        <FileText size={48} className="mb-4" />
                                                        <p className="text-slate-500 font-bold text-sm">Belum ada peserta yang menyelesaikan ujian ini.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGINATION INFO */}
                            <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Menampilkan Halaman {reports.current_page} dari {reports.last_page}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
            <div className={`w-12 h-12 ${colors[color]} border rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1.5">{value ?? 0}</h3>
        </div>
    );
}
