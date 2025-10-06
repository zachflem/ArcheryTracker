import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ClubDetailsContainer = styled.div`
  padding: 1rem;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #3498db;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ClubHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ClubImage = styled.div`
  width: 100%;
  height: 200px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  
  @media (min-width: 768px) {
    width: 300px;
    margin-right: 2rem;
    margin-bottom: 0;
  }
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ClubInfo = styled.div`
  flex: 1;
`;

const ClubName = styled.h1`
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const ClubLocation = styled.p`
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const ClubDescription = styled.p`
  margin-bottom: 1.5rem;
`;

const ContactInfoSection = styled.div`
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1.2rem;
  border-radius: 8px;
`;

const ContactItem = styled.div`
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ContactIcon = styled.span`
  margin-right: 0.8rem;
  font-size: 1.2rem;
  color: #3498db;
  min-width: 24px;
  text-align: center;
`;

const SocialMediaLinks = styled.div`
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const SocialMediaLink = styled.a`
  color: #fff;
  background-color: #3498db;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s;
  
  &:hover {
    background-color: #2980b9;
    transform: translateY(-3px);
  }
`;

const ClubMetadata = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const MetadataItem = styled.div`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.primary ? '#3498db' : 'white'};
  color: ${props => props.primary ? 'white' : '#3498db'};
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#f5f7fa'};
  }
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const CourseCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const CourseImage = styled.div`
  height: 120px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const CourseDetails = styled.div`
  padding: 1.5rem;
`;

const CourseName = styled.h3`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const CourseLink = styled(Link)`
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

const EventsList = styled.div`
  margin-bottom: 2rem;
`;

const EventCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const EventTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const EventDate = styled.p`
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const MembersList = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  color: #3498db;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const ModalButton = styled.button`
  padding: 0.8rem 1.2rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid;
  
  ${props => {
    if (props.primary) {
      return `
        background-color: #3498db;
        border-color: #3498db;
        color: white;
        &:hover {
          background-color: #2980b9;
          border-color: #2980b9;
        }
      `;
    } else if (props.secondary) {
      return `
        background-color: #2ecc71;
        border-color: #2ecc71;
        color: white;
        &:hover {
          background-color: #27ae60;
          border-color: #27ae60;
        }
      `;
    } else {
      return `
        background-color: white;
        border-color: #e74c3c;
        color: #e74c3c;
        &:hover {
          background-color: #fdf4f4;
        }
      `;
    }
  }}
`;

const ClubDetails = () => {
  const { name } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  
  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        
        // Get auth token
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log(`Fetching club details for name: ${name}`);
        
        // Fetch club data from API
        const clubResponse = await axios.get(`/api/clubs/${name}`, { headers });
        console.log('Club details response:', clubResponse.data);
        
        if (!clubResponse.data.success) {
          throw new Error(clubResponse.data.error || 'Failed to fetch club details');
        }
        
        const clubData = clubResponse.data.data;
        setClub(clubData);
        
        // If the club has courses, fetch those
        if (clubData.courses && clubData.courses.length > 0) {
          try {
            const coursesResponse = await axios.get(`/api/clubs/${name}/courses`, { headers });
            if (coursesResponse.data.success) {
              setCourses(coursesResponse.data.data);
            }
          } catch (courseError) {
            console.error('Error fetching courses:', courseError);
            setCourses([]);
          }
        } else {
          setCourses([]);
        }
        
        // If the club has events, fetch those
        if (clubData.events && clubData.events.length > 0) {
          try {
            const eventsResponse = await axios.get(`/api/clubs/${name}/events`, { headers });
            if (eventsResponse.data.success) {
              setEvents(eventsResponse.data.data);
            }
          } catch (eventError) {
            console.error('Error fetching events:', eventError);
            setEvents([]);
          }
        } else {
          setEvents([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching club details:', error);
        setLoading(false);
      }
    };
    
    fetchClubDetails();
  }, [name]);

  if (loading) {
    return (
      <ClubDetailsContainer>
        <p>Loading club details...</p>
      </ClubDetailsContainer>
    );
  }

  if (!club) {
    return (
      <ClubDetailsContainer>
        <BackLink to="/clubs">← Back to Clubs</BackLink>
        <p>Club not found. The club may have been removed or you don't have access.</p>
      </ClubDetailsContainer>
    );
  }

  return (
    <ClubDetailsContainer>
      <BackLink to="/clubs">← Back to Clubs</BackLink>
      
      <ClubHeader>
        <ClubImage>
          {club.logo ? (
            <img src={`${process.env.REACT_APP_API_URL}/uploads/images/${club.logo}`} alt={`${club.name} logo`} />
          ) : (
            <>🏹</>
          )}
        </ClubImage>
        <ClubInfo>
          <ClubName>{club.name}</ClubName>
          <ClubLocation>{club.location.address}</ClubLocation>
          <ClubDescription>{club.description}</ClubDescription>
          
          <ActionButtons>
            <Button primary onClick={() => setShowJoinModal(true)}>Join Club</Button>
            {user && (user.role === 'admin' || user.role === 'super_user' || (club.admins && club.admins.some(admin => 
              (admin._id === user._id || admin === user._id)
            ))) && (
              <Button onClick={() => history.push(`/clubs/edit/${club.name}`)}>Edit Club</Button>
            )}
          </ActionButtons>
          
          <ContactInfoSection>
              <h3 style={{ marginBottom: '1rem' }}>Contact Information</h3>
              
              {club.contactPerson && (
                <ContactItem>
                  <ContactIcon>👤</ContactIcon>
                  <div>{club.contactPerson}</div>
                </ContactItem>
              )}
              
              {club.contactEmail && (
                <ContactItem>
                  <ContactIcon>✉️</ContactIcon>
                  <div>
                    <a href={`mailto:${club.contactEmail}`} style={{ color: '#3498db', textDecoration: 'none' }}>
                      {club.contactEmail}
                    </a>
                  </div>
                </ContactItem>
              )}
              
              {club.contactPhone && (
                <ContactItem>
                  <ContactIcon>📞</ContactIcon>
                  <div>{club.contactPhone}</div>
                </ContactItem>
              )}
              
              {club.website && (
                <ContactItem>
                  <ContactIcon>🌐</ContactIcon>
                  <div>
                    <a 
                      href={club.website.startsWith('http') ? club.website : `https://${club.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3498db', textDecoration: 'none' }}
                    >
                      {club.website}
                    </a>
                  </div>
                </ContactItem>
              )}
              
              {club.location && club.location.address && (
                <ContactItem>
                  <ContactIcon>📍</ContactIcon>
                  <div>{club.location.address}</div>
                </ContactItem>
              )}
              
              {club.affiliation && (
                <ContactItem>
                  <ContactIcon>🏆</ContactIcon>
                  <div>Affiliated with: {club.affiliation}</div>
                </ContactItem>
              )}
              
              {/* Social Media Links */}
              {club.socialLinks && Object.keys(club.socialLinks).length > 0 && (
                <SocialMediaLinks>
                  {club.socialLinks.facebook && (
                    <SocialMediaLink href={club.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      f
                    </SocialMediaLink>
                  )}
                  {club.socialLinks.instagram && (
                    <SocialMediaLink href={club.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      i
                    </SocialMediaLink>
                  )}
                  {club.socialLinks.twitter && (
                    <SocialMediaLink href={club.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      t
                    </SocialMediaLink>
                  )}
                  {club.socialLinks.youtube && (
                    <SocialMediaLink href={club.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      y
                    </SocialMediaLink>
                  )}
                </SocialMediaLinks>
              )}
            </ContactInfoSection>
            
            <ClubMetadata>
              {club.established && (
                <MetadataItem><strong>Established:</strong> {new Date(club.established).getFullYear()}</MetadataItem>
              )}
              {club.memberCount && (
                <MetadataItem><strong>Members:</strong> {club.memberCount}</MetadataItem>
              )}
            </ClubMetadata>
        </ClubInfo>
      </ClubHeader>
      
      <section>
        <SectionTitle>Courses</SectionTitle>
        {courses.length > 0 ? (
          <CourseGrid>
            {courses.map(course => (
              <CourseCard key={course._id}>
                <CourseImage>🎯</CourseImage>
                <CourseDetails>
                  <CourseName>{course.name}</CourseName>
                  <p>{course.description}</p>
                  <p><strong>Targets:</strong> {course.targets}</p>
                  <p><strong>Scoring:</strong> {course.scoringSystem}</p>
                  <CourseLink to={`/courses/${course._id}`}>View Course</CourseLink>
                </CourseDetails>
              </CourseCard>
            ))}
          </CourseGrid>
        ) : (
          <p>No courses available for this club.</p>
        )}
      </section>
      
      <section>
        <SectionTitle>Upcoming Events</SectionTitle>
        {events.length > 0 ? (
          <EventsList>
            {events.map(event => (
              <EventCard key={event._id}>
                <EventTitle>{event.name}</EventTitle>
                <EventDate>{new Date(event.date).toLocaleDateString()}</EventDate>
                <p>{event.description}</p>
                <p><strong>Participants:</strong> {event.participants}</p>
              </EventCard>
            ))}
          </EventsList>
        ) : (
          <p>No upcoming events for this club.</p>
        )}
      </section>
      
      {/* Join Club Modal */}
      {showJoinModal && (
        <Modal onClick={() => setShowJoinModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Join {club.name}</ModalTitle>
            
            {joinError && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{joinError}</p>}
            {joinSuccess && <p style={{ color: '#2ecc71', marginBottom: '1rem' }}>{joinSuccess}</p>}
            
            {!joinSuccess && (
              <>
                <ModalText>
                  By joining this club:
                  <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                    <li>Your details will be shared with the club admins.</li>
                    <li>You will be shown information about this club as a priority around the website.</li>
                    <li>You can make this club your 'Home Club' to improve the user experience for commonly completed tasks.</li>
                  </ul>
                </ModalText>
                
                <ModalActions>
                  <ModalButton 
                    secondary 
                    disabled={joining}
                    onClick={() => handleJoinClub(true)}
                  >
                    {joining ? 'Processing...' : 'Join and make this my home club'}
                  </ModalButton>
                  
                  <ModalButton 
                    primary 
                    disabled={joining}
                    onClick={() => handleJoinClub(false)}
                  >
                    {joining ? 'Processing...' : 'Join, but I\'m just a visitor'}
                  </ModalButton>
                  
                  <ModalButton 
                    onClick={() => setShowJoinModal(false)}
                    disabled={joining}
                  >
                    No, don't join the club
                  </ModalButton>
                </ModalActions>
              </>
            )}
            
            {joinSuccess && (
              <ModalButton 
                primary 
                style={{ margin: '0 auto', display: 'block' }}
                onClick={() => setShowJoinModal(false)}
              >
                Close
              </ModalButton>
            )}
          </ModalContent>
        </Modal>
      )}
    </ClubDetailsContainer>
  );
  
  // Function to handle joining the club
  async function handleJoinClub(makeHomeClub) {
    setJoining(true);
    setJoinError("");
    
    // Get auth token
    const token = localStorage.getItem('token');
    
    if (!token) {
      setJoinError("You must be logged in to join a club.");
      setJoining(false);
      return;
    }
    
    try {
      // Make the actual API call to join the club
      console.log(`Joining club ${club.name}, make home club: ${makeHomeClub}`);
      
      // First add the user as a member
      const joinResponse = await axios.put(
        `/api/clubs/${name}/members`, 
        { email: user.email }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Join club response:', joinResponse.data);
      
      if (!joinResponse.data.success) {
        throw new Error(joinResponse.data.error || 'Failed to join club');
      }
      
      // If makeHomeClub is true, set this club as home club
      if (makeHomeClub) {
        const homeClubResponse = await axios.put(
          `/api/users/homeclub`,
          { clubId: club._id },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        console.log('Set home club response:', homeClubResponse.data);
        
        if (!homeClubResponse.data.success) {
          console.warn('Failed to set as home club, but successfully joined');
          setJoinSuccess(`You have successfully joined ${club.name}, but there was an issue setting it as your home club.`);
          setJoining(false);
          return;
        }
      }
      
      // Success message based on whether it's a home club
      setJoinSuccess(makeHomeClub 
        ? `You have successfully joined ${club.name} and set it as your home club!` 
        : `You have successfully joined ${club.name}!`
      );
      
    } catch (error) {
      console.error('Error joining club:', error);
      setJoinError(error.response?.data?.error || "Failed to join the club. Please try again.");
    } finally {
      setJoining(false);
    }
  }
};

export default ClubDetails;
