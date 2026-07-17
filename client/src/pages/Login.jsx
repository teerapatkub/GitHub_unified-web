import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Code, Cpu, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 100);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isRegister ? '/register' : '/login';
        try {
            const res = await axios.post(`http://localhost:3001${endpoint}`, formData);
            if (res.data.success) {
                if (!isRegister) {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    navigate('/menu');
                } else {
                    alert('ลงทะเบียนสำเร็จ! กรุณาล็อคอิน');
                    setIsRegister(false);
                }
            }
        } catch (err) {
            setError('ชื่อผู้ใช้ซ้ำ หรือ รหัสผ่านผิดพลาด!');
        }
    };

    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            {/* Background Artwork */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pysim-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-pysim-secondary-container/10 rounded-full blur-[100px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#145d91 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                {/* Decorative Code */}
                <div className="absolute bottom-10 right-10 opacity-10 flex flex-col gap-2 font-mono text-xs text-pysim-primary text-right">
                    <span>class Developer:</span>
                    <span className="pl-4">def __init__(self):</span>
                    <span className="pl-8">self.skills = []</span>
                    <span className="pl-8">self.ready = True</span>
                </div>
            </div>

            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">

            {/* Login Card */}
            <div className={`bg-white rounded-xl whisper-shadow p-8 w-full max-w-md relative z-10 transition-all duration-700 border border-pysim-outline-variant/10
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* Top gradient accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] python-gradient rounded-full"></div>
                
                {/* Brand */}
                <div className="flex flex-col items-center mb-8 pt-4">
                    <div className="w-16 h-16 rounded-lg python-gradient flex items-center justify-center mb-4 whisper-shadow">
                        <Code size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-pysim-on-surface tracking-tighter uppercase">
                        {isRegister ? 'New Scholar' : 'PySim OS'}
                    </h1>
                    <p className="text-pysim-on-surface-variant text-sm mt-1">
                        {isRegister ? 'สร้างบัญชีเพื่อเริ่มเขียนโค้ด' : 'ยินดีต้อนรับกลับสู่โลก Developer'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-pysim-primary text-xs font-bold mb-2 tracking-widest uppercase">USERNAME</label>
                        <div className="flex items-center bg-pysim-surface-low rounded-lg px-4 py-3 
                            focus-within:ring-2 focus-within:ring-pysim-primary/20 transition-all duration-300">
                            <Code size={18} className="text-pysim-outline mr-3 flex-shrink-0" />
                            <input type="text" name="username"
                                className="bg-transparent w-full text-pysim-on-surface focus:outline-none text-sm placeholder-pysim-outline"
                                placeholder="DevName101" onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label className="block text-pysim-primary text-xs font-bold mb-2 tracking-widest uppercase">PASSWORD</label>
                        <div className="flex items-center bg-pysim-surface-low rounded-lg px-4 py-3
                            focus-within:ring-2 focus-within:ring-pysim-primary/20 transition-all duration-300">
                            <Cpu size={18} className="text-pysim-outline mr-3 flex-shrink-0" />
                            <input type="password" name="password"
                                className="bg-transparent w-full text-pysim-on-surface focus:outline-none text-sm placeholder-pysim-outline"
                                placeholder="••••••••" onChange={handleChange} required />
                        </div>
                    </div>

                    {error && (
                        <div className="text-pysim-error text-sm font-medium bg-pysim-error-container p-3 rounded-lg flex items-center gap-2 animate-scale-in">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <button type="submit"
                        className="w-full relative overflow-hidden python-gradient
                            text-white font-bold py-3.5 rounded-lg transition-all duration-300 uppercase tracking-wider text-sm
                            hover:shadow-lg hover:shadow-pysim-primary/20 active:scale-[0.98]">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <Sparkles size={16} />
                            {isRegister ? 'Register' : 'Access System'}
                        </span>
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={() => setIsRegister(!isRegister)}
                        className="text-pysim-on-surface-variant hover:text-pysim-primary text-sm transition-colors duration-300">
                        {isRegister ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}