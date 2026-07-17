import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Coins, CheckCircle, Search, SlidersHorizontal, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ShopPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
    
    const categories = [
        { id: 'all', name: t('shop.categories.all', 'ทั้งหมด') },
        { id: 'themes', name: t('shop.categories.themes', 'ธีม') },
        { id: 'avatars', name: t('shop.categories.avatars', 'อวาตาร์') },
        { id: 'effects', name: t('shop.categories.effects', 'เอฟเฟกต์') },
    ];
    
    const items = [
        { id: 1, name: 'Ocean Theme', category: 'themes', price: 500, icon: '🌊', rarity: 'rare', owned: false },
        { id: 2, name: 'Sakura Theme', category: 'themes', price: 750, icon: '🌸', rarity: 'epic', owned: false },
        { id: 3, name: 'Cyber Cat', category: 'avatars', price: 300, icon: '🐱', rarity: 'common', owned: true },
        { id: 4, name: 'Code Ninja', category: 'avatars', price: 450, icon: '🥷', rarity: 'rare', owned: false },
        { id: 5, name: 'Golden Trail', category: 'effects', price: 1000, icon: '✨', rarity: 'legendary', owned: false },
        { id: 6, name: 'Matrix Rain', category: 'effects', price: 600, icon: '💚', rarity: 'rare', owned: false },
    ];
    
    const rarityColors = {
        common: 'text-pysim-on-surface-variant',
        rare: 'text-pysim-primary',
        epic: 'text-purple-600',
        legendary: 'text-pysim-secondary',
    };
    
    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pysim-secondary-container/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] bg-pysim-primary/5 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">
                {/* Header */}
                <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <ShoppingBag size={20} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-pysim-on-surface tracking-tight">{t('shop.title', 'Theme Store')}</h1>
                    </div>
                    <p className="text-pysim-on-surface-variant ml-[52px]">{t('shop.subtitle', 'ปรับแต่งประสบการณ์ของคุณ')}</p>
                </div>
                
                {/* Filters & Search */}
                <div className={`flex flex-col md:flex-row gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                                    selectedCategory === cat.id 
                                        ? 'python-gradient text-white' 
                                        : 'bg-white text-pysim-on-surface-variant hover:bg-pysim-surface-low whisper-shadow'
                                }`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 md:max-w-xs ml-auto">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pysim-outline" />
                            <input type="text" placeholder={t('shop.search', 'ค้นหา...')}
                                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-lg text-sm text-pysim-on-surface focus:outline-none focus:ring-2 focus:ring-pysim-primary/20 whisper-shadow placeholder-pysim-outline"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
                
                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item, index) => (
                        <div key={item.id}
                            className={`bg-white rounded-xl whisper-shadow hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group
                                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            style={{ transitionDelay: `${200 + index * 80}ms` }}>
                            {/* Item Preview */}
                            <div className="h-40 bg-pysim-surface-low flex items-center justify-center relative">
                                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                                <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/80 backdrop-blur-sm ${rarityColors[item.rarity]}`}>
                                    {item.rarity}
                                </span>
                            </div>
                            {/* Item Info */}
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-pysim-on-surface mb-1">{item.name}</h3>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1.5">
                                        <Coins size={16} className="text-pysim-secondary-container" />
                                        <span className="font-bold text-pysim-secondary text-sm">{item.price}</span>
                                    </div>
                                    {item.owned ? (
                                        <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                                            <CheckCircle size={16} /> {t('shop.owned', 'มีแล้ว')}
                                        </span>
                                    ) : (
                                        <button className="px-5 py-2 python-gradient text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95">
                                            {t('shop.buy', 'ซื้อ')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Back Button */}
                <button onClick={() => navigate('/menu')}
                    className={`mt-10 text-pysim-outline hover:text-pysim-primary text-sm font-bold transition-colors uppercase tracking-widest ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('shop.back', 'กลับหน้าหลัก')}
                </button>
            </div>
        </div>
    );
}