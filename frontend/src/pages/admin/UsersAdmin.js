import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const RoleBadge = styled.span`
  display: inline-block;
  background-color: ${props => {
    switch(props.role) {
      case 'super_user': return '#e74c3c';
      case 'admin': return '#f39c12';
      case 'club_admin': return '#27ae60';
      default: return '#7f8c8d';
    }
  }};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  text-transform: uppercase;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: #f5f7fa;
  th {
    padding: 1rem;
    text-align: left;
    font-weight: bold;
    color: #2c3e50;
    border-bottom: 2px solid #e5e5e5;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: #f8f9fa;
    }
    &:not(:last-child) {
      border-bottom: 1px solid #e5e5e5;
    }
  }
  
  td {
    padding: 1rem;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &.edit {
    background-color: #3498db;
    color: white;
    
    &:hover {
      background-color: #2980b9;
    }
  }
  
  &.delete {
    background-color: #e74c3c;
    color: white;
    
    &:hover {
      background-color: #c0392b;
    }
  }
  
  &.promote {
    background-color: #f39c12;
    color: white;
    
    &:hover {
      background-color: #d35400;
    }
  }
  
  &.demote {
    background-color: #7f8c8d;
    color: white;
    
    &:hover {
      background-color: #6c7a89;
    }
  }
  
  &:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
  }
  
  button {
    padding: 0.8rem 1.5rem;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    
    &:hover {
      background-color: #2980b9;
    }
  }
`;

const FilterSection = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  select {
    padding: 0.5rem;
    margin-right: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  
  button {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    background-color: ${props => props.active ? '#3498db' : '#f5f7fa'};
    color: ${props => props.active ? 'white' : '#2c3e50'};
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background-color: ${props => props.active ? '#2980b9' : '#e5e5e5'};
    }
    
    &:disabled {
      background-color: #f5f7fa;
      color: #bdc3c7;
      cursor: not-allowed;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input, select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  
  button {
    padding: 0.8rem 1.5rem;
    margin-left: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &.cancel {
      background-color: #f5f7fa;
      color: #2c3e50;
      
      &:hover {
        background-color: #e5e5e5;
      }
    }
    
    &.save {
      background-color: #3498db;
      color: white;
      
      &:hover {
        background-color: #2980b9;
      }
    }
  }
`;

const UsersAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Fetch real users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Authentication error. Please login again.');
          setLoading(false);
          return;
        }
        
        // Make real API call to get users
        const response = await axios.get('/api/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const realUsers = response.data.data;
          setUsers(realUsers);
          setTotalPages(Math.ceil(realUsers.length / 10));
        } else {
          throw new Error('Failed to fetch users');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error(error.response?.data?.error || 'Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Pagination
  const usersPerPage = 10;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  // User actions
  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };
  
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Authentication error. Please login again.');
          return;
        }
        
        // Make real API call to delete user
        const response = await axios.delete(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          // Remove user from state
          setUsers(users.filter(user => user._id !== userId));
          toast.success('User deleted successfully');
        } else {
          throw new Error('Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.error || 'Failed to delete user');
      }
    }
  };
  
  const handlePromoteUser = async (userId) => {
    try {
      // Get current user to determine the new role
      const userToPromote = users.find(user => user._id === userId);
      if (!userToPromote) return;
      
      const newRole = userToPromote.role === 'user' ? 'club_admin' : userToPromote.role === 'club_admin' ? 'admin' : userToPromote.role;
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }
      
      // Make real API call to change user role
      const response = await axios.put(`/api/users/${userId}/role`, 
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update user in state
        setUsers(users.map(user => {
          if (user._id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }));
        
        toast.success('User role updated successfully');
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };
  
  const handleDemoteUser = async (userId) => {
    try {
      // Get current user to determine the new role
      const userToDemote = users.find(user => user._id === userId);
      if (!userToDemote) return;
      
      const newRole = userToDemote.role === 'admin' ? 'club_admin' : userToDemote.role === 'club_admin' ? 'user' : userToDemote.role;
      
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }
      
      // Make real API call to change user role
      const response = await axios.put(`/api/users/${userId}/role`, 
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update user in state
        setUsers(users.map(user => {
          if (user._id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }));
        
        toast.success('User role updated successfully');
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };
  
  const handleVerifyUser = async (userId) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }
      
      // Make real API call to verify user
      const response = await axios.put(`/api/users/${userId}/verify`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update user in state
        setUsers(users.map(user => {
          if (user._id === userId) {
            return { ...user, verified: true };
          }
          return user;
        }));
        
        toast.success('User verified successfully');
      } else {
        throw new Error('Failed to verify user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error(error.response?.data?.error || 'Failed to verify user');
    }
  };
  
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        return;
      }
      
      // Make real API call to update user
      const response = await axios.put(`/api/users/${editingUser._id}`, 
        {
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        // Update user in state
        setUsers(users.map(user => {
          if (user._id === editingUser._id) {
            return response.data.data;
          }
          return user;
        }));
        
        setModalOpen(false);
        toast.success('User updated successfully');
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <AdminContainer>
      <Title>User Management</Title>
      
      <SearchBar>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
        />
        <button onClick={handleSearch}>Search</button>
      </SearchBar>
      
      <FilterSection>
        <select value={roleFilter} onChange={handleRoleFilterChange}>
          <option value="all">All Roles</option>
          <option value="super_user">Super User</option>
          <option value="admin">Admin</option>
          <option value="club_admin">Club Admin</option>
          <option value="user">User</option>
        </select>
      </FilterSection>
      
      <UserTable>
        <TableHead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </TableHead>
        <TableBody>
          {paginatedUsers.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <RoleBadge role={u.role}>
                  {u.role.replace('_', ' ')}
                </RoleBadge>
              </td>
              <td>{u.verified ? 'Verified' : 'Pending'}</td>
              <td>
                <Button
                  className="edit"
                  onClick={() => handleEditUser(u)}
                >
                  Edit
                </Button>
                
                {!u.verified && (
                  <Button
                    className="edit"
                    onClick={() => handleVerifyUser(u._id)}
                  >
                    Verify
                  </Button>
                )}
                
                {/* Don't allow super-users to be demoted or deleted */}
                {u.role !== 'super_user' && (
                  <>
                    {/* Promote/Demote buttons */}
                    {u.role !== 'super_user' && user.role === 'super_user' && (
                      <>
                        {u.role !== 'admin' && (
                          <Button
                            className="promote"
                            onClick={() => handlePromoteUser(u._id)}
                          >
                            Promote
                          </Button>
                        )}
                        
                        {u.role !== 'user' && (
                          <Button
                            className="demote"
                            onClick={() => handleDemoteUser(u._id)}
                          >
                            Demote
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* Only super-users can delete admins */}
                    {(u.role !== 'admin' || user.role === 'super_user') && (
                      <Button
                        className="delete"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </TableBody>
      </UserTable>
      
      {totalPages > 1 && (
        <Pagination>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
              style={{
                backgroundColor: page === currentPage ? '#3498db' : '#f5f7fa',
                color: page === currentPage ? 'white' : '#2c3e50'
              }}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </Pagination>
      )}
      
      {/* Edit User Modal */}
      {modalOpen && editingUser && (
        <Modal>
          <ModalContent>
            <ModalTitle>Edit User</ModalTitle>
            
            <form onSubmit={handleSaveUser}>
              <FormGroup>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  required
                />
              </FormGroup>
              
              {user.role === 'super_user' && editingUser.role !== 'super_user' && (
                <FormGroup>
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="club_admin">Club Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </FormGroup>
              )}
              
              <ModalButtons>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                
                <button type="submit" className="save">
                  Save Changes
                </button>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      )}
    </AdminContainer>
  );
};

export default UsersAdmin;
