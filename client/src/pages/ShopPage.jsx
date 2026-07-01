import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Coins, CheckCircle, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = 'http://localhost:3001';

const resolveAssetUrl = (value) => (value?.startsWith('/uploads') ? `${API_BASE}${value}` : value);
const itemSlot = (type) => {
    if (type === 'THEME') return 'THEME';
    if (type === 'MOUSE_EFFECT') return 'MOUSE_EFFECT';
    return 'PROFILE_FRAME';
};

const createShopTheme = (item) => ({
    id: `shop-theme-${item.itemId}`,
    name: item.name,
    backgroundImage: resolveAssetUrl(item.assetUrl || item.previewImage),
    colors: {
        '--t-bg': '#fff7fb',
        '--t-bg-soft': '#fff0f6',
        '--t-card': 'rgba(255, 255, 255, 0.82)',
        '--t-card-hover': 'rgba(255, 255, 255, 0.94)',
        '--t-text': '#4a2338',
        '--t-text-soft': '#85516b',
        '--t-muted': '#b08098',
        '--t-accent': '#ec4899',
        '--t-accent-soft': 'rgba(236, 72, 153, 0.14)',
        '--t-accent-hover': '#db2777',
        '--t-border': 'rgba(236, 72, 153, 0.16)',
    },
});

export default function ShopPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { registerTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [ownedItemIds, setOwnedItemIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const [equippedItems, setEquippedItems] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return {
                THEME: Number(user.equipped_theme_id) || null,
                MOUSE_EFFECT: Number(user.equipped_mouse_effect_id) || null,
                PROFILE_FRAME: Number(user.equipped_profile_frame_id) || null,
            };
        } catch {
            return {};
        }
    });

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    const categories = [
        { id: 'all', name: t('shop.categories.all', 'ทั้งหมด') },
        { id: 'themes', name: t('shop.categories.themes', 'ธีม') },
        { id: 'avatars', name: t('shop.categories.avatars', 'อวาตาร์') },
        { id: 'effects', name: t('shop.categories.effects', 'เอฟเฟกต์') },
    ];

    const rarityColors = {
        common: 'text-pysim-on-surface-variant',
        rare: 'text-pysim-primary',
        epic: 'text-purple-600',
        legendary: 'text-pysim-secondary',
    };

    const normalizePreviewData = (value) => {
        if (!value) return null;
        if (typeof value === 'object') return value;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    };

    const getCategoryFromType = (type) => {
        if (type === 'MOUSE_EFFECT') return 'effects';
        if (type === 'PROFILE_FRAME' || type === 'PROFILE_BACKGROUND') return 'avatars';
        return 'themes';
    };

    const getIconFromItem = (item) => {
        const imageUrl = item.preview_image || item.asset_url;
        if (typeof imageUrl === 'string' && imageUrl.trim()) {
            return { type: 'image', value: imageUrl };
        }

        const preview = normalizePreviewData(item.preview_data);
        if (preview?.css_class) {
            const labelByTheme = {
                'theme-default': 'Py',
                'theme-neon-cyberpunk': 'NE',
                'theme-hacker': '</>',
            };
            return { type: 'text', value: labelByTheme[preview.css_class] || 'Aa' };
        }
        if (preview?.border) {
            return { type: 'text', value: '[]' };
        }

        const firstEffect = Array.isArray(preview) ? preview[0] : null;
        const visual = firstEffect?.visual || preview?.visual || preview?.icon || preview?.effect;

        if (typeof visual === 'string' && visual.trim()) {
            if (visual.startsWith('http') || visual.startsWith('/uploads')) {
                return { type: 'image', value: visual };
            }
            return { type: 'text', value: visual };
        }

        if (item.type === 'MOUSE_EFFECT') return { type: 'text', value: '*' };
        if (item.type === 'PROFILE_FRAME' || item.type === 'PROFILE_BACKGROUND') return { type: 'text', value: '[]' };
        return { type: 'text', value: '#' };
    };

    const fetchShop = async () => {
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const [itemsRes, inventoryRes] = await Promise.all([
                fetch(`${API_BASE}/shop/items`),
                user?.user_id && !user?.isGuest
                    ? fetch(`${API_BASE}/shop/inventory/${user.user_id}`)
                    : Promise.resolve(null),
            ]);

            if (!itemsRes.ok) throw new Error('โหลดสินค้าไม่สำเร็จ');
            const shopItems = await itemsRes.json();
            const inventoryItems = inventoryRes && inventoryRes.ok ? await inventoryRes.json() : [];
            const ownedIds = new Set((Array.isArray(inventoryItems) ? inventoryItems : []).map((item) => Number(item.item_id)));

            setOwnedItemIds(ownedIds);
            setItems((Array.isArray(shopItems) ? shopItems : []).map((item) => ({
                id: Number(item.item_id),
                itemId: Number(item.item_id),
                name: item.name,
                category: getCategoryFromType(item.type),
                type: item.type,
                price: Number(item.price || 0),
                assetUrl: item.asset_url || '',
                previewImage: item.preview_image || '',
                icon: getIconFromItem(item),
                effectData: normalizePreviewData(item.preview_data),
                rarity: String(item.rarity || 'common').toLowerCase(),
                owned: ownedIds.has(Number(item.item_id)),
            })));
        } catch (err) {
            setError(err.message || 'โหลดสินค้าไม่สำเร็จ');
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShop();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleBuy = async (item) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.user_id || user?.isGuest) {
            alert('กรุณาเข้าสู่ระบบก่อนซื้อสินค้า');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id, itemId: item.itemId }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'ซื้อสินค้าไม่สำเร็จ');
                return;
            }

            const nextOwned = new Set(ownedItemIds);
            nextOwned.add(item.itemId);
            setOwnedItemIds(nextOwned);
            setItems((current) => current.map((entry) => (
                entry.itemId === item.itemId ? { ...entry, owned: true } : entry
            )));
        } catch {
            alert('เชื่อมต่อร้านค้าไม่สำเร็จ');
        }
    };

    const handleEquip = async (item) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.user_id || user?.isGuest) return;

        try {
            const res = await fetch(`${API_BASE}/shop/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id, itemId: item.itemId, type: item.type }),
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || 'Unable to equip item');
                return;
            }

            const slot = itemSlot(item.type);
            const nextUser = { ...user };
            if (slot === 'THEME') {
                nextUser.equipped_theme_id = item.itemId;
                nextUser.theme_asset_url = item.assetUrl || item.previewImage;
                const theme = createShopTheme(item);
                registerTheme(theme);
                window.setTimeout(() => setTheme(theme.id), 0);
            } else if (slot === 'MOUSE_EFFECT') {
                nextUser.equipped_mouse_effect_id = item.itemId;
                nextUser.mouse_effect_data = item.effectData;
                window.dispatchEvent(new CustomEvent('pysim:mouse-effect-equipped', {
                    detail: { effects: item.effectData },
                }));
            } else {
                nextUser.equipped_profile_frame_id = item.itemId;
                nextUser.profile_asset_url = item.assetUrl || item.previewImage;
            }
            localStorage.setItem('user', JSON.stringify(nextUser));
            setEquippedItems((current) => ({ ...current, [slot]: item.itemId }));
            window.dispatchEvent(new CustomEvent('pysim:user-cosmetic-equipped', {
                detail: { user: nextUser },
            }));
        } catch {
            alert('Unable to equip item');
        }
    };

    const handleUnequip = async (item) => {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.user_id || user?.isGuest) return;

        try {
            const res = await fetch(`${API_BASE}/shop/equip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id, itemId: null, type: item.type }),
            });
            if (!res.ok) return;

            const slot = itemSlot(item.type);
            const nextUser = { ...user };
            if (slot === 'THEME') {
                nextUser.equipped_theme_id = null;
                nextUser.theme_asset_url = '';
                setTheme('cyberpunk-light');
            } else if (slot === 'MOUSE_EFFECT') {
                nextUser.equipped_mouse_effect_id = null;
                nextUser.mouse_effect_data = [];
                window.dispatchEvent(new CustomEvent('pysim:mouse-effect-equipped', {
                    detail: { effects: [] },
                }));
            } else {
                nextUser.equipped_profile_frame_id = null;
                nextUser.profile_asset_url = '';
            }
            localStorage.setItem('user', JSON.stringify(nextUser));
            setEquippedItems((current) => ({ ...current, [slot]: null }));
            window.dispatchEvent(new CustomEvent('pysim:user-cosmetic-equipped', {
                detail: { user: nextUser },
            }));
        } catch {
            // The visual state remains unchanged if the request cannot be completed.
        }
    };

    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pysim-secondary-container/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] bg-pysim-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className={`mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <ShoppingBag size={20} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-pysim-on-surface tracking-tight">{t('shop.title', 'Theme Store')}</h1>
                    </div>
                    <p className="text-pysim-on-surface-variant ml-[52px]">{t('shop.subtitle', 'ปรับแต่งประสบการณ์ของคุณ')}</p>
                </div>

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

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="py-16 text-center text-sm font-semibold text-pysim-outline">
                        กำลังโหลดสินค้า...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item, index) => (
                            <div key={item.id}
                                onMouseEnter={() => setHoveredItemId(item.id)}
                                onMouseLeave={() => setHoveredItemId(null)}
                                className={`bg-white rounded-xl whisper-shadow hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group
                                    ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${200 + index * 80}ms` }}>
                                <div className="h-40 bg-pysim-surface-low flex items-center justify-center relative">
                                    {item.icon.type === 'image' ? (
                                        <img
                                            src={item.icon.value.startsWith('/uploads') ? `${API_BASE}${item.icon.value}` : item.icon.value}
                                            alt={item.name}
                                            className={item.type === 'THEME'
                                                ? 'h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                                                : 'h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-300'}
                                        />
                                    ) : (
                                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon.value}</span>
                                    )}
                                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/80 backdrop-blur-sm ${rarityColors[item.rarity] || rarityColors.common}`}>
                                        {item.rarity}
                                    </span>
                                </div>

                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-pysim-on-surface mb-1">{item.name}</h3>
                                    <div className="relative mt-4 h-10">
                                        <div className={`absolute inset-0 items-center gap-1.5 ${hoveredItemId === item.id && !item.owned ? 'hidden' : 'flex'}`}>
                                            <Coins size={16} className="text-pysim-secondary-container" />
                                            <span className="font-bold text-pysim-secondary text-sm">{item.price}</span>
                                        </div>
                                        {item.owned ? (
                                            <>
                                            <span
                                                role={item.type === 'MOUSE_EFFECT' ? 'button' : undefined}
                                                tabIndex={item.type === 'MOUSE_EFFECT' ? 0 : undefined}
                                                title={item.type === 'MOUSE_EFFECT' ? 'Equip mouse effect' : undefined}
                                                onClick={() => item.type === 'MOUSE_EFFECT' && handleEquip(item)}
                                                onKeyDown={(event) => {
                                                    if (item.type === 'MOUSE_EFFECT' && (event.key === 'Enter' || event.key === ' ')) handleEquip(item);
                                                }}
                                                className={`absolute inset-0 flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${item.type === 'MOUSE_EFFECT' ? 'cursor-pointer bg-sky-400 text-white hover:bg-sky-500' : 'bg-emerald-50 text-emerald-600'}`}
                                            >
                                                <CheckCircle size={16} /> {t('shop.owned', 'มีแล้ว')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleEquip(item)}
                                                className={`absolute inset-0 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-colors ${equippedItems[itemSlot(item.type)] === item.itemId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-sky-400 hover:bg-sky-500'}`}
                                            >
                                                <CheckCircle size={17} /> {equippedItems[itemSlot(item.type)] === item.itemId ? 'กำลังสวมใส่' : 'สวมใส่'}
                                            </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleBuy(item)}
                                                className={`absolute inset-0 w-full items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-500 active:scale-[0.98] ${hoveredItemId === item.id ? 'flex' : 'hidden'}`}
                                            >
                                                <ShoppingCart size={17} />
                                                {t('shop.buy', 'ซื้อ')}
                                            </button>
                                        )}
                                    </div>
                                    {item.owned && equippedItems[itemSlot(item.type)] === item.itemId && (
                                        <button
                                            type="button"
                                            onClick={() => handleUnequip(item)}
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            ถอดออก
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate('/menu')}
                    className={`mt-10 text-pysim-outline hover:text-pysim-primary text-sm font-bold transition-colors uppercase tracking-widest ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('shop.back', 'กลับหน้าหลัก')}
                </button>
            </div>
        </div>
    );
}
