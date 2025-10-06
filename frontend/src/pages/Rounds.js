import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RoundsContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 0;
`;

const NewRoundButton = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: #f5f7fa;
  padding: 1.5rem;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const FilterSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const DateInput = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const RoundsList = styled.div`
  margin-bottom: 2rem;
`;

const RoundCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-3px);
  }
`;

const RoundHeader = styled.div`
  background-color: #f5f7fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoundTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.2rem;
`;

const RoundDate = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const RoundContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const RoundInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const RoundStats = styled.div`
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 768px) {
    border-top: 1px solid #eee;
    padding-top: 1rem;
  }
`;

const ScoreDisplay = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
  
  span {
    font-size: 1rem;
    color: #7f8c8d;
    font-weight: normal;
  }
`;

const ActionLinks = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
`;

const ActionLink = styled(Link)`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: ${props => props.secondary ? 'white' : '#3498db'};
  color: ${props => props.secondary ? '#3498db' : 'white'};
  border: 1px solid #3498db;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.secondary ? '#f5f7fa' : '#2980b9'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f5f7fa;
  border-radius: 8px;
`;

const Rounds = () => {
  const { user } = useAuth();
  const [rounds, setRounds] = useState([]);
  const [filteredRounds, setFilteredRounds] = useState([]);
  const [scoreType, setScoreType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setLoading(true);
        
        // Make an actual API call to fetch rounds
        const response = await axios.get('/api/rounds');
        
        if (response.data && response.data.success) {
          const userRounds = response.data.data;
          
          // Process the rounds to ensure they have the expected format
          const processedRounds = userRounds.map(round => {
            // Calculate the maximum possible score based on scoring system and targets
            let maxScore = 0;
            if (round.course && round.course.targets) {
              if (round.scoringSystem === 'ABA') {
                // ABA scoring: each target can score up to 20 points total (regardless of arrows)
                maxScore = round.course.targets * 20;
              } else if (round.scoringSystem === 'IFAA') {
                // IFAA scoring: each target can score up to 5 points per arrow, default 3 arrows
                const arrowsPerTarget = round.course.arrowsPerTarget || 3;
                maxScore = round.course.targets * 5 * arrowsPerTarget;
              }
            }
            
            // Find user's score in participants
            let userScore = 0;
            if (round.participants) {
              const userParticipant = round.participants.find(
                p => p.user && p.user._id === user.id
              );
              if (userParticipant) {
                userScore = userParticipant.totalScore;
              }
            }
            
            return {
              ...round,
              maxScore,
              score: userScore,
              complete: round.status === 'completed'
            };
          });
          
          setRounds(processedRounds);
          setFilteredRounds(processedRounds);
        } else {
          console.error('Error fetching rounds: Invalid API response');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rounds:', error);
        setLoading(false);
      }
    };
    
    if (user) {
      fetchRounds();
    }
  }, [user]);

  useEffect(() => {
    // Apply filters whenever they change
    let result = [...rounds];
    
    // Filter by scoring system
    if (scoreType !== 'all') {
      result = result.filter(round => round.scoringSystem === scoreType);
    }
    
    // Filter by date range
    if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      result = result.filter(round => {
        const roundDate = new Date(round.date);
        return roundDate >= start && roundDate <= end;
      });
    } else if (dateRange !== 'all' && dateRange !== 'custom') {
      const today = new Date();
      let daysToSubtract = 0;
      
      switch (dateRange) {
        case 'week':
          daysToSubtract = 7;
          break;
        case 'month':
          daysToSubtract = 30;
          break;
        case 'year':
          daysToSubtract = 365;
          break;
        default:
          daysToSubtract = 0;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(today.getDate() - daysToSubtract);
      
      result = result.filter(round => {
        const roundDate = new Date(round.date);
        return roundDate >= cutoffDate;
      });
    }
    
    // Sort by date, most recent first
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredRounds(result);
  }, [scoreType, dateRange, startDate, endDate, rounds]);

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    // Reset custom dates if not using custom range
    if (e.target.value !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <RoundsContainer>
      <Header>
        <Title>My Rounds</Title>
        <NewRoundButton to="/rounds/new">Start New Round</NewRoundButton>
      </Header>
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="scoreType">Scoring System</FilterLabel>
          <FilterSelect 
            id="scoreType"
            value={scoreType}
            onChange={(e) => setScoreType(e.target.value)}
          >
            <option value="all">All Systems</option>
            <option value="ABA">ABA</option>
            <option value="IFAA">IFAA</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="dateRange">Date Range</FilterLabel>
          <FilterSelect 
            id="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 365 Days</option>
            <option value="custom">Custom Range</option>
          </FilterSelect>
        </FilterGroup>
        
        {dateRange === 'custom' && (
          <>
            <FilterGroup>
              <FilterLabel htmlFor="startDate">Start Date</FilterLabel>
              <DateInput
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="endDate">End Date</FilterLabel>
              <DateInput
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FilterGroup>
          </>
        )}
      </FiltersContainer>
      
      {loading ? (
        <p>Loading rounds...</p>
      ) : filteredRounds.length > 0 ? (
        <RoundsList>
          {filteredRounds.map(round => (
            <RoundCard key={round._id}>
              <RoundHeader>
                <RoundTitle>{round.name}</RoundTitle>
                <RoundDate>{new Date(round.date).toLocaleDateString()}</RoundDate>
              </RoundHeader>
              <RoundContent>
              <RoundInfo>
                <p>
                  <strong>Scoring System:</strong> {round.scoringSystem}
                </p>
                {round.course && (
                  <>
                    <p>
                      <strong>Course:</strong> {round.course.name}
                    </p>
                    <p>
                      <strong>Targets:</strong> {round.course.targets}
                    </p>
                    {round.course.club && (
                      <p>
                        <strong>Club:</strong> {round.course.club.name}
                      </p>
                    )}
                  </>
                )}
                <p>
                  <strong>Status:</strong> {round.status}
                </p>
              </RoundInfo>
                <RoundStats>
                  <ScoreDisplay>
                    {round.score} <span>/ {round.maxScore}</span>
                  </ScoreDisplay>
                  <p>
                    <strong>Percentage:</strong> {((round.score / round.maxScore) * 100).toFixed(1)}%
                  </p>
                  <ActionLinks>
                    <ActionLink to={`/rounds/${round._id}`}>View Details</ActionLink>
                    {!round.complete && (
                      <ActionLink to={`/rounds/${round._id}/score`}>Continue Scoring</ActionLink>
                    )}
                  </ActionLinks>
                </RoundStats>
              </RoundContent>
            </RoundCard>
          ))}
        </RoundsList>
      ) : (
        <EmptyState>
          <h2>No rounds found</h2>
          <p>Try adjusting your filters or start a new round to see it here.</p>
          <NewRoundButton to="/rounds/new">Start New Round</NewRoundButton>
        </EmptyState>
      )}
    </RoundsContainer>
  );
};

export default Rounds;
