import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Play, FileCode, Folder, Trash2, X, Terminal,
    FilePlus, FolderPlus, Save, ChevronRight, ChevronDown,
    FileText, Loader, Square, Eraser
} from 'lucide-react';
import usePyodide from '../../hooks/usePyodide';

// ==========================================
// Python Syntax Highlighter
// ==========================================
const PYTHON_KEYWORDS = new Set([
    'False','None','True','and','as','assert','async','await','break',
    'class','continue','def','del','elif','else','except','finally',
    'for','from','global','if','import','in','is','lambda','nonlocal',
    'not','or','pass','raise','return','try','while','with','yield'
]);

const PYTHON_BUILTINS = new Set([
    'print','len','range','int','str','float','list','dict','set','tuple',
    'type','isinstance','open','input','map','filter','zip','enumerate',
    'sorted','reversed','abs','max','min','sum','any','all','round',
    'bool','bytes','format','hasattr','getattr','setattr','id','hex','oct',
    'bin','chr','ord','repr','super','property','staticmethod','classmethod'
]);

function highlightPython(code) {
    if (!code) return [];

    const lines = code.split('\n');
    return lines.map(line => {
        const tokens = [];
        let i = 0;

        while (i < line.length) {
            // Comments
            if (line[i] === '#') {
                tokens.push({ type: 'comment', text: line.slice(i) });
                break;
            }

            // Triple-quoted strings (simplified — single line)
            if (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''") {
                const quote = line.slice(i, i + 3);
                const end = line.indexOf(quote, i + 3);
                if (end !== -1) {
                    tokens.push({ type: 'string', text: line.slice(i, end + 3) });
                    i = end + 3;
                } else {
                    tokens.push({ type: 'string', text: line.slice(i) });
                    break;
                }
                continue;
            }

            // Strings
            if (line[i] === '"' || line[i] === "'") {
                const quote = line[i];
                let j = i + 1;
                while (j < line.length && line[j] !== quote) {
                    if (line[j] === '\\') j++;
                    j++;
                }
                tokens.push({ type: 'string', text: line.slice(i, j + 1) });
                i = j + 1;
                continue;
            }

            // Numbers
            if (/\d/.test(line[i])) {
                let j = i;
                while (j < line.length && /[\d.xXoObBeE_]/.test(line[j])) j++;
                tokens.push({ type: 'number', text: line.slice(i, j) });
                i = j;
                continue;
            }

            // Words (keywords, builtins, identifiers)
            if (/[a-zA-Z_]/.test(line[i])) {
                let j = i;
                while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
                const word = line.slice(i, j);
                if (PYTHON_KEYWORDS.has(word)) {
                    tokens.push({ type: 'keyword', text: word });
                } else if (PYTHON_BUILTINS.has(word)) {
                    tokens.push({ type: 'builtin', text: word });
                } else {
                    tokens.push({ type: 'text', text: word });
                }
                i = j;
                continue;
            }

            // Decorators
            if (line[i] === '@') {
                let j = i + 1;
                while (j < line.length && /[a-zA-Z0-9_.]/.test(line[j])) j++;
                tokens.push({ type: 'decorator', text: line.slice(i, j) });
                i = j;
                continue;
            }

            // Operators and punctuation
            if ('()[]{}:,.+-*/%=<>!&|^~'.includes(line[i])) {
                tokens.push({ type: 'operator', text: line[i] });
                i++;
                continue;
            }

            // Whitespace and other
            tokens.push({ type: 'text', text: line[i] });
            i++;
        }

        return tokens;
    });
}

const TOKEN_COLORS = {
    keyword: '#9333ea', // purple-600
    builtin: '#2563eb', // blue-600
    string: '#16a34a', // green-600
    number: '#d97706', // amber-600
    comment: '#64748b', // slate-500
    decorator: '#ca8a04', // yellow-600
    operator: '#0891b2', // cyan-600
    text: '#334155', // slate-700
};

// ==========================================
// Main CodeEditor Component
// ==========================================
export default function CodeEditor({ files = [], folderId, onCreateFile, onDeleteFile, onUpdateFile }) {
    const [selectedFolderId, setSelectedFolderId] = useState(folderId || null);
    const [openTabs, setOpenTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'system', text: 'Python Terminal — Loading...' }
    ]);
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [showTerminal, setShowTerminal] = useState(true);

    const textareaRef = useRef(null);
    const highlightRef = useRef(null);
    const terminalEndRef = useRef(null);
    const lineNumbersRef = useRef(null);

    // Pyodide hook
    const { status: pyStatus, runCode, clearOutput, setOnOutput } = usePyodide();

    // Sync terminal output from Pyodide
    useEffect(() => {
        setOnOutput((output) => setTerminalOutput(output));
    }, [setOnOutput]);

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalOutput]);

    // Get files in selected folder
    const getFilesInFolder = (parentId) => files.filter(f => (f.parentId || null) === parentId);
    const allFolders = files.filter(f => f.type === 'folder');
    const currentFile = files.find(f => f.id === activeTabId);

    // --- File operations ---
    const handleOpenFile = (file) => {
        if (file.type === 'folder') {
            setExpandedFolders(prev => {
                const next = new Set(prev);
                next.has(file.id) ? next.delete(file.id) : next.add(file.id);
                return next;
            });
            return;
        }
        if (!openTabs.includes(file.id)) setOpenTabs([...openTabs, file.id]);
        setActiveTabId(file.id);
    };

    const handleCloseTab = (e, fileId) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(id => id !== fileId);
        setOpenTabs(newTabs);
        if (activeTabId === fileId) setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null);
    };

    const handleUpdateContent = (newContent) => {
        onUpdateFile?.(activeTabId, newContent);
    };

    const handleCreateFile = (type) => {
        const name = prompt(type === 'folder' ? 'Folder name:' : 'File name (e.g. script.py):');
        if (!name) return;
        const newFile = {
            id: Date.now(), name, type,
            parentId: selectedFolderId,
            content: type === 'file' ? '' : undefined,
            createdAt: new Date().toISOString()
        };
        onCreateFile?.(newFile);
        if (type === 'file') {
            setTimeout(() => {
                setOpenTabs(prev => [...prev, newFile.id]);
                setActiveTabId(newFile.id);
            }, 50);
        }
    };

    const handleDeleteFile = (id) => {
        if (window.confirm("Delete this file?")) {
            onDeleteFile?.(id);
            setOpenTabs(prev => prev.filter(t => t !== id));
            if (activeTabId === id) setActiveTabId(null);
        }
    };

    // --- Run Python code ---
    const handleRunCode = useCallback(async () => {
        if (!currentFile || !currentFile.name.endsWith('.py')) return;
        if (pyStatus === 'running') return;

        // Get sibling files in the same folder for FS sync
        const siblingFiles = files
            .filter(f => (f.parentId || null) === (currentFile.parentId || null) && f.id !== currentFile.id)
            .map(f => ({ name: f.name, type: f.type, content: f.content || '' }));

        const result = await runCode(currentFile.content || '', siblingFiles);

        // Sync file changes back to game FS
        if (result?.fsChanges) {
            const { created, deleted } = result.fsChanges;
            if (created && created.length > 0) {
                for (const f of created) {
                    // Don't re-create files that already exist
                    const exists = files.find(
                        ef => ef.name === f.name && (ef.parentId || null) === (currentFile.parentId || null)
                    );
                    if (!exists) {
                        onCreateFile?.({
                            id: Date.now() + Math.random(),
                            name: f.name,
                            type: f.type,
                            parentId: currentFile.parentId || null,
                            content: f.content,
                            createdAt: new Date().toISOString()
                        });
                    } else if (f.type === 'file' && f.content !== exists.content) {
                        // Update existing file content if modified
                        onUpdateFile?.(exists.id, f.content);
                    }
                }
            }
            // Handle modified files
            if (result.fsChanges.modified) {
                for (const f of result.fsChanges.modified) {
                    const existing = files.find(
                        ef => ef.name === f.name && (ef.parentId || null) === (currentFile.parentId || null)
                    );
                    if (existing && f.type === 'file' && f.content !== existing.content) {
                        onUpdateFile?.(existing.id, f.content);
                    }
                }
            }
        }
    }, [currentFile, files, pyStatus, runCode, onCreateFile, onUpdateFile]);

    // --- Keyboard handling ---
    const handleKeyDown = (e) => {
        // Tab = 4 spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const ta = e.target;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const val = ta.value;
            const newVal = val.substring(0, start) + '    ' + val.substring(end);
            handleUpdateContent(newVal);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 4;
            });
        }

        // Enter = auto-indent
        if (e.key === 'Enter') {
            e.preventDefault();
            const ta = e.target;
            const start = ta.selectionStart;
            const val = ta.value;
            const lineStart = val.lastIndexOf('\n', start - 1) + 1;
            const currentLine = val.substring(lineStart, start);
            const indentMatch = currentLine.match(/^(\s*)/);
            let indent = indentMatch ? indentMatch[1] : '';
            // Add extra indent after ':'
            if (currentLine.trimEnd().endsWith(':')) indent += '    ';
            const newVal = val.substring(0, start) + '\n' + indent + val.substring(ta.selectionEnd);
            handleUpdateContent(newVal);
            requestAnimationFrame(() => {
                ta.selectionStart = ta.selectionEnd = start + 1 + indent.length;
            });
        }

        // Ctrl+Enter = Run
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleRunCode();
        }
    };

    // Sync scroll between textarea and highlight overlay
    const handleScroll = () => {
        if (highlightRef.current && textareaRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
        if (lineNumbersRef.current && textareaRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    // Ctrl+S intercept
    useEffect(() => {
        const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') e.preventDefault(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ==========================================
    // Folder Picker View
    // ==========================================
    if (!selectedFolderId) {
        return (
            <div className="h-full flex flex-col bg-slate-50 text-slate-800">
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-8">
                            <FileCode size={48} className="mx-auto mb-4 text-blue-500 opacity-60" />
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Open Folder</h2>
                            <p className="text-sm text-slate-500">Select a project folder to start coding</p>
                        </div>
                        <div className="space-y-3 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {allFolders.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
                                    <p className="text-sm font-medium">No folders found.</p>
                                    <p className="text-xs mt-1">Create a folder in My Computer first.</p>
                                </div>
                            ) : (
                                allFolders.map(folder => (
                                    <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
                                        className="w-full flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl transition-all text-left group">
                                        <div className="p-2 bg-amber-50 rounded-xl">
                                            <Folder size={24} className="text-amber-500" fill="currentColor" opacity={0.8} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-700">{folder.name}</div>
                                            <div className="text-xs text-slate-400 font-medium mt-0.5">{files.filter(f => f.parentId === folder.id).length} items</div>
                                        </div>
                                        <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))
                            )}
                        </div>
                        <button onClick={() => {
                            const name = prompt('Create new project folder:', 'my-project');
                            if (!name) return;
                            const newFolder = { id: Date.now(), name, type: 'folder', parentId: null, createdAt: new Date().toISOString() };
                            onCreateFile?.(newFolder);
                            setTimeout(() => setSelectedFolderId(newFolder.id), 50);
                        }} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98]">
                            <FolderPlus size={18} /> Create New Project
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // File Tree
    // ==========================================
    const FileTree = ({ parentId, depth = 0 }) => {
        const items = getFilesInFolder(parentId);
        const folders = items.filter(i => i.type === 'folder');
        const fileItems = items.filter(i => i.type === 'file');
        const sorted = [...folders, ...fileItems];

        return sorted.map(item => (
            <div key={item.id}>
                <div onClick={() => handleOpenFile(item)}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 cursor-pointer hover:bg-blue-50/50 group rounded-md mx-1 my-0.5 transition-colors ${activeTabId === item.id ? 'bg-blue-100/50 text-blue-700 font-medium' : 'text-slate-600'}`}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}>
                    <div className="flex items-center gap-1.5 min-w-0">
                        {item.type === 'folder' ? (
                            <>
                                {expandedFolders.has(item.id) ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                <Folder size={14} className="text-amber-500 shrink-0" fill="currentColor" opacity={0.8} />
                            </>
                        ) : (
                            <>
                                <span className="w-3" />
                                <FileCode size={14} className={`shrink-0 ${item.name.endsWith('.py') ? 'text-blue-500' : item.name.endsWith('.txt') ? 'text-slate-400' : 'text-indigo-400'}`} />
                            </>
                        )}
                        <span className="truncate text-xs">{item.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(item.id); }}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 shrink-0 transition-colors bg-white rounded-sm p-0.5 shadow-sm">
                        <Trash2 size={11} />
                    </button>
                </div>
                {item.type === 'folder' && expandedFolders.has(item.id) && (
                    <FileTree parentId={item.id} depth={depth + 1} />
                )}
            </div>
        ));
    };

    const selectedFolder = files.find(f => f.id === selectedFolderId);
    const content = currentFile?.content || '';
    const highlighted = currentFile?.name.endsWith('.py') ? highlightPython(content) : null;
    const lineCount = content.split('\n').length;    // ==========================================
    // Render
    // ==========================================
    return (
        <div className="flex h-full bg-slate-50 text-slate-700 font-mono text-sm border-t border-slate-200">

            {/* --- LEFT SIDEBAR (EXPLORER) --- */}
            <div className="w-60 flex flex-col border-r border-slate-200 bg-slate-50/50">
                <div className="p-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-4 flex justify-between items-center border-b border-slate-200">
                    <span className="truncate text-slate-600">{selectedFolder?.name || 'Explorer'}</span>
                    <div className="flex gap-1.5">
                        <button onClick={() => handleCreateFile('file')} title="New File" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><FilePlus size={14} /></button>
                        <button onClick={() => handleCreateFile('folder')} title="New Folder" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><FolderPlus size={14} /></button>
                        <button onClick={() => setSelectedFolderId(null)} title="Change Folder" className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><Folder size={14} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
                    <FileTree parentId={selectedFolderId} />
                </div>

                {/* Pyodide Status */}
                <div className="p-3 border-t border-slate-200 text-[11px] bg-slate-100/50">
                    <div className="flex items-center gap-2 font-medium">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            pyStatus === 'ready' ? 'bg-emerald-500 shadow-emerald-500/40' :
                            pyStatus === 'loading' ? 'bg-amber-400 animate-pulse shadow-amber-400/40' :
                            pyStatus === 'running' ? 'bg-blue-500 animate-pulse shadow-blue-500/40' :
                            'bg-slate-300'
                        }`} />
                        <span className={`${pyStatus === 'ready' ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {pyStatus === 'ready' ? 'Python Ready' :
                             pyStatus === 'loading' ? 'Loading Python...' :
                             pyStatus === 'running' ? 'Running script...' :
                             'Python Idle'}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- MAIN AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">

                {/* TAB BAR */}
                <div className="flex bg-slate-100 overflow-x-auto border-b border-slate-200 custom-scrollbar">
                    {openTabs.map(tabId => {
                        const file = files.find(f => f.id === tabId);
                        if (!file) return null;
                        return (
                            <div key={tabId} onClick={() => setActiveTabId(tabId)}
                                className={`flex items-center gap-2 px-4 py-2.5 min-w-[130px] max-w-[220px] border-r border-slate-200 cursor-pointer text-xs select-none transition-colors
                                    ${activeTabId === tabId ? 'bg-white text-blue-700 font-bold border-t-2 border-t-blue-500 shadow-sm' : 'bg-transparent hover:bg-slate-200 text-slate-600 font-medium border-t-2 border-t-transparent'}`}>
                                <FileCode size={13} className={file.name.endsWith('.py') ? 'text-blue-500' : 'text-slate-400'} />
                                <span className="truncate">{file.name}</span>
                                <button className="ml-auto hover:bg-slate-300 hover:text-red-500 text-slate-400 rounded-md p-1 shrink-0 transition-colors"
                                    onClick={(e) => handleCloseTab(e, tabId)}>
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* TOOLBAR */}
                <div className="flex justify-between items-center px-4 py-2.5 bg-white border-b border-slate-100 shadow-sm z-10">
                    <div className="text-[11px] font-medium text-slate-400 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
                        <Folder size={12} className="text-amber-500" fill="currentColor" opacity={0.5} />
                        {currentFile ? `${selectedFolder?.name} / ${currentFile.name}` : 'No file selected'}
                    </div>
                    <div className="flex items-center gap-3">
                        {currentFile?.name.endsWith('.py') && <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mr-1">Python 3</span>}
                        <button onClick={handleRunCode}
                            disabled={!currentFile?.name.endsWith('.py') || pyStatus === 'running' || pyStatus === 'loading'}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95
                                ${currentFile?.name.endsWith('.py') && pyStatus === 'ready'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                                    : pyStatus === 'running'
                                        ? 'bg-blue-600 text-white cursor-wait shadow-blue-500/20'
                                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}`}>
                            {pyStatus === 'running' ? (
                                <><Loader size={14} className="animate-spin" /> Running...</>
                            ) : pyStatus === 'loading' ? (
                                <><Loader size={14} className="animate-spin" /> Initializing</>
                            ) : (
                                <><Play size={14} fill="currentColor" /> Run Script</>
                            )}
                        </button>
                    </div>
                </div>

                {/* EDITOR AREA */}
                <div className="flex-1 relative overflow-hidden bg-[#fdfdfd]">
                    {currentFile ? (
                        <div className="h-full flex">
                            {/* Line numbers */}
                            <div ref={lineNumbersRef}
                                className="bg-slate-50 border-r border-slate-200 px-3 py-4 text-right text-[12px] text-slate-400 font-mono select-none overflow-hidden leading-[24px] w-12"
                                style={{ overflowY: 'hidden' }}>
                                {Array.from({ length: lineCount }, (_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>

                            {/* Editor container */}
                            <div className="flex-1 relative overflow-hidden">
                                {/* Syntax highlight overlay (behind textarea) */}
                                {highlighted && (
                                    <pre ref={highlightRef}
                                        className="absolute inset-0 p-4 font-mono text-[13px] leading-[24px] whitespace-pre-wrap break-words overflow-hidden pointer-events-none"
                                        style={{ color: '#334155' }}
                                        aria-hidden="true">
                                        {highlighted.map((lineTokens, li) => (
                                            <div key={li}>
                                                {lineTokens.length === 0 ? '\n' :
                                                    lineTokens.map((t, ti) => (
                                                        <span key={ti} style={{ color: TOKEN_COLORS[t.type] || '#334155' }}>
                                                            {t.text}
                                                        </span>
                                                    ))
                                                }
                                            </div>
                                        ))}
                                    </pre>
                                )}
                                {/* Actual textarea (transparent text if highlighted) */}
                                <textarea
                                    ref={textareaRef}
                                    className="absolute inset-0 w-full h-full bg-transparent p-4 outline-none resize-none font-mono text-[13px] leading-[24px] custom-scrollbar"
                                    style={{
                                        color: highlighted ? 'transparent' : '#334155',
                                        caretColor: '#2563eb', // blue-600
                                        WebkitTextFillColor: highlighted ? 'transparent' : undefined,
                                    }}
                                    value={content}
                                    onChange={(e) => handleUpdateContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onScroll={handleScroll}
                                    spellCheck={false}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center">
                                <FileCode size={48} className="mb-4 opacity-30 text-blue-500" />
                                <p className="text-sm font-medium text-slate-600">Select a file to start editing</p>
                                <p className="text-xs mt-2 text-slate-400">Or create a new .py file with the <FilePlus size={12} className="inline mx-1" /> button</p>
                                <div className="mt-6 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-xs font-medium text-slate-500 flex items-center gap-2">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Ctrl</span> + <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Enter</span> to Run Code
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* TERMINAL AREA */}
                {showTerminal && (
                    <div className="h-48 border-t border-slate-200 bg-slate-50 flex flex-col shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-between px-5 py-2 border-b border-slate-200 bg-white">
                            <span className="font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 text-slate-500">
                                <Terminal size={12} /> Output Console
                            </span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => {
                                    clearOutput();
                                    setTerminalOutput([{ type: 'system', text: 'Console cleared.' }]);
                                }} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors" title="Clear">
                                    <Eraser size={12} /> Clear
                                </button>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <button onClick={() => setShowTerminal(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-white rounded-md p-0.5" title="Close Terminal"><X size={14} /></button>
                            </div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed space-y-1 custom-scrollbar">
                            {terminalOutput.map((entry, i) => (
                                <div key={i} className={
                                    entry.type === 'command' ? 'text-blue-600 font-bold' :
                                    entry.type === 'stderr' ? 'text-red-500 font-medium' :
                                    entry.type === 'system' ? 'text-slate-400 italic' :
                                    'text-slate-700'
                                }>
                                    {entry.text}
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>
                    </div>
                )}
                {!showTerminal && (
                    <button onClick={() => setShowTerminal(true)}
                        className="py-1.5 border-t border-slate-200 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-center bg-slate-50">
                        ▲ Show Terminal Response
                    </button>
                )}
            </div>

            {/* --- RIGHT ACTIVITY BAR --- */}
            <div className="w-10 bg-[#333] flex flex-col items-center py-3 gap-3 border-l border-[#252526]">
                <FileCode size={16} className="text-gray-500 hover:text-white cursor-pointer" title="Explorer" />
                <button onClick={() => setShowTerminal(t => !t)}>
                    <Terminal size={16} className={`cursor-pointer ${showTerminal ? 'text-white' : 'text-gray-500 hover:text-white'}`} title="Terminal" />
                </button>
            </div>
        </div>
    );
}