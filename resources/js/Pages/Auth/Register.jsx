import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus, Mail, Lock, GraduationCap, User } from 'lucide-react'; // Opsional: Tambahkan icon untuk tampilan lebih pro

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        jenjang: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            {/* --- HEADER --- */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                    <UserPlus size={24} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Buat Akun Baru
                </h2>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                    Lengkapi form di bawah ini untuk bergabung dengan platform kami.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">

                {/* --- INPUT NAME --- */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <User size={18} />
                        </div>
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1" />
                </div>

                {/* --- INPUT EMAIL --- */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Mail size={18} />
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="budi@example.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* --- INPUT JENJANG (DROPDOWN) --- */}
                <div>
                    <InputLabel htmlFor="jenjang" value="Jenjang Pendidikan" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <GraduationCap size={18} />
                        </div>
                        <select
                            id="jenjang"
                            name="jenjang"
                            value={data.jenjang}
                            onChange={(e) => setData('jenjang', e.target.value)}
                            className={`block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${!data.jenjang ? 'text-gray-500' : 'text-gray-900'}`}
                            required
                        >
                            <option value="" disabled className="text-gray-400">-- Pilih Jenjang --</option>
                            <option value="SD" className="text-gray-900">Sekolah Dasar (SD)</option>
                            <option value="SMP" className="text-gray-900">Sekolah Menengah Pertama (SMP)</option>
                            <option value="SMA" className="text-gray-900">Sekolah Menengah Atas (SMA)</option>
                            <option value="SMK" className="text-gray-900">Sekolah Menengah Kejuruan (SMK)</option>
                            <option value="UMUM" className="text-gray-900">Umum / Profesional</option>
                        </select>
                    </div>
                    <InputError message={errors.jenjang} className="mt-1" />
                </div>

                {/* --- GRID UNTUK PASSWORD (Lebih hemat ruang) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* INPUT PASSWORD */}
                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* INPUT CONFIRM PASSWORD */}
                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Ulangi Kata Sandi" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="block w-full pl-10 py-2.5 transition-all border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="Ketikan ulang"
                                required
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                {/* --- SEPARATOR --- */}
                <hr className="border-gray-200 mt-6 mb-4" />

                {/* --- ACTION BUTTONS --- */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <Link
                        href={route('login')}
                        className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    >
                        Sudah punya akun? Masuk
                    </Link>

                    <PrimaryButton
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all rounded-xl shadow-md shadow-indigo-200"
                        disabled={processing}
                    >
                        {processing ? 'Memproses...' : 'Daftar Sekarang'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
