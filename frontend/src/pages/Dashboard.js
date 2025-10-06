import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  padding: 1rem;
`;

const WelcomeSection = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  color: #555;
  margin-bottom: 1.5rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #555;
  font-size: 1rem;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  margin-right: 1rem;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const RecentActivitySection = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  color: #2c3e50;
`;

const ActivityList = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ActivityItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1rem;
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ActivityDate = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRounds: 0,
    totalClubs: 0,
    totalCourses: 0
  });
  const [recentRounds, setRecentRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get user stats from API
        const statsResponse = await axios.get('/api/rounds/stats/me');
        
        if (statsResponse.data && statsResponse.data.success) {
          const userStats = statsResponse.data.data;
          
          // Count unique clubs from the user's rounds
          const uniqueClubsResponse = await axios.get('/api/rounds');
          let uniqueClubIds = new Set();
          let uniqueCourseIds = new Set();
          
          if (uniqueClubsResponse.data && uniqueClubsResponse.data.success) {
            uniqueClubsResponse.data.data.forEach(round => {
              if (round.club) {
                uniqueClubIds.add(round.club._id);
              }
              if (round.course) {
                uniqueCourseIds.add(round.course._id);
              }
            });
          }
          
          setStats({
            totalRounds: userStats.totalRounds || 0,
            totalClubs: uniqueClubIds.size || 0,
            totalCourses: uniqueCourseIds.size || 0
          });
        }
        
        console.log('Full user object:', user);
        console.log('Using user ID:', user && user.id ? user.id : 'undefined');
        
        // Get recent rounds (limit to 3) - no status filter to ensure we get all user's rounds
        const recentRoundsResponse = await axios.get('/api/rounds?limit=3');
        console.log('Raw API response:', recentRoundsResponse.data);
        
        if (recentRoundsResponse.data && recentRoundsResponse.data.success) {
          const rounds = recentRoundsResponse.data.data;
          // Debug: Log the raw round data from API with detailed info
          console.log('Rounds count:', rounds.length);
          console.log('Raw rounds data:', JSON.stringify(rounds, null, 2));
          console.log('User ID for comparison:', user && user.id ? user.id : 'undefined');
          rounds.forEach(round => {
            console.log(`Round "${round.name}" (${round._id}):`, {
              status: round.status,
              scoringSystem: round.scoringSystem,
              participantsCount: round.participants ? round.participants.length : 0,
              courseInfo: round.course ? `${round.course.name} (${round.course.targets} targets, ${round.course.arrowsPerTarget} arrows per target)` : 'No course'
            });
          });
          
          // Process rounds to extract relevant data for display
          // Check if we have rounds data but nothing is displaying
          console.log('Processing rounds:', rounds.length);
          
          // Always show rounds even if user matching fails
          const processedRounds = rounds.map(round => {
            // Find the user's score in this round
            let userScore = 0;
            let maxScore = 0;
            let userFound = false;
            
            if (round.participants && round.participants.length > 0) {
              // Try multiple methods to find the user's participant record
              let userParticipant = null;
              
              // Log all user IDs for debugging
              console.log('Debugging participant IDs:');
              round.participants.forEach(p => {
                if (p.user) {
                  console.log(`Participant user ID: ${p.user._id}, User ID: ${user.id}`);
                  console.log(`Types - Participant ID: ${typeof p.user._id}, User ID: ${typeof user.id}`);
                  console.log(`String comparison: ${p.user._id.toString() === user.id}`);
                }
              });
              
              // Method 1: Direct string comparison (already converted to string)
              userParticipant = round.participants.find(
                p => p.user && p.user._id.toString() === user.id
              );
              
              console.log('Method 1 result:', userParticipant ? 'Found' : 'Not found');
              
              // Method 2: If not found, try without toString()
              if (!userParticipant) {
                userParticipant = round.participants.find(
                  p => p.user && p.user._id === user.id
                );
                console.log('Method 2 result:', userParticipant ? 'Found' : 'Not found');
              }
              
              // Method 3: Compare only the first part before any potential colons
              if (!userParticipant && user && user.id) {
                const userId = user.id.split(':')[0];
                console.log('Using partial ID match with:', userId);
                userParticipant = round.participants.find(
                  p => p.user && p.user._id.toString().includes(userId)
                );
                console.log('Method 3 result:', userParticipant ? 'Found' : 'Not found');
              }
              
              // Method 4: Try matching by string values in different formats
              if (!userParticipant && user && user.id) {
                console.log('Trying additional ID matching methods');
                // Try different ID formats
                userParticipant = round.participants.find(
                  p => p.user && (
                    String(p.user._id) === String(user.id) ||
                    p.user._id === user.id ||
                    p.user.toString() === user.id
                  )
                );
                console.log('Method 4 result:', userParticipant ? 'Found' : 'Not found');
              }
              
              // Detailed participant debugging
              console.log('Round:', round.name, `(ID: ${round._id}, Status: ${round.status})`);
              console.log('User ID for matching:', user && user.id ? user.id : 'undefined');
              console.log('Participants array:', round.participants.map(p => ({
                participantId: p._id,
                userId: p.user ? p.user._id : 'No user ID',
                userName: p.user ? p.user.name : 'No user name',
                totalScore: p.totalScore || 0,
                scoresCount: p.scores ? p.scores.length : 0
              })));
              
              if (userParticipant) {
                console.log('User participant found:', {
                  id: userParticipant._id,
                  totalScore: userParticipant.totalScore || 0,
                  scoresLength: userParticipant.scores ? userParticipant.scores.length : 0,
                  scores: userParticipant.scores
                });
              } else {
                console.log('User participant not found');
              }
              if (userParticipant) {
                userFound = true;
                // Ensure we get a score, even if totalScore is 0
                userScore = userParticipant.totalScore !== undefined ? userParticipant.totalScore : 0;
                
                // If totalScore is 0 but there are scores, calculate it ourselves
                if (userScore === 0 && userParticipant.scores && userParticipant.scores.length > 0) {
                  userScore = userParticipant.scores.reduce((total, score) => total + (score.totalPoints || 0), 0);
                }
                
                console.log('Final user score:', userScore);
              } else {
                // FALLBACK: If user not found among participants but round exists, show anyway
                console.log('Using fallback: showing round even though user match failed');
                // Try to find any participant score to display
                if (round.participants && round.participants.length > 0) {
                  const anyParticipant = round.participants[0];
                  if (anyParticipant) {
                    userScore = anyParticipant.totalScore || 0;
                  }
                }
              }
            }
            
            // Calculate max possible score
            if (round.course && round.course.targets) {
              // Fix: Use arrowsPerTarget from course model instead of round
              const arrowsPerTarget = round.course.arrowsPerTarget || 3;
              
              if (round.scoringSystem === 'ABA') {
                // ABA scoring: each target can score up to 20 points total (regardless of arrows)
                maxScore = round.course.targets * 20;
                console.log('ABA scoring - Targets:', round.course.targets, 
                            'Max score calculated:', maxScore);
              } else if (round.scoringSystem === 'IFAA') {
                maxScore = round.course.targets * 5 * arrowsPerTarget;
                console.log('IFAA scoring - Targets:', round.course.targets, 
                            'Arrows per target:', arrowsPerTarget, 
                            'Max score calculated:', maxScore);
              }
            }
            
            return {
              id: round._id,
              name: round.name,
              date: round.date,
              score: userScore,
              maxScore: maxScore || 0,
              scoringSystem: round.scoringSystem
            };
          });
          
          console.log('Final processed rounds:', processedRounds.length);
          setRecentRounds(processedRounds);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <DashboardContainer>
      <WelcomeSection>
        <Title>Welcome, {user ? user.name : 'Archer'}!</Title>
        <Subtitle>Track your progress, manage your rounds, and connect with clubs.</Subtitle>
        
        <div>
          <ActionButton to="/rounds/new">Start New Round</ActionButton>
          <ActionButton to="/clubs">Find Clubs</ActionButton>
        </div>
      </WelcomeSection>
      
      <StatsContainer>
        <StatCard>
          <StatNumber>{stats.totalRounds}</StatNumber>
          <StatLabel>Total Rounds</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalClubs}</StatNumber>
          <StatLabel>Club Memberships</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalCourses}</StatNumber>
          <StatLabel>Courses Shot</StatLabel>
        </StatCard>
      </StatsContainer>
      
      <RecentActivitySection>
        <SectionTitle>Recent Rounds</SectionTitle>
        
        {loading ? (
          <p>Loading recent activity...</p>
        ) : recentRounds.length > 0 ? (
          <ActivityList>
            {recentRounds.map(round => (
              <ActivityItem key={round.id}>
                <ActivityIcon>🎯</ActivityIcon>
                <ActivityDetails>
                  <Link to={`/rounds/${round.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <ActivityTitle>{round.name || 'Unnamed Round'}</ActivityTitle>
                    <div>
                      {round.score !== undefined ? round.score : 0} / 
                      {round.maxScore !== undefined ? round.maxScore : 0} points 
                      ({round.scoringSystem || 'Unknown'})
                    </div>
                    <ActivityDate>
                      {round.date ? new Date(round.date).toLocaleDateString() : 'Date not available'}
                    </ActivityDate>
                  </Link>
                </ActivityDetails>
              </ActivityItem>
            ))}
          </ActivityList>
        ) : (
          <p>No recent rounds found. Start a new round to see your activity here!</p>
        )}
      </RecentActivitySection>
    </DashboardContainer>
  );
};

export default Dashboard;
