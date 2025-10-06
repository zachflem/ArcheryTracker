import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileContainer = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const ClubList = styled.div`
  margin-top: 1rem;
`;

const ClubItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border: 1px solid transparent;
`;

const ClubLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const ClubInfo = styled.div`
  flex: 1;
`;

const ClubName = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ClubActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 160px;
`;

// Create styled component that can be used as a button or a Link
const MenuItem = styled(({ as: Component = 'button', ...props }) => <Component {...props} />)`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.7rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${props => props.danger ? '#e74c3c' : '#333'};
  text-decoration: none;
  
  &:hover {
    background-color: #f5f7fa;
  }
`;

const RelativeWrapper = styled.div`
  position: relative;
`;

const HomeClubIcon = styled.span`
  color: #3498db;
  margin-left: 0.5rem;
  font-size: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.secondary ? 'white' : props.danger ? '#e74c3c' : '#3498db'};
  color: ${props => props.secondary ? '#3498db' : 'white'};
  border: 2px solid ${props => props.danger ? '#e74c3c' : '#3498db'};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
  
  &:hover {
    background-color: ${props => props.secondary ? '#f5f7fa' : props.danger ? '#c0392b' : '#2980b9'};
  }
  
  &:disabled {
    background-color: #cccccc;
    border-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
  }
`;

const InfoItem = styled.div`
  margin-bottom: 1rem;
  
  strong {
    display: block;
    margin-bottom: 0.25rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background-color: #f5f7fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const ProfilePicture = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin: 0 auto 2rem;
  color: #3498db;
`;

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const history = useHistory();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // State for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State for user clubs and home club
  const [userClubs, setUserClubs] = useState([]);
  const [homeClub, setHomeClub] = useState(null);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [clubsError, setClubsError] = useState('');
  const [homeClubLoading, setHomeClubLoading] = useState(false);
  const [homeClubSuccess, setHomeClubSuccess] = useState('');
  const [homeClubError, setHomeClubError] = useState('');
  const [leaveClubLoading, setLeaveClubLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Mock stats for the profile
  const [stats, setStats] = useState({
    totalRounds: 0,
    avgScore: 0,
    bestScore: 0,
    totalClubs: 0
  });
  
  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setName(user.name);
      setEmail(user.email);

      // Fetch user's clubs
      fetchUserClubs();
    }
    
    // Fetch user stats
    const fetchStats = async () => {
      // In a real implementation, this would be an API call
      // For this MVP, we'll simulate the data
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock stats data
      setStats({
        totalRounds: 12,
        avgScore: 78.5, // percentage
        bestScore: 92.3, // percentage
        totalClubs: 3
      });
    };
    
    fetchStats();
  }, [user]);

  const fetchUserClubs = async () => {
    if (!user) return;

    try {
      setClubsLoading(true);
      setClubsError('');

      const token = localStorage.getItem('token');
      
      // Get current user profile 
      const response = await axios.get(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User profile response:', response.data);
      
      if (response.data.success) {
        const userData = response.data.data;
        console.log('User data:', userData);
        console.log('User clubs from profile:', userData.clubs);
        
        // Get the user's clubs with populated data
        const clubsResponse = await axios.get('/api/clubs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (clubsResponse.data.success) {
          const allClubs = clubsResponse.data.data;
          
          console.log('All clubs:', allClubs);
          
          // Filter to get only the clubs the user is a member of
          const userClubIds = userData.clubs || [];
          console.log('User club IDs:', userClubIds);
          
          // Convert ObjectIDs to strings for comparison if needed
          const userClubs = allClubs.filter(club => {
            const clubId = club._id;
            console.log(`Checking if user is member of club ${club.name} (${clubId})`);
            
            // Handle various ways the ID might be represented
            return userClubIds.some(id => {
              // If id is an object with _id property
              if (id && typeof id === 'object' && id._id) {
                return id._id.toString() === clubId.toString();
              }
              // If id is a string, compare directly
              else if (typeof id === 'string') {
                return id === clubId;
              }
              // Direct comparison as a fallback
              return id === clubId;
            });
          });
          
          console.log('Filtered user clubs:', userClubs);
          
          // Mark the home club
          const homeClubId = userData.homeClub;
          const homeClubData = userClubs.find(club => club._id === homeClubId) || null;
          
          const clubsWithHomeFlag = userClubs.map(club => ({
            ...club,
            isHomeClub: club._id === homeClubId
          }));
          
          // Sort clubs so home club appears first
          const sortedClubs = [...clubsWithHomeFlag].sort((a, b) => {
            if (a.isHomeClub) return -1;
            if (b.isHomeClub) return 1;
            return a.name.localeCompare(b.name);
          });
          
          console.log('User clubs:', sortedClubs);
          
          setUserClubs(sortedClubs);
          setHomeClub(homeClubData);
          setStats(prevStats => ({
            ...prevStats,
            totalClubs: sortedClubs.length
          }));
        }
      }

      setClubsLoading(false);
    } catch (error) {
      console.error('Error fetching user clubs:', error);
      setClubsError('Failed to load your clubs');
      setClubsLoading(false);
    }
  };

  const handleSetHomeClub = async (clubId) => {
    try {
      setHomeClubLoading(true);
      setHomeClubError('');
      setHomeClubSuccess('');

      const token = localStorage.getItem('token');
      
      // Debug the user object
      console.log('Current user object:', user);
      
      // Determine the user ID (could be user._id or user.id)
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('User ID is undefined or null');
        setHomeClubError('User ID not found, please try logging out and back in');
        setHomeClubLoading(false);
        return;
      }
      
      console.log('Using user ID for API call:', userId);
      
      // Set the home club via API
      const response = await axios.put(
        `/api/users/${userId}/homeclub`, 
        { clubId },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      console.log('Set home club response:', response.data);
      
      if (response.data.success) {
        // Find the selected club
        const selectedClub = userClubs.find(club => club._id === clubId);
        
        if (!selectedClub) {
          throw new Error('Club not found');
        }
        
        // Update the home club in our state
        setHomeClub(selectedClub);
        
        // Update the clubs list to show the home club first
        const updatedClubs = userClubs.map(club => ({
          ...club,
          isHomeClub: club._id === clubId
        }));
        
        // Sort clubs so home club appears first
        const sortedClubs = [...updatedClubs].sort((a, b) => {
          if (a.isHomeClub) return -1;
          if (b.isHomeClub) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setUserClubs(sortedClubs);
        setHomeClubSuccess('Home club updated successfully');
      } else {
        setHomeClubError('Failed to update home club');
      }

      setHomeClubLoading(false);
    } catch (error) {
      console.error('Error setting home club:', error);
      setHomeClubError('Failed to update home club');
      setHomeClubLoading(false);
    }
  };
  
  const handleLeaveClub = async (clubId, clubName) => {
    // Confirm user wants to leave the club
    if (!window.confirm(`Are you sure you want to leave ${clubName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLeaveClubLoading(true);
      setClubsError('');
      
      const token = localStorage.getItem('token');
      
      // Determine the user ID (could be user._id or user.id)
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('User ID is undefined or null');
        setClubsError('User ID not found, please try logging out and back in');
        setLeaveClubLoading(false);
        return;
      }
      
      console.log(`Attempting to leave club ${clubName} (${clubId})`);
      
      // Check if this is the home club
      const isHomeClub = homeClub && homeClub._id === clubId;
      
      // If this is the home club, clear the home club first
      if (isHomeClub) {
        console.log('This is the home club, clearing home club first');
        await axios.put(
          `/api/users/${userId}/homeclub`,
          { clubId: null },
          { headers: { Authorization: `Bearer ${token}` }}
        );
      }
      
      // Remove user from club members
      const response = await axios.delete(
        `/api/clubs/${clubName}/members/${userId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('Leave club response:', response.data);
      
      if (response.data.success) {
        // Remove club from UI
        const updatedClubs = userClubs.filter(club => club._id !== clubId);
        
        // Update home club if needed
        if (isHomeClub) {
          setHomeClub(null);
        }
        
        setUserClubs(updatedClubs);
        setStats(prevStats => ({
          ...prevStats,
          totalClubs: updatedClubs.length
        }));
        
        toast.success(`You have left ${clubName}`);
      } else {
        setClubsError(`Failed to leave club: ${response.data.error || 'Unknown error'}`);
      }
      
      setLeaveClubLoading(false);
      // Close any open menus
      setOpenMenuId(null);
      
    } catch (error) {
      console.error('Error leaving club:', error);
      setClubsError('Failed to leave club. Please try again.');
      setLeaveClubLoading(false);
    }
  };
  
  const toggleMenu = (clubId) => {
    setOpenMenuId(openMenuId === clubId ? null : clubId);
  };

  const clearHomeClub = async () => {
    try {
      setHomeClubLoading(true);
      setHomeClubError('');
      setHomeClubSuccess('');

      const token = localStorage.getItem('token');
      
      // Determine the user ID (could be user._id or user.id)
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('User ID is undefined or null');
        setHomeClubError('User ID not found, please try logging out and back in');
        setHomeClubLoading(false);
        return;
      }
      
      console.log('Using user ID for API call:', userId);
      
      // Clear the home club via API
      const response = await axios.put(
        `/api/users/${userId}/homeclub`,
        { clubId: null },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('Clear home club response:', response.data);
      
      if (response.data.success) {
        // Update the home club in our state
        setHomeClub(null);
        
        // Update the clubs list to remove the home club designation
        const updatedClubs = userClubs.map(club => ({
          ...club,
          isHomeClub: false
        }));
        
        // Sort clubs alphabetically since there's no home club
        const sortedClubs = [...updatedClubs].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        
        setUserClubs(sortedClubs);
        setHomeClubSuccess('Home club removed successfully');
      } else {
        setHomeClubError('Failed to remove home club');
      }
      
      setHomeClubLoading(false);
    } catch (error) {
      console.error('Error removing home club:', error);
      setHomeClubError('Failed to remove home club');
      setHomeClubLoading(false);
    }
  };
  
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    
    // Validate input
    if (!name.trim()) {
      return setError('Name is required');
    }
    
    if (!email.trim()) {
      return setError('Email is required');
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      // For this MVP, we'll simulate a successful response
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the profile
      // updateProfile({ name, email }); // This would be called in a real implementation
      
      setSuccess('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      setError('Failed to update profile');
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate input
    if (!currentPassword) {
      return setPasswordError('Current password is required');
    }
    
    if (!newPassword) {
      return setPasswordError('New password is required');
    }
    
    if (newPassword !== confirmPassword) {
      return setPasswordError('Passwords do not match');
    }
    
    if (newPassword.length < 6) {
      return setPasswordError('Password must be at least 6 characters long');
    }
    
    try {
      setPasswordLoading(true);
      
      // In a real implementation, this would be an API call
      // For this MVP, we'll simulate a successful response
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordLoading(false);
    } catch (err) {
      setPasswordError('Failed to change password');
      setPasswordLoading(false);
    }
  };
  
  return (
    <ProfileContainer>
      <Title>My Profile</Title>
      
      <Card>
        <ProfilePicture>🏹</ProfilePicture>
        
        <SectionTitle>Personal Information</SectionTitle>
        <Form onSubmit={handleUpdateProfile}>
          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </Form>
      </Card>
      
      <Card>
        <SectionTitle>Change Password</SectionTitle>
        <Form onSubmit={handleChangePassword}>
          <FormGroup>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormGroup>
          
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
          {passwordSuccess && <SuccessMessage>{passwordSuccess}</SuccessMessage>}
          
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </Form>
      </Card>
      
      <Card>
        <SectionTitle>Archery Statistics</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalRounds}</StatValue>
            <StatLabel>Total Rounds</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.avgScore}%</StatValue>
            <StatLabel>Average Score</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.bestScore}%</StatValue>
            <StatLabel>Best Score</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatValue>{stats.totalClubs}</StatValue>
            <StatLabel>Club Memberships</StatLabel>
          </StatCard>
        </StatsGrid>
      </Card>
      
      <Card>
        <SectionTitle>Club Memberships</SectionTitle>
        
        {clubsLoading ? (
          <p>Loading your club memberships...</p>
        ) : clubsError ? (
          <ErrorMessage>{clubsError}</ErrorMessage>
        ) : userClubs.length === 0 ? (
          <div>
            <p>You are not a member of any clubs yet.</p>
            <Button as={Link} to="/clubs">Browse Clubs</Button>
          </div>
        ) : (
          <>
            <div>
              <Label>Set Home Club</Label>
              <p style={{ marginBottom: '1rem' }}>
                Your home club is where you shoot most often. Setting a home club gives you quick access to its courses and events.
              </p>
              
              {homeClubError && <ErrorMessage>{homeClubError}</ErrorMessage>}
              {homeClubSuccess && <SuccessMessage>{homeClubSuccess}</SuccessMessage>}
              
              <ClubList>
                {userClubs.map(club => (
                  <ClubItem key={club._id} isHomeClub={homeClub && homeClub._id === club._id}>
                    <ClubLogo>
                      {club.logo ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL}/uploads/images/${club.logo}`} 
                          alt={`${club.name} logo`} 
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            e.target.parentNode.innerHTML = '🏹';
                          }}
                        />
                      ) : (
                        <>🏹</>
                      )}
                    </ClubLogo>
                    <ClubInfo>
                      <ClubName>
                        {club.name}
                        {homeClub && homeClub._id === club._id && (
                          <HomeClubIcon title="Home Club">🏠</HomeClubIcon>
                        )}
                      </ClubName>
                    </ClubInfo>
                    <ClubActions>
                      <RelativeWrapper>
                        <MenuButton onClick={() => toggleMenu(club._id)}>
                          ⋮
                        </MenuButton>
                        
                        {openMenuId === club._id && (
                          <MenuDropdown>
                            <MenuItem 
                              as={Link} 
                              to={`/clubs/${club.name}`}
                            >
                              View Club
                            </MenuItem>
                            {homeClub && homeClub._id === club._id ? (
                              <MenuItem 
                                onClick={clearHomeClub}
                                disabled={homeClubLoading}
                              >
                                Remove as Home Club
                              </MenuItem>
                            ) : (
                              <MenuItem 
                                onClick={() => handleSetHomeClub(club._id)}
                                disabled={homeClubLoading}
                              >
                                Set as Home Club
                              </MenuItem>
                            )}
                            <MenuItem 
                              onClick={() => handleLeaveClub(club._id, club.name)}
                              disabled={leaveClubLoading}
                              danger
                            >
                              Leave Club
                            </MenuItem>
                          </MenuDropdown>
                        )}
                      </RelativeWrapper>
                    </ClubActions>
                  </ClubItem>
                ))}
              </ClubList>
            </div>
          </>
        )}
      </Card>
      
      <Card>
        <SectionTitle>Account Settings</SectionTitle>
        <Button danger onClick={() => window.confirm('Are you sure you want to delete your account? This action cannot be undone.')}>
          Delete Account
        </Button>
      </Card>
    </ProfileContainer>
  );
};

export default Profile;
