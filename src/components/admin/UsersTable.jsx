import React, { useEffect, useState } from 'react';

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error('Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="text-zinc-500">Loading users...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Registered Users</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-950 text-zinc-200 uppercase font-mono text-xs">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Referral Used</th>
                            <th className="px-6 py-4">Joined At</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-4 font-mono">{user.id}</td>
                                <td className="px-6 py-4 text-white font-medium">{user.username}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-500/10 text-zinc-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{user.referral_code}</td>
                                <td className="px-6 py-4 font-mono text-xs">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;
