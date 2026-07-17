import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Palette,
  BookPlus,
  Globe,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: t("navbar.dashboard", "แดชบอร์ด"), icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: t("navbar.leaderboard", "ตารางอันดับ"), icon: Trophy, path: "/admin/leaderboard" },
    { name: t("navbar.manageAccount", "จัดการบัญชี"), icon: Users, path: "/admin/manage-account" },
    { name: t("navbar.theme", "ธีม"), icon: Palette, path: "/admin/theme" },
    { name: t("navbar.addLesson", "เพิ่มบทเรียน"), icon: BookPlus, path: "/admin/add-lesson" },
  ];

  return (
    <nav className="fixed top-0 left-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => navigate("/admin/dashboard")}
            >
              <img src="/cat-logo.png" alt="Logo" className="h-8 w-8" />
              <div className="hidden sm:block">
                <div className="text-xs font-black uppercase leading-none tracking-[0.2em] text-blue-600">
                  PYSIM
                </div>
                <div className="mt-0.5 text-[10px] leading-none text-slate-400">
                  Admin Panel
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.name}</span>
                    {active && (
                      <motion.div
                        layoutId="admin-nav-active"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen((prev) => !prev)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                title="เปลี่ยนภาษา"
              >
                <Globe className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {langMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
                  >
                    <button
                      onClick={() => changeLanguage("en")}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span>EN</span> English
                    </button>
                    <button
                      onClick={() => changeLanguage("th")}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                    >
                      <span>TH</span> ภาษาไทย
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mx-1 h-6 w-px bg-slate-200" />

            <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-slate-200">
              <img src="/user-icon.png" alt="Profile" className="h-full w-full object-cover" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500"
              title={t("navbar.logout", "ออกจากระบบ")}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">{t("navbar.logout", "ออกจากระบบ")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
