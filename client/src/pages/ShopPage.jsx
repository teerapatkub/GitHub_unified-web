import { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Coins, CheckCircle, Search, Palette, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickLocalized } from '../utils/problemText';
import { toast, friendlyError } from '../components/ui/toast.js';
import { useTheme } from '../contexts/useTheme.js';
import { API_BASE, assetUrl } from '../config/api.js';
import { applyCosmetic, createShopTheme, itemSlot } from '../shop/equipCosmetic.js';
import SkeletonLoading from '../components/ui/Skeleton.jsx';
import PurchaseSuccessPopup from '../components/shop/PurchaseSuccessPopup.jsx';
import CosmeticTryButton from '../components/shop/CosmeticTryButton.jsx';
import PurchaseConfirmDialog from '../components/shop/PurchaseConfirmDialog.jsx';


export default function ShopPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const lang = i18n.language === 'en' ? 'en' : 'th';
    // A cosmetic's name on screen: English when it has one, Thai otherwise (fix
    // list item 16.10). `name` stays Thai: themes are matched by keyword in it.
    const shownName = (item) => pickLocalized(lang, item?.nameEn ?? item?.name_en, item?.name);
    // Prices reach five digits since fix list item 8; 15200 is hard to read.
    const coins = (value) => Number(value || 0).toLocaleString(lang === 'en' ? 'en-US' : 'th-TH');
    const { registerTheme, setTheme } = useTheme();
    // registerTheme changes identity whenever the signed-in user resolves, and
    // fetchShop depended on it, so the shop loaded items/inventory/sets three
    // times on every visit (Spec 0005 #12). Read it through a ref instead.
    const registerThemeRef = useRef(registerTheme);
    useEffect(() => { registerThemeRef.current = registerTheme; }, [registerTheme]);
    const [mounted, setMounted] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    // Owned or not is the first thing a returning shopper wants to sort by.
    const [ownership, setOwnership] = useState('all');
    const readWallet = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return Number(user.virtual_currency ?? user.coins ?? 0);
        } catch {
            return 0;
        }
    };
    const [wallet, setWallet] = useState(readWallet);
    // What the confirm dialog is asking about; nothing is bought until it is
    // confirmed (UI review 2026-11-18, P1).
    const [pendingPurchase, setPendingPurchase] = useState(null);
    const [items, setItems] = useState([]);
    const [ownedItemIds, setOwnedItemIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sets, setSets] = useState([]);
    const [buyingSet, setBuyingSet] = useState('');
    const [buyingItemId, setBuyingItemId] = useState(null);
    const [purchaseNotice, setPurchaseNotice] = useState(null);
    const purchaseBusyRef = useRef(false);
    const purchaseSequenceRef = useRef(0);
    const [equippedItems, setEquippedItems] = useState(() => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return {
                THEME: Number(user.equipped_theme_id) || null,
                MOUSE_EFFECT: Number(user.equipped_mouse_effect_id) || null,
                PROFILE_FRAME: Number(user.equipped_profile_frame_id) || null,
                PICTURE_URL: user.avatar?.url || '',
            };
        } catch {
            return {};
        }
    });
    // Is this item the one being worn? A profile picture is not an equipped_*
    // column - it is whatever the user's avatar resolves to (docs/adr 0002) -
    // so it is matched by the picture's address instead of by id.
    const isInUse = (item) => (item.type === 'PROFILE_PICTURE'
        ? Boolean(equippedItems.PICTURE_URL) && equippedItems.PICTURE_URL === item.assetUrl
        : equippedItems[itemSlot(item.type)] === item.itemId);

    useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

    useEffect(() => {
        if (!purchaseNotice) return undefined;
        const timeout = window.setTimeout(() => setPurchaseNotice(null), 6000);
        return () => window.clearTimeout(timeout);
    }, [purchaseNotice]);

    const showPurchaseSuccess = (details) => {
        purchaseSequenceRef.current += 1;
        setPurchaseNotice({ id: purchaseSequenceRef.current, ...details });
    };

    useEffect(() => {
        const syncEquippedFromUser = (user) => {
            if (!user) return;
            setEquippedItems({
                THEME: Number(user.equipped_theme_id) || null,
                MOUSE_EFFECT: Number(user.equipped_mouse_effect_id) || null,
                PROFILE_FRAME: Number(user.equipped_profile_frame_id) || null,
                PICTURE_URL: user.avatar?.url || '',
            });
        };

        const onUserUpdated = (event) => {
            syncEquippedFromUser(event.detail?.user);
            const balance = event.detail?.user?.virtual_currency;
            if (balance !== undefined) setWallet(Number(balance));
        };
        window.addEventListener('pysim:user-updated', onUserUpdated);
        window.addEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
        return () => {
            window.removeEventListener('pysim:user-updated', onUserUpdated);
            window.removeEventListener('pysim:user-cosmetic-equipped', onUserUpdated);
        };
    }, []);

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
        if (type === 'PROFILE_FRAME' || type === 'PROFILE_BACKGROUND' || type === 'PROFILE_PICTURE') return 'avatars';
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

    const fetchShop = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const setsUrl = user?.user_id && !user?.isGuest
                ? `${API_BASE}/api/shop/sets?userId=${user.user_id}`
                : `${API_BASE}/api/shop/sets`;
            const [itemsRes, inventoryRes, setsRes] = await Promise.all([
                fetch(`${API_BASE}/api/shop/items`),
                user?.user_id && !user?.isGuest
                    ? fetch(`${API_BASE}/api/shop/inventory/${user.user_id}`)
                    : Promise.resolve(null),
                fetch(setsUrl),
            ]);

            if (!itemsRes.ok) throw new Error(t('shop.loadFailed', 'โหลดสินค้าไม่สำเร็จ'));
            const shopItems = await itemsRes.json();
            const inventoryItems = inventoryRes && inventoryRes.ok ? await inventoryRes.json() : [];
            const ownedIds = new Set((Array.isArray(inventoryItems) ? inventoryItems : []).map((item) => Number(item.item_id)));

            const nextItems = (Array.isArray(shopItems) ? shopItems : []).map((item) => ({
                id: Number(item.item_id),
                itemId: Number(item.item_id),
                name: item.name,
                nameEn: item.name_en || '',
                category: getCategoryFromType(item.type),
                type: item.type,
                price: Number(item.price || 0),
                assetUrl: item.asset_url || '',
                previewImage: item.preview_image || '',
                icon: getIconFromItem(item),
                effectData: normalizePreviewData(item.preview_data),
                rarity: String(item.rarity || 'common').toLowerCase(),
                owned: ownedIds.has(Number(item.item_id)),
            }));

            setOwnedItemIds(ownedIds);
            setItems(nextItems);
            setSets(setsRes && setsRes.ok ? await setsRes.json() : []);

            const equippedThemeId = Number(user?.equipped_theme_id || 0);
            const equippedTheme = nextItems.find((item) => item.type === 'THEME' && item.itemId === equippedThemeId);
            if (equippedTheme) {
                registerThemeRef.current(createShopTheme(equippedTheme));
            }
        } catch (err) {
            setError(err.message || t('shop.loadFailed', 'โหลดสินค้าไม่สำเร็จ'));
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShop();
    }, [fetchShop]);

    const inCategory = items.filter(item => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const query = searchTerm.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(query) || String(item.nameEn || '').toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    const ownershipCounts = {
        all: inCategory.length,
        missing: inCategory.filter((item) => !item.owned).length,
        owned: inCategory.filter((item) => item.owned).length,
    };
    const filteredItems = inCategory.filter((item) => (
        ownership === 'all' || (ownership === 'owned' ? item.owned : !item.owned)
    ));
    // Sets you can still buy come first; finished ones sink to the bottom, and
    // the "owned" view has no sets at all - there is nothing left to buy there.
    const visibleSets = ownership === 'owned' ? [] : [...sets]
        .filter((set) => ownership === 'all' || !set.fully_owned)
        .sort((a, b) => Number(a.fully_owned) - Number(b.fully_owned));
    const ownershipTabs = [
        { id: 'all', label: t('shop.ownership.all', 'ทั้งหมด') },
        { id: 'missing', label: t('shop.ownership.missing', 'ยังไม่มี') },
        { id: 'owned', label: t('shop.ownership.owned', 'มีแล้ว') },
    ];

    const handleBuy = async (item) => {
        if (purchaseBusyRef.current) return;
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.user_id || user?.isGuest) {
            toast(t('shop.signInToBuy', 'กรุณาเข้าสู่ระบบก่อนซื้อสินค้า'));
            return;
        }

        purchaseBusyRef.current = true;
        setBuyingItemId(item.itemId);
        try {
            const res = await fetch(`${API_BASE}/api/shop/buy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id, itemId: item.itemId }),
            });
            const data = await res.json();
            if (!res.ok || data.success !== true) {
                toast(friendlyError(data.error, t('shop.buyFailed', 'ซื้อสินค้าไม่สำเร็จ'), lang));
                return;
            }

            const nextOwned = new Set(ownedItemIds);
            nextOwned.add(item.itemId);
            setOwnedItemIds(nextOwned);
            setItems((current) => current.map((entry) => (
                entry.itemId === item.itemId ? { ...entry, owned: true } : entry
            )));
            if (data.virtual_currency !== undefined) {
                const nextUser = {
                    ...user,
                    virtual_currency: Number(data.virtual_currency),
                    coins: Number(data.virtual_currency),
                };
                localStorage.setItem('user', JSON.stringify(nextUser));
                window.dispatchEvent(new CustomEvent('pysim:user-updated', {
                    detail: { user: nextUser },
                }));
            }
            showPurchaseSuccess({
                kind: 'item',
                name: shownName(item),
                image: item.icon.type === 'image' ? item.icon.value : '',
                icon: item.icon.type === 'text' ? item.icon.value : '',
            });
        } catch {
            toast(t('shop.connectionFailed', 'เชื่อมต่อร้านค้าไม่สำเร็จ'));
        } finally {
            purchaseBusyRef.current = false;
            setBuyingItemId(null);
        }
    };

    const handleBuySet = async (set) => {
        if (purchaseBusyRef.current) return;
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (!user?.user_id || user?.isGuest) {
            toast(t('shop.signInToBuy', 'กรุณาเข้าสู่ระบบก่อนซื้อสินค้า'));
            return;
        }

        purchaseBusyRef.current = true;
        setBuyingSet(set.set_key);
        try {
            const res = await fetch(`${API_BASE}/api/shop/buy-set`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.user_id, setKey: set.set_key }),
            });
            const data = await res.json();
            if (!res.ok || data.success !== true) {
                toast(friendlyError(data.error, t('shop.buySetFailed', 'ซื้อเซ็ตไม่สำเร็จ'), lang));
                return;
            }

            if (data.virtual_currency !== undefined) {
                const nextUser = {
                    ...user,
                    virtual_currency: Number(data.virtual_currency),
                    coins: Number(data.virtual_currency),
                };
                localStorage.setItem('user', JSON.stringify(nextUser));
                window.dispatchEvent(new CustomEvent('pysim:user-updated', { detail: { user: nextUser } }));
            }
            // Re-reads items, inventory and sets in one go, so the item grid and the
            // set cards agree about what is owned without hand-patching both.
            await fetchShop();
            showPurchaseSuccess({
                kind: 'set',
                name: pickLocalized(lang, set.name_en, set.name_th),
                image: set.items.find((item) => item.asset_url)?.asset_url || '',
            });
        } catch {
            toast(t('shop.connectionFailed', 'เชื่อมต่อร้านค้าไม่สำเร็จ'));
        } finally {
            purchaseBusyRef.current = false;
            setBuyingSet('');
        }
    };

    // Equipping goes through shop/equipCosmetic.js, shared with the
    // appearance page so the two can never disagree about what "worn" means.
    const handleEquip = async (item) => {
        try {
            const result = await applyCosmetic({ type: item.type, item, registerTheme, setTheme });
            if (!result.ok) {
                if (result.error !== 'signin') toast(friendlyError(result.error, t('shop.equipFailed', 'สวมใส่ไม่สำเร็จ ลองอีกครั้ง'), lang));
                return;
            }
            setEquippedItems((current) => (item.type === 'PROFILE_PICTURE'
                ? { ...current, PICTURE_URL: result.user?.avatar?.url || item.assetUrl }
                : { ...current, [itemSlot(item.type)]: item.itemId }));
        } catch {
            toast(t('shop.equipFailed', 'สวมใส่ไม่สำเร็จ ลองอีกครั้ง'));
        }
    };

    const handleUnequip = async (item) => {
        try {
            const result = await applyCosmetic({ type: item.type, item: null, registerTheme, setTheme });
            if (result.ok) setEquippedItems((current) => ({ ...current, [itemSlot(item.type)]: null }));
        } catch {
            toast(t('shop.unequipFailed', 'ถอดออกไม่สำเร็จ ลองอีกครั้ง'));
        }
    };

    return (
        <div className="min-h-screen bg-pysim-surface relative overflow-y-auto">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-pysim-secondary-container/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -left-48 w-[500px] h-[500px] bg-pysim-primary/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8">
                <div className={`on-art on-art-block mb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 python-gradient rounded-lg flex items-center justify-center">
                            <ShoppingBag size={20} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-pysim-on-surface tracking-tight">{t('shop.title', 'Theme Store')}</h1>
                    </div>
                    <div className="ml-[52px] flex flex-wrap items-center justify-between gap-3">
                        <p className="text-pysim-on-surface-variant">{t('shop.subtitle', 'ปรับแต่งประสบการณ์ของคุณ')}</p>
                        <button type="button" onClick={() => navigate('/profile/appearance')}
                            className="inline-flex items-center gap-2 rounded-lg border border-pysim-primary/30 bg-white px-4 py-2 text-sm font-bold text-pysim-primary whisper-shadow transition-colors hover:bg-pysim-primary/10">
                            <Palette size={16} /> {t('shop.openWardrobe', 'แต่งโปรไฟล์ด้วยของที่มี')}
                        </button>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row gap-4 mb-8 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar md:flex-wrap md:overflow-visible">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                                className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                                    selectedCategory === cat.id
                                        ? 'python-gradient text-white'
                                        : 'bg-white text-pysim-on-surface-variant hover:bg-pysim-surface-low whisper-shadow'
                                }`}>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <div className="order-first flex-1 md:order-none md:ml-auto md:max-w-xs">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pysim-outline" />
                            <input type="search" aria-label={t('shop.searchLabel', 'ค้นหาสินค้าในร้าน')} placeholder={t('shop.search', 'ค้นหา...')}
                                className="w-full bg-white pl-10 pr-4 py-2.5 rounded-lg text-sm text-pysim-on-surface focus:outline-none focus:ring-2 focus:ring-pysim-primary/20 whisper-shadow placeholder-pysim-outline"
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div role="tablist" aria-label={t('shop.ownership.label', 'แสดงตามการเป็นเจ้าของ')} className={`-mt-4 mb-8 inline-flex rounded-xl bg-white p-1 whisper-shadow transition-all duration-700 delay-100 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    {ownershipTabs.map((tab) => (
                        <button key={tab.id} type="button" role="tab" aria-selected={ownership === tab.id}
                            onClick={() => setOwnership(tab.id)}
                            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${ownership === tab.id ? 'bg-pysim-primary text-white' : 'text-pysim-on-surface-variant hover:bg-pysim-surface-low'}`}>
                            {tab.label}
                            <span className={`ml-1.5 rounded-full px-1.5 text-xs ${ownership === tab.id ? 'bg-white/25' : 'bg-pysim-surface-low'}`}>{ownershipCounts[tab.id]}</span>
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                        {error}
                    </div>
                )}

                {!loading && visibleSets.length > 0 && selectedCategory === 'all' && !searchTerm && (
                    <div className={`mb-12 transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="on-art flex w-fit flex-wrap items-baseline gap-x-3 mb-4">
                            <h2 className="text-2xl font-black text-pysim-on-surface">{t('shop.setsTitle', 'เซ็ตธีม')}</h2>
                            <p className="text-sm text-pysim-on-surface-variant">{t('shop.setsSubtitle', 'ซื้อยกเซ็ตถูกกว่าเลือกทีละชิ้น')}</p>
                        </div>

                        {/* A swipe row on a phone: nine set cards stacked made the shop
                            about 18 screens tall (UI review 2026-11-18, P3). */}
                        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
                            {visibleSets.map((set) => (
                                <div key={set.set_key}
                                    className={`w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-auto bg-white rounded-xl whisper-shadow overflow-hidden flex flex-col ${set.fully_owned ? 'ring-2 ring-pysim-success-strong/40' : ''}`}>
                                    <div className="px-6 pt-5 pb-4 border-b border-pysim-outline/10">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-xl font-black text-pysim-on-surface">{pickLocalized(lang, set.name_en, set.name_th)}</h3>
                                                <p className="mt-1 text-sm text-pysim-on-surface-variant">{pickLocalized(lang, set.description_en, set.description_th)}</p>
                                            </div>
                                            {set.fully_owned ? (
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-pysim-success-strong px-3 py-1.5 text-xs font-black text-white">
                                                    <CheckCircle size={14} /> {t('shop.setComplete', 'มีครบแล้ว')}
                                                </span>
                                            ) : (
                                                <div className="flex shrink-0 flex-col items-end gap-1.5">
                                                    {set.savings > 0 && (
                                                        <span className="rounded-lg bg-pysim-primary/10 px-3 py-1.5 text-xs font-black text-pysim-primary">
                                                            {t('shop.save', 'ประหยัด')} {coins(set.savings)}
                                                        </span>
                                                    )}
                                                    {set.owned_count > 0 && (
                                                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-label font-bold text-emerald-700">
                                                            {t('shop.ownedOf', { owned: set.owned_count, total: set.items.length, defaultValue: 'มีแล้ว {{owned}}/{{total}} ชิ้น' })}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 px-6 py-5">
                                        {set.items.map((item) => (
                                            <div key={item.item_id} className="text-center">
                                                <div className="relative h-24 rounded-lg bg-pysim-surface-low flex items-center justify-center overflow-hidden">
                                                    {item.asset_url ? (
                                                        <img src={item.asset_url} alt={shownName(item)}
                                                            className={item.type === 'THEME'
                                                                ? 'h-full w-full object-cover'
                                                                : 'h-16 w-16 object-contain'} />
                                                    ) : (
                                                        <span className="text-3xl">
                                                            {Array.isArray(item.preview_data) && item.preview_data[0]?.visual
                                                                ? item.preview_data[0].visual
                                                                : '*'}
                                                        </span>
                                                    )}
                                                    {item.owned && (
                                                        <span className="absolute inset-x-0 bottom-0 bg-pysim-success-strong py-0.5 text-xs font-bold text-white">
                                                            {t('shop.owned', 'มีแล้ว')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-xs font-bold text-pysim-on-surface leading-tight">{shownName(item)}</p>
                                                <p className={`text-label ${item.owned ? 'font-bold text-emerald-700' : 'text-pysim-outline'}`}>
                                                    {item.owned ? t('shop.owned', 'มีแล้ว') : `${coins(item.price)} ${t('shop.coins', 'เหรียญ')}`}
                                                </p>
                                                <CosmeticTryButton type={item.type} effects={item.preview_data}
                                                    themeText={`${item.name} ${item.asset_url || ''}`} className="mt-1.5" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto flex items-end justify-between gap-4 px-6 pb-5">
                                        <div>
                                            <p className="text-xs text-pysim-outline line-through">
                                                {t('shop.separately', 'แยกชิ้น')} {coins(set.individual_total)} {t('shop.coins', 'เหรียญ')}
                                            </p>
                                            <p className="text-2xl font-black text-pysim-primary leading-tight">
                                                {coins(set.fully_owned ? set.price : set.price_for_user)} {t('shop.coins', 'เหรียญ')}
                                            </p>
                                            {!set.fully_owned && set.owned_count > 0 && (
                                                <p className="text-label text-pysim-on-surface-variant">
                                                    {t('shop.ownedDeducted', { count: set.owned_count, defaultValue: 'หักส่วนที่มีแล้ว {{count}} ชิ้นออก' })}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setPendingPurchase({
                                                kind: 'set',
                                                target: set,
                                                name: pickLocalized(lang, set.name_en, set.name_th),
                                                price: set.price_for_user,
                                                image: set.items.find((entry) => entry.asset_url)?.asset_url || '',
                                            })}
                                            disabled={set.fully_owned || Boolean(buyingSet) || buyingItemId !== null}
                                            className={`rounded-lg px-6 py-2.5 text-sm font-bold transition-all duration-200 ${
                                                set.fully_owned
                                                    ? 'bg-pysim-surface-low text-pysim-outline cursor-not-allowed'
                                                    : 'python-gradient text-white hover:opacity-90'
                                            }`}>
                                            {set.fully_owned
                                                ? t('shop.setComplete', 'มีครบแล้ว')
                                                : buyingSet === set.set_key ? t('shop.buying', 'กำลังซื้อ...') : t('shop.buySet', 'ซื้อยกเซ็ต')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <SkeletonLoading variant="catalog" label={t('shop.loading', 'กำลังโหลดสินค้า...')} className="py-4" />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
                        {filteredItems.length === 0 && (
                            <p className="col-span-full rounded-xl bg-white p-8 text-center text-sm text-pysim-on-surface-variant whisper-shadow">
                                {ownership === 'owned'
                                    ? t('shop.emptyOwned', 'ยังไม่มีของในหมวดนี้ ลองดูในแท็บ "ยังไม่มี"')
                                    : ownership === 'missing'
                                        ? t('shop.emptyMissing', 'คุณมีของในหมวดนี้ครบแล้ว')
                                        : t('shop.empty', 'ไม่พบสินค้า')}
                            </p>
                        )}
                        {filteredItems.map((item, index) => (
                            <div key={item.id}
                                className={`bg-white rounded-xl whisper-shadow hover:translate-y-[-4px] transition-all duration-300 overflow-hidden group
                                    ${isInUse(item) ? 'ring-2 ring-pysim-primary' : item.owned ? 'ring-2 ring-pysim-success-strong/40' : ''}
                                    ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                                style={{ transitionDelay: `${200 + index * 80}ms` }}>
                                <div className="h-28 sm:h-40 bg-pysim-surface-low flex items-center justify-center relative">
                                    {item.icon.type === 'image' ? (
                                        <img
                                            src={assetUrl(item.icon.value)}
                                            alt={shownName(item)}
                                            className={item.type === 'THEME'
                                                ? 'h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                                                : 'h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-300'}
                                        />
                                    ) : (
                                        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{item.icon.value}</span>
                                    )}
                                    <span className={`absolute top-3 right-3 text-label font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/80 backdrop-blur-sm ${rarityColors[item.rarity] || rarityColors.common}`}>
                                        {item.rarity}
                                    </span>
                                    {item.owned && (
                                        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label font-black text-white shadow ${isInUse(item) ? 'bg-pysim-primary' : 'bg-pysim-success-strong'}`}>
                                            <CheckCircle size={12} />
                                            {isInUse(item) ? t('shop.inUse', 'กำลังใช้') : t('shop.owned', 'มีแล้ว')}
                                        </span>
                                    )}
                                </div>

                                <div className="p-3 sm:p-5">
                                    <h3 className="text-base sm:text-lg font-bold text-pysim-on-surface mb-1">{shownName(item)}</h3>
                                    <CosmeticTryButton type={item.type} effects={item.effectData}
                                        themeText={`${item.name} ${item.assetUrl || item.previewImage || ''}`} />
                                    <div className="mt-3 flex flex-col items-stretch gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                        {item.owned ? (
                                            <span className="text-sm font-bold text-emerald-700">{t('shop.inWardrobe', 'อยู่ในตู้ของคุณ')}</span>
                                        ) : (
                                            <div className="min-w-0">
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <Coins size={16} className="text-pysim-secondary-container" />
                                                    <span className="font-bold text-pysim-secondary text-sm">{coins(item.price)}</span>
                                                </div>
                                                {wallet < item.price && (
                                                    <p className="mt-0.5 text-label font-semibold text-rose-600">
                                                        {t('shop.shortBy', { amount: coins(item.price - wallet), defaultValue: 'ขาดอีก {{amount}} เหรียญ' })}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {item.owned ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEquip(item)}
                                                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors ${isInUse(item) ? 'bg-pysim-success-strong hover:bg-pysim-success-strong/90' : 'bg-pysim-primary hover:bg-pysim-primary/90'}`}
                                            >
                                                <CheckCircle size={17} /> {isInUse(item) ? t('shop.equipped', 'กำลังสวมใส่') : t('shop.equip', 'สวมใส่')}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setPendingPurchase({
                                                    kind: 'item',
                                                    target: item,
                                                    name: shownName(item),
                                                    price: item.price,
                                                    image: item.icon.type === 'image' ? item.icon.value : '',
                                                    icon: item.icon.type === 'text' ? item.icon.value : '',
                                                })}
                                                disabled={buyingItemId !== null || Boolean(buyingSet) || wallet < item.price}
                                                className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-pysim-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pysim-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {wallet < item.price ? <Lock size={16} /> : <ShoppingCart size={17} />}
                                                {buyingItemId === item.itemId ? t('shopPurchase.buying', 'กำลังซื้อ...')
                                                    : wallet < item.price ? t('shop.notEnough', 'เหรียญไม่พอ') : t('shop.buy', 'ซื้อ')}
                                            </button>
                                        )}
                                    </div>
                                    {item.owned && isInUse(item) && item.type !== 'PROFILE_PICTURE' && (
                                        <button
                                            type="button"
                                            onClick={() => handleUnequip(item)}
                                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                                        >
                                            {t('shop.unequip', 'ถอดออก')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button onClick={() => navigate('/learn')}
                    className={`on-art mt-10 inline-flex min-h-10 items-center text-pysim-on-surface-variant hover:text-pysim-primary text-sm font-bold transition-colors ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    ← {t('shop.back', 'กลับหน้าหลัก')}
                </button>
            </div>
            <PurchaseConfirmDialog
                purchase={pendingPurchase}
                wallet={wallet}
                busy={buyingItemId !== null || Boolean(buyingSet)}
                onCancel={() => setPendingPurchase(null)}
                onConfirm={async () => {
                    const { kind, target } = pendingPurchase;
                    if (kind === 'set') await handleBuySet(target);
                    else await handleBuy(target);
                    setPendingPurchase(null);
                }}
            />
            <PurchaseSuccessPopup purchase={purchaseNotice} onDismiss={() => setPurchaseNotice(null)} />
        </div>
    );
}
