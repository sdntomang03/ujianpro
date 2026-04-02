import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function Create({ auth, kategori, ujian_id }) {
    const fileInputRef = useRef(null);
    const quillRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        kategori_id: '',
        tipe_soal: 'pg',
        pertanyaan: '',
        gambar: null,
        bobot_nilai: 10,

        opsi: ['', '', '', ''],
        ujian_id: ujian_id || '',
        kunci_jawaban: 0, // Untuk PG
        kunci_kompleks: [], // Untuk PG Kompleks (array of index)
        kunci_isian: '', // Untuk Isian Singkat
        pasangan: [{ kiri: '', kanan: '' }, { kiri: '', kanan: '' }],
        pernyataan_bs: [
            { teks: '', kunci: 'Benar' },
            { teks: '', kunci: 'Salah' }
        ]
    });

    useEffect(() => {
        // Reset state parsial jika tipe berubah agar UI bersih (TAPI tidak mereset 'pertanyaan' utama)
        switch(data.tipe_soal) {
            case 'pg':
                setData('kunci_jawaban', 0);
                break;
            case 'pg_kompleks':
                setData('kunci_kompleks', []);
                break;
            case 'benar_salah':
                setData('pernyataan_bs', [{ teks: '', kunci: 'Benar' }, { teks: '', kunci: 'Salah' }]);
                break;
            case 'isian':
                setData('kunci_isian', '');
                break;
            case 'survei':
                // 🌟 AUTO-FILL OPSI DEFAULT UNTUK SURVEI
                setData('opsi', [
                    'Sangat Tidak Setuju',
                    'Tidak Setuju',
                    'Ragu-ragu',
                    'Setuju',
                    'Sangat Setuju'
                ]);
                break;
        }
    }, [data.tipe_soal]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('gambar', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.bank-soal.store'));
    };

    // --- FUNGSI PEMBAJAK UPLOAD GAMBAR REACT QUILL ---
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/png, image/jpeg, image/jpg, image/webp');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            const formData = new FormData();
            formData.append('image', file);

            try {
                // Tampilkan loading sementara di editor
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.insertText(range.index, 'Mengupload gambar...', 'italic', true);

                // Kirim gambar ke API Laravel untuk dikonversi ke WebP
                const response = await axios.post(route('admin.bank-soal.upload-editor-image'), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                // Hapus teks loading ("Mengupload gambar..." = 20 karakter)
                quill.deleteText(range.index, 20);

                // Masukkan URL gambar WebP ke dalam editor
                const url = response.data.url;
                quill.insertEmbed(range.index, 'image', url);

                // Pindahkan kursor ke setelah gambar
                quill.setSelection(range.index + 1);

            } catch (error) {
                console.error('Upload gagal', error);
                alert('Terjadi kesalahan saat mengupload gambar ke editor.');

                // Hapus teks loading jika gagal
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection(true);
                quill.deleteText(range.index - 20, 20);
            }
        };
    };

    // Toolbar kustom untuk Quill (Gunakan useMemo agar tidak re-render & hilang fokus)
    const quillModules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image', 'formula'],
                ['clean']
            ],
            handlers: {
                image: imageHandler // Pasang fungsi custom kita di sini
            }
        }
    }), []);

    const renderAnswerEngine = () => {
        if (data.tipe_soal === 'pg' || data.tipe_soal === 'pg_kompleks' || data.tipe_soal === 'survei') {
             return (
                <div className="space-y-3">
                    {data.opsi.map((opt, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                            <div className="pt-2 pl-2">
                                {data.tipe_soal === 'pg' && (
                                    <input type="radio" name="kunci_pg" checked={data.kunci_jawaban === index} onChange={() => setData('kunci_jawaban', index)} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
                                )}
                                {data.tipe_soal === 'pg_kompleks' && (
                                    <input type="checkbox" checked={data.kunci_kompleks.includes(index)}
                                        onChange={(e) => {
                                            const newKeys = e.target.checked
                                                ? [...data.kunci_kompleks, index]
                                                : data.kunci_kompleks.filter(k => k !== index);
                                            setData('kunci_kompleks', newKeys);
                                        }} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                )}
                                {data.tipe_soal === 'survei' && (
                                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">{String.fromCharCode(65 + index)}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <textarea value={opt} onChange={e => {
                                    const newOpsi = [...data.opsi]; newOpsi[index] = e.target.value; setData('opsi', newOpsi);
                                }} rows="1" placeholder={`Ketik pilihan jawaban ${String.fromCharCode(65 + index)}...`} className="w-full border-0 focus:ring-0 text-sm p-2 resize-none" required={data.tipe_soal !== 'survei'}></textarea>
                            </div>

                            <button type="button" onClick={() => {
                                if(data.opsi.length <= 2) return alert('Minimal 2 pilihan jawaban!');
                                setData('opsi', data.opsi.filter((_, i) => i !== index));
                            }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setData('opsi', [...data.opsi, ''])} className="mt-3 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition border border-indigo-100 border-dashed w-full">+ Tambah Pilihan Jawaban</button>
                </div>
            );
        }

        if (data.tipe_soal === 'isian') {
             return (
                <div className="bg-white p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                    <label className="text-xs font-bold text-emerald-700 uppercase mb-2 block">Kunci Jawaban Tepat</label>
                    <input type="text" value={data.kunci_isian} onChange={e => setData('kunci_isian', e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-emerald-500" placeholder="Contoh: Sapi" required />
                    <p className="text-xs text-slate-500 mt-2">Untuk multiple alternatif (seperti seeder), pisahkan dengan koma. Cth: Sapi, Kambing</p>
                </div>
            );
        }

        if (data.tipe_soal === 'benar_salah') {
            return (
                <div className="space-y-4">
                    <div className="flex gap-3 px-3">
                        <div className="flex-1 text-xs font-bold text-slate-400 uppercase">Pernyataan Turunan</div>
                        <div className="w-32 flex justify-center text-xs font-bold text-slate-400 uppercase">Kunci</div>
                        <div className="w-10"></div>
                    </div>

                    {data.pernyataan_bs.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1">
                            <div className="flex-1">
                                <textarea value={item.teks} onChange={e => {
                                        const newP = [...data.pernyataan_bs]; newP[index].teks = e.target.value; setData('pernyataan_bs', newP);
                                    }} rows="2" placeholder="Ketik pernyataan turunan..." className="w-full border-0 focus:ring-0 text-sm p-2 resize-none" required></textarea>
                            </div>
                            <div className="w-32 flex justify-center gap-2 border-l border-slate-100 pl-3">
                                <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-bold transition ${item.kunci === 'Benar' ? 'bg-emerald-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    <input type="radio" className="hidden" name={`kunci_bs_${index}`} value="Benar" checked={item.kunci === 'Benar'} onChange={() => {
                                            const newP = [...data.pernyataan_bs]; newP[index].kunci = 'Benar'; setData('pernyataan_bs', newP);
                                        }} />B
                                </label>
                                <label className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm font-bold transition ${item.kunci === 'Salah' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    <input type="radio" className="hidden" name={`kunci_bs_${index}`} value="Salah" checked={item.kunci === 'Salah'} onChange={() => {
                                            const newP = [...data.pernyataan_bs]; newP[index].kunci = 'Salah'; setData('pernyataan_bs', newP);
                                        }} />S
                                </label>
                            </div>
                            <button type="button" onClick={() => {
                                if(data.pernyataan_bs.length <= 1) return alert('Minimal 1 pernyataan!');
                                setData('pernyataan_bs', data.pernyataan_bs.filter((_, i) => i !== index));
                            }} className="p-2 text-slate-400 hover:text-rose-500 w-10 flex justify-center"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setData('pernyataan_bs', [...data.pernyataan_bs, { teks: '', kunci: 'Benar' }])} className="w-full py-2 border border-dashed rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">+ Tambah Pernyataan</button>
                </div>
            );
        }

        if (data.tipe_soal === 'menjodohkan') {
             return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4"><div className="text-xs font-bold text-slate-500 uppercase text-center">Kolom Kiri (L)</div><div className="text-xs font-bold text-slate-500 uppercase text-center">Kolom Kanan (R)</div></div>
                    {data.pasangan.map((pair, index) => (
                        <div key={index} className="flex gap-4 items-center">
                            <input type="text" value={pair.kiri} onChange={e => { const newP = [...data.pasangan]; newP[index].kiri = e.target.value; setData('pasangan', newP); }} className="flex-1 border-slate-200 rounded-xl focus:ring-indigo-500 text-sm" placeholder="Ketik premis..." required />
                            <span className="font-bold text-slate-300">==</span>
                            <input type="text" value={pair.kanan} onChange={e => { const newP = [...data.pasangan]; newP[index].kanan = e.target.value; setData('pasangan', newP); }} className="flex-1 border-slate-200 rounded-xl focus:ring-emerald-500 text-sm" placeholder="Ketik jawaban benar..." required />
                            <button type="button" onClick={() => { if(data.pasangan.length <= 2) return alert('Minimal 2 pasang!'); setData('pasangan', data.pasangan.filter((_, i) => i !== index)); }} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => setData('pasangan', [...data.pasangan, { kiri: '', kanan: '' }])} className="w-full py-2 border border-dashed rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition">+ Tambah Baris Pasangan</button>
                </div>
            );
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-bold text-2xl text-slate-800 tracking-tight">Question Builder Pro</h2>}>
            <Head title="Buat Soal" />
            <style>{`.quill-editor .ql-container { min-height: 150px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; font-size: 15px; } .quill-editor .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background-color: #f8fafc; border-color: #e2e8f0; }`}</style>

            <form onSubmit={submit} className="max-w-6xl mx-auto mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 space-y-6">

                    {/* SECTION 1: PERTANYAAN (SEKARANG TAMPIL UNTUK SEMUA TIPE) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                            <h3 className="font-bold text-slate-800">
                                Konten Pertanyaan Utama {data.tipe_soal === 'benar_salah' && "(Wacana Induk)"}
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="quill-editor mb-6">
                                <ReactQuill
                                    ref={quillRef} // <-- PENTING: Pasang ref di sini
                                    theme="snow"
                                    value={data.pertanyaan}
                                    onChange={c => setData('pertanyaan', c)}
                                    modules={quillModules}
                                    placeholder="Ketikkan wacana, cerita, atau teks pertanyaan utama di sini..."
                                />
                                {errors.pertanyaan && <p className="text-rose-500 text-xs mt-2">{errors.pertanyaan}</p>}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Lampiran Gambar Pendukung (Opsional)</label>
                                {!imagePreview ? (
                                    <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors group">
                                        <svg className="w-10 h-10 mb-2 text-slate-300 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <p className="text-sm font-semibold">Klik untuk upload gambar soal</p>
                                    </div>
                                ) : (
                                    <div className="relative border border-slate-200 rounded-2xl p-2 bg-slate-50 inline-block">
                                        <img src={imagePreview} className="h-40 w-auto rounded-xl object-contain" />
                                        <button type="button" onClick={() => {setData('gambar', null); setImagePreview(null);}} className="absolute -top-3 -right-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/jpg" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ENGINE JAWABAN */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                            <h3 className="font-bold text-slate-800">
                                {data.tipe_soal === 'benar_salah' ? "Pernyataan Benar / Salah" : "Opsi & Kunci Jawaban"}
                            </h3>
                        </div>
                        <div className="p-6 bg-slate-50/30">
                            {renderAnswerEngine()}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-slate-800">Pengaturan Soal</h3></div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Kategori / Mapel</label>
                                <select value={data.kategori_id} onChange={e => setData('kategori_id', e.target.value)} className="mt-2 w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm" required>
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    {kategori?.map(kat => <option key={kat.id} value={kat.id}>{kat.nama_kategori}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Jenis Ujian</label>
                                <select value={data.tipe_soal} onChange={e => setData('tipe_soal', e.target.value)} className="mt-2 w-full border-slate-200 rounded-xl focus:ring-indigo-500 font-bold bg-slate-50 text-sm">
                                    <option value="pg">Pilihan Ganda</option>
                                    <option value="pg_kompleks">PG Kompleks</option>
                                    <option value="benar_salah">Benar / Salah (Majemuk)</option>
                                    <option value="isian">Isian Singkat</option>
                                    <option value="menjodohkan">Menjodohkan</option>
                                    <option value="survei">Survei</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Bobot Nilai</label>
                                <div className="relative mt-2">
                                    <input type="number" min="0" max="100" value={data.bobot_nilai} onChange={e => setData('bobot_nilai', e.target.value)} className="w-full border-slate-200 rounded-xl focus:ring-indigo-500 text-sm font-bold pl-4 pr-12" required />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 text-sm font-medium">Poin</div>
                                </div>
                            </div>
                            <hr className="border-slate-100" />
                            <div className="pt-2">
                                <button type="submit" disabled={processing} className="w-full py-3.5 bg-indigo-600 text-white font-black rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-50">
                                    {processing ? 'Menyimpan...' : 'Simpan Soal'}
                                </button>
                                <Link
                                    href={ujian_id ? route('admin.ujian.show', ujian_id) : route('admin.bank-soal.index')}
                                    className="block text-center mt-3 px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition"
                                >
                                    Batal
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
