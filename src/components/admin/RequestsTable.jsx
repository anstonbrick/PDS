import React, { useEffect, useState } from 'react';

const RequestsTable = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('adminToken');
            await fetch(`/api/admin/requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchRequests(); // Refresh
        } catch (error) {
            console.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-zinc-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">PDS Requests</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-zinc-950 text-zinc-200 uppercase font-mono text-xs">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Request Info</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                            req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                req.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {new Date(req.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{req.operator_name}</div>
                                        <div className="text-xs">{req.character_name} ({req.series_source})</div>
                                        <div className="text-xs mt-1 bg-zinc-800 inline-block px-1 rounded">{req.access_key}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{req.contact_handle}</div>
                                        <div className="text-xs opacity-75">{req.contact_method}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={req.status}
                                            onChange={(e) => updateStatus(req.id, e.target.value)}
                                            className="bg-black border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="completed">Completed</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RequestsTable;
