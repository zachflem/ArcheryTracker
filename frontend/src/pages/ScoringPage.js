import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ScoringContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
`;

const ScoringHeader = styled.div`
  background-color: #3498db;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const RoundInfo = styled.div`
  h1 {
    font-size: 1.2rem;
    margin: 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  span {
    font-size: 1rem;
    opacity: 0.9;
    margin-left: 0.5rem;
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const TargetsNavigation = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
`;

const TargetTab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background-color: ${props => props.active ? '#3498db' : '#f5f7fa'};
  color: ${props => props.active ? 'white' : props.completed ? '#2ecc71' : '#7f8c8d'};
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
  flex-shrink: 0;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  position: relative;
  
  &:hover {
    background-color: ${props => props.active ? '#3498db' : '#e5e5e5'};
  }
  
  ${props => props.completed && !props.active && `
    &::after {
      content: '✓';
      position: absolute;
      bottom: 2px;
      right: 2px;
      font-size: 0.7rem;
      color: #2ecc71;
    }
  `}
`;

const ScoringPanel = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TargetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TargetTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
`;

const TargetScore = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  
  span {
    opacity: 0.7;
  }
`;

const ArrowsSection = styled.div`
  margin-bottom: 2rem;
`;

const ArrowsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ArrowsTitle = styled.h3`
  color: #2c3e50;
  margin: 0;
`;

const ArrowsTotal = styled.div`
  font-weight: bold;
`;

const ArrowsInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ArrowInputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ArrowLabel = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const ArrowSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const AbaInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AbaScoreSelects = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ArrowNumberSelect = styled.select`
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const ZoneSelect = styled.select`
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const ArrowScoreDisplay = styled.div`
  margin-top: 0.5rem;
  font-weight: bold;
  color: #3498db;
`;

const NotesSection = styled.div`
  margin-bottom: 2rem;
`;

const NotesTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const NavButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.secondary ? 'white' : '#3498db'};
  color: ${props => props.secondary ? '#3498db' : 'white'};
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.secondary ? '#f5f7fa' : '#2980b9'};
  }
  
  &:disabled {
    background-color: #cccccc;
    border-color: #cccccc;
    color: #666666;
    cursor: not-allowed;
  }
`;

const SubmitRoundButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #2ecc71;
  color: white;
  border: 2px solid #2ecc71;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #27ae60;
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #2ecc71;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 100;
  
  &:hover {
    background-color: #27ae60;
    transform: scale(1.05);
  }
`;

// Helper function to calculate target scores for IFAA
const calculateTargetScore = (arrows) => {
  return arrows.reduce((total, arrow) => total + (arrow || 0), 0);
};

// Helper function to calculate ABA score based on arrow number and zone
const calculateABAScore = (arrowNumber, zone) => {
  if (!arrowNumber || !zone || zone === 'miss') return 0;
  return abaScoreMatrix[arrowNumber][zone];
};

// Calculate target score for ABA (sum of arrow scores)
const calculateTargetScoreABA = (arrows) => {
  if (!arrows) return 0;
  return arrows.reduce((total, arrow) => total + (arrow?.score || 0), 0);
};

// Helper function to calculate total round score
const calculateTotalScore = (targets) => {
  return targets.reduce((total, target) => total + target.score, 0);
};

// Score matrix for ABA - based on arrow number and zone
const abaScoreMatrix = {
  1: { A: 20, B: 18, C: 16 }, // 1st arrow scores
  2: { A: 14, B: 12, C: 10 }, // 2nd arrow scores
  3: { A: 8, B: 6, C: 4 }     // 3rd arrow scores
};

// Arrow number options for ABA
const arrowNumberOptions = [
  { value: '1', label: 'Arrow 1' },
  { value: '2', label: 'Arrow 2' },
  { value: '3', label: 'Arrow 3' }
];

// Zone options for ABA
const abaZoneOptions = [
  { value: 'A', label: 'Zone A' },
  { value: 'B', label: 'Zone B' },
  { value: 'C', label: 'Zone C' },
  { value: 'miss', label: 'Miss' }
];

// Score value options for IFAA
const ifaaScoreOptions = [
  { value: 5, label: '5 - Center Ring' },
  { value: 4, label: '4 - Second Ring' },
  { value: 3, label: '3 - Third Ring' },
  { value: 0, label: '0 - Miss' }
];

const ScoringPage = () => {
  const { id } = useParams();
  const history = useHistory();
  
  // Round state
  const [round, setRound] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Calculate if all targets are completed
  const [allTargetsCompleted, setAllTargetsCompleted] = useState(false);
  
  // State for browser storage
  const [isSaved, setIsSaved] = useState(true);
  
  useEffect(() => {
    const fetchRound = async () => {
      try {
        setLoading(true);
        
        // Try to load from local storage first - check both formats: 'round-r1' and 'round-${id}'
        console.log("Attempting to load round from local storage with ID:", id);
        let savedRound = localStorage.getItem(`round-${id}`);
        
        // If not found, try alternative key format
        if (!savedRound && id === 'r1') {
          savedRound = localStorage.getItem('round-r1');
          console.log("Checking alternative local storage key 'round-r1'");
        }
        
        if (savedRound) {
          const parsedRound = JSON.parse(savedRound);
          console.log("Successfully loaded round from local storage:", parsedRound);
          
          // Make sure participants are properly initialized
          if (!parsedRound.participants) {
            console.log("No participants found in saved round, initializing empty array");
            parsedRound.participants = [];
          }
          
          // Make sure each target has participantScores initialized for all participants
          if (parsedRound.targets && Array.isArray(parsedRound.targets)) {
            parsedRound.targets.forEach(target => {
              if (!target.participantScores) {
                console.log(`Initializing participantScores for target ${target.number}`);
                target.participantScores = [];
              }
              
              // Make sure each participant has a score entry for this target
              parsedRound.participants.forEach(participant => {
                const hasScoreEntry = target.participantScores.some(ps => ps.participantId === participant.id);
                
                if (!hasScoreEntry) {
                  console.log(`Adding score entry for participant ${participant.name} on target ${target.number}`);
                  target.participantScores.push({
                    participantId: participant.id,
                    arrows: [],
                    currentArrow: { arrowNumber: '', zone: '' },
                    score: 0
                  });
                }
              });
            });
          }
          
          // Calculate max score for ABA based on actual number of targets
          if (parsedRound.scoringSystem === 'ABA') {
            // For ABA scoring, each target has a max score of 20 points total
            const targetCount = parsedRound.targets ? parsedRound.targets.length : 0;
            parsedRound.maxScore = targetCount * 20;
            console.log(`ABA scoring: ${targetCount} targets * 20 points = ${parsedRound.maxScore} maximum points`);
            
            // Ensure each target has the correct max score set
            if (parsedRound.targets) {
              parsedRound.targets.forEach(target => {
                target.maxScore = 20; // Each target has a max score of 20 points
              });
            }
          }
          
          setRound(parsedRound);
          setLoading(false);
          return;
        } else {
          console.log("No saved round found in local storage with ID:", id);
        }
        
        // Fall back to API or use mock data
        // In a real implementation, we would try to fetch from API before using mock data
        try {
          // Get auth token
          const token = localStorage.getItem('token');
          if (token) {
            // Try to fetch the round from the API
            console.log("Attempting to fetch round from API");
            const response = await axios.get(`/api/rounds/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.data && response.data.success) {
              console.log("Successfully fetched round from API");
              const apiRound = response.data.data;
              
              // Transform API round data into the format expected by the frontend
              const formattedRound = {
                ...apiRound,
                targets: Array(apiRound.course?.targets || 20).fill().map((_, index) => ({
                  number: index + 1,
                  participantScores: apiRound.participants.map(p => ({
                    participantId: p.user._id || p.user,
                    arrows: [],
                    currentArrow: { arrowNumber: '', zone: '' },
                    score: 0
                  })),
                  maxScore: 20,
                  notes: ''
                }))
              };
              
              setRound(formattedRound);
              // Save to local storage for future access
              localStorage.setItem(`round-${id}`, JSON.stringify(formattedRound));
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.error("Error fetching round from API:", apiError);
          // Continue to mock data as fallback
        }
        
        // As a last resort, create mock data if nothing else worked
        console.log("Using mock data as fallback");
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Create mock participants (in a real app, these would come from the round data)
        const mockParticipants = [
          { 
            id: 'p1', 
            name: 'Zach Fleming',
            email: 'zach@seezed.net',
            isScorer: true,
            shootingClass: 'Freestyle Unlimited Compound',
            ageGroup: 'Seniors (18-55 years)'
          }
        ];
        
        // Create a new round with empty targets
        const mockRound = {
          _id: id,
          name: 'New Round',  // Use generic name that will be replaced by real name
          date: new Date().toISOString().split('T')[0],
          scoringSystem: 'ABA',
          course: null,  // Will be set by actual selection
          participants: mockParticipants,
          maxScore: 200,
          complete: false,
          targets: Array(10).fill().map((_, index) => ({
            number: index + 1,
            participantScores: mockParticipants.map(p => ({
              participantId: p.id,
              arrows: [],
              currentArrow: { arrowNumber: '', zone: '' },
              score: 0
            })),
            maxScore: 20,
            notes: ''
          }))
        };
        
        setRound(mockRound);
        // Don't save this generic mock to localStorage
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching round data:', error);
        setLoading(false);
      }
    };
    
    fetchRound();
  }, [id]);
  
  // Check if all targets are completed whenever the round data changes
  useEffect(() => {
    if (round) {
      // For the new participantScores structure, we need to update this check
      let completed = true;
      
      if (round.scoringSystem === 'ABA') {
        // A target is complete when at least one participant has a valid arrow recorded
        completed = round.targets.every(target => {
          // Check if target has participantScores
          if (!target.participantScores) {
            return false;
          }
          
          return target.participantScores.some(ps => {
            // Check if ps exists and has an arrows array
            if (!ps || !ps.arrows || !Array.isArray(ps.arrows)) {
              return false;
            }
            
            return ps.arrows.some(arrow => 
              arrow && arrow.arrowNumber && arrow.zone && 
              arrow.arrowNumber !== '' && arrow.zone !== '' && 
              arrow.score > 0
            );
          });
        });
      } else {
        // This needs to be updated if IFAA scoring is implemented with participant scores
        completed = false;
      }
      
      setAllTargetsCompleted(completed);
    }
  }, [round]);
  
  // Save round data to local storage whenever it changes
  useEffect(() => {
    if (round) {
      localStorage.setItem(`round-${id}`, JSON.stringify(round));
      setIsSaved(true);
    }
  }, [round, id]);
  
  const handleTargetNotesChange = (notes) => {
    setIsSaved(false);
    
    // Create a copy of the current target
    const updatedTargets = [...round.targets];
    const targetIndex = currentTarget;
    
    // Update the target notes
    updatedTargets[targetIndex].notes = notes;
    
    // Update the round
    setRound({
      ...round,
      targets: updatedTargets
    });
  };
  
  const goToNextTarget = () => {
    if (currentTarget < round.targets.length - 1) {
      setCurrentTarget(currentTarget + 1);
    }
  };
  
  const goToPreviousTarget = () => {
    if (currentTarget > 0) {
      setCurrentTarget(currentTarget - 1);
    }
  };
  
  const isTargetCompleted = (targetIndex) => {
    if (!round) return false;
    
    // Different check based on scoring system
    if (round.scoringSystem === 'ABA') {
      // Check if participantScores exists
      if (!round.targets[targetIndex].participantScores) {
        return false;
      }
      
      // For ABA, a target is complete when at least one participant has a valid arrow recorded
      return round.targets[targetIndex].participantScores.some(ps => {
        // Check if ps exists and has an arrows array
        if (!ps || !ps.arrows || !Array.isArray(ps.arrows)) {
          return false;
        }
        
        return ps.arrows.some(arrow => 
          arrow && arrow.arrowNumber && arrow.zone && 
          arrow.arrowNumber !== '' && arrow.zone !== '' && 
          arrow.score > 0
        );
      });
    } else {
      // For IFAA, this would need to be updated if implementing multi-participant scoring
      return false;
    }
  };
  
  // Transform the frontend round data structure to match the backend model
  const transformRoundData = (roundData) => {
    // Create a copy of the round data
    const transformedRound = {
      ...roundData
      // Don't set status here - will be set by the complete endpoint
    };
    
    // Convert from target-centric to participant-centric scores structure
    if (transformedRound.participants && transformedRound.targets) {
      transformedRound.participants = transformedRound.participants.map(participant => {
        // Extract participant ID
        const participantId = participant.id;
        
        // Create scores array for this participant
        const scores = [];
        
        // Go through each target and extract this participant's scores
        transformedRound.targets.forEach(target => {
          const participantScore = target.participantScores?.find(
            ps => ps.participantId === participantId
          );
          
          if (participantScore && participantScore.arrows && participantScore.arrows.length > 0) {
            // Format arrows according to the backend schema
            const formattedArrows = participantScore.arrows.map(arrow => {
              if (transformedRound.scoringSystem === 'ABA') {
                return {
                  zoneHit: arrow.zone,
                  points: arrow.score
                };
              } else {
                // For IFAA
                return {
                  scoreValue: arrow.score
                };
              }
            });
            
            // Add score entry for this target
            scores.push({
              targetNumber: target.number,
              arrows: formattedArrows,
              totalPoints: participantScore.score
            });
          }
        });
        
        // Return participant with backend-compatible structure
        return {
          user: participant._id || participant.id,  // Use MongoDB _id if available
          scores: scores,
          totalScore: scores.reduce((total, score) => total + score.totalPoints, 0),
          personalBest: false  // This will be calculated on the server
        };
      });
    }
    
    // Remove the targets array, as it's not expected by the backend
    delete transformedRound.targets;
    
    // Set the scorer to the current user
    if (!transformedRound.scorer && transformedRound.participants) {
      // Find the scorer participant
      const scorer = transformedRound.participants.find(p => p.isScorer);
      if (scorer) {
        transformedRound.scorer = scorer.user;
      }
    }
    
    // Delete temporary properties not used by backend
    transformedRound.participants.forEach(p => {
      delete p.name;
      delete p.email;
      delete p.isScorer;
      delete p.shootingClass;
      delete p.ageGroup;
    });
    
    return transformedRound;
  };

  const handleSubmitRound = async () => {
    try {
      // Transform the round data to match the backend model
      const transformedRound = transformRoundData(round);
      
      console.log('Submitting transformed round data:', transformedRound);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        throw new Error('Authentication required');
      }
      
      // Send the round data to the backend API
      let response;
      
      // If round already has an _id that's not a temporary id (not starting with 'r')
      if (round._id && !round._id.startsWith('r')) {
        // Update existing round
        response = await axios.put(`/api/rounds/${round._id}`, transformedRound, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Create new round
        response = await axios.post('/api/rounds', transformedRound, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      if (response.data && response.data.success) {
        console.log('Round successfully saved to server:', response.data.data);
        
        try {
          // Mark round as complete on the server
          const completeResponse = await axios.put(`/api/rounds/${response.data.data._id}/complete`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Round successfully marked as complete:', completeResponse.data);
          
          // Clear from local storage
          localStorage.removeItem(`round-${id}`);
          
          // Redirect to the round details page with the real ID from the server
          history.push(`/rounds/${response.data.data._id}`);
        } catch (completeError) {
          console.error('Error completing round:', completeError);
          
          // If completion fails but the round was saved, still redirect to the round details
          // This ensures the user doesn't lose their data
          alert('Round was saved but could not be marked as complete. You can view your round data.');
          localStorage.removeItem(`round-${id}`);
          history.push(`/rounds/${response.data.data._id}`);
        }
      } else {
        throw new Error('Failed to save round to server');
      }
    } catch (error) {
      console.error('Error submitting round:', error);
      alert(`Error submitting round: ${error.message || 'Unknown error'}`);
      // Keep the round in localStorage so user doesn't lose their data
    }
  };
  
  if (loading || !round) {
    return (
      <ScoringContainer>
        <ScoringHeader>
          <RoundInfo>
            <h1>Loading round data...</h1>
          </RoundInfo>
        </ScoringHeader>
        <MainContent>
          <p>Loading...</p>
        </MainContent>
      </ScoringContainer>
    );
  }
  
  return (
    <ScoringContainer>
      <ScoringHeader>
        <RoundInfo>
          <h1>{round.name}</h1>
          <p>{round.course ? round.course.name : 'Custom Round'} | {round.scoringSystem}</p>
        </RoundInfo>
        {/* Removed the score tally display from the header per requirement */}
      </ScoringHeader>
      
      <MainContent>
        <TargetsNavigation>
          {round.targets.map((target, index) => (
            <TargetTab
              key={index}
              active={index === currentTarget}
              completed={isTargetCompleted(index)}
              onClick={() => setCurrentTarget(index)}
            >
              {target.number}
            </TargetTab>
          ))}
        </TargetsNavigation>
        
        <ScoringPanel>
          <TargetHeader>
            <TargetTitle>Target {round.targets[currentTarget].number}</TargetTitle>
          </TargetHeader>
          
          <ArrowsSection>
            <ArrowsHeader>
              <ArrowsTitle>Scores by Participant</ArrowsTitle>
            </ArrowsHeader>
            
            {round.scoringSystem === 'ABA' ? (
              <div>
                {/* Scoring section for each participant */}
                {round.participants && Array.isArray(round.participants) ? round.participants.map(participant => {
                  // Get current participant's score data for this target
                  const participantScoreData = round.targets[currentTarget].participantScores.find(
                    ps => ps.participantId === participant.id
                  );
                  
                  // Get valid arrows for display (filter out incomplete entries)
                  const participantValidArrows = participantScoreData?.arrows?.filter(arrow => 
                    arrow && arrow.arrowNumber && arrow.zone && 
                    arrow.arrowNumber !== '' && arrow.zone !== ''
                  ) || [];
                  
                  return (
                    <div key={participant.id} style={{ 
                      marginBottom: '25px', 
                      padding: '15px', 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: '8px',
                      border: participant.isScorer ? '2px solid #3498db' : '1px solid #ddd'
                    }}>
                      <h4 style={{ marginTop: 0 }}>
                        {participant.name} 
                        {participant.isScorer && 
                          <span style={{ fontSize: '0.8rem', color: '#3498db', marginLeft: '8px' }}>(Scorer)</span>
                        }
                      </h4>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                        {participant.shootingClass} | {participant.ageGroup}
                      </div>
                      
                      {/* Input controls */}
                      <AbaInputGroup>
                        <ArrowLabel>Current Arrow</ArrowLabel>
                        <AbaScoreSelects>
                          <ArrowNumberSelect
                            value={participantScoreData?.currentArrow?.arrowNumber || ''}
                            onChange={(e) => {
                              const updatedTargets = [...round.targets];
                              const targetIndex = currentTarget;
                              
                              // Find participant's score data
                              const scoreDataIndex = updatedTargets[targetIndex].participantScores.findIndex(
                                ps => ps.participantId === participant.id
                              );
                              
                              if (scoreDataIndex >= 0) {
                                updatedTargets[targetIndex].participantScores[scoreDataIndex].currentArrow = {
                                  ...updatedTargets[targetIndex].participantScores[scoreDataIndex].currentArrow || {},
                                  arrowNumber: e.target.value
                                };
                                
                                setRound({
                                  ...round,
                                  targets: updatedTargets
                                });
                              }
                            }}
                          >
                            <option value="">Arrow #</option>
                            {arrowNumberOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </ArrowNumberSelect>
                          
                          <ZoneSelect
                            value={participantScoreData?.currentArrow?.zone || ''}
                            onChange={(e) => {
                              const updatedTargets = [...round.targets];
                              const targetIndex = currentTarget;
                              
                              // Find participant's score data
                              const scoreDataIndex = updatedTargets[targetIndex].participantScores.findIndex(
                                ps => ps.participantId === participant.id
                              );
                              
                              if (scoreDataIndex >= 0) {
                                const participantScoreData = updatedTargets[targetIndex].participantScores[scoreDataIndex];
                                const arrowNumber = participantScoreData.currentArrow?.arrowNumber;
                                const zone = e.target.value;
                                
                                // Update current arrow
                                participantScoreData.currentArrow = {
                                  ...participantScoreData.currentArrow || {},
                                  zone
                                };
                                
                                // Calculate and record score if both arrowNumber and zone are set
                                if (arrowNumber && zone) {
                                  const score = zone !== 'miss' ? calculateABAScore(arrowNumber, zone) : 0;
                                  
                                  // Ensure arrows array is initialized
                                  if (!participantScoreData.arrows) {
                                    participantScoreData.arrows = [];
                                  }
                                  
                                  // Find the index of the arrow to update or add a new one
                                  const arrowIndex = participantScoreData.arrows.findIndex(
                                    a => a && a.arrowNumber === arrowNumber
                                  );
                                  
                                  if (arrowIndex >= 0) {
                                    // Update existing arrow
                                    participantScoreData.arrows[arrowIndex] = {
                                      arrowNumber,
                                      zone,
                                      score
                                    };
                                  } else {
                                    // Add new arrow
                                    participantScoreData.arrows.push({
                                      arrowNumber,
                                      zone,
                                      score
                                    });
                                  }
                                  
                                  // Update participant's target score
                                  participantScoreData.score = calculateTargetScoreABA(participantScoreData.arrows);
                                  
                                  // Clear the current arrow input after recording
                                  participantScoreData.currentArrow = { arrowNumber: '', zone: '' };
                                }
                                
                                setRound({
                                  ...round,
                                  targets: updatedTargets
                                });
                                setIsSaved(false);
                              }
                            }}
                          >
                            <option value="">Zone</option>
                            {abaZoneOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </ZoneSelect>
                        </AbaScoreSelects>
                      </AbaInputGroup>
                      
                      {/* Display of recorded arrows for this participant */}
                      {participantValidArrows.length > 0 && (
                        <div style={{ marginTop: '15px' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '5px' }}>
                            Recorded Arrows: <span style={{ float: 'right' }}>Score: {participantScoreData.score}</span>
                          </div>
                          <div>
                            {participantValidArrows.map((arrow, idx) => (
                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', padding: '6px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                                <div>
                                  <strong>Arrow {arrow.arrowNumber}</strong> | Zone {arrow.zone}
                                </div>
                                <div>
                                  <strong>Score: {arrow.score}</strong>
                                  <button 
                                    style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}
                                    onClick={() => {
                                      const updatedTargets = [...round.targets];
                                      const targetIndex = currentTarget;
                                      const scoreDataIndex = updatedTargets[targetIndex].participantScores.findIndex(
                                        ps => ps.participantId === participant.id
                                      );
                                      
                                      if (scoreDataIndex >= 0) {
                                        // Remove the arrow
                                        updatedTargets[targetIndex].participantScores[scoreDataIndex].arrows = 
                                          updatedTargets[targetIndex].participantScores[scoreDataIndex].arrows.filter(a => 
                                            a !== arrow
                                          );
                                          
                                        // Update score
                                        updatedTargets[targetIndex].participantScores[scoreDataIndex].score = 
                                          calculateTargetScoreABA(updatedTargets[targetIndex].participantScores[scoreDataIndex].arrows);
                                          
                                        setRound({
                                          ...round,
                                          targets: updatedTargets
                                        });
                                        setIsSaved(false);
                                      }
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }) : <div>No participants found</div>}
              </div>
            ) : (
              <div>
                <p>IFAA scoring not implemented yet for multiple participants.</p>
              </div>
            )}
          </ArrowsSection>
          
          <NotesSection>
            <NotesTitle>Notes</NotesTitle>
            <NotesTextarea
              placeholder="Optional notes about this target (e.g., shooting conditions, equipment adjustments)"
              value={round.targets[currentTarget].notes}
              onChange={(e) => handleTargetNotesChange(e.target.value)}
            />
          </NotesSection>
          
          <NavigationButtons>
            <NavButton
              secondary
              onClick={goToPreviousTarget}
              disabled={currentTarget === 0}
            >
              Previous Target
            </NavButton>
            
            {currentTarget < round.targets.length - 1 ? (
              <NavButton
                onClick={goToNextTarget}
              >
                Next Target
              </NavButton>
            ) : (
              <SubmitRoundButton
                onClick={handleSubmitRound}
                disabled={!allTargetsCompleted}
              >
                Submit Round
              </SubmitRoundButton>
            )}
          </NavigationButtons>
        </ScoringPanel>
      </MainContent>
      
      <FloatingButton
        onClick={goToNextTarget}
        disabled={currentTarget === round.targets.length - 1}
      >
        →
      </FloatingButton>
    </ScoringContainer>
  );
};

export default ScoringPage;
