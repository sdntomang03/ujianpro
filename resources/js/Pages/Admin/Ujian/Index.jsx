import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen, Plus, Search, Edit3, Trash2,
    Settings, Clock, Calendar, Folder, HelpCircle, X
} from 'lucide-react';

export default function IndexUjian({ auth, ujians, kategoriUjian }) {

    // --- STATE UNTUK MODAL & MODE EDIT ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null); // Jika null berarti "Create", jika ada ID berarti "Edit"

    // --- FORM HANDLING ---
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        kategori_ujian_id: '',
        judul_ujian: '',
        deskripsi: '',
        durasi_menit: 90,
        waktu_mulai: '',
        waktu_selesai: '',
        acak_soal: true,
        acak_opsi: true,
    });

    // Helper: Format tanggal database ke format input type="datetime-local"
    const formatForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date - offset)).toISOString().slice(0, 16);
    };

    // Fungsi Buka Modal Buat Baru
    const openCreateModal = () => {
        setEditId(null);
        reset();
        clearErrors();
        setIsModalOpen(true);
    };

    // Fungsi Buka Modal Edit
    const openEditModal = (ujian) => {
        setEditId(ujian.id);
        clearErrors();
        setData({
            kategori_ujian_id: ujian.kategori_ujian_id,
            judul_ujian: ujian.judul_ujian,
            deskripsi: ujian.deskripsi || '',
            durasi_menit: ujian.durasi_menit,
            waktu_mulai: formatForInput(ujian.waktu_mulai),
            waktu_selesai: formatForInput(ujian.waktu_selesai),
            acak_soal: ujian.acak_soal ? true : false,
            acak_opsi: ujian.acak_opsi ? true : false,
        });
        setIsModalOpen(true);
    };

    // Fungsi Tutup Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => { reset(); setEditId(null); clearErrors(); }, 300); // Reset setelah animasi tutup
    };

    // Submit Form (Menangani Create & Edit sekaligus)
    const submitUjian = (e) => {
        e.preventDefault();

        if (editId) {
            // Mode EDIT (Gunakan PUT)
            put(route('admin.ujian.update', editId), {
                onSuccess: () => closeModal()
            });
        } else {
            // Mode CREATE (Gunakan POST)
            post(route('admin.ujian.store'), {
                onSuccess: () => closeModal()
            });
        }
    };

    // Fungsi Hapus Ujian
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus ujian ini? Semua data nilai siswa untuk ujian ini juga akan terhapus.')) {
            router.delete(route('admin.ujian.destroy', id));
        }
    };

    // Helper format tanggal untuk Tabel
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
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Manajemen Ujian</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Kelola jadwal, durasi, dan daftar ujian peserta</p>
                    </div>

                    {/* TOMBOL BUKA MODAL BUAT BARU */}
                    <button
                        onClick={openCreateModal}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                    >
                        <Plus size={18} /> Buat Ujian Baru
                    </button>
                </div>
            }
        >
            <Head title="Daftar Ujian" />

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                {/* TOOLBAR PENCARIAN */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Cari judul ujian..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-sm transition-all"
                        />
                    </div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
                        Total {ujians.total} Ujian
                    </div>
                </div>

                {/* TABEL DATA UJIAN */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50 bg-white">
                                <th className="px-8 py-5 w-20 text-center">ID</th>
                                <th className="px-6 py-5">Judul & Kategori</th>
                                <th className="px-6 py-5 w-64">Jadwal Pelaksanaan</th>
                                <th className="px-6 py-5 w-32 text-center">Pengaturan</th>
                                <th className="px-8 py-5 w-48 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {ujians.data.length > 0 ? ujians.data.map((ujian, index) => (
                                <tr key={ujian.id} className="hover:bg-indigo-50/30 transition-colors group bg-white">
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-xs font-black text-slate-300 group-hover:text-indigo-400 transition-colors">
                                            #{ujian.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <h4 className="font-bold text-slate-800 text-base line-clamp-1">{ujian.judul_ujian}</h4>
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 mt-1 uppercase tracking-wider">
                                            <Folder size={12} />
                                            {ujian.kategori_ujian?.nama_kategori || 'Tanpa Kategori'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Calendar size={14} className="text-emerald-500" />
                                                Mulai: {formatDate(ujian.waktu_mulai)}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Clock size={14} className="text-rose-400" />
                                                Batas: {formatDate(ujian.waktu_selesai)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex flex-col gap-1 items-center">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg">
                                                {ujian.durasi_menit} Menit
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {ujian.acak_soal ? 'Acak Soal' : 'Soal Urut'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">

                                            {/* Tombol Kelola Soal */}
                                            <Link
                                                href={route('admin.ujian.show', ujian.id)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-100"
                                                title="Kelola Soal Ujian"
                                            >
                                                <Settings size={14} /> Kelola Soal
                                            </Link>

                                            {/* TOMBOL BUKA MODAL EDIT */}
                                            <button
                                                onClick={() => openEditModal(ujian)}
                                                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-100"
                                                title="Edit Pengaturan Ujian"
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            {/* Tombol Hapus */}
                                            <button
                                                onClick={() => handleDelete(ujian.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                                                title="Hapus Ujian"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-300">
                                            <BookOpen size={48} className="mb-4" />
                                            <h4 className="text-lg font-bold text-slate-700">Belum Ada Ujian</h4>
                                            <p className="text-slate-500 font-medium mt-1 text-sm">Klik tombol "Buat Ujian Baru" untuk memulai.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION INFO */}
                <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Menampilkan Halaman {ujians.current_page} dari {ujians.last_page}
                    </p>
                    {ujians.links && ujians.links.length > 3 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                            {ujians.links.map((link, idx) => {
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
            </div>

            {/* =========================================
                MODAL FORM BUAT / EDIT UJIAN
            ========================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                {/* Judul Modal Berubah Sesuai Mode */}
                                <h3 className="font-black text-xl text-slate-800">
                                    {editId ? 'Edit Pengaturan Ujian' : 'Buat Ujian Baru'}
                                </h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">
                                    {editId ? 'Perbarui jadwal atau durasi ujian ini.' : 'Isi formulir di bawah untuk menjadwalkan ujian.'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body Modal (Form) */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            <form id="formUjian" onSubmit={submitUjian} className="space-y-5">

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori Ujian</label>
                                    <select
                                        value={data.kategori_ujian_id}
                                        onChange={e => setData('kategori_ujian_id', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
                                        required
                                    >
                                        <option value="" disabled>-- Pilih Kategori --</option>
                                        {kategoriUjian?.map(kat => (
                                            <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                                        ))}
                                    </select>
                                    {errors.kategori_ujian_id && <p className="text-rose-500 text-xs mt-1">{errors.kategori_ujian_id}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Judul Ujian</label>
                                    <input
                                        type="text"
                                        value={data.judul_ujian}
                                        onChange={e => setData('judul_ujian', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
                                        placeholder="Misal: Tryout UTBK Saintek"
                                        required
                                    />
                                    {errors.judul_ujian && <p className="text-rose-500 text-xs mt-1">{errors.judul_ujian}</p>}
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Deskripsi (Opsional)</label>
                                    <textarea
                                        value={data.deskripsi}
                                        onChange={e => setData('deskripsi', e.target.value)}
                                        className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
                                        rows="2"
                                        placeholder="Catatan tambahan untuk ujian ini..."
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Waktu Mulai (Opsional)</label>
                                        <input
                                            type="datetime-local"
                                            value={data.waktu_mulai}
                                            onChange={e => setData('waktu_mulai', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
                                        />
                                        {errors.waktu_mulai && <p className="text-rose-500 text-xs mt-1">{errors.waktu_mulai}</p>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Waktu Selesai (Opsional)</label>
                                        <input
                                            type="datetime-local"
                                            value={data.waktu_selesai}
                                            onChange={e => setData('waktu_selesai', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm"
                                        />
                                        {errors.waktu_selesai && <p className="text-rose-500 text-xs mt-1">{errors.waktu_selesai}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Durasi Pengerjaan</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.durasi_menit}
                                            onChange={e => setData('durasi_menit', e.target.value)}
                                            className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm font-bold pl-4 pr-16"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 text-sm font-medium">Menit</div>
                                    </div>
                                    {errors.durasi_menit && <p className="text-rose-500 text-xs mt-1">{errors.durasi_menit}</p>}
                                </div>

                                <div className="flex gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.acak_soal}
                                            onChange={e => setData('acak_soal', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Acak Urutan Soal</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.acak_opsi}
                                            onChange={e => setData('acak_opsi', e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-bold text-slate-700">Acak Opsi Jawaban</span>
                                    </label>
                                </div>

                            </form>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="formUjian"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-100"
                            >
                                {/* Teks Tombol Berubah Sesuai Mode */}
                                {processing ? 'Menyimpan...' : (editId ? 'Simpan Perubahan' : 'Buat Ujian')}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
