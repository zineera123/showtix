import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserDashboard from '../components/dashboards/UserDashboard';
import ArtistDashboard from '../components/dashboards/ArtistDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back, {user.name}!
        </h1>
        <p className="mt-2 text-gray-500 font-medium">
          Role: <span className="uppercase text-primary tracking-wide text-xs bg-primary/10 px-2 py-1 rounded-full">{user.role}</span>
        </p>
      </div>

      {user.role === 'User' && <UserDashboard />}
      {user.role === 'Artist' && <ArtistDashboard />}
      {user.role === 'Admin' && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
