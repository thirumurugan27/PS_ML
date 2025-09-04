import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import StudentDashboard from '../StudentDashboard/StudentDashboard';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className='min-h-screen'>
      {user.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default DashboardPage;