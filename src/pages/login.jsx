    import { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { FiUser, FiLock } from 'react-icons/fi';
    import Input from '../components/input';
    import Button from '../components/button';
    import Dialog from '../components/dialog';
    
    function Login() {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const navigate = useNavigate();
        const API_URL = import.meta.env.VITE_API_BASE_URL;

        const [dialogConfig, setDialogConfig] = useState({
            isOpen: false,
            type: 'default',
            title: '',
            message: ''
        });

        const handleLogin = async (e) => {
            e.preventDefault();
            setIsLoading(true);

            try {
                const response = await fetch(`${API_URL}api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                

                    setDialogConfig({
                        isOpen: true,
                        type: 'success',
                        title: 'Login',
                        message: `Selamat datang kembali, ${result.user.username}.`
                    });

                    setTimeout(() => navigate('/dashboard'), 1500);
                } else {
                    setDialogConfig({
                        isOpen: true,
                        type: 'error',
                        title: 'Login gagal',
                        message: result.message || 'Kredensial tidak valid.'
                    });
                }
            } catch (error) {
                setDialogConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Masalah Koneksi',
                    message: 'Server tidak merespon. Pastikan backend aktif.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        return (
            // Background menggunakan warna emerald SMK yang solid
            <div className="w-screen h-screen flex justify-center items-center bg-slate-900 font-sans">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white p-10 md:p-14 rounded-[2.5rem] w-full max-w-[420px] shadow-2xl mx-4"
                >
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-[900] text-slate-900 tracking-tight">
                            DAF<span className="text-emerald-500">Archive</span>
                        </h2>
                        <div className="h-1 w-12 bg-emerald-500 mx-auto mt-2 rounded-full" />
                        <p className="text-slate-400 text-[10px] tracking-[0.3em] mt-2 font-medium opacity-70">
                            DIPO ADMINISTRATIVE FILES ARCHIVE
                        </p>
                    </div>

                    {/* Form Section */}
                    <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <Input
                                icon={FiUser}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                            />
                            <Input
                                icon={FiLock}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        Sign In
                                    </span>
                                ) : 'Sign In'}
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-slate-400 text-[10px] mt-10">
                        &copy; 2026 SMK DIPONEGORO CIPARI - Digital Archive System
                    </p>
                </motion.div>

                {/* Dialog Alert */}
                <Dialog
                    isOpen={dialogConfig.isOpen}
                    onClose={() => setDialogConfig({ ...dialogConfig, isOpen: false })}
                    title={dialogConfig.title}
                    type={dialogConfig.type}
                >
                    <div className="text-center">
                        <p className="text-slate-500 mb-6">{dialogConfig.message}</p>
                        {dialogConfig.type === 'error' && (
                            <Button onClick={() => setDialogConfig({ ...dialogConfig, isOpen: false })}>
                                Coba Lagi
                            </Button>
                        )}
                    </div>
                </Dialog>
            </div>
        );
    }

    export default Login;