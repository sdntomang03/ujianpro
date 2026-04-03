import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Users, Search, RefreshCw, Clock, ArrowLeft,
    CheckCircle2, AlertCircle, X, CheckSquare, Calculator
} from 'lucide-react';

export default function Monitoring({ auth, ujian, pesertas, filters }) {
    // --- 1. STATE MANAGEMENT PENCARIAN & SELEKSI ---
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState([]);

    // State Loading untuk fitur Hitung Ulang
    const [isRecalculating, setIsRecalculating] = useState(false);

    // Reset pilihan (checkbox) setiap kali data tabel berubah (ganti halaman/pencarian)
    useEffect(() => {
        setSelectedIds([]);
    }, [pesertas.data]);

    // --- 2. STATE FORM UNTUK MODAL TAMBAH WAKTU ---
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        peserta_ids: [],
        tambahan_menit: 10
    });

    // --- 3. FUNGSI PENCARIAN ---
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.ujian.monitoring', ujian.id), { search: searchQuery }, { preserveState: true });
    };

    // --- 4. FUNGSI CHECKBOX (MULTI-SELECT) ---
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(pesertas.data.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (e, id) => {
        if (e.target.checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(item => item !== id));
        }
    };

    // --- 5. FUNGSI AKSI INDIVIDUAL & MASSAL ---

    // A. Buka Modal Tambah Waktu
    const openTimeModal = (pesertaId = null) => {
        if (pesertaId) {
            // Mode Individual
            setData({ peserta_ids: [pesertaId], tambahan_menit: 10 });
        } else {
            // Mode Bulk (Massal)
            if (selectedIds.length === 0) return alert("Pilih minimal 1 peserta terlebih dahulu!");
            setData({ peserta_ids: selectedIds, tambahan_menit: 10 });
        }
        setIsTimeModalOpen(true);
    };

    // B. Submit Tambah Waktu ke Server
    const submitTambahWaktu = (e) => {
        e.preventDefault();
        post(route('admin.ujian.tambah-waktu', ujian.id), {
            onSuccess: () => {
                setIsTimeModalOpen(false);
                setSelectedIds([]);
                reset();
            }
        });
    };

    // C. Reset Sesi Ujian (Individual / Massal)
    const handleReset = (pesertaId = null, namaSiswa = null) => {
        let idsToReset = [];
        let confirmMessage = "";

        if (pesertaId) {
            idsToReset = [pesertaId];
            confirmMessage = `Yakin ingin mereset sesi ujian untuk siswa ${namaSiswa}? Seluruh jawaban akan terhapus dan siswa harus mengulang dari awal.`;
        } else {
            if (selectedIds.length === 0) return alert("Pilih minimal 1 peserta terlebih dahulu!");
            idsToReset = selectedIds;
            confirmMessage = `Yakin ingin mereset sesi ujian untuk ${selectedIds.length} siswa yang dipilih? Seluruh jawaban mereka akan terhapus.`;
        }

        if (confirm(confirmMessage)) {
            router.post(route('admin.ujian.reset-peserta', ujian.id), {
                peserta_ids: idsToReset
            }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    // D. Hitung Ulang Nilai (Recalculate)
    const handleRecalculate = () => {
        if (confirm("Apakah Anda yakin ingin menghitung ulang semua nilai peserta? Ini akan mengganti nilai lama dengan perhitungan berdasarkan kunci jawaban terbaru.")) {
            setIsRecalculating(true);
            router.post(route('admin.ujian.recalculate', ujian.id), {}, {
                preserveScroll: true,
                onFinish: () => setIsRecalculating(false)
            });
        }
    };

    // --- 6. HELPER RENDER UI ---
    const renderStatus = (status) => {
        if (status === 'selesai') return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Selesai</span>;
        if (status === 'mengerjakan') return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-max"><AlertCircle size={12}/> Mengerjakan</span>;
        return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-max">Belum Mulai</span>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.ujian.index')} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition shadow-sm">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="font-black text-2xl text-slate-800 tracking-tight">Monitoring Peserta</h2>
                            <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest">{ujian.judul_ujian}</p>
                        </div>
                    </div>

                    {/* TOMBOL HITUNG ULANG NILAI */}
                    <button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-100 hover:text-indigo-700 transition border border-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cocokkan ulang jawaban siswa dengan kunci jawaban terbaru"
                    >
                        <Calculator size={18} className={isRecalculating ? "animate-pulse" : ""} />
                        {isRecalculating ? 'Menghitung...' : 'Hitung Ulang Nilai'}
                    </button>
                </div>
            }
        >
            <Head title={`Monitoring - ${ujian.judul_ujian}`} />

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mt-6 pb-20 relative">

                {/* --- TOOLBAR PENCARIAN --- */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm">
                        <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari nama atau email siswa..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium transition-all"
                        />
                    </form>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2.5 rounded-full">
                        <Users size={16} /> {pesertas.total} Terdaftar
                    </div>
                </div>

                {/* --- TABEL DATA PESERTA --- */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50 bg-white">
                                <th className="px-6 py-5 w-10 text-center">
                                    {/* Checkbox Select All */}
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                                        onChange={handleSelectAll}
                                        checked={pesertas.data.length > 0 && selectedIds.length === pesertas.data.length}
                                    />
                                </th>
                                <th className="px-6 py-5">Nama Siswa</th>
                                <th className="px-6 py-5">Status</th>
                                <th className="px-6 py-5">Waktu Mulai</th>
                                <th className="px-6 py-5">Batas Waktu</th>
                                <th className="px-6 py-5 text-center">Nilai</th>
                                <th className="px-6 py-5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pesertas.data.length > 0 ? pesertas.data.map((peserta) => {
                                const isSelected = selectedIds.includes(peserta.id);
                                return (
                                    <tr key={peserta.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/40' : 'hover:bg-slate-50/50'}`}>
                                        <td className="px-6 py-4 text-center">
                                            {/* Checkbox Individual */}
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                                                checked={isSelected}
                                                onChange={(e) => handleSelectOne(e, peserta.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <h4 className="font-bold text-slate-800 text-sm">{peserta.user?.name}</h4>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">{peserta.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">{renderStatus(peserta.status)}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                            {peserta.waktu_mulai ? new Date(peserta.waktu_mulai).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-rose-500">
                                            {peserta.batas_waktu ? new Date(peserta.batas_waktu).toLocaleString('id-ID', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-black text-lg text-slate-800">{peserta.nilai_akhir !== null ? Math.round(peserta.nilai_akhir) : '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Aksi Individual (Hanya muncul jika tidak sedang multi-select agar UI bersih) */}
                                            <div className={`flex justify-end gap-2 transition-opacity ${selectedIds.length > 0 ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                                                <button
                                                    onClick={() => openTimeModal(peserta.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-[10px] font-black uppercase transition-colors border border-amber-100"
                                                    title="Tambah Waktu"
                                                >
                                                    <Clock size={12} /> + Waktu
                                                </button>
                                                <button
                                                    onClick={() => handleReset(peserta.id, peserta.user?.name)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[10px] font-black uppercase transition-colors border border-rose-100"
                                                    title="Reset Sesi Ujian"
                                                >
                                                    <RefreshCw size={12} /> Reset
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <Users size={48} className="mb-4 opacity-50" />
                                            <h4 className="text-lg font-bold text-slate-700">Belum Ada Peserta</h4>
                                            <p className="text-slate-500 font-medium mt-1 text-sm">Peserta yang mulai mengerjakan ujian akan muncul di sini.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- PAGINATION --- */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Menampilkan Hal {pesertas.current_page} dari {pesertas.last_page}
                    </p>
                    {pesertas.links && pesertas.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {pesertas.links.map((link, idx) => {
                                const labelText = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');
                                return link.url === null ? (
                                    <div key={idx} className="px-3.5 py-2 rounded-xl text-sm font-bold text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: labelText }} />
                                ) : (
                                    <Link key={idx} href={link.url} preserveScroll className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${link.active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'}`} dangerouslySetInnerHTML={{ __html: labelText }} />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- 🌟 BULK ACTIONS TOOLBAR (Melayang di bawah) --- */}
                <div className={`absolute bottom-0 left-0 w-full bg-slate-900 text-white p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-transform duration-300 ${selectedIds.length > 0 ? 'translate-y-0 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]' : 'translate-y-full'}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <CheckSquare size={20} className="text-indigo-300" />
                        </div>
                        <div>
                            <p className="font-black tracking-widest text-sm uppercase text-indigo-300">{selectedIds.length} Siswa Dipilih</p>
                            <p className="text-xs text-slate-400 font-medium">Pilih aksi yang ingin diterapkan ke semua siswa ini.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => openTimeModal(null)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-5 py-3 rounded-xl transition shadow-lg shadow-amber-500/20 text-xs uppercase tracking-widest"
                        >
                            <Clock size={16} /> + Waktu Massal
                        </button>
                        <button
                            onClick={() => handleReset(null, null)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-black px-5 py-3 rounded-xl transition shadow-lg shadow-rose-500/20 text-xs uppercase tracking-widest"
                        >
                            <RefreshCw size={16} /> Reset Massal
                        </button>
                    </div>
                </div>

            </div>

            {/* --- MODAL TAMBAH WAKTU --- */}
            {isTimeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-lg text-slate-800">Tambah Waktu Ujian</h3>
                            <button onClick={() => setIsTimeModalOpen(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition"><X size={20} /></button>
                        </div>

                        <form onSubmit={submitTambahWaktu} className="p-6 space-y-5">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                <p className="text-sm font-bold text-indigo-900 leading-snug">
                                    Anda akan menambahkan waktu tambahan untuk <span className="bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md mx-1">{data.peserta_ids.length} Siswa</span> yang terpilih.
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tambahan (Menit)</label>
                                <div className="relative">
                                    <input
                                        type="number" min="1" max="120"
                                        value={data.tambahan_menit}
                                        onChange={e => setData('tambahan_menit', e.target.value)}
                                        className="w-full border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-indigo-500 font-black text-lg py-3 pl-5 pr-16 transition-colors"
                                        required
                                    />
                                    <span className="absolute right-5 top-3.5 text-slate-400 text-sm font-black uppercase">Mnt</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 pt-2">
                                {[5, 10, 15, 30].map(mins => (
                                    <button type="button" key={mins} onClick={() => setData('tambahan_menit', mins)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${data.tambahan_menit == mins ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                                        +{mins}
                                    </button>
                                ))}
                            </div>

                            <button type="submit" disabled={processing} className="w-full mt-4 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-xl shadow-slate-200">
                                {processing ? 'Memproses...' : 'Terapkan Waktu'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
