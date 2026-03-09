import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const GlassSelect = ({ options, value, onChange, placeholder = "Select an option", label, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/5 dark:bg-black/40 border ${isOpen ? 'border-indigo-500/50' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-6 py-4 outline-none transition-all flex items-center justify-between group h-[60px] cursor-pointer shadow-sm dark:shadow-none`}
            >
                <span className={`font-bold ${selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <ChevronDown size={20} className={`${isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} group-hover:text-indigo-500 dark:group-hover:text-white transition-colors`} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[100] w-full mt-2 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-3xl"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all group mb-1 last:mb-0 cursor-pointer ${value === option.value
                                        ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    <span className="font-black text-sm tracking-tight">{option.label}</span>
                                    {value === option.value && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        >
                                            <Check size={16} />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlassSelect;
