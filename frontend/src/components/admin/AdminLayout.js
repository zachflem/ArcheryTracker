import React from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../common/MainLayout';

const AdminHeader = styled.div`
  background-color: #f5f7fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 2rem;
`;

const AdminTitle = styled.h1`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const AdminDescription = styled.p`
  color: #7f8c8d;
  margin: 0;
`;

const AdminLayout = ({ children, title, description, requiredRole = ['super_user', 'admin'] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Check if user has required role
  const hasAccess = () => {
    if (!isAuthenticated || !user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // Redirect to dashboard if user doesn't have the required role
  if (!hasAccess()) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <MainLayout>
      <AdminHeader>
        <AdminTitle>{title}</AdminTitle>
        {description && <AdminDescription>{description}</AdminDescription>}
      </AdminHeader>
      {children}
    </MainLayout>
  );
};

export default AdminLayout;
