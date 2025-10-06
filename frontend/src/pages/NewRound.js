import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NewRoundContainer = styled.div`
  padding: 1rem;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const StepContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #ddd;
    z-index: -1;
  }
`;

const Step = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#3498db' : props.completed ? '#2ecc71' : '#f5f7fa'};
  color: ${props => props.active || props.completed ? 'white' : '#7f8c8d'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid ${props => props.active ? '#3498db' : props.completed ? '#2ecc71' : '#ddd'};
  z-index: 1;
`;

const StepLabel = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.active ? '#3498db' : '#7f8c8d'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const Form = styled.form`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const RadioGroup = styled.div`
  margin-top: 0.5rem;
`;

const RadioOption = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const RadioInput = styled.input`
  margin-right: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

const SearchResults = styled.div`
  margin-top: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

const SearchResult = styled.div`
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantsList = styled.div`
  margin-top: 1rem;
`;

const ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const ParticipantName = styled.div`
  font-weight: bold;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
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

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const NewRound = () => {
  const { user } = useAuth();
  const history = useHistory();
  
  // State for multi-step form
  const [step, setStep] = useState(1);

  // State for user's home club
  const [homeClub, setHomeClub] = useState(null);
  const [homeClubCourses, setHomeClubCourses] = useState([]);
  const [loadingHomeClub, setLoadingHomeClub] = useState(false);
  
  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scoringSystem, setScoringSystem] = useState('ABA');
  const [courseType, setCourseType] = useState('existing');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [customTargets, setCustomTargets] = useState(10);
  
  // Step 2: Participants
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [participantResults, setParticipantResults] = useState([]);
  const [participants, setParticipants] = useState([
    { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      isScorer: true,
      shootingClass: '',
      ageGroup: ''
    } // Current user is always included
  ]);
  
  // ABA Classes
  const abaClasses = [
    'Freestyle Unlimited Recurve',
    'Freestyle Unlimited Compound',
    'Freestyle Unlimited',
    'Bowhunter Recurve',
    'Bowhunter Compound',
    'Bowhunter Unlimited',
    'Bowhunter Limited',
    'Longbow Traditional',
    'Longbow Modern',
    'Historical Bow',
    'Sighted',
    'Unsighted',
    'Unlimited'
  ];
  
  // Age Groups
  const ageGroups = [
    'Cubs (under 13 years)',
    'Junior (13-17 years)',
    'Seniors (18-55 years)',
    'Veterans (over 55 years)'
  ];
  
  // Step 3: Weather & Notes
  const [weather, setWeather] = useState('');
  const [notes, setNotes] = useState('');
  
  // Error state
  const [errors, setErrors] = useState({});
  
  // Fetch user's home club and its courses
  useEffect(() => {
    if (!user) return;
    
    const fetchHomeClub = async () => {
      try {
        setLoadingHomeClub(true);
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        // Fetch the user's complete profile including homeClub
        const response = await axios.get(`/api/users/${user._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('User profile response:', response.data);
        
        if (response.data.success && response.data.data.homeClub) {
          setHomeClub(response.data.data.homeClub);
          
          // If there's a home club, fetch its courses
          try {
            const coursesResponse = await axios.get(`/api/clubs/${response.data.data.homeClub.name}/courses`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (coursesResponse.data.success) {
              console.log('Home club courses:', coursesResponse.data.data);
              setHomeClubCourses(coursesResponse.data.data);
            }
          } catch (courseError) {
            console.error('Error fetching home club courses:', courseError);
            
            // Use mock data for home club courses for now (temporary until API is fully implemented)
            const mockCourseData = [
              {
                _id: '1001',
                name: 'Test Course 1',
                club: {
                  _id: response.data.data.homeClub._id,
                  name: response.data.data.homeClub.name
                },
                targets: 12,
                scoringSystem: 'ABA'
              },
              {
                _id: '1002',
                name: 'Practice Range',
                club: {
                  _id: response.data.data.homeClub._id,
                  name: response.data.data.homeClub.name
                },
                targets: 8,
                scoringSystem: 'ABA'
              }
            ];
            
            setHomeClubCourses(mockCourseData);
          }
        }
        
        setLoadingHomeClub(false);
      } catch (error) {
        console.error('Error fetching home club:', error);
        setLoadingHomeClub(false);
      }
    };
    
    fetchHomeClub();
  }, [user, allCourses]);
  
  // Fetch all available courses
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        // In a real implementation, we would use an API endpoint for courses
        // For now, we'll keep using the mock data
        
        const mockCourses = [
          {
            _id: '101',
            name: 'Beginner Course',
            club: {
              _id: '1',
              name: 'Central Archery Club'
            },
            targets: 10,
            scoringSystem: 'ABA'
          },
          {
            _id: '102',
            name: 'Advanced Field Course',
            club: {
              _id: '1',
              name: 'Central Archery Club'
            },
            targets: 20,
            scoringSystem: 'IFAA'
          },
          {
            _id: '103',
            name: 'Competition Range',
            club: {
              _id: '1',
              name: 'Central Archery Club'
            },
            targets: 15,
            scoringSystem: 'ABA'
          },
          {
            _id: '201',
            name: 'Beach Range',
            club: {
              _id: '2',
              name: 'Eastern Archers'
            },
            targets: 12,
            scoringSystem: 'IFAA'
          },
          {
            _id: '1001',
            name: 'Test Course 1',
            club: {
              _id: '3',
              name: 'Home Archery Club'
            },
            targets: 12,
            scoringSystem: 'ABA'
          }
        ];
        
        setAllCourses(mockCourses);
      } catch (error) {
        console.error('Error fetching all courses:', error);
      }
    };
    
    fetchAllCourses();
  }, []);
  
  // Handle course search using real API
  useEffect(() => {
    if (courseSearchTerm.length > 2) {
      const timer = setTimeout(() => {
        try {
          // Filter the courses based on search term
          const filtered = allCourses.filter(
            course => course.name.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                    (course.club && course.club.name.toLowerCase().includes(courseSearchTerm.toLowerCase()))
          );
          
          setSearchResults(filtered);
        } catch (error) {
          console.error('Error searching for courses:', error);
          setSearchResults([]);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [courseSearchTerm, allCourses]);
  
  // Handle participant search using real API
  useEffect(() => {
    if (participantSearchTerm.length > 2) {
      const timer = setTimeout(async () => {
        try {
          // Get auth token
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No auth token found');
            return;
          }
          
          console.log('Searching for participants with term:', participantSearchTerm);
          console.log('Auth token available:', !!token);
          
          // Fetch all users from API
          console.log('Making API request to /api/users');
          console.log('Current user role:', user.role);
          
          // First try with a different endpoint that might have fewer restrictions
          let response;
          try {
            // Try with a more permissive endpoint if available
            response = await axios.get('/api/users/search?term=' + encodeURIComponent(participantSearchTerm), {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Search endpoint response:', response.data);
          } catch (searchError) {
            console.log('Search endpoint not found or failed, falling back to main users endpoint');
            
            // Fall back to the main endpoint
            response = await axios.get('/api/users', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          
          console.log('API Response:', response.data);
          
          if (!response.data.success) {
            throw new Error('Failed to fetch users');
          }
          
          // Get the users from the response
          const allUsers = response.data.data;
          console.log('All users from API:', allUsers);
          
          // Client-side filtering based on search term
          const filtered = allUsers.filter(
            user => user.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
                   user.email.toLowerCase().includes(participantSearchTerm.toLowerCase())
          );
          console.log('Filtered users by search term:', filtered);
          
          // Filter out users who are already added as participants
          // Match on _id for real API data
          const notYetAdded = filtered.filter(
            user => !participants.some(p => p.id === user._id)
          );
          console.log('After filtering out already added participants:', notYetAdded);
          
          // Format the users to match our expected format
          const formattedUsers = notYetAdded.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }));
          console.log('Formatted users for display:', formattedUsers);
          
          setParticipantResults(formattedUsers);
        } catch (error) {
          console.error('Error searching for participants:', error);
          setParticipantResults([]);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setParticipantResults([]);
    }
  }, [participantSearchTerm, participants]);
  
  const selectCourse = (course) => {
    setSelectedCourse(course);
    setScoringSystem(course.scoringSystem);
    setCourseSearchTerm('');
    setSearchResults([]);
  };
  
  const addParticipant = (user) => {
    // Add user with empty class and age group initially
    setParticipants([...participants, { 
      ...user, 
      isScorer: false,
      shootingClass: '',
      ageGroup: ''
    }]);
    setParticipantSearchTerm('');
    setParticipantResults([]);
  };
  
  const updateParticipantClass = (id, shootingClass) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, shootingClass } : p
    ));
  };
  
  const updateParticipantAgeGroup = (id, ageGroup) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, ageGroup } : p
    ));
  };
  
  const removeParticipant = (id) => {
    // Don't allow removing the current user (scorer)
    if (id === user._id) return;
    
    setParticipants(participants.filter(p => p.id !== id));
  };
  
  const validateStep1 = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Round name is required';
    }
    
    if (!date) {
      errors.date = 'Date is required';
    }
    
    if (courseType === 'existing' && !selectedCourse) {
      errors.course = 'Please select a course or choose Custom Round';
    }
    
    if (courseType === 'custom' && (!customTargets || customTargets < 1)) {
      errors.customTargets = 'Number of targets must be at least 1';
    }
    
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };
  
  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleSubmit = async () => {
    try {
      // In a real implementation, this would be an API call to create the round
      // For this MVP, we'll simulate a successful response
      
      // Create round object
      const round = {
        name,
        date,
        scoringSystem,
        course: courseType === 'existing' ? selectedCourse : null,
        targets: courseType === 'existing' ? selectedCourse.targets : customTargets,
        participants, // Include the participants array with class and age group
        weather,
        notes
      };
      
      // Debug the participants data
      console.log('Participants being sent to round:', participants);
      
      // Create empty targets array based on scoring system
      if (scoringSystem === 'ABA') {
        // For ABA, we need to use the new object-based arrow format with participant-specific scoring
        
        // Standardize ABA rounds to 20 targets (standard ABA round)
        // If the course has fewer than 20 targets, we'll still create a standard 20-target round
        const targetCount = Math.max(round.targets, 20);
        round.maxScore = 400; // Standard max score for ABA rounds (20 targets * 20 points per target)
        
        round.targets = Array(targetCount).fill().map((_, index) => ({
          number: index + 1,
          // Add participant-specific scoring for each target
          participantScores: participants.map(p => ({
            participantId: p.id,
            arrows: [],
            currentArrow: { arrowNumber: '', zone: '' },
            score: 0
          })),
          maxScore: 20, // Max score per target is 20 points
          notes: ''
        }));
      } else {
        // For IFAA, we use the original array-based arrow format
        round.targets = Array(round.targets).fill().map((_, index) => ({
          number: index + 1,
          arrows: [null, null, null], // 3 arrows per target
          maxScore: 15, // 3 arrows * 5 points max per arrow for IFAA
          score: 0,
          notes: ''
        }));
      }
      
      console.log('New Round Data:', round);
      
      // Simulate API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save the round to local storage so we can access it from the scoring page
      localStorage.setItem('round-r1', JSON.stringify(round));
      console.log('Saved round to local storage:', round);
      
      // Redirect to the scoring page (in a real app, we'd use the ID from the API response)
      history.push('/rounds/r1/score');
    } catch (error) {
      console.error('Error creating round:', error);
      setErrors({ submit: 'Failed to create round. Please try again.' });
    }
  };
  
  const renderStep1 = () => (
    <Form>
      <FormGroup>
        <Label htmlFor="name">Round Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend Shoot at Central Club"
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {errors.date && <ErrorMessage>{errors.date}</ErrorMessage>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="scoringSystem">Scoring System</Label>
        <Select
          id="scoringSystem"
          value={scoringSystem}
          onChange={(e) => setScoringSystem(e.target.value)}
        >
          <option value="ABA">ABA (Australian Bowhunters Association)</option>
          <option value="IFAA">IFAA (International Field Archery Association)</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label>Round Type</Label>
        <RadioGroup>
          <RadioOption>
            <RadioInput
              type="radio"
              id="existingCourse"
              name="courseType"
              checked={courseType === 'existing'}
              onChange={() => setCourseType('existing')}
            />
            <label htmlFor="existingCourse">Existing Course</label>
          </RadioOption>
          <RadioOption>
            <RadioInput
              type="radio"
              id="customRound"
              name="courseType"
              checked={courseType === 'custom'}
              onChange={() => setCourseType('custom')}
            />
            <label htmlFor="customRound">Custom Round</label>
          </RadioOption>
        </RadioGroup>
      </FormGroup>
      
      {courseType === 'existing' ? (
        <FormGroup>
          {/* Display home club courses if available */}
          {homeClub && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#3498db' }}>
                {homeClub.name} Courses (Home Club)
              </h3>
              
              {loadingHomeClub ? (
                <div style={{ padding: '0.8rem', textAlign: 'center' }}>Loading courses...</div>
              ) : homeClubCourses.length > 0 ? (
                <div style={{ 
                  backgroundColor: '#edf7fd', 
                  padding: '0.8rem', 
                  borderRadius: '8px',
                  border: '1px solid #d1e7f7'
                }}>
                  {homeClubCourses.map(course => (
                    <SearchResult 
                      key={course._id} 
                      onClick={() => selectCourse(course)}
                      style={{
                        backgroundColor: 'white',
                        padding: '0.8rem',
                        borderRadius: '4px',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        border: '1px solid #e5e5e5'
                      }}
                    >
                      <strong>{course.name}</strong>
                      <div>Targets: {course.targets} | Scoring: {course.scoringSystem}</div>
                    </SearchResult>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '0.8rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  No courses found for your home club
                </div>
              )}
            </div>
          )}
        
          <Label htmlFor="courseSearch">Search for Other Courses</Label>
          <Input
            id="courseSearch"
            type="text"
            value={courseSearchTerm}
            onChange={(e) => setCourseSearchTerm(e.target.value)}
            placeholder="Search by course or club name..."
          />
          
          {searchResults.length > 0 && (
            <SearchResults>
              {searchResults.map(course => (
                <SearchResult key={course._id} onClick={() => selectCourse(course)}>
                  <strong>{course.name}</strong> ({course.club.name})
                  <div>Targets: {course.targets} | Scoring: {course.scoringSystem}</div>
                </SearchResult>
              ))}
            </SearchResults>
          )}
          
          {selectedCourse && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', backgroundColor: '#f5f7fa', borderRadius: '4px' }}>
              <h3>Selected Course:</h3>
              <p><strong>{selectedCourse.name}</strong> ({selectedCourse.club.name})</p>
              <p>Targets: {selectedCourse.targets} | Scoring: {selectedCourse.scoringSystem}</p>
            </div>
          )}
          
          {errors.course && <ErrorMessage>{errors.course}</ErrorMessage>}
        </FormGroup>
      ) : (
        <FormGroup>
          <Label htmlFor="customTargets">Number of Targets</Label>
          <Input
            id="customTargets"
            type="number"
            min="1"
            max="50"
            value={customTargets}
            onChange={(e) => setCustomTargets(parseInt(e.target.value))}
          />
          {errors.customTargets && <ErrorMessage>{errors.customTargets}</ErrorMessage>}
        </FormGroup>
      )}
    </Form>
  );
  
  const renderStep2 = () => (
    <Form>
      <h2 style={{ marginBottom: '1.5rem' }}>Participants</h2>
      
      <FormGroup>
        <Label htmlFor="participantSearch">Add Participants by Name or Email</Label>
        
        <Input
          id="participantSearch"
          type="text"
          value={participantSearchTerm}
          onChange={(e) => setParticipantSearchTerm(e.target.value)}
          placeholder="Enter name or email to search..."
          autoComplete="off"
        />
        
        {participantResults.length > 0 && (
          <SearchResults>
            {participantResults.map(user => (
              <SearchResult key={user.id} onClick={() => addParticipant(user)}>
                <strong>{user.name}</strong>
                <div>{user.email}</div>
                {user.role && <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>({user.role.replace('_', ' ')})</div>}
              </SearchResult>
            ))}
          </SearchResults>
        )}
        
        {participantSearchTerm.length > 2 && participantResults.length === 0 && (
          <div style={{ padding: '0.8rem', backgroundColor: '#f8f9fa', borderRadius: '4px', marginTop: '0.5rem' }}>
            <p style={{ margin: 0, color: '#7f8c8d' }}>No matching archers found.</p>
            <button 
              onClick={() => {
                // Add a non-registered user
                const name = participantSearchTerm;
                addParticipant({ 
                  id: 'guest-' + Date.now(), 
                  name, 
                  email: 'Guest archer', 
                  isGuest: true 
                });
                setParticipantSearchTerm('');
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add as Guest Archer
            </button>
          </div>
        )}
      </FormGroup>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Current Participants:</h3>
        <ParticipantsList>
          {participants.map(participant => (
            <ParticipantItem key={participant.id} style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <ParticipantName>{participant.name}</ParticipantName>
                  <div>{participant.email}</div>
                  {participant.isScorer && <div style={{ color: '#3498db', marginTop: '0.5rem', fontSize: '0.9rem' }}>Scorer</div>}
                </div>
                <RemoveButton
                  onClick={() => removeParticipant(participant.id)}
                  disabled={participant.isScorer}
                >
                  {participant.isScorer ? '' : '×'}
                </RemoveButton>
              </div>

              {/* Shooting Class dropdown */}
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '3px', color: '#555' }}>
                  Shooting Class:
                </label>
                <Select
                  value={participant.shootingClass}
                  onChange={(e) => updateParticipantClass(participant.id, e.target.value)}
                  style={{ fontSize: '0.9rem', padding: '6px' }}
                >
                  <option value="">Select Class</option>
                  {abaClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>

              {/* Age Group dropdown */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '3px', color: '#555' }}>
                  Age Group:
                </label>
                <Select
                  value={participant.ageGroup}
                  onChange={(e) => updateParticipantAgeGroup(participant.id, e.target.value)}
                  style={{ fontSize: '0.9rem', padding: '6px' }}
                >
                  <option value="">Select Age Group</option>
                  {ageGroups.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </div>
            </ParticipantItem>
          ))}
        </ParticipantsList>
      </div>
    </Form>
  );
  
  const renderStep3 = () => (
    <Form>
      <h2 style={{ marginBottom: '1.5rem' }}>Weather & Notes (Optional)</h2>
      
      <FormGroup>
        <Label htmlFor="weather">Weather Conditions</Label>
        <Input
          id="weather"
          type="text"
          value={weather}
          onChange={(e) => setWeather(e.target.value)}
          placeholder="e.g. Partly cloudy, 22°C, light wind"
        />
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about the round..."
        />
      </FormGroup>
      
      {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
    </Form>
  );
  
  return (
    <NewRoundContainer>
      <Title>Start New Round</Title>
      
      <StepContainer>
        <StepIndicator>
          <div>
            <Step completed={step > 1} active={step === 1}>1</Step>
            <StepLabel active={step === 1}>Basic Info</StepLabel>
          </div>
          <div>
            <Step completed={step > 2} active={step === 2}>2</Step>
            <StepLabel active={step === 2}>Participants</StepLabel>
          </div>
          <div>
            <Step active={step === 3}>3</Step>
            <StepLabel active={step === 3}>Weather & Notes</StepLabel>
          </div>
        </StepIndicator>
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <ButtonsContainer>
          {step > 1 && (
            <Button secondary onClick={prevStep}>
              Back
            </Button>
          )}
          
          <Button onClick={nextStep}>
            {step < 3 ? 'Continue' : 'Start Round'}
          </Button>
        </ButtonsContainer>
      </StepContainer>
    </NewRoundContainer>
  );
};

export default NewRound;
