import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';

export default function RuangUjian({ auth, sesi, dataSoal, errors }) {
    // ------------------------------------------------------------------------------------
    // 1. STATE MANAGEMENT & WAKTU SERVER
    // ------------------------------------------------------------------------------------
    const [indeksAktif, setIndeksAktif] = useState(0);
    const [jawabanSiswa, setJawabanSiswa] = useState({});
    const [selectedLeft, setSelectedLeft] = useState(null);

    const soalSekarang = dataSoal[indeksAktif];
    const idUjianUnik = `cbt_jawaban_${sesi.id}`;

    // Timer Akurat dari Server
    const hitungSisaDetik = () => {
        const batas = new Date(sesi.batas_waktu).getTime();
        const sekarang = new Date().getTime();
        return Math.max(0, Math.floor((batas - sekarang) / 1000));
    };

    const [sisaWaktu, setSisaWaktu] = useState(hitungSisaDetik());

    useEffect(() => {
        const timerInterval = setInterval(() => {
            const sisa = hitungSisaDetik();
            setSisaWaktu(sisa);

            if (sisa <= 0) {
                clearInterval(timerInterval);
                alert("⏱️ WAKTU HABIS! Mengumpulkan jawaban secara otomatis...");
                router.post(`/ujian/${sesi.id}/selesai`);
            }
        }, 1000);
        return () => clearInterval(timerInterval);
    }, [sesi.batas_waktu, sesi.id]);

    const formatWaktu = (totalDetik) => {
        const jam = Math.floor(totalDetik / 3600);
        const menit = Math.floor((totalDetik % 3600) / 60);
        const detik = totalDetik % 60;
        return `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
    };

    // Pendeteksi Error Database
    useEffect(() => {
        if (errors && errors.pesan) {
            alert("⚠️ Sistem gagal menyimpan: " + errors.pesan);
        }
    }, [errors]);

    // Load Memori & Menggambar Garis
    const containerRef = useRef(null);
    const leftRefs = useRef({});
    const rightRefs = useRef({});
    const [garisKoordinat, setGarisKoordinat] = useState([]);

    useEffect(() => {
        try {
            const memori = localStorage.getItem(idUjianUnik);
            if (memori) setJawabanSiswa(JSON.parse(memori));
        } catch (e) { localStorage.removeItem(idUjianUnik); }
    }, [idUjianUnik]);

    useEffect(() => { setSelectedLeft(null); }, [indeksAktif]);

    useEffect(() => {
        const gambarGaris = () => {
            if (soalSekarang.tipe !== 'menjodohkan' || !containerRef.current) return;
            const containerBox = containerRef.current.getBoundingClientRect();
            const connections = Array.isArray(jawabanSiswa[soalSekarang.id]) ? jawabanSiswa[soalSekarang.id] : [];

            const daftarGaris = connections.map(conn => {
                const elemenKiri = leftRefs.current[conn.from];
                const elemenKanan = rightRefs.current[conn.to];
                if (elemenKiri && elemenKanan) {
                    const boxKiri = elemenKiri.getBoundingClientRect();
                    const boxKanan = elemenKanan.getBoundingClientRect();
                    return {
                        id: `${conn.from}-${conn.to}`,
                        x1: boxKiri.right - containerBox.left, y1: (boxKiri.top + boxKiri.height / 2) - containerBox.top,
                        x2: boxKanan.left - containerBox.left, y2: (boxKanan.top + boxKanan.height / 2) - containerBox.top
                    };
                }
                return null;
            }).filter(Boolean);
            setGarisKoordinat(daftarGaris);
        };
        const timer = setTimeout(gambarGaris, 50);
        window.addEventListener('resize', gambarGaris);
        return () => { clearTimeout(timer); window.removeEventListener('resize', gambarGaris); };
    }, [jawabanSiswa, indeksAktif, soalSekarang]);

    // ------------------------------------------------------------------------------------
    // 2. FUNGSI PENYIMPAN JAWABAN (SMART AUTO-SAVE)
    // ------------------------------------------------------------------------------------
    const handleSimpanJawaban = (idSoal, tipeSoal, dataJawaban) => {
        let jawabanBaru = { ...jawabanSiswa };

        if (tipeSoal === 'pg_kompleks') {
            let arr = Array.isArray(jawabanBaru[idSoal]) ? jawabanBaru[idSoal] : [];
            if (arr.includes(dataJawaban)) arr = arr.filter(j => j !== dataJawaban);
            else arr.push(dataJawaban);
            jawabanBaru[idSoal] = arr;
        }
        else if (tipeSoal === 'benar_salah') {
            let obj = (typeof jawabanBaru[idSoal] === 'object' && !Array.isArray(jawabanBaru[idSoal]) && jawabanBaru[idSoal] !== null) ? jawabanBaru[idSoal] : {};
            obj[dataJawaban.key] = dataJawaban.value;
            jawabanBaru[idSoal] = obj;
        }
        else {
            jawabanBaru[idSoal] = dataJawaban;
        }

        // Update UI instan agar responsif
        setJawabanSiswa(jawabanBaru);
        localStorage.setItem(idUjianUnik, JSON.stringify(jawabanBaru));

        // Tembak Data via Inertia dengan perlindungan penuh
        router.post(`/ujian/${sesi.id}/simpan-jawaban`, {
            soal_id: idSoal,
            jawaban: jawabanBaru[idSoal]
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true, // Mencegah tumpukan history browser
        });
    };

    // ------------------------------------------------------------------------------------
    // 3. MESIN PERENDER UI SOAL (TAMPILAN PREMIUM)
    // ------------------------------------------------------------------------------------
    const renderLembarSoal = () => {
        const id = soalSekarang.id;
        const jawabanCurrent = jawabanSiswa[id];

        switch (soalSekarang.tipe) {
            case 'pg':
                return (
                    <div className="space-y-4">
                        {soalSekarang.opsi.map((pilihan, index) => {
                            const huruf = String.fromCharCode(65 + index);
                            const isSelected = jawabanCurrent === pilihan.id;
                            return (
                                <label key={pilihan.id} className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out group ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 transition-colors duration-300 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-indigo-400'}`}>
                                        <span className="font-bold text-sm">{huruf}</span>
                                    </div>
                                    <input type="radio" checked={isSelected} onChange={() => handleSimpanJawaban(id, 'pg', pilihan.id)} className="hidden"/>
                                    <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{pilihan.teks_opsi}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'pg_kompleks':
                const arrayJawaban = Array.isArray(jawabanCurrent) ? jawabanCurrent : [];
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-amber-700 font-medium mb-5 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Pilih semua jawaban yang menurut Anda benar (bisa lebih dari satu).
                        </div>
                        {soalSekarang.opsi.map((pilihan) => {
                            const isChecked = arrayJawaban.includes(pilihan.id);
                            return (
                                <label key={pilihan.id} className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ease-in-out ${isChecked ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={isChecked} onChange={() => handleSimpanJawaban(id, 'pg_kompleks', pilihan.id)} className="w-6 h-6 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 transition-all cursor-pointer"/>
                                    <span className={`ml-4 text-lg font-medium ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>{pilihan.teks_opsi}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'isian':
                return (
                    <div className="space-y-3 mt-4">
                        <textarea rows="4" value={jawabanCurrent || ''} onChange={(e) => handleSimpanJawaban(id, 'isian', e.target.value)} placeholder="Ketik jawaban Anda di sini dengan jelas..." className="w-full p-6 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-lg transition-all resize-none text-slate-800 shadow-sm" />
                    </div>
                );

            case 'menjodohkan':
                const connections = Array.isArray(jawabanCurrent) ? jawabanCurrent : [];
                const handleConnect = (rightId) => {
                    if (selectedLeft) {
                        const connectionsBaru = connections.filter(c => c.from !== selectedLeft && c.to !== rightId);
                        connectionsBaru.push({ from: selectedLeft, to: rightId });
                        handleSimpanJawaban(id, 'menjodohkan', connectionsBaru);
                        setSelectedLeft(null);
                    }
                };
                return (
                    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 p-6 md:p-8 bg-slate-50/50 rounded-3xl relative border border-slate-200 mt-6 shadow-inner">
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                            {garisKoordinat.map(garis => (
                                <line key={garis.id} x1={garis.x1} y1={garis.y1} x2={garis.x2} y2={garis.y2} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" className="drop-shadow-sm" />
                            ))}
                        </svg>
                        <button onClick={() => { handleSimpanJawaban(id, 'menjodohkan', []); setSelectedLeft(null); }} className="absolute -top-3 -right-3 md:top-4 md:right-4 text-xs bg-white border border-rose-200 text-rose-600 font-bold px-4 py-2 rounded-full hover:bg-rose-50 hover:border-rose-300 transition-all z-20 shadow-sm flex items-center gap-1">
                            Reset Garis
                        </button>
                        <div className="space-y-4 z-10">
                            <h5 className="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6 text-center">Pernyataan</h5>
                            {soalSekarang.opsi.left.map(item => {
                                const isConnected = connections.some(c => c.from === item.id);
                                const isSelected = selectedLeft === item.id;
                                return (
                                    <div key={item.id} ref={el => leftRefs.current[item.id] = el} onClick={() => setSelectedLeft(item.id)} className={`p-4 md:p-5 bg-white border-2 rounded-2xl text-sm md:text-base font-medium cursor-pointer flex justify-between items-center transition-all duration-200 relative ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50 shadow-lg scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}>
                                        <span className="text-slate-700">{item.teks_opsi}</span>
                                        <div className={`w-4 h-4 rounded-full flex-shrink-0 ml-3 transition-colors ${isConnected ? 'bg-indigo-500 ring-4 ring-indigo-100' : 'bg-slate-200'}`}></div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-4 z-10">
                            <h5 className="font-bold text-slate-500 uppercase tracking-widest text-xs mb-6 text-center">Pasangan</h5>
                            {soalSekarang.opsi.right.map(item => {
                                const isConnected = connections.some(c => c.to === item.id);
                                return (
                                    <div key={item.id} ref={el => rightRefs.current[item.id] = el} onClick={() => handleConnect(item.id)} className={`p-4 md:p-5 bg-white border-2 rounded-2xl text-sm md:text-base flex justify-between items-center transition-all duration-200 cursor-pointer relative ${isConnected ? 'border-emerald-500 ring-4 ring-emerald-50 shadow-md' : (selectedLeft ? 'border-amber-400 bg-amber-50/50 hover:shadow-md' : 'border-slate-200 hover:border-emerald-300')}`}>
                                        <div className={`w-4 h-4 rounded-full flex-shrink-0 mr-3 transition-colors ${isConnected ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-200'}`}></div>
                                        <span className="text-slate-700 font-medium">{item.teks_opsi}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'benar_salah':
                const objectJawabanTable = (typeof jawabanCurrent === 'object' && !Array.isArray(jawabanCurrent) && jawabanCurrent !== null) ? jawabanCurrent : {};
                return (
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 text-sm text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                                        <th className="p-5 font-bold">Pernyataan</th>
                                        <th className="p-5 font-bold text-center w-32 text-emerald-600 bg-emerald-50/50 border-l border-white">Benar</th>
                                        <th className="p-5 font-bold text-center w-32 text-rose-600 bg-rose-50/50 border-l border-white">Salah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {soalSekarang.opsi.map((pernyataan, idx) => {
                                        const rowKey = pernyataan.id;
                                        const valueRow = objectJawabanTable[rowKey];
                                        return (
                                            <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-5 text-slate-700 font-medium text-base">{idx+1}. {pernyataan.teks_opsi}</td>
                                                <td className="p-5 text-center bg-emerald-50/10 border-l border-slate-100 cursor-pointer hover:bg-emerald-50/50" onClick={() => handleSimpanJawaban(id, 'benar_salah', {key: rowKey, value: 'Benar'})}>
                                                    <input type="radio" checked={valueRow === 'Benar'} readOnly className="w-6 h-6 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                                </td>
                                                <td className="p-5 text-center bg-rose-50/10 border-l border-slate-100 cursor-pointer hover:bg-rose-50/50" onClick={() => handleSimpanJawaban(id, 'benar_salah', {key: rowKey, value: 'Salah'})}>
                                                    <input type="radio" checked={valueRow === 'Salah'} readOnly className="w-6 h-6 text-rose-500 focus:ring-rose-500 cursor-pointer" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'survei':
                return (
                    <div className="bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-200 mt-6 shadow-inner">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {soalSekarang.opsi.map((pilihan, index) => {
                                const isSelected = jawabanCurrent === pilihan.id;
                                return (
                                    <label key={pilihan.id} className={`flex flex-col items-center p-5 bg-white border-2 rounded-2xl cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isSelected ? 'border-amber-400 bg-amber-50 ring-4 ring-amber-50' : 'border-slate-200 hover:border-amber-300'}`}>
                                        <input type="radio" checked={isSelected} onChange={() => handleSimpanJawaban(id, 'survei', pilihan.id)} className="hidden" />
                                        <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-3 transition-colors ${isSelected ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 text-slate-400'}`}>
                                            <p className="font-black text-2xl">{index + 1}</p>
                                        </div>
                                        <p className={`text-sm leading-tight font-medium ${isSelected ? 'text-amber-900' : 'text-slate-600'}`}>{pilihan.teks_opsi}</p>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );

            default: return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: Tipe soal tidak dikenal.</div>;
        }
    };

    // ------------------------------------------------------------------------------------
    // 4. MASTER LAYOUT
    // ------------------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 selection:bg-indigo-100 selection:text-indigo-900">
            <Head title={`Soal No. ${soalSekarang.no} - CBT Pro`} />

            <nav className="bg-white/80 backdrop-blur-md text-slate-800 px-6 py-4 shadow-sm sticky top-0 z-50 flex justify-between items-center border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                        <span className="text-white font-black text-xl">C</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 hidden sm:block">
                        CBT <span className="text-indigo-600">PRO</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-white font-mono font-bold text-base sm:text-lg flex items-center gap-3 transition-all duration-300 shadow-md ${sisaWaktu <= 300 ? 'bg-rose-500 animate-pulse shadow-rose-200' : 'bg-slate-900 shadow-slate-300'}`}>
                        <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {formatWaktu(sisaWaktu)}
                    </div>
                    <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
                        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <span className="font-semibold text-sm text-slate-700">{auth?.user?.name || 'Siswa'}</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 mt-4 flex flex-col lg:flex-row gap-8">
                {/* KOLOM KIRI */}
                <div className="lg:w-3/4 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h2 className="text-slate-500 font-semibold text-sm uppercase tracking-widest mb-1">Mata Uji</h2>
                            <h3 className="text-2xl font-black text-slate-900">{sesi.ujian.judul_ujian}</h3>
                        </div>
                        <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm border border-indigo-100 flex items-center gap-2 self-start sm:self-auto">
                            <span>Sesi: #{sesi.id}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div className="bg-slate-50/50 border-b border-slate-200/60 px-8 py-5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-200">{soalSekarang.no}</div>
                                <span className="font-bold text-slate-600 text-lg">Soal Ujian</span>
                            </div>
                            <span className="text-xs px-3 py-1.5 font-bold rounded-md bg-white text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                                {soalSekarang.tipe.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="p-8 md:p-10">
                            <h4 className="text-xl md:text-2xl text-slate-800 leading-relaxed font-semibold mb-8">{soalSekarang.tanya}</h4>
                            {renderLembarSoal()}
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm sticky bottom-4 z-40">
                        <button onClick={() => setIndeksAktif(prev => Math.max(0, prev - 1))} disabled={indeksAktif === 0} className="flex items-center gap-2 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 transition-all text-sm md:text-base group">
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </button>

                        {indeksAktif === dataSoal.length - 1 ? (
                            <button onClick={() => { if(confirm("Yakin ingin mengakhiri ujian? Jawaban tidak bisa diubah lagi!")) { router.post(`/ujian/${sesi.id}/selesai`); } }} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 text-sm md:text-base">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Selesai Ujian
                            </button>
                        ) : (
                            <button onClick={() => setIndeksAktif(prev => Math.min(dataSoal.length - 1, prev + 1))} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 md:px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 text-sm md:text-base group">
                                <span className="hidden sm:inline">Selanjutnya</span>
                                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="lg:w-1/4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60 sticky top-28">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                            <h3 className="font-extrabold text-lg text-slate-800">Navigasi Soal</h3>
                            <div className="flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 font-bold py-1.5 px-3 rounded-lg border border-indigo-100">
                                <span>{Object.keys(jawabanSiswa).length} / {dataSoal.length}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2.5">
                            {dataSoal.map((soal, index) => {
                                const sudahDijawab = jawabanSiswa[soal.id] !== undefined && (Array.isArray(jawabanSiswa[soal.id]) ? jawabanSiswa[soal.id].length > 0 : Object.keys(jawabanSiswa[soal.id] || {}).length > 0 || (typeof jawabanSiswa[soal.id] === 'string' && jawabanSiswa[soal.id].trim() !== '') || typeof jawabanSiswa[soal.id] === 'number');
                                const sedangDibuka = indeksAktif === index;
                                return (
                                    <button key={soal.id} onClick={() => setIndeksAktif(index)} className={`w-full aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 ${ sedangDibuka ? 'bg-indigo-600 border-none text-white ring-4 ring-indigo-100 shadow-lg transform scale-110 z-10' : sudahDijawab ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-500 hover:text-white' : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600' }`}>
                                        {soal.no}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
