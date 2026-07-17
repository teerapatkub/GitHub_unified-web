import { X, Settings, Globe, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsModal({ open, onClose, volume, onVolumeChange }) {
    const { t, i18n } = useTranslation();

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-[80] animate-fade-in p-4">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 w-full max-w-md relative animate-scale-in border border-white shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 hover:bg-red-50 p-2 rounded-full"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3 font-outfit">
                    <Settings size={24} className="text-blue-600" />
                    {t('mainMenu.settingsModal.title')}
                </h2>

                <div className="space-y-8">
                    <div>
                        <label className="text-blue-600 text-xs font-bold flex items-center gap-2 tracking-widest mb-3 uppercase">
                            <Globe size={16} />
                            {t('mainMenu.settingsModal.language')}
                        </label>
                        <div className="flex gap-3">
                            <button
                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${i18n.language === 'en' ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                onClick={() => i18n.changeLanguage('en')}
                            >
                                English
                            </button>
                            <button
                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${i18n.language === 'th' ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}
                                onClick={() => i18n.changeLanguage('th')}
                            >
                                ภาษาไทย
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="text-amber-500 text-xs font-bold flex items-center gap-2 tracking-widest uppercase mb-3">
                            <Volume2 size={16} />
                            {t('mainMenu.settingsModal.musicVolume')}
                        </label>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                                value={volume}
                                onChange={(e) => onVolumeChange(e.target.value)}
                            />
                            <div className="text-slate-700 font-bold text-sm min-w-[3rem] text-right">{volume}%</div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-[0.98] mt-4 tracking-wide uppercase"
                    >
                        {t('mainMenu.settingsModal.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
}
