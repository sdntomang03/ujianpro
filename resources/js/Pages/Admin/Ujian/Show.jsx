import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Download, Trash2, CheckSquare, X, BookOpen, Layers, Filter } from 'lucide-react';

export default function ShowUjian({ auth, ujian, bankSoal, kategoris, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ==========================================
    // STATE UNTUK PAGINATION UTAMA (SOAL UJIAN)
    // ==========================================
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalSoals = ujian.soals?.length || 0;
    const totalPages = Math.ceil(totalSoals / itemsPerPage);

    const paginatedSoals = ujian.soals?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) || [];

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    // ==========================================
    // FORM HANDLING UNTUK IMPORT MODAL
    // ==========================================
    const { data, setData, post, processing, reset } = useForm({
        soal_ids: []
    });

    const handleCheck = (id) => {
        let currentIds = [...data.soal_ids];
        if (currentIds.includes(id)) {
            currentIds = currentIds.filter(itemId => itemId !== id);
        } else {
            currentIds.push(id);
        }
        setData('soal_ids', currentIds);
    };

    const handleImport = (e) => {
        e.preventDefault();
        post(route('admin.ujian.import-soal', ujian.id), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                // Reset filter & Paging Modal kembali ke awal setelah sukses import
                router.get(route('admin.ujian.show', ujian.id), {}, { preserveScroll: true, preserveState: false });
            }
        });
    };

    const handleRemove = (soalId) => {
        if (confirm('Keluarkan soal ini dari ujian? (Soal akan tetap ada di Bank Soal)')) {
            router.delete(route('admin.ujian.remove-soal', { ujian: ujian.id, soal: soalId }), {
                onSuccess: () => {
                    if (paginatedSoals.length === 1 && currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                    }
                }
            });
        }
    };

    // 🌟 FUNGSI BARU: FILTER MODAL VIA SERVER (Partial Reload)
    const handleModalFilter = (e) => {
        router.get(
            route('admin.ujian.show', ujian.id),
            { kategori_id: e.target.value }, // Kirim ID Kategori ke Controller
            {
                preserveState: true,  // Modal tetap terbuka, checkbox yang sudah dicentang tidak hilang
                preserveScroll: true, // Posisi scroll tidak loncat
                replace: true,
                only: ['bankSoal', 'filters'] // HANYA memuat ulang variabel bankSoal & filters
            }
        );
    };

    const createMarkup = (html) => ({ __html: html });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.ujian.index')} className="p-2 bg-white rounded-full border border-slate-200 text-slate-500 hover:text-indigo-600 shadow-sm transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Manajemen Soal Ujian</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">{ujian.judul_ujian}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Kelola Soal - ${ujian.judul_ujian}`} />

            <div className="space-y-6">
                {/* TOOLBAR AKSI (Sama seperti sebelumnya) */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm gap-4">
                    <div className="flex items-center gap-4 px-4">
                        <div className="flex items-center gap-2">
                            <Layers className="text-indigo-500" size={20} />
                            <span className="font-bold text-slate-700">{totalSoals} Soal Terdaftar</span>
                        </div>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-indigo-600 px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-50 transition"
                        >
                            <Download size={18} /> Import dari Bank Soal
                        </button>
                        <Link
                            href={route('admin.bank-soal.create', { ujian_id: ujian.id })}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                            <Plus size={18} /> Buat Soal Baru
                        </Link>
                    </div>
                </div>

                {/* DAFTAR SOAL DI DALAM UJIAN */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50 bg-slate-50/50">
                                <th className="px-8 py-5 w-20 text-center">No</th>
                                <th className="px-6 py-5">Pertanyaan</th>
                                <th className="px-6 py-5 w-32 text-center">Tipe</th>
                                <th className="px-6 py-5 w-32 text-center">Bobot</th>
                                <th className="px-8 py-5 w-32 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {paginatedSoals.length > 0 ? paginatedSoals.map((soal, index) => {
                                const nomorUrut = (currentPage - 1) * itemsPerPage + index + 1;
                                return (
                                    <tr key={soal.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-center font-black text-slate-400">
                                            {nomorUrut}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-slate-700 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={createMarkup(soal.pertanyaan)} />
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {soal.tipe_soal.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center font-bold text-emerald-600">
                                            {soal.bobot_nilai} Poin
                                        </td>
                                        <td className="px-8 py-5 text-right flex justify-end gap-2">
                                            <Link href={route('admin.bank-soal.edit', soal.id)} className="p-2 text-slate-400 hover:text-indigo-600 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition">
                                                <BookOpen size={16} />
                                            </Link>
                                            <button onClick={() => handleRemove(soal.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-white rounded-xl border border-slate-100 hover:border-rose-200 transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-500">Belum ada soal di ujian ini.</p>
                                        <button onClick={() => setIsModalOpen(true)} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">Import soal sekarang</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* KOMPONEN PAGING UTAMA */}
                    {totalPages > 1 && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Menampilkan Halaman {currentPage} dari {totalPages}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === 1 ? 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'}`}>«</button>
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNumber = i + 1;
                                    return (
                                        <button key={pageNumber} onClick={() => handlePageChange(pageNumber)} className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === pageNumber ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'}`}>
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${currentPage === totalPages ? 'text-slate-300 bg-slate-50 border border-slate-100 cursor-not-allowed' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600'}`}>»</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                MODAL IMPORT DARI BANK SOAL (SERVER SIDE)
            ========================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-black text-xl text-slate-800">Pilih Soal dari Bank Soal</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Pilih soal yang ingin dimasukkan ke dalam ujian ini.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* 🌟 Toolbar Filter Server-Side */}
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Filter size={18} className="text-slate-400" />
                                <select
                                    value={filters?.kategori_id || ''}
                                    onChange={handleModalFilter}
                                    className="border-slate-200 rounded-xl focus:ring-indigo-500 text-sm font-medium w-full sm:w-64"
                                >
                                    <option value="">Semua Kategori (Mata Pelajaran)</option>
                                    {kategoris?.map(kat => (
                                        <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Ditemukan: {bankSoal.total} Soal
                            </div>
                        </div>

                        {/* Body Modal (Tabel Bank Soal) */}
                        <div className="p-0 overflow-y-auto flex-1 bg-slate-50">
                            {bankSoal.data.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white shadow-sm border-b border-slate-100 z-10">
                                        <tr className="text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                            <th className="px-6 py-4 w-16 text-center">Pilih</th>
                                            <th className="px-6 py-4 w-20 text-center">Kategori</th>
                                            <th className="px-6 py-4">Cuplikan Pertanyaan</th>
                                            <th className="px-6 py-4 w-32 text-center">Tipe</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {bankSoal.data.map((soal) => (
                                            <tr key={soal.id} className={`transition-colors cursor-pointer ${data.soal_ids.includes(soal.id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`} onClick={() => handleCheck(soal.id)}>
                                                <td className="px-6 py-4 text-center">
                                                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all mx-auto ${data.soal_ids.includes(soal.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent'}`}>
                                                        <CheckSquare size={14} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md line-clamp-1">
                                                        {soal.kategori?.nama_kategori || 'Umum'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-700 line-clamp-2 prose prose-sm" dangerouslySetInnerHTML={createMarkup(soal.pertanyaan)} />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider">
                                                        {soal.tipe_soal.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 font-bold">Tidak ada soal yang ditemukan pada kategori ini.</p>
                                </div>
                            )}
                        </div>

                        {/* 🌟 Paging Modal Server-Side */}
                        {bankSoal.links && bankSoal.links.length > 3 && (
                            <div className="px-6 py-3 border-t border-slate-100 bg-white flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-400">
                                    Halaman {bankSoal.current_page} dari {bankSoal.last_page}
                                </p>
                                <div className="flex gap-1">
                                    {bankSoal.links.map((link, idx) => {
                                        const labelText = link.label.replace('&laquo; Previous', '«').replace('Next &raquo;', '»');
                                        return link.url === null ? (
                                            <div key={idx} className="px-3 py-1.5 rounded-lg border border-slate-100 text-slate-300 text-sm font-bold cursor-not-allowed" dangerouslySetInnerHTML={{ __html: labelText }} />
                                        ) : (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveState
                                                preserveScroll
                                                only={['bankSoal', 'filters']} // Inertia Partial Reload!
                                                className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition ${link.active ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                                dangerouslySetInnerHTML={{ __html: labelText }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Footer Modal (Tombol Submit) */}
                        <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <p className="text-sm font-bold text-slate-500">
                                <span className="text-indigo-600 font-black">{data.soal_ids.length}</span> Soal Terpilih
                            </p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition">
                                    Batal
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={data.soal_ids.length === 0 || processing}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-100"
                                >
                                    {processing ? 'Menyimpan...' : 'Import Soal Terpilih'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
