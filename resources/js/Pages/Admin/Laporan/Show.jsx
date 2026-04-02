import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, User, Clock, Calendar, CheckCircle, XCircle, AlertCircle, Award, BookOpen } from 'lucide-react';

export default function LaporanShow({ auth, peserta, peta_acakan }) {

    // Helper format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const createMarkup = (html) => ({ __html: html || '' });

    // PENGOLAHAN DATA: Menggabungkan Urutan JSON dengan Data Jawaban/Soal dari Database
    const getDaftarSoal = () => {
        if (!peta_acakan || !peserta.jawaban_pesertas) return [];

        let urutanAcakan = [];
        if (Array.isArray(peta_acakan)) {
            urutanAcakan = peta_acakan;
        } else if (typeof peta_acakan === 'object' && peta_acakan !== null) {
            urutanAcakan = Object.values(peta_acakan);
        }

        // Mapping berdasarkan urutan nomor soal saat ujian
        return urutanAcakan.map((acakan) => {
            // Cari data jawaban berdasarkan soal_id di peta_acakan
            const jawabanPeserta = peserta.jawaban_pesertas.find(j => j.soal_id === acakan.soal_id);
            const soalAsli = jawabanPeserta?.soal;

            return {
                nomor_urut: acakan.no,
                tipe_soal: acakan.tipe,
                pertanyaan: soalAsli?.pertanyaan || 'Soal tidak ditemukan / telah dihapus',
                jawaban_user: jawabanPeserta?.jawaban_user || [], // Array
                skor_soal: jawabanPeserta?.skor_soal || 0,
                bobot_maksimal: soalAsli?.bobot_nilai || 0,
                opsis: soalAsli?.opsis || [],
                kunci_jawaban_json: soalAsli?.kunci_jawaban || null // Khusus menjodohkan
            };
        }).sort((a, b) => a.nomor_urut - b.nomor_urut); // Pastikan urut nomor
    };

    const daftarSoal = getDaftarSoal();

    // Helper: Me-render teks jawaban yang benar berdasarkan tipe soal
    const renderKunciJawaban = (item) => {
        const { tipe_soal, opsis, kunci_jawaban_json } = item;

        if (tipe_soal === 'pg' || tipe_soal === 'pg_kompleks') {
            const benar = opsis.filter(o => o.is_correct).map(o => createMarkup(o.teks_opsi));
            return benar.map((b, i) => <div key={i} dangerouslySetInnerHTML={b} className="text-sm font-bold text-indigo-700 mb-1" />);
        }
        else if (tipe_soal === 'isian') {
            const benar = opsis.filter(o => o.is_correct).map(o => o.teks_opsi);
            return <div className="text-sm font-bold text-indigo-700">{benar.join(' / ')}</div>;
        }
        else if (tipe_soal === 'benar_salah') {
            return opsis.map(o => (
                <div key={o.id} className="text-sm flex gap-2 mb-1">
                    <span className="text-slate-500 line-clamp-1" dangerouslySetInnerHTML={createMarkup(o.teks_opsi)}></span>:
                    <strong className={o.is_correct ? 'text-emerald-600' : 'text-rose-600'}>{o.is_correct ? 'Benar' : 'Salah'}</strong>
                </div>
            ));
        }
        else if (tipe_soal === 'menjodohkan') {
            try {
                const mapKunci = JSON.parse(kunci_jawaban_json || '{}');
                return Object.entries(mapKunci).map(([kiriId, kananId]) => {
                    const kiriTeks = opsis.find(o => o.id == kiriId)?.teks_opsi || 'ID Kiri Hilang';
                    const kananTeks = opsis.find(o => o.id == kananId)?.teks_opsi || 'ID Kanan Hilang';
                    return (
                        <div key={kiriId} className="text-xs bg-indigo-50 p-2 rounded mb-1 border border-indigo-100 flex items-center gap-2">
                            <span dangerouslySetInnerHTML={createMarkup(kiriTeks)} className="flex-1 truncate"></span>
                            <span>➔</span>
                            <span dangerouslySetInnerHTML={createMarkup(kananTeks)} className="flex-1 truncate font-bold text-indigo-700"></span>
                        </div>
                    );
                });
            } catch (e) {
                return "Format kunci menjodohkan tidak valid.";
            }
        }
        return "-";
    };

    // Helper: Me-render jawaban siswa
    const renderJawabanSiswa = (item) => {
        const { tipe_soal, jawaban_user, opsis } = item;
        if (!jawaban_user || jawaban_user.length === 0) return <span className="italic text-slate-300">Kosong / Tidak dijawab</span>;

        if (tipe_soal === 'pg' || tipe_soal === 'pg_kompleks') {
            // jawaban_user isinya array ID opsi
            const dijawab = opsis.filter(o => jawaban_user.includes(o.id.toString()) || jawaban_user.includes(o.id));
            return dijawab.map((d, i) => <div key={i} dangerouslySetInnerHTML={createMarkup(d.teks_opsi)} className="text-sm font-bold text-slate-700 mb-1" />);
        }
        else if (tipe_soal === 'isian') {
            return <div className="text-sm font-bold text-slate-700">{jawaban_user[0]}</div>;
        }
        else if (tipe_soal === 'benar_salah') {
            // jawaban_user isinya object { "opsi_id": "Benar/Salah" }
            return Object.entries(jawaban_user).map(([id, jawab]) => {
                const teksOpsi = opsis.find(o => o.id == id)?.teks_opsi || 'Opsi terhapus';
                return (
                    <div key={id} className="text-sm flex gap-2 mb-1">
                        <span className="text-slate-500 line-clamp-1" dangerouslySetInnerHTML={createMarkup(teksOpsi)}></span>:
                        <strong className={jawab === 'Benar' ? 'text-emerald-600' : 'text-rose-600'}>{jawab}</strong>
                    </div>
                );
            });
        }
        else if (tipe_soal === 'menjodohkan') {
            // jawaban_user isinya object { "id_kiri": "id_kanan" }
            return Object.entries(jawaban_user).map(([kiriId, kananId]) => {
                const kiriTeks = opsis.find(o => o.id == kiriId)?.teks_opsi || 'ID Kiri Hilang';
                const kananTeks = opsis.find(o => o.id == kananId)?.teks_opsi || 'ID Kanan Hilang';
                return (
                    <div key={kiriId} className="text-xs bg-slate-50 p-2 rounded mb-1 border border-slate-100 flex items-center gap-2">
                        <span dangerouslySetInnerHTML={createMarkup(kiriTeks)} className="flex-1 truncate"></span>
                        <span>➔</span>
                        <span dangerouslySetInnerHTML={createMarkup(kananTeks)} className="flex-1 truncate font-bold text-slate-700"></span>
                    </div>
                );
            });
        }

        return JSON.stringify(jawaban_user);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.laporan.index')}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h2 className="font-black text-2xl text-slate-800 tracking-tight">Detail Jawaban Siswa</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Evaluasi hasil pengerjaan {peserta?.user?.name}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Detail Ujian - ${peserta?.user?.name || 'Siswa'}`} />

            <div className="max-w-5xl mx-auto space-y-6">

                {/* KARTU IDENTITAS (Sama seperti sebelumnya) */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="bg-indigo-600 p-8 md:w-1/3 flex flex-col justify-center items-center text-center text-white relative">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-2 border-white/30 z-10">
                            <Award size={40} className="text-white" />
                        </div>
                        <p className="text-indigo-100 font-bold uppercase tracking-widest text-xs mb-2 z-10">Nilai Akhir</p>
                        <h1 className="text-6xl font-black mb-2 z-10">{peserta?.nilai_akhir ?? '0'}</h1>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider z-10 shadow-sm ${
                            peserta?.nilai_akhir >= 75 ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
                        }`}>
                            {peserta?.nilai_akhir >= 75 ? 'Lulus KKM' : 'Remedial'}
                        </span>
                    </div>

                    <div className="p-8 md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white z-10">
                        <div>
                            <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1"><User size={14}/> Peserta</p>
                            <h4 className="font-black text-lg text-slate-800">{peserta?.user?.name}</h4>
                            <p className="text-sm font-medium text-slate-500">{peserta?.user?.email}</p>
                        </div>
                        <div>
                            <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1"><BookOpen size={14}/> Mata Ujian</p>
                            <h4 className="font-black text-lg text-slate-800 line-clamp-2">{peserta?.ujian?.judul_ujian}</h4>
                        </div>
                    </div>
                </div>

                {/* DAFTAR SOAL DAN JAWABAN (FIXED) */}
                <div className="space-y-4 pt-4">
                    <h3 className="font-black text-xl text-slate-800 pl-2">Rincian Per Soal</h3>

                    {daftarSoal.length > 0 ? (
                        daftarSoal.map((item, index) => {
                            // Cek apakah skor_soal sama dengan bobot maksimal (berarti benar sepenuhnya)
                            // Jika skor 0 berarti salah. (Skor bisa desimal jika PG Kompleks/Menjodohkan)
                            const isBenarPenuh = item.skor_soal > 0 && item.skor_soal == item.bobot_maksimal;
                            const isBenarSebagian = item.skor_soal > 0 && item.skor_soal < item.bobot_maksimal;

                            let statusColor = 'border-rose-200 bg-rose-50/30';
                            let badgeText = 'Salah (0 Poin)';
                            let badgeStyle = 'bg-rose-100 text-rose-700';

                            if (isBenarPenuh) {
                                statusColor = 'border-emerald-200 bg-emerald-50/30';
                                badgeText = `Benar (${item.skor_soal} Poin)`;
                                badgeStyle = 'bg-emerald-100 text-emerald-700';
                            } else if (isBenarSebagian) {
                                statusColor = 'border-amber-200 bg-amber-50/30';
                                badgeText = `Sebagian (${parseFloat(item.skor_soal).toFixed(1)} Poin)`;
                                badgeStyle = 'bg-amber-100 text-amber-700';
                            }

                            return (
                                <div key={index} className={`p-6 rounded-3xl border ${statusColor} shadow-sm transition-all`}>

                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 font-black shadow-sm">
                                                {item.nomor_urut}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${badgeStyle}`}>
                                                {badgeText}
                                            </span>
                                            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-400 rounded-lg text-xs font-black uppercase">
                                                {item.tipe_soal.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Pertanyaan */}
                                    <div
                                        className="text-slate-700 text-sm md:text-base font-medium mb-6 prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-sm"
                                        dangerouslySetInnerHTML={createMarkup(item.pertanyaan)}
                                    />

                                    {/* Perbandingan Jawaban */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Jawaban Siswa</p>
                                            {renderJawabanSiswa(item)}
                                        </div>
                                        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Kunci Jawaban Seharusnya</p>
                                            {renderKunciJawaban(item)}
                                        </div>
                                    </div>

                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
                            <h4 className="text-lg font-bold text-slate-800">Tidak Ada Data Soal</h4>
                            <p className="text-slate-500 mt-2">Peserta ini mungkin belum menjawab soal satupun, atau soal telah dihapus.</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
