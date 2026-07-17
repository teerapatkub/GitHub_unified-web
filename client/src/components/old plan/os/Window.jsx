import { useState, useEffect } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

export default function Window({ id, title, children, onClose, onMinimize, isActive, onFocus, bounds }) {
    const [isMaximized, setIsMaximized] = useState(false);
    const [viewportSize, setViewportSize] = useState({
        w: bounds?.w || (typeof window !== 'undefined' ? window.innerWidth : 1200),
        h: bounds?.h || (typeof window !== 'undefined' ? window.innerHeight : 800)
    });
    const [size, setSize] = useState(() => {
        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;
        return {
            w: Math.round(Math.min(900, Math.max(320, w * 0.85))),
            h: Math.round(Math.min(700, Math.max(280, h * 0.62)))
        };
    });
    const [position, setPosition] = useState({ x: 40 + (Math.random() * 40), y: 40 + (Math.random() * 40) });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

    useEffect(() => {
        if (bounds?.w && bounds?.h) {
            setViewportSize({ w: bounds.w, h: bounds.h });
        }
    }, [bounds?.h, bounds?.w]);

    const handleMouseDown = (e) => {
        if (isMaximized) return;
        onFocus();
        setIsDragging(true);
        setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    useEffect(() => {
        const handleResize = () => {
            if (!bounds?.w || !bounds?.h) {
                setViewportSize({ w: window.innerWidth, h: window.innerHeight });
            }
        };

        const handleMouseMove = (e) => {
            if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
            if (isResizing) setSize({ w: Math.max(280, e.clientX - position.x), h: Math.max(220, e.clientY - position.y) });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        window.addEventListener('resize', handleResize);
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [bounds?.h, bounds?.w, isDragging, isResizing, dragOffset, position]);

    const inset = 8;
    const maxW = Math.max(280, viewportSize.w - inset * 2);
    const maxH = Math.max(220, viewportSize.h - inset * 2 - 48);
    const safeWidth = isMaximized ? viewportSize.w : Math.min(size.w, maxW);
    const safeHeight = isMaximized ? viewportSize.h - 48 : Math.min(size.h, maxH);
    const safeX = isMaximized ? 0 : Math.min(Math.max(inset, position.x), viewportSize.w - safeWidth - inset);
    const safeY = isMaximized ? 0 : Math.min(Math.max(inset, position.y), viewportSize.h - safeHeight - 48 - inset);

    return (
        <div onMouseDown={onFocus}
            style={{
                top: safeY,
                left: safeX,
                width: isMaximized ? `${viewportSize.w}px` : `${safeWidth}px`,
                height: isMaximized ? `${Math.max(220, viewportSize.h - 48)}px` : `${safeHeight}px`,
                zIndex: isActive ? 50 : 10,
                transition: isDragging || isResizing ? 'none' : 'all 0.15s ease-out',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'scale(1)' : 'scale(0.95)',
            }}
            className={`absolute flex flex-col overflow-hidden pointer-events-auto bg-white/95 backdrop-blur-2xl
                ${isMaximized ? 'rounded-none' : 'rounded-2xl'}
                ${isActive ? 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-slate-300/80 ring-1 ring-white' : 'shadow-lg border-slate-200/60 opacity-95 hover:opacity-100'}
                border transition-opacity`}>

            {/* Title Bar */}
            <div onMouseDown={handleMouseDown}
                className={`h-10 flex justify-between items-center px-4 select-none cursor-default border-b transition-colors ${isActive ? 'bg-slate-50/80 border-slate-200 text-slate-700' : 'bg-slate-50/40 border-slate-100 text-slate-400'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-40">🐾</span>
                    <span className={`text-xs font-bold tracking-wide uppercase ${isActive ? 'text-slate-700' : 'text-slate-400'}`}>{title}</span>
                </div>
                <div className="flex gap-1.5 h-full items-center z-20" onMouseDown={e => e.stopPropagation()}>
                    <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-400 transition-colors flex items-center justify-center group">
                        <Minus size={8} className="text-yellow-900 opacity-0 group-hover:opacity-100" />
                    </button>
                    <button onClick={() => setIsMaximized(!isMaximized)} className="w-3 h-3 rounded-full bg-green-500/70 hover:bg-green-400 transition-colors flex items-center justify-center group">
                        {isMaximized ? <Square size={6} className="text-green-900 opacity-0 group-hover:opacity-100" /> : <Maximize2 size={6} className="text-green-900 opacity-0 group-hover:opacity-100" />}
                    </button>
                    <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors flex items-center justify-center group">
                        <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-white">{children}</div>

            {/* Resize Handle */}
            {!isMaximized && (
                <div onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20" />
            )}
        </div>
    );
}
