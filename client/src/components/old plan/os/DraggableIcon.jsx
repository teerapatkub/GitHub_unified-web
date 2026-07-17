import { useState, useEffect, useRef } from 'react';

export default function DraggableIcon({ id, icon, label, initialPos, onOpen, onContextMenu, draggable, dragData, onFileDrop, isDropTarget, dropHighlightColor }) {
    const [pos, setPos] = useState(initialPos || { x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isOverDrop, setIsOverDrop] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const dragMoved = useRef(false);
    const mouseDownPos = useRef(null);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
        mouseDownPos.current = { x: e.clientX, y: e.clientY };
        dragMoved.current = false;
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const dx = e.clientX - (mouseDownPos.current?.x || 0);
                const dy = e.clientY - (mouseDownPos.current?.y || 0);
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.current = true;
                setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            }
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) { 
            window.addEventListener('mousemove', handleMouseMove); 
            window.addEventListener('mouseup', handleMouseUp); 
        }
        return () => { 
            window.removeEventListener('mousemove', handleMouseMove); 
            window.removeEventListener('mouseup', handleMouseUp); 
        };
    }, [isDragging, offset]);

    const handleDragStart = (e) => { 
        if (dragData) { 
            e.dataTransfer.setData('application/json', JSON.stringify(dragData)); 
            e.dataTransfer.effectAllowed = 'move'; 
        } 
    };
    const handleDragOver = (e) => { 
        if (!isDropTarget) return; 
        e.preventDefault(); 
        e.dataTransfer.dropEffect = 'move'; 
        setIsOverDrop(true); 
    };
    const handleDragLeave = () => setIsOverDrop(false);
    const handleDrop = (e) => {
        e.preventDefault(); 
        setIsOverDrop(false);
        if (!onFileDrop) return;
        try { 
            onFileDrop(JSON.parse(e.dataTransfer.getData('application/json'))); 
        } catch (err) { 
            console.error('Drop parse error', err); 
        }
    };

    return (
        <div style={{ top: `${pos.y}px`, left: `${pos.x}px` }}
            className={`absolute flex flex-col items-center gap-0.5 sm:gap-1 md:gap-1.5 p-1 sm:p-1.5 md:p-2 rounded-lg sm:rounded-xl cursor-pointer w-[52px] sm:w-[64px] md:w-[80px] z-0 transition-opacity duration-200
                ${isDragging ? 'opacity-50 scale-95 cursor-grabbing' : ''}
                ${isHovered && !isDragging ? 'bg-white/20' : ''}
                ${isOverDrop ? `bg-blue-50/50 scale-110 rounded-2xl` : ''}`}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={() => { if (!dragMoved.current) onOpen?.(); }}
            onContextMenu={(e) => onContextMenu?.(e, id)}
            draggable={!!dragData} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className={`p-1.5 sm:p-2 md:p-2.5 rounded-xl sm:rounded-2xl text-slate-700 pointer-events-none transition-all duration-300
                bg-white/70 border border-white/90 shadow-sm backdrop-blur-md
                ${isHovered ? 'bg-white shadow-[0_8px_25px_rgba(0,0,0,0.1)] border-blue-200 scale-110 text-blue-600' : ''}
                ${isOverDrop ? 'scale-110 shadow-lg ring-2 ring-blue-400 bg-blue-50' : ''}
                [&_svg]:w-4 [&_svg]:h-4 sm:[&_svg]:w-5 sm:[&_svg]:h-5 md:[&_svg]:w-7 md:[&_svg]:h-7`}>
                {icon}
            </div>
            <span className={`text-[8px] sm:text-[9px] md:text-[11px] font-bold tracking-wide text-center leading-tight px-1 py-0.5 mt-0.5 rounded-md select-none pointer-events-none transition-all duration-200
                ${isHovered ? 'text-slate-900 bg-white/90 shadow-sm backdrop-blur-md' : 'text-slate-800 bg-white/50 backdrop-blur-sm shadow-sm border border-white/20'}`}
                style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                {label}
            </span>
        </div>
    );
}
