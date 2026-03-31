import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function PersiapanUjian({ auth, ujian }) {
    // 1. State untuk menyimpan token acak yang ditampilkan di layar
    const [displayToken, setDisplayToken] = useState('');

    // 2. Helper useForm dari Inertia untuk menangani data dan pengiriman
    const { data, setData, post, processing } = useForm({
        jenis_kelamin: 'L',
        nama_peserta: '',
        tgl: '',
        bulan: '',
        tahun: '',
        token: '', // Token yang diketik oleh siswa
    });

    // 3. Fungsi Generate Token Acak 6 Karakter (Huruf Kapital)
    const handleRefreshToken = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setDisplayToken(result);
    };

    // Generate token otomatis saat halaman pertama kali dimuat
    useEffect(() => {
        handleRefreshToken();
    }, []);

    // 4. Fungsi Utama Konfirmasi & Submit
    const handleKonfirmasi = (e) => {
        e.preventDefault(); // Mencegah reload halaman

        // --- VALIDASI KETAT FRONTEND ---

        // Cek Token (Case Insensitive)
        if (data.token.toUpperCase() !== displayToken) {
            alert('TOKEN SALAH! Periksa kembali token yang tertera di sisi kiri.');
            return; // BERHENTI DI SINI: Jangan lanjut ke proses post
        }

        // Cek Nama
        if (data.nama_peserta.trim() === '') {
            alert('Silahkan ketikkan nama Anda sesuai instruksi!');
            return; // BERHENTI
        }

        // Cek Tanggal Lahir
        if (!data.tgl || !data.bulan || !data.tahun) {
            alert('Data Tanggal Lahir belum lengkap!');
            return; // BERHENTI
        }

        // --- JIKA LOLOS VALIDASI, JALANKAN PROSES BERIKUT ---

        // A. Aktifkan Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }

        // B. Kirim data ke Laravel Backend
        // Ini akan memicu method mulaiUjian di UjianController
        post(route('ujian.mulai', ujian.id), {
            onFinish: () => console.log('Request dikirim.'),
            onError: (err) => alert('Terjadi kesalahan pada server. Silakan coba lagi.')
        });
    };

    return (
        <div className="bg-white min-h-screen font-sans" style={{ paddingTop: '150px' }}>
            <Head title="Simulasi TKA - Konfirmasi Data" />

            {/* --- HEADER BIRU FIXED (STYLE PUSMENDIK / ANBK) --- */}
            <div className="container-fluid text-white" style={styles.header}>
                <div className="row px-md-5">
                    <div className="col pl-md-5 pt-1">
                        <table className="mt-2">
                            <tbody>
                                <tr>
                                    <td>
                                        <img
                                            style={{ height: '70px', margin: '5px' }}
                                            src="https://pusmendik.kemdikbud.go.id/tka/images/logo-kemdikbud-71x72.png"
                                            alt="Logo Kemdikbud"
                                        />
                                    </td>
                                    <td className="pl-2">
                                        <div className="font-weight-bold" style={{ fontSize: '18px', lineHeight: '1.2' }}>PUSMENDIK</div>
                                        <div><small>APLIKASI ANBK (CBT PRO)</small></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="col pt-1 mt-4 text-right pr-md-5">
                        <table align="right">
                            <tbody>
                                <tr>
                                    <td className="align-top pr-2">
                                        <div className="text-uppercase" style={{ fontSize: '12px' }}>
                                            {auth.user.id} - {auth.user.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="pl-1 pr-1 pt-1 pb-1" style={{ background: '#74b9ff', borderRadius: '2px', color: '#326698' }}>
                                            <i className="fa fa-graduation-cap fa-flip-horizontal"></i>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="container-fluid px-md-5 mb-5">
                <div className="row">

                    {/* BAGIAN KIRI: PANEL TOKEN */}
                    <div className="col-sm-8 mb-4">
                        <div id="formContent" className="text-left pl-5 pt-4 pb-5 shadow-sm" style={styles.cardLeft}>
                            <div className="font-weight-bold mb-4" style={{ fontSize: '22px' }}>
                                <span className="mr-3 text-secondary">
                                    Token : <span className="text-primary tracking-widest" id="token-val">{displayToken}</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleRefreshToken}
                                    className="btn btn-primary btn-sm rounded-pill px-3 shadow-sm"
                                >
                                    Refresh
                                </button>
                            </div>
                            <div className="mt-4 pr-5 text-muted" style={{ fontSize: '13px' }}>
                                <p><strong>Petunjuk:</strong> Masukkan token yang tertera di atas ke dalam kolom konfirmasi di sebelah kanan. Pastikan data diri Anda sudah sesuai.</p>
                            </div>
                        </div>
                    </div>

                    {/* BAGIAN KANAN: FORM KONFIRMASI */}
                    <div className="col-sm-4">
                        <div id="formContent" className="text-left p-4 shadow-lg" style={styles.cardRight}>
                            <div style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Konfirmasi data Peserta</div>

                            <form onSubmit={handleKonfirmasi}>
                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Kode NIK</b></label>
                                    <input type="text" className="w-100" style={styles.inputReadOnly} value={auth.user.id} readOnly />
                                </div>

                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Nama Peserta</b></label>
                                    <input type="text" className="w-100" style={styles.inputReadOnly} value={auth.user.name.toUpperCase()} readOnly />
                                </div>

                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Jenis Kelamin</b></label>
                                    <select
                                        className="form-control"
                                        style={styles.selectInput}
                                        value={data.jenis_kelamin}
                                        onChange={e => setData('jenis_kelamin', e.target.value)}
                                    >
                                        <option value="L">Laki-Laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>

                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Mata Ujian</b></label>
                                    <input type="text" className="w-100" style={styles.inputReadOnly} value={ujian.judul_ujian} readOnly />
                                </div>

                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Ketik Nama Peserta</b></label>
                                    <input
                                        type="text"
                                        className="w-100"
                                        style={styles.inputActive}
                                        placeholder="Ketik Nama Anda"
                                        required
                                        value={data.nama_peserta}
                                        onChange={e => setData('nama_peserta', e.target.value)}
                                    />
                                </div>

                                <div className="mt-2">
                                    <label style={styles.labelSmall}><b>Tanggal Lahir</b></label>
                                    <div className="input-group">
                                        <select className="form-control mr-1" style={styles.dateDropdown} onChange={e => setData('tgl', e.target.value)}>
                                            <option value="">Hari</option>
                                            {[...Array(31)].map((_, i) => <option key={i} value={i+1}>{String(i+1).padStart(2, '0')}</option>)}
                                        </select>
                                        <select className="form-control mr-1" style={styles.dateDropdown} onChange={e => setData('bulan', e.target.value)}>
                                            <option value="">Bulan</option>
                                            {['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'].map((b, i) => <option key={i} value={i+1}>{b}</option>)}
                                        </select>
                                        <select className="form-control" style={styles.dateDropdown} onChange={e => setData('tahun', e.target.value)}>
                                            <option value="">Tahun</option>
                                            {[...Array(25)].map((_, i) => <option key={i} value={2000+i}>{2000+i}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <label className="text-primary" style={styles.labelSmall}><b>Token</b></label>
                                    <input
                                        type="text"
                                        className="w-100"
                                        style={styles.inputActive}
                                        placeholder="Ketikkan token di sini"
                                        value={data.token}
                                        autoComplete="off"
                                        onChange={e => setData('token', e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-primary btn-block rounded-pill mt-5 font-weight-bold py-2 shadow-lg"
                                    style={{ background: '#326698', border: 'none' }}
                                >
                                    {processing ? 'MOHON TUNGGU...' : 'SUBMIT'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* ASSETS: BOOTSTRAP & FONT AWESOME */}
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
            <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" />
        </div>
    );
}

// --- CSS IN JS (PUSMENDIK REPLICA) ---
const styles = {
    header: {
        background: '#326698',
        backgroundImage: "url('https://pusmendik.kemdikbud.go.id/tka/images/bg-top.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left',
        backgroundSize: 'contain',
        height: '150px',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000
    },
    cardLeft: {
        borderRadius: '10px',
        background: '#fff',
        backgroundImage: "url('https://pusmendik.kemdikbud.go.id/tka/images/logo-w.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top right',
        backgroundSize: '350px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: 'none'
    },
    cardRight: {
        borderRadius: '10px',
        background: '#fff',
        backgroundImage: "url('https://pusmendik.kemdikbud.go.id/tka/images/logo-w.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top right',
        backgroundSize: '300px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        border: 'none'
    },
    labelSmall: {
        fontSize: '10px',
        display: 'block',
        marginBottom: '0px',
        color: '#555',
        textTransform: 'uppercase'
    },
    inputReadOnly: {
        border: 'none',
        borderBottom: '1px solid #eee',
        background: 'transparent',
        fontSize: '14px',
        color: '#777',
        padding: '3px 0',
        outline: 'none'
    },
    inputActive: {
        border: 'none',
        borderBottom: '1px solid #326698',
        background: 'transparent',
        fontSize: '14px',
        color: '#000',
        outline: 'none',
        padding: '3px 0'
    },
    selectInput: {
        border: 'none',
        borderBottom: '1px solid #eee',
        background: 'transparent',
        borderRadius: '0',
        paddingLeft: '0',
        fontSize: '14px',
        height: '35px',
        boxShadow: 'none'
    },
    dateDropdown: {
        backgroundColor: '#eee',
        border: 'none',
        borderRadius: '2px',
        fontSize: '12px',
        height: '35px',
        boxShadow: 'none'
    }
};
