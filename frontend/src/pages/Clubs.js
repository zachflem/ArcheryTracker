import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ClubsContainer = styled.div`
  padding: 1rem;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CreateButton = styled(Link)`
  padding: 0.7rem 1.2rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 2rem;
`;

const SearchInput = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 500px;
`;

const ClubGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ClubCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const ClubImage = styled.div`
  height: 150px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ClubDetails = styled.div`
  padding: 1.5rem;
`;

const ClubName = styled.h2`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const ClubLocation = styled.p`
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const ClubLink = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f5f7fa;
  border-radius: 8px;
`;

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        
        // Get auth token
        const token = localStorage.getItem('token');
        
        // Fetch clubs from API
        const response = await axios.get('/api/clubs', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Log more detailed information about the API response
        console.log('Clubs API response:', response.data);
        console.log('Clubs API success:', response.data.success);
        console.log('Clubs API count:', response.data.count);
        console.log('Clubs API data:', response.data.data);
        
        if (response.data.success) {
          const fetchedClubs = response.data.data || [];
          console.log('Number of clubs fetched:', fetchedClubs.length);
          
          if (fetchedClubs.length === 0) {
            console.log('No clubs returned from API');
          } else {
            console.log('First club example:', fetchedClubs[0]);
          }
          
          setClubs(fetchedClubs);
          setFilteredClubs(fetchedClubs);
        } else {
          console.error('API returned success: false', response.data);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setLoading(false);
      }
    };
    
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClubs(clubs);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = clubs.filter(club => {
      // Create a safe search function that handles undefined/null values
      const safeSearch = (value) => {
        return typeof value === 'string' && value.toLowerCase().includes(term);
      };
      
      // Check name
      if (safeSearch(club.name)) return true;
      
      // Check location address
      if (club.location && safeSearch(club.location.address)) return true;
      
      // Check description
      if (safeSearch(club.description)) return true;
      
      // Check contact info
      if (club.contactInfo) {
        if (safeSearch(club.contactInfo.email)) return true;
        if (safeSearch(club.contactInfo.phone)) return true;
        if (safeSearch(club.contactInfo.website)) return true;
      }
      
      // Check affiliation
      if (safeSearch(club.affiliation)) return true;
      
      // Check contact person
      if (safeSearch(club.contactPerson)) return true;
      
      return false;
    });
    
    setFilteredClubs(results);
  }, [searchTerm, clubs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <ClubsContainer>
      <TitleRow>
        <Title>Archery Clubs</Title>
        <CreateButton to="/clubs/new">
          + Create Club
        </CreateButton>
      </TitleRow>
      
      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search clubs by name or location..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </SearchBar>
      
      {loading ? (
        <p>Loading clubs...</p>
      ) : filteredClubs.length > 0 ? (
        <ClubGrid>
          {filteredClubs.map(club => (
            <ClubCard key={club._id}>
              <ClubImage>
                {club.logo ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL || ''}/uploads/images/${club.logo}`} 
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
              </ClubImage>
              <ClubDetails>
                <ClubName>{club.name || 'Unnamed Club'}</ClubName>
                <ClubLocation>
                  {club.location && club.location.address 
                    ? club.location.address 
                    : 'Location not specified'}
                </ClubLocation>
                <p>{club.description || 'No description available'}</p>
                <ClubLink to={`/clubs/${club.name}`}>View Details</ClubLink>
              </ClubDetails>
            </ClubCard>
          ))}
        </ClubGrid>
      ) : (
        <EmptyState>
          <h2>No clubs found</h2>
          <p>
            {searchTerm ? 
              'No clubs match your search criteria. Try adjusting your search.' : 
              'No clubs have been added yet. Click "Create Club" to add the first club.'}
          </p>
        </EmptyState>
      )}
    </ClubsContainer>
  );
};

export default Clubs;
