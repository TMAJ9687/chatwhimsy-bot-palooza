
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { isAdminLoggedIn } from '@/services/admin/adminService';
import { 
  getTrafficStatistics, 
  getUserStatistics, 
  getContentStatistics, 
  getSystemStatistics 
} from '@/utils/adminUtils';

// Import refactored components
import AdminSidebar from '@/components/admin/AdminSidebar';
import UserManagement from '@/components/admin/UserManagement';
import BanUserDialog from '@/components/admin/dialogs/BanUserDialog';
import UpgradeToVIPDialog from '@/components/admin/dialogs/UpgradeToVIPDialog';
import ConfirmationDialog from '@/components/admin/dialogs/ConfirmationDialog';
import StatisticsOverview from '@/components/admin/statistics/StatisticsOverview';
import AdminSettings from '@/components/admin/AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  // Local state variables
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [statsTab, setStatsTab] = useState("traffic");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    description: "",
    action: () => {},
  });
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [trafficStats, setTrafficStats] = useState(getTrafficStatistics());
  const [userStats, setUserStats] = useState(getUserStatistics());
  const [contentStats, setContentStats] = useState(getContentStatistics());
  const [systemStats, setSystemStats] = useState(getSystemStatistics());

  // Function to format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Function to calculate percentage change
  const getPercentChange = () => {
    return `${Math.floor(Math.random() * 100)}%`;
  };

  // Mock function to fetch user data
  const fetchUsers = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockUsers = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 3 === 0 ? "admin" : i % 2 === 0 ? "vip" : "standard",
      status: i % 4 === 0 ? "active" : "inactive",
      lastLogin: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      registrationDate: new Date(Date.now() - (i + 7) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    }));
    setUsers(mockUsers);
    setLoading(false);
  };

  // Function to handle user impersonation
  const handleImpersonateUser = (user) => {
    setAlertConfig({
      title: "Impersonate User",
      description: `Are you sure you want to impersonate ${user.name}?`,
      action: () => {
        // Create a proper UserProfile object with all required fields
        setUser({
          id: user.id.toString(),
          nickname: user.name,
          email: user.email,
          gender: 'male',  // Default values for required fields
          age: 30,
          country: 'US',
          interests: [],
          isVip: user.role === "vip",
          isAdmin: user.role === "admin",
          subscriptionTier: 'none',
          imagesRemaining: 10,
          voiceMessagesRemaining: 10
        });
        
        toast({
          title: "User Impersonated",
          description: `You are now impersonating ${user.name}.`,
        });
        navigate("/");
      },
    });
    setAlertOpen(true);
  };

  // Function to handle user deactivation
  const handleDeactivateUser = (user) => {
    setAlertConfig({
      title: "Deactivate User",
      description: `Are you sure you want to deactivate ${user.name}?`,
      action: () => {
        // Simulate API call
        toast({
          title: "User Deactivated",
          description: `${user.name} has been deactivated.`,
        });
      },
    });
    setAlertOpen(true);
  };

  // Function to handle user deletion
  const handleDeleteUser = (user) => {
    setAlertConfig({
      title: "Delete User",
      description: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      action: () => {
        // Simulate API call
        toast({
          title: "User Deleted",
          description: `${user.name} has been permanently deleted.`,
        });
      },
    });
    setAlertOpen(true);
  };

  // Function to handle opening the ban user dialog
  const handleOpenBanDialog = (user) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  // Function to handle submitting the ban user form
  const submitBanUser = async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "User Banned",
      description: `${selectedUser?.name} has been banned for ${values.duration} with reason: ${values.reason}.`,
    });
    setBanDialogOpen(false);
  };

  // Function to handle opening the upgrade to VIP dialog
  const handleOpenUpgradeDialog = (user) => {
    setSelectedUser(user);
    setUpgradeDialogOpen(true);
  };

  // Function to handle submitting the upgrade to VIP form
  const submitUpgradeToVIP = async (values) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast({
      title: "User Upgraded to VIP",
      description: `${selectedUser?.name} has been upgraded to VIP for ${values.duration}.`,
    });
    setUpgradeDialogOpen(false);
  };

  // useEffect hook to check admin login status and fetch user data on component mount
  useEffect(() => {
    const checkAdminLogin = async () => {
      const isLoggedIn = await isAdminLoggedIn();
      if (!isLoggedIn) {
        navigate("/admin/login");
      } else {
        fetchUsers();
      }
    };

    checkAdminLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation */}
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg">Loading admin data...</p>
            </div>
          ) : (
            <>
              {/* User Management Tab */}
              {activeTab === "users" && (
                <UserManagement 
                  users={users}
                  onImpersonateUser={handleImpersonateUser}
                  onOpenUpgradeDialog={handleOpenUpgradeDialog}
                  onOpenBanDialog={handleOpenBanDialog}
                  onDeactivateUser={handleDeactivateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {/* Statistics Tab */}
              {activeTab === "statistics" && (
                <StatisticsOverview 
                  statsTab={statsTab}
                  setStatsTab={setStatsTab}
                  trafficStats={trafficStats}
                  userStats={userStats}
                  contentStats={contentStats}
                  systemStats={systemStats}
                  formatNumber={formatNumber}
                  getPercentChange={getPercentChange}
                />
              )}
              
              {/* Settings Tab */}
              {activeTab === "settings" && (
                <AdminSettings />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertConfig.title}
        description={alertConfig.description}
        onConfirm={() => {
          alertConfig.action();
          setAlertOpen(false);
        }}
      />
      
      {/* Ban User Dialog */}
      <BanUserDialog 
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        selectedUser={selectedUser}
        onBanUser={submitBanUser}
      />
      
      {/* Upgrade to VIP Dialog */}
      <UpgradeToVIPDialog 
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        selectedUser={selectedUser}
        onUpgradeToVIP={submitUpgradeToVIP}
      />
    </div>
  );
};

export default AdminDashboard;
