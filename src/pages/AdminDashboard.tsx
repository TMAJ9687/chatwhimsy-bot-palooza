
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '@/hooks/useAdmin';
import { useUser } from '@/context/UserContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, adminActions, bannedUsers } = useAdmin();
  const { user } = useUser();
  
  // Check if user is admin, redirect if not
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  if (loading) {
    return <div>Loading admin dashboard...</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Admin Actions</h2>
          {adminActions.length > 0 ? (
            <ul className="space-y-2">
              {adminActions.slice(0, 5).map((action) => (
                <li key={action.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{action.actionType}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(action.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{action.details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent admin actions</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Banned Users</h2>
          {bannedUsers.length > 0 ? (
            <ul className="space-y-2">
              {bannedUsers.slice(0, 5).map((ban) => (
                <li key={ban.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{ban.identifier}</span>
                    <span className="text-sm text-gray-500">
                      {ban.permanent ? 'Permanent' : `Until ${new Date(ban.expiresAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ban.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users are currently banned</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate('/admin/users')}
        >
          Manage Users
        </button>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate('/admin/reports')}
        >
          View Reports
        </button>
        <button 
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={() => navigate('/admin/bots')}
        >
          Manage Bots
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
