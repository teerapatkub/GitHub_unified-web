import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function NavBar({ items, className }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const currentItem = items.find(item => location.pathname.startsWith(item.url));
    if (currentItem) {
      setActiveTab(currentItem.name);
    }
  }, [location.pathname, items])

  return (
    <div
      className={cn(
        "w-full",
        "pointer-events-auto",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-2 shadow-inner shadow-white/50">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors duration-300",
                "text-slate-500 hover:text-blue-600 whitespace-nowrap",
                "min-w-[80px] text-center",
                isActive ? "text-blue-700 bg-blue-50/80" : "",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-blue-50/80 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-blue-500">
                    <div className="absolute inset-x-1 -top-1 h-3 rounded-full bg-blue-400/20 blur-md" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
