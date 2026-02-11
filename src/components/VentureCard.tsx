import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, LayoutGrid } from 'lucide-react';
import { Button } from './ui/Button';

export interface Venture {
    id: string;
    name: string;
    description: string;
    status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
    program: 'Accelerate' | 'Ignite' | 'Liftoff';
    location: string;
    submittedAt: string;
}

interface VentureCardProps {
    venture: Venture;
}

export const VentureCard: React.FC<VentureCardProps> = ({ venture }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <RocketIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{venture.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{venture.description} • {venture.location}</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${venture.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {venture.status === 'Draft' ? 'Draft' : 'Submitted'}
                </div>
            </div>

            {/* Program Tag if applicable */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-gray-400">Selected:</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                    {venture.program}
                </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <ClockIcon />
                <span>Submitted: {venture.submittedAt}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                    onClick={() => navigate(`/dashboard/venture/${venture.id}/workbench`)}
                >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Workbench
                </Button>
                <Button
                    variant="outline"
                    onClick={() => navigate(`/dashboard/venture/${venture.id}`)}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Details
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
