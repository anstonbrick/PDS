import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import DashboardHome from './DashboardHome';
import RequestsTable from './RequestsTable';
import UsersTable from './UsersTable';
import ReferralManager from './ReferralManager';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            case 'requests':
                return <RequestsTable />;
            case 'users':
                return <UsersTable />;
            case 'referrals':
                return <ReferralManager />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </AdminLayout>
    );
};

export default AdminDashboard;
