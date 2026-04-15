import React from 'react';
import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';

const EmptyState = ({ icon: Icon = Archive, title = "No Data Found", message = "There is nothing to display here yet.", actionLabel, onAction }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center glass rounded-3xl border border-white/5"
        >
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6 border border-slate-700/50 text-slate-500">
                <Icon size={40} className="stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
                {title}
            </h3>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
                {message}
            </p>
            {actionLabel && onAction && (
                <button 
                    onClick={onAction}
                    className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/20"
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
};

export default EmptyState;
