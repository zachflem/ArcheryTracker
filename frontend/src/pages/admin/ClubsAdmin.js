import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import ClubAdminPanel from '../../components/clubs/ClubAdminPanel';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.primary ? '#3498db' : 'white'};
  color: ${props => props.primary ? 'white' : '#3498db'};
  border: 2px solid #3498db;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#f5f7fa'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClubSelectionSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const ClubSelectorLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const ClubSelector = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
`;

const NoClubsMessage = styled.div`
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const ClubsAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const history = useHistory();

  // Determine if user is a system admin (can see all clubs) or just a club admin
  const isSystemAdmin = user && (user.role === 'admin' || user.role === 'super_user');
  const isClubAdmin = user && user.role === 'club_admin';

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Get all clubs the user has access to
      const response = await axios.get('/api/clubs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        let availableClubs = response.data.data;
        
        // If not a system admin, filter to only show clubs where user is an admin
        if (!isSystemAdmin) {
          availableClubs = availableClubs.filter(club => 
            club.admins && club.admins.some(admin => 
              (admin._id === user._id || admin === user._id || admin.toString() === user._id)
            )
          );
        }
        
        setClubs(availableClubs);
        
        // If there are clubs, select the first one by default
        if (availableClubs.length > 0) {
          setSelectedClub(availableClubs[0]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Failed to load clubs');
      setLoading(false);
    }
  };

  const handleClubChange = (e) => {
    const clubId = e.target.value;
    const club = clubs.find(c => c._id === clubId);
    setSelectedClub(club);
  };

  // Handle club data refresh after updates
  const handleClubUpdate = async () => {
    await fetchClubs();
    
    // If the selected club was updated, make sure to get the latest version
    if (selectedClub) {
      const updatedSelectedClub = clubs.find(club => club._id === selectedClub._id);
      if (updatedSelectedClub) {
        setSelectedClub(updatedSelectedClub);
      }
    }
  };

  if (loading) {
    return <LoadingMessage>Loading clubs...</LoadingMessage>;
  }

  if (clubs.length === 0) {
    return (
      <AdminContainer>
        <SectionTitle>Club Administration</SectionTitle>
        
        {isClubAdmin ? (
          <NoClubsMessage>
            <p>You are not an admin for any clubs.</p>
          </NoClubsMessage>
        ) : (
          <NoClubsMessage>
            <p>No clubs found in the system.</p>
            <Button primary onClick={() => history.push('/clubs/new')}>Create a Club</Button>
          </NoClubsMessage>
        )}
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <SectionTitle>Club Administration</SectionTitle>
      
      <ClubSelectionSection>
        <ClubSelectorLabel htmlFor="club-selector">Select a club to manage:</ClubSelectorLabel>
        <ClubSelector 
          id="club-selector"
          value={selectedClub?._id || ''}
          onChange={handleClubChange}
        >
          {clubs.map(club => (
            <option key={club._id} value={club._id}>
              {club.name}
            </option>
          ))}
        </ClubSelector>
        
        {isSystemAdmin && (
          <Button primary onClick={() => history.push('/clubs/new')}>
            Create New Club
          </Button>
        )}
      </ClubSelectionSection>
      
      {selectedClub && (
        <ClubAdminPanel 
          club={selectedClub} 
          onUpdate={handleClubUpdate} 
        />
      )}
    </AdminContainer>
  );
};

export default ClubsAdmin;
