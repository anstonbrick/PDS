import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Package, Search, ChevronDown, Calendar } from 'lucide-react';

const RequestsTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const navigate = useNavigate();

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                navigate('/admin/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusChange = (request, newStatus) => {
        if (newStatus === 'rejected') {
            setSelectedRequest(request);
            setRejectionReason('');
            setIsRejectionModalOpen(true);
        } else {
            updateStatus(request.id, newStatus);
        }
    };

    const confirmRejection = () => {
        if (selectedRequest && rejectionReason.trim()) {
            updateStatus(selectedRequest.id, 'rejected', rejectionReason);
            setIsRejectionModalOpen(false);
            setSelectedRequest(null);
        } else {
            alert("Please provide a reason for rejection.");
        }
    };

    const updateStatus = async (id, newStatus, reason = null) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem('adminToken');
            const body = { status: newStatus };
            if (reason) body.reason = reason;

            const response = await fetch(`/api/admin/requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            await fetchRequests(); // Refresh
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            reviewing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            approved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            production: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
            shipping: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
            completed: 'bg-green-500/10 text-green-500 border-green-500/20',
            on_hold: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            rejected: 'bg-red-500/10 text-red-500 border-red-500/20'
        };
        return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12 text-zinc-500 animate-pulse font-mono tracking-widest">
            LOADING_PDS_DATA_STREAM...
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">PDS Requests // Database</h2>
                <div className="text-zinc-500 font-mono text-xs">{requests.length} RECORDS FOUND</div>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-lg overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-900/50 text-zinc-200 uppercase font-mono text-xs tracking-wider border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timestamps</th>
                                <th className="px-6 py-4">Request Info</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                        {req.status === 'rejected' && req.rejection_reason && (
                                            <div className="mt-2 text-[10px] text-red-400 max-w-[150px] leading-tight border-l border-red-500/50 pl-2">
                                                {req.rejection_reason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs space-y-1">
                                        <div className="flex items-center gap-2 text-zinc-300">
                                            <Clock size={12} className="text-zinc-500" />
                                            {new Date(req.timestamp).toLocaleDateString()}
                                        </div>
                                        {req.updated_at && (
                                            <div className="flex items-center gap-2 text-electric-blue/70">
                                                <Calendar size={12} />
                                                {new Date(req.updated_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold uppercase tracking-tight">{req.operator_name}</div>
                                        <div className="text-xs text-zinc-400 mt-0.5">{req.character_name} <span className="text-zinc-600">//</span> {req.series_source}</div>
                                        <div className="text-[10px] mt-2 font-mono text-zinc-600 bg-black/50 inline-block px-1.5 py-0.5 rounded border border-zinc-800">
                                            {req.access_key}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-zinc-300">{req.contact_handle}</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-widest text-[10px]">{req.contact_method}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative group/select">
                                            {updatingId === req.id ? (
                                                <div className="flex items-center gap-2 text-xs font-mono text-electric-blue animate-pulse">
                                                    <div className="w-2 h-2 rounded-full bg-electric-blue"></div>
                                                    UPDATING...
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        value={req.status}
                                                        onChange={(e) => handleStatusChange(req, e.target.value)}
                                                        disabled={updatingId !== null}
                                                        className="appearance-none bg-black border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-electric-blue w-full min-w-[120px] cursor-pointer hover:border-zinc-500 transition-colors uppercase font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="reviewing">Reviewing</option>
                                                        <option value="approved">Approved</option>
                                                        <option value="production">Production</option>
                                                        <option value="shipping">Shipping</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="on_hold">On Hold</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover/select:text-white transition-colors" />
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rejection Modal */}
            {isRejectionModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-red-500/30 rounded-lg max-w-md w-full p-6 shadow-2xl shadow-red-900/20">
                        <div className="flex items-center gap-3 text-red-500 mb-6">
                            <AlertCircle size={24} />
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Reject Request</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Reason for Denial</label>
                                <textarea
                                    className="w-full bg-black border border-zinc-700 rounded p-3 text-white text-sm focus:outline-none focus:border-red-500 min-h-[100px]"
                                    placeholder="Enter reason for rejection..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    autoFocus
                                />
                                <p className="text-[10px] text-zinc-500">This reason will be visible to the user on the tracking page.</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    onClick={() => {
                                        setIsRejectionModalOpen(false);
                                        setSelectedRequest(null);
                                    }}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRejection}
                                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestsTable;
