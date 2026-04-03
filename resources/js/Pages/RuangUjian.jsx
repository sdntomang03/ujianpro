import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';

// 🌟 IMPORT KATEX
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';

export default function RuangUjian({ auth, sesi, dataSoal, errors }) {
    // ------------------------------------------------------------------------------------
    // 1. STATE MANAGEMENT, WAKTU SERVER, FULLSCREEN & UI SETTINGS
    // ------------------------------------------------------------------------------------
    const [indeksAktif, setIndeksAktif] = useState(0);
    const [jawabanSiswa, setJawabanSiswa] = useState({});

    // 🔥 STATE BARU: RAGU-RAGU
    const [raguRagu, setRaguRagu] = useState({});

    const [selectedLeft, setSelectedLeft] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Aksesibilitas Font & Lightbox Gambar
    const [fontSize, setFontSize] = useState(1);
    const [showLightbox, setShowLightbox] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const soalSekarang = dataSoal[indeksAktif];

    // Identifier unik untuk LocalStorage
    const idUjianUnik = `cbt_jawaban_${sesi.id}`;
    const idRaguUnik = `cbt_ragu_${sesi.id}`;

    // 🌟 REF UNTUK CONTAINER KATEX
    const contentRef = useRef(null);

    // 🌟 EFFECT AUTO-RENDER KATEX
    useEffect(() => {
        if (contentRef.current) {
            renderMathInElement(contentRef.current, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: true },
                ],
                throwOnError: false,
            });
        }
    }, [indeksAktif, fontSize, soalSekarang]); // Trigger jika soal atau font berubah

    // 🌟 HELPER COMPONENT UNTUK RENDER TEKS/HTML
    const MathContent = ({ html, className = "" }) => (
        <div
            className={`math-content ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );

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

    // Mesin Fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        const attemptAutoFullscreen = async () => {
            try {
                if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) { /* Abaikan jika diblokir */ }
        };
        attemptAutoFullscreen();
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    // Load Memori Jawaban & Ragu-ragu dari LocalStorage
    const containerRef = useRef(null);
    const leftRefs = useRef({});
    const rightRefs = useRef({});
    const [garisKoordinat, setGarisKoordinat] = useState([]);

    useEffect(() => {
        try {
            const memoriJawaban = localStorage.getItem(idUjianUnik);
            if (memoriJawaban) setJawabanSiswa(JSON.parse(memoriJawaban));

            const memoriRagu = localStorage.getItem(idRaguUnik);
            if (memoriRagu) setRaguRagu(JSON.parse(memoriRagu));
        } catch (e) {
            localStorage.removeItem(idUjianUnik);
            localStorage.removeItem(idRaguUnik);
        }
    }, [idUjianUnik, idRaguUnik]);

    useEffect(() => {
        setSelectedLeft(null);
        setZoomLevel(1);
    }, [indeksAktif]);

    // Logic Garis Anti-Pecah
    useEffect(() => {
        const gambarGaris = () => {
            if (soalSekarang.tipe !== 'menjodohkan' || !containerRef.current) return;
            const containerBox = containerRef.current.getBoundingClientRect();

            const connections = (typeof jawabanSiswa[soalSekarang.id] === 'object' && !Array.isArray(jawabanSiswa[soalSekarang.id]) && jawabanSiswa[soalSekarang.id] !== null)
                                ? jawabanSiswa[soalSekarang.id] : {};

            const daftarGaris = Object.entries(connections).map(([from, to]) => {
                const elemenKiri = leftRefs.current[from];
                const elemenKanan = rightRefs.current[to];
                if (elemenKiri && elemenKanan) {
                    const boxKiri = elemenKiri.getBoundingClientRect();
                    const boxKanan = elemenKanan.getBoundingClientRect();
                    return {
                        id: `${from}-${to}`,
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
        window.addEventListener('scroll', gambarGaris, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', gambarGaris);
            window.removeEventListener('scroll', gambarGaris, true);
        };
    }, [jawabanSiswa, indeksAktif, soalSekarang, fontSize]);

    // ------------------------------------------------------------------------------------
    // 2. FUNGSI PENYIMPAN JAWABAN & TOGGLE RAGU-RAGU
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

        setJawabanSiswa(jawabanBaru);
        localStorage.setItem(idUjianUnik, JSON.stringify(jawabanBaru));

        const isRagu = raguRagu[idSoal] || false;

        router.post(`/ujian/${sesi.id}/simpan-jawaban`, {
            soal_id: idSoal,
            jawaban: jawabanBaru[idSoal],
            is_ragu: isRagu
        }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    };

    const handleToggleRagu = () => {
        const idSoal = soalSekarang.id;
        const statusBaru = !raguRagu[idSoal];

        const raguBaru = { ...raguRagu, [idSoal]: statusBaru };
        setRaguRagu(raguBaru);
        localStorage.setItem(idRaguUnik, JSON.stringify(raguBaru));

        const jawabanCurrent = jawabanSiswa[idSoal] || null;

        router.post(`/ujian/${sesi.id}/simpan-jawaban`, {
            soal_id: idSoal,
            jawaban: jawabanCurrent,
            is_ragu: statusBaru
        }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    };

    // ------------------------------------------------------------------------------------
    // 3. KELAS UKURAN FONT DINAMIS & MESIN PERENDER UI SOAL
    // ------------------------------------------------------------------------------------
    const fontTanya = fontSize === 0 ? "text-base md:text-xl" : fontSize === 1 ? "text-lg md:text-2xl" : "text-xl md:text-3xl";
    const fontBase = fontSize === 0 ? "text-sm md:text-base" : fontSize === 1 ? "text-base md:text-lg" : "text-lg md:text-xl";
    const fontSmall = fontSize === 0 ? "text-xs md:text-sm" : fontSize === 1 ? "text-sm md:text-base" : "text-base md:text-lg";
    const fontXSmall = fontSize === 0 ? "text-[10px] md:text-xs" : fontSize === 1 ? "text-xs sm:text-sm md:text-base" : "text-sm sm:text-base md:text-lg";

    const renderLembarSoal = () => {
        const id = soalSekarang.id;
        const jawabanCurrent = jawabanSiswa[id];

        switch (soalSekarang.tipe) {
            case 'pg':
                return (
                    <div className="space-y-3 md:space-y-4">
                        {soalSekarang.opsi.map((pilihan, index) => {
                            const huruf = String.fromCharCode(65 + index);
                            const isSelected = jawabanCurrent === pilihan.id;
                            return (
                                <label key={pilihan.id} className={`flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out group ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <div className={`flex flex-shrink-0 items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border-2 mr-3 md:mr-4 transition-colors duration-300 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-slate-500 group-hover:border-indigo-400'}`}>
                                        <span className="font-bold text-xs md:text-sm">{huruf}</span>
                                    </div>
                                    <input type="radio" checked={isSelected} onChange={() => handleSimpanJawaban(id, 'pg', pilihan.id)} className="hidden"/>
                                    {/* 🌟 GANTI SPAN DENGAN MATHCONTENT */}
                                    <MathContent html={pilihan.teks_opsi} className={`${fontBase} font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`} />
                                </label>
                            );
                        })}
                    </div>
                );

            case 'pg_kompleks':
                const arrayJawaban = Array.isArray(jawabanCurrent) ? jawabanCurrent : [];
                return (
                    <div className="space-y-3 md:space-y-4">
                        <div className={`flex items-start md:items-center gap-2 ${fontSmall} text-amber-700 font-medium mb-4 bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl shadow-sm`}>
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5 md:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Pilih semua jawaban yang menurut Anda benar (bisa lebih dari satu).
                        </div>
                        {soalSekarang.opsi.map((pilihan) => {
                            const isChecked = arrayJawaban.includes(pilihan.id);
                            return (
                                <label key={pilihan.id} className={`flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ease-in-out ${isChecked ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={isChecked} onChange={() => handleSimpanJawaban(id, 'pg_kompleks', pilihan.id)} className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 transition-all cursor-pointer"/>
                                    {/* 🌟 GANTI SPAN DENGAN MATHCONTENT */}
                                    <MathContent html={pilihan.teks_opsi} className={`ml-3 md:ml-4 ${fontBase} font-medium ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`} />
                                </label>
                            );
                        })}
                    </div>
                );

            case 'isian':
                return (
                    <div className="space-y-3 mt-4">
                        <textarea rows="4" value={jawabanCurrent || ''} onChange={(e) => handleSimpanJawaban(id, 'isian', e.target.value)} placeholder="Ketik jawaban Anda di sini..." className={`w-full p-4 md:p-6 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 ${fontBase} transition-all resize-none text-slate-800 shadow-sm`} />
                    </div>
                );

            case 'menjodohkan':
                const connections = (typeof jawabanCurrent === 'object' && jawabanCurrent !== null && !Array.isArray(jawabanCurrent)) ? jawabanCurrent : {};

                const handleConnect = (rightId) => {
                    if (selectedLeft) {
                        const connectionsBaru = { ...connections };
                        for (let key in connectionsBaru) {
                            if (connectionsBaru[key] === rightId) delete connectionsBaru[key];
                        }
                        connectionsBaru[selectedLeft] = rightId;
                        handleSimpanJawaban(id, 'menjodohkan', connectionsBaru);
                        setSelectedLeft(null);
                    }
                };

                return (
                    <div ref={containerRef} className="p-3 sm:p-6 md:p-8 bg-slate-50/50 rounded-2xl md:rounded-3xl relative border border-slate-200 mt-4 md:mt-6 shadow-inner overflow-hidden">
                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                            {garisKoordinat.map(garis => (
                                <line key={garis.id} x1={garis.x1} y1={garis.y1} x2={garis.x2} y2={garis.y2} stroke="#4f46e5" strokeWidth={window.innerWidth < 640 ? "2.5" : "4"} strokeLinecap="round" className="drop-shadow-sm" />
                            ))}
                        </svg>

                        <div className="flex justify-end mb-4 relative z-20">
                            <button onClick={() => { handleSimpanJawaban(id, 'menjodohkan', {}); setSelectedLeft(null); }} className="text-[10px] sm:text-xs bg-white border border-rose-200 text-rose-600 font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-rose-50 transition-all shadow-sm">
                                Reset Garis
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-8 md:gap-20 relative z-10">
                            <div className="space-y-3 md:space-y-4">
                                <h5 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] md:text-xs text-center mb-1">Pernyataan (Kiri)</h5>
                                {soalSekarang.opsi.left.map(item => {
                                    const isConnected = connections[item.id] !== undefined;
                                    const isSelected = selectedLeft === item.id;
                                    return (
                                        <div key={item.id} ref={el => leftRefs.current[item.id] = el} onClick={() => setSelectedLeft(item.id)} className={`p-2.5 sm:p-4 md:p-5 bg-white border-2 rounded-xl md:rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-200 relative ${isSelected ? 'border-indigo-500 ring-2 md:ring-4 ring-indigo-50 shadow-md scale-[1.02]' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
                                            {/* 🌟 GANTI SPAN DENGAN MATHCONTENT */}
                                            <MathContent html={item.teks_opsi} className={`text-slate-700 ${fontXSmall} font-medium break-words w-full pr-1`} />
                                            <div className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full flex-shrink-0 transition-colors ${isConnected ? 'bg-indigo-500 ring-2 md:ring-4 ring-indigo-100' : 'bg-slate-200'}`}></div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <h5 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] md:text-xs text-center mb-1">Pasangan (Kanan)</h5>
                                {soalSekarang.opsi.right.map(item => {
                                    const isConnected = Object.values(connections).includes(item.id);
                                    return (
                                        <div key={item.id} ref={el => rightRefs.current[item.id] = el} onClick={() => handleConnect(item.id)} className={`p-2.5 sm:p-4 md:p-5 bg-white border-2 rounded-xl md:rounded-2xl flex justify-between items-center transition-all duration-200 cursor-pointer relative ${isConnected ? 'border-emerald-500 ring-2 md:ring-4 ring-emerald-50 shadow-md' : (selectedLeft ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 hover:border-emerald-300 shadow-sm')}`}>
                                            <div className={`w-2.5 h-2.5 md:w-4 md:h-4 rounded-full flex-shrink-0 mr-1.5 md:mr-3 transition-colors ${isConnected ? 'bg-emerald-500 ring-2 md:ring-4 ring-emerald-100' : 'bg-slate-200'}`}></div>
                                            {/* 🌟 GANTI SPAN DENGAN MATHCONTENT */}
                                            <MathContent html={item.teks_opsi} className={`text-slate-700 ${fontXSmall} font-medium break-words w-full pl-1`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );

            case 'benar_salah':
                const objectJawabanTable = (typeof jawabanCurrent === 'object' && !Array.isArray(jawabanCurrent) && jawabanCurrent !== null) ? jawabanCurrent : {};
                return (
                    <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 overflow-hidden shadow-sm mt-4 md:mt-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[450px] md:min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50 text-xs md:text-sm text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                                        <th className="p-4 md:p-5 font-bold">Pernyataan</th>
                                        <th className="p-4 md:p-5 font-bold text-center w-24 md:w-32 text-emerald-600 bg-emerald-50/50 border-l border-white">Benar</th>
                                        <th className="p-4 md:p-5 font-bold text-center w-24 md:w-32 text-rose-600 bg-rose-50/50 border-l border-white">Salah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {soalSekarang.opsi.map((pernyataan, idx) => {
                                        const rowKey = pernyataan.id;
                                        const valueRow = objectJawabanTable[rowKey];
                                        return (
                                            <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors group">
                                                {/* 🌟 GANTI TD DENGAN MATHCONTENT */}
                                                <td className={`p-4 md:p-5`}>
                                                     <MathContent html={`${idx+1}. ${pernyataan.teks_opsi}`} className={`text-slate-700 font-medium ${fontSmall}`} />
                                                </td>
                                                <td className="p-4 md:p-5 text-center bg-emerald-50/10 border-l border-slate-100 cursor-pointer hover:bg-emerald-50/50" onClick={() => handleSimpanJawaban(id, 'benar_salah', {key: rowKey, value: 'Benar'})}>
                                                    <input type="radio" checked={valueRow === 'Benar'} readOnly className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 focus:ring-emerald-500 cursor-pointer" />
                                                </td>
                                                <td className="p-4 md:p-5 text-center bg-rose-50/10 border-l border-slate-100 cursor-pointer hover:bg-rose-50/50" onClick={() => handleSimpanJawaban(id, 'benar_salah', {key: rowKey, value: 'Salah'})}>
                                                    <input type="radio" checked={valueRow === 'Salah'} readOnly className="w-5 h-5 md:w-6 md:h-6 text-rose-500 focus:ring-rose-500 cursor-pointer" />
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
                    <div className="bg-slate-50/50 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 mt-4 md:mt-6 shadow-inner">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                            {soalSekarang.opsi.map((pilihan, index) => {
                                const isSelected = jawabanCurrent === pilihan.id;
                                return (
                                    <label key={pilihan.id} className={`flex flex-col items-center p-4 md:p-5 bg-white border-2 rounded-xl md:rounded-2xl cursor-pointer text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isSelected ? 'border-amber-400 bg-amber-50 ring-2 md:ring-4 ring-amber-50' : 'border-slate-200 hover:border-amber-300'}`}>
                                        <input type="radio" checked={isSelected} onChange={() => handleSimpanJawaban(id, 'survei', pilihan.id)} className="hidden" />
                                        <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-2 md:mb-3 transition-colors ${isSelected ? 'bg-amber-400 text-amber-900' : 'bg-slate-100 text-slate-400'}`}>
                                            <p className="font-black text-xl md:text-2xl">{index + 1}</p>
                                        </div>
                                        {/* 🌟 GANTI P DENGAN MATHCONTENT */}
                                        <MathContent html={pilihan.teks_opsi} className={`${fontSize === 0 ? 'text-[10px] md:text-xs' : fontSize === 1 ? 'text-xs md:text-sm' : 'text-sm md:text-base'} leading-tight font-medium ${isSelected ? 'text-amber-900' : 'text-slate-600'}`} />
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );

            default: return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error: Tipe soal tidak dikenal.</div>;
        }
    };

    const jumlahDijawab = dataSoal.filter(soal => {
        const j = jawabanSiswa[soal.id];
        if (j === undefined || j === null) return false;
        if (Array.isArray(j)) return j.length > 0;
        if (typeof j === 'object') return Object.keys(j).length > 0;
        if (typeof j === 'string') return j.trim() !== '';
        if (typeof j === 'number') return true;
        return false;
    }).length;

    // ------------------------------------------------------------------------------------
    // 4. MASTER LAYOUT
    // ------------------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12 selection:bg-indigo-100 selection:text-indigo-900 relative">
            <Head title={`Soal No. ${soalSekarang.no} - CBT Pro`} />

            <nav className="bg-white/80 backdrop-blur-md text-slate-800 px-4 md:px-6 py-3 md:py-4 shadow-sm sticky top-0 z-40 flex justify-between items-center border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                        <span className="text-white font-black text-lg md:text-xl">C</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 hidden sm:block">
                        CBT <span className="text-indigo-600">PRO</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    <button onClick={toggleFullscreen} className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors border border-slate-200" title="Mode Layar Penuh">
                        {isFullscreen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7M4 10h6m0 0V4m0 6l-7-7m17 11h-6m0 0v6m0-6l7 7"></path></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                        )}
                    </button>

                    <div className={`px-3 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl text-white font-mono font-bold text-sm md:text-lg flex items-center gap-2 md:gap-3 transition-all duration-300 shadow-md ${sisaWaktu <= 300 ? 'bg-rose-500 animate-pulse shadow-rose-200' : 'bg-slate-900 shadow-slate-300'}`}>
                        <svg className="w-4 h-4 md:w-5 md:h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {formatWaktu(sisaWaktu)}
                    </div>
                </div>
            </nav>

            {/* 🌟 PASANG REF DI CONTAINER UTAMA KIRI UNTUK KATEX */}
            <div ref={contentRef} className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 mt-2 md:mt-4 flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* KOLOM KIRI */}
                <div className="lg:w-3/4 flex flex-col gap-4 md:gap-6">

                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                        <div className="bg-slate-50/50 border-b border-slate-200/60 px-5 md:px-8 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-700 rounded-xl md:rounded-2xl flex flex-shrink-0 items-center justify-center font-black text-lg md:text-xl border border-indigo-200">{soalSekarang.no}</div>
                                <span className="font-bold text-slate-600 text-base md:text-lg">Soal Ujian</span>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                                    <button onClick={() => setFontSize(Math.max(0, fontSize - 1))} disabled={fontSize === 0} className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-white transition-colors" title="Perkecil Teks">
                                        <span className="font-bold text-sm">A-</span>
                                    </button>
                                    <div className="w-px h-5 bg-slate-200"></div>
                                    <button onClick={() => setFontSize(Math.min(2, fontSize + 1))} disabled={fontSize === 2} className="px-3 py-1.5 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-white transition-colors" title="Perbesar Teks">
                                        <span className="font-bold text-lg leading-none">A+</span>
                                    </button>
                                </div>
                                <span className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 font-bold rounded-md bg-white text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm whitespace-nowrap">
                                    {soalSekarang.tipe.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                        <div className="p-5 sm:p-8 md:p-10">

                            {soalSekarang.gambar && (
                                <div onClick={() => setShowLightbox(true)} className="mb-6 md:mb-8 rounded-xl border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center p-3 relative group cursor-zoom-in" title="Klik untuk memperbesar gambar">
                                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                    <img src={soalSekarang.gambar} alt="Ilustrasi Soal" className="max-h-[140px] md:max-h-[200px] w-auto object-contain rounded-lg transition-transform duration-500 group-hover:scale-[1.02]" onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}

                            {/* 🌟 GANTI DANGEROUSLYSETINNERHTML DENGAN MATHCONTENT */}
                            <MathContent html={soalSekarang.tanya} className={`${fontTanya} text-slate-800 font-normal leading-relaxed mb-6 md:mb-8 transition-all space-y-4`} />

                            {renderLembarSoal()}

                        </div>
                    </div>

                    <div className="flex justify-between items-center p-3 md:p-4 bg-white rounded-xl md:rounded-2xl border border-slate-200/60 shadow-sm sticky bottom-3 md:bottom-4 z-30">
                        <button onClick={() => setIndeksAktif(prev => Math.max(0, prev - 1))} disabled={indeksAktif === 0} className="flex items-center gap-1 md:gap-2 bg-white border-2 border-slate-200 text-slate-600 font-bold py-2.5 px-3 md:py-3 md:px-5 rounded-lg md:rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 transition-all text-xs md:text-sm group">
                            <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            <span className="hidden sm:inline">Sebelumnya</span>
                        </button>

                        {/* 🔥 TOMBOL RAGU-RAGU DI TENGAH BAWAH */}
                        <button
                            onClick={handleToggleRagu}
                            className={`flex items-center gap-1.5 md:gap-2 border-2 font-bold py-2.5 px-4 md:py-3 md:px-6 rounded-lg md:rounded-xl transition-all text-xs md:text-sm shadow-sm ${
                                raguRagu[soalSekarang.id]
                                ? 'bg-amber-100 border-amber-400 text-amber-700 hover:bg-amber-200'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                            }`}
                        >
                            <input type="checkbox" checked={raguRagu[soalSekarang.id] || false} readOnly className="w-4 h-4 text-amber-500 focus:ring-amber-500 rounded border-slate-300" />
                            <span className="hidden sm:inline">Ragu-Ragu</span>
                            <span className="sm:hidden">Ragu</span>
                        </button>

                        {indeksAktif === dataSoal.length - 1 ? (
                            <button onClick={() => { if(confirm("Yakin ingin mengakhiri ujian? Pastikan tidak ada jawaban yang Ragu-ragu!")) { router.post(`/ujian/${sesi.id}/selesai`); } }} className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-4 md:py-3 md:px-6 rounded-lg md:rounded-xl shadow-lg shadow-emerald-200 transition-all transform hover:scale-105 active:scale-95 text-xs md:text-sm">
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Selesai
                            </button>
                        ) : (
                            <button onClick={() => setIndeksAktif(prev => Math.min(dataSoal.length - 1, prev + 1))} className="flex items-center gap-1 md:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 md:py-3 md:px-5 rounded-lg md:rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 text-xs md:text-sm group">
                                <span className="hidden sm:inline">Selanjutnya</span>
                                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="lg:w-1/4">
                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200/60 lg:sticky lg:top-28">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 md:pb-4 mb-4 md:mb-6">
                            <h3 className="font-extrabold text-base md:text-lg text-slate-800">Navigasi Soal</h3>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs bg-indigo-50 text-indigo-700 font-bold py-1 px-2.5 md:py-1.5 md:px-3 rounded-md md:rounded-lg border border-indigo-100">
                                <span>{jumlahDijawab} / {dataSoal.length}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2 md:gap-2.5">
                            {dataSoal.map((soal, index) => {
                                const j = jawabanSiswa[soal.id];
                                const sudahDijawab = j !== undefined && j !== null && (Array.isArray(j) ? j.length > 0 : typeof j === 'object' ? Object.keys(j).length > 0 : typeof j === 'string' ? j.trim() !== '' : true);
                                const sedangDibuka = indeksAktif === index;

                                // 🔥 CEK STATUS RAGU-RAGU
                                const isRagu = raguRagu[soal.id] || false;

                                // 🔥 WARNA DINAMIS NAVIGASI SOAL
                                let colorClass = 'bg-white border md:border-2 border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600'; // Default (Belum dijawab)

                                if (sedangDibuka) {
                                    colorClass = 'bg-indigo-600 border-none text-white ring-2 md:ring-4 ring-indigo-100 shadow-lg transform scale-110 z-10'; // Aktif
                                } else if (isRagu) {
                                    colorClass = 'bg-amber-100 border md:border-2 border-amber-400 text-amber-700 hover:bg-amber-500 hover:text-white'; // Ragu-ragu (Kuning/Amber)
                                } else if (sudahDijawab) {
                                    colorClass = 'bg-emerald-50 border md:border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-500 hover:text-white'; // Dijawab (Hijau)
                                }

                                return (
                                    <button key={soal.id} onClick={() => setIndeksAktif(index)} className={`w-full aspect-square flex items-center justify-center rounded-lg md:rounded-xl font-bold text-xs md:text-sm transition-all duration-300 ${colorClass}`}>
                                        {soal.no}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Legend Navigasi */}
                        <div className="mt-6 flex flex-wrap gap-3 text-[10px] sm:text-xs text-slate-500 font-medium border-t border-slate-100 pt-4">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border-2 border-slate-200 rounded-sm"></div> Belum</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-100 border-2 border-emerald-400 rounded-sm"></div> Dijawab</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 border-2 border-amber-400 rounded-sm"></div> Ragu-ragu</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- LIGHTBOX MODAL --- */}
            {showLightbox && soalSekarang.gambar && (
                <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
                    <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent z-50">
                        <div className="text-white/80 text-xs md:text-sm font-bold tracking-widest uppercase bg-black/30 px-4 py-2 rounded-full backdrop-blur-md">Pratinjau Gambar Soal</div>
                        <button onClick={() => { setShowLightbox(false); setZoomLevel(1); }} className="bg-white/10 hover:bg-rose-500 text-white rounded-full p-2.5 md:p-3 transition-colors shadow-lg"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                    </div>
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                        <img src={soalSekarang.gambar} alt="Zoom" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }} className="max-w-full max-h-full md:max-w-[80vw] md:max-h-[80vh] object-contain transition-transform duration-300 ease-out rounded-lg shadow-2xl" />
                    </div>
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-slate-800/80 backdrop-blur-md p-2 md:p-2.5 rounded-full border border-slate-600/50 z-50 shadow-2xl">
                        <button onClick={() => setZoomLevel(p => Math.max(0.5, p - 0.25))} className="p-2 md:p-3 text-white hover:bg-slate-700 rounded-full transition-colors active:scale-95"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path></svg></button>
                        <div className="flex flex-col items-center justify-center w-12 md:w-16"><span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Zoom</span><span className="text-white font-mono font-bold text-sm md:text-base leading-none">{Math.round(zoomLevel * 100)}%</span></div>
                        <button onClick={() => setZoomLevel(p => Math.min(3, p + 0.25))} className="p-2 md:p-3 text-white hover:bg-slate-700 rounded-full transition-colors active:scale-95"><svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg></button>
                    </div>
                </div>
            )}
        </div>
    );
}
