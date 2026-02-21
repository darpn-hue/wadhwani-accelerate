import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, LayoutGrid } from 'lucide-react';
import { Button } from './ui/Button';

export interface Venture {
    id: string;
    name: string;
    description: string;
    status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Agreement Sent' | 'Contract Sent';
    program: 'Accelerate' | 'Ignite' | 'Liftoff';
    location: string;
    submittedAt: string;
    agreement_status?: 'Draft' | 'Sent' | 'Signed';
    workbench_locked?: boolean;
}

interface VentureCardProps {
    venture: Venture;
}


export const VentureCard: React.FC<VentureCardProps> = ({ venture }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/dashboard/venture/${venture.id}`)}
            className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-brand-50 to-peach-100 rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <RocketIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{venture.name}</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{venture.description} • {venture.location}</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${venture.status === 'Draft' ? 'bg-orange-100 text-orange-700' : 'bg-brand-100 text-brand-700'}`}>
                    {venture.status === 'Draft' ? 'Draft' : 'Submitted'}
                </div>
            </div>

            {/* Program Tag if applicable */}
            <div className="flex items-center gap-2 mb-6 ml-18 pl-1">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Program</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {venture.program}
                </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 pl-1">
                <ClockIcon />
                <span className="font-medium">Submitted: {venture.submittedAt}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-100">
                {venture.status === 'Contract Sent' || venture.workbench_locked ? (
                    // Contract sent - need to review and sign
                    <Button
                        className="bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 shadow-none font-medium text-sm py-2.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/venture/${venture.id}/workbench`);
                        }}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Review Contract
                    </Button>
                ) : venture.agreement_status === 'Signed' ? (
                    // Agreement signed - workbench unlocked
                    <Button
                        className="bg-gray-900 text-white hover:bg-black border-none text-sm py-2.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/venture/${venture.id}/workbench`);
                        }}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Workbench
                    </Button>
                ) : (
                    // Waiting for agreement - locked
                    <Button
                        className="bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100 shadow-none font-medium text-sm py-2.5"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Workbench Locked
                    </Button>
                )}
                <Button
                    variant="outline"
                    className="text-sm py-2.5 border-gray-200 text-gray-600 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50/50"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/dashboard/venture/${venture.id}`);
                    }}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </Button>
            </div>
        </div>
    );
};

// Simple Icons for demo
const RocketIcon = () => (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
