import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ auth, soal, kategori }) {
    // Data form otomatis diisi dari props 'soal'
    const { data, setData, put, processing, errors } = useForm({
        kategori_ujian_id: soal.kategori_ujian_id || '',
        pertanyaan: soal.pertanyaan || '',
        opsi_a: soal.opsi_a || '',
        opsi_b: soal.opsi_b || '',
        opsi_c: soal.opsi_c || '',
        opsi_d: soal.opsi_d || '',
        opsi_e: soal.opsi_e || '',
        kunci_jawaban: soal.kunci_jawaban || 'A',
    });

    const submit = (e) => {
        e.preventDefault();
        // Menggunakan method PUT untuk update data
        put(route('admin.bank-soal.update', soal.id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-2xl text-slate-800">Edit Data Soal</h2>}>
            <Head title="Edit Soal" />

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto mt-6">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-lg font-black text-slate-900">Perbarui Soal</h3>
                    <Link href={route('admin.bank-soal.index')} className="text-sm font-bold text-slate-500 hover:text-rose-600 transition flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Kembali
                    </Link>
                </div>

                <div className="p-8">
                    <form onSubmit={submit} autoComplete="off">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Kategori / Mata Pelajaran</label>
                                <select
                                    value={data.kategori_ujian_id}
                                    onChange={e => setData('kategori_ujian_id', e.target.value)}
                                    className="mt-2 w-full border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500 font-medium"
                                    required
                                >
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    {kategori?.map(kat => <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>)}
                                </select>
                                {errors.kategori_ujian_id && <p className="text-rose-500 text-xs mt-1">{errors.kategori_ujian_id}</p>}
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Kunci Jawaban Benar</label>
                                <select
                                    value={data.kunci_jawaban}
                                    onChange={e => setData('kunci_jawaban', e.target.value)}
                                    className="mt-2 w-full border-slate-200 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 font-bold text-emerald-700 bg-emerald-50"
                                    required
                                >
                                    {['A', 'B', 'C', 'D', 'E'].map(opt => <option key={opt} value={opt}>Opsi {opt}</option>)}
                                </select>
                                {errors.kunci_jawaban && <p className="text-rose-500 text-xs mt-1">{errors.kunci_jawaban}</p>}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase">Teks Pertanyaan</label>
                            <textarea
                                value={data.pertanyaan}
                                onChange={e => setData('pertanyaan', e.target.value)}
                                rows="5"
                                className="mt-2 w-full border-slate-200 rounded-xl focus:ring-rose-500 focus:border-rose-500"
                                placeholder="Ketikkan pertanyaan soal di sini..."
                                required
                            ></textarea>
                            {errors.pertanyaan && <p className="text-rose-500 text-xs mt-1">{errors.pertanyaan}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {['a', 'b', 'c', 'd', 'e'].map((opt) => (
                                <div key={opt} className={opt === 'e' ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''}>
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2">
                                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${data.kunci_jawaban === opt.toUpperCase() ? 'bg-emerald-500 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                            {opt.toUpperCase()}
                                        </span>
                                        Pilihan {opt.toUpperCase()}
                                    </label>
                                    <textarea
                                        value={data[`opsi_${opt}`]}
                                        onChange={e => setData(`opsi_${opt}`, e.target.value)}
                                        rows="2"
                                        className={`w-full rounded-xl text-sm ${data.kunci_jawaban === opt.toUpperCase() ? 'border-emerald-300 focus:ring-emerald-500 bg-emerald-50/50' : 'border-slate-200 focus:ring-rose-500'}`}
                                        required
                                    ></textarea>
                                    {errors[`opsi_${opt}`] && <p className="text-rose-500 text-xs mt-1">{errors[`opsi_${opt}`]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Link href={route('admin.bank-soal.index')} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
                                Batal
                            </Link>
                            <button type="submit" disabled={processing} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2">
                                {processing ? 'Memperbarui...' : 'Update Soal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
