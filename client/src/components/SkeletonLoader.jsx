import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="glass p-8 rounded-3xl border border-white/5 animate-pulse">
                        <div className="w-12 h-12 bg-slate-800/80 rounded-2xl mb-6"></div>
                        <div className="h-6 bg-slate-800/80 rounded-lg w-3/4 mb-4"></div>
                        <div className="h-4 bg-slate-800/50 rounded-lg w-1/2 mb-6"></div>
                        <div className="flex gap-2 mb-6">
                            <div className="h-8 w-20 bg-slate-800/50 rounded-full"></div>
                            <div className="h-8 w-20 bg-slate-800/50 rounded-full"></div>
                        </div>
                        <div className="h-12 bg-slate-800/80 rounded-xl w-full"></div>
                    </div>
                );
            case 'table-row':
                return (
                    <div className="flex items-center gap-6 p-6 border-b border-white/5 animate-pulse glass">
                        <div className="w-10 h-10 rounded-full bg-slate-800/80 flex-shrink-0"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-800/80 rounded-lg w-1/4"></div>
                            <div className="h-3 bg-slate-800/50 rounded-lg w-1/2"></div>
                        </div>
                        <div className="w-24 h-8 rounded-full bg-slate-800/50 flex-shrink-0"></div>
                    </div>
                );
            case 'text':
                return <div className="h-4 bg-slate-800/80 rounded-lg w-full animate-pulse"></div>;
            case 'stat-box':
                return (
                    <div className="glass p-6 rounded-3xl border-white/5 animate-pulse flex flex-col items-center justify-center h-full">
                        <div className="h-3 w-24 bg-slate-800/50 rounded-lg mb-4"></div>
                        <div className="h-8 w-16 bg-slate-800/80 rounded-xl"></div>
                    </div>
                );
            default:
                return <div className="h-20 bg-slate-800/80 rounded-2xl w-full animate-pulse"></div>;
        }
    };

    return (
        <>
            {Array(count).fill(0).map((_, index) => (
                <React.Fragment key={index}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </>
    );
};

export default SkeletonLoader;
