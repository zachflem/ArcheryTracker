import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const RoundDetailsContainer = styled.div`
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

const RoundHeader = styled.div`
  margin-bottom: 2rem;
`;

const RoundTitle = styled.h1`
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const RoundMeta = styled.div`
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  
  p {
    margin-bottom: 0.25rem;
  }
`;

const ScoreSummary = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
`;

const ScoreDisplay = styled.div`
  flex: 1;
  min-width: 200px;
  
  h2 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #3498db;
  margin-bottom: 0.5rem;
  
  span {
    font-size: 1.5rem;
    color: #7f8c8d;
    font-weight: normal;
  }
`;

const ScorePercentage = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const TargetScores = styled.div`
  margin-bottom: 2rem;
`;

const TargetTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: bold;
    color: #2c3e50;
    background-color: #f5f7fa;
  }
  
  tr:hover {
    background-color: #f5f7fa;
  }
  
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
  }
`;

const ChartContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlaceholderChart = styled.div`
  text-align: center;
  color: #7f8c8d;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.secondary ? 'white' : '#3498db'};
  color: ${props => props.secondary ? '#3498db' : 'white'};
  border: 2px solid #3498db;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  
  &:hover {
    background-color: ${props => props.secondary ? '#f5f7fa' : '#2980b9'};
  }
`;

const RoundDetails = () => {
  const { id } = useParams();
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRoundDetails = async () => {
      try {
        setLoading(true);
        
        // Make an actual API call to fetch round details
        const response = await axios.get(`/api/rounds/${id}`);
        
        if (response.data && response.data.success) {
          const roundData = response.data.data;
          
          // Process the round data to ensure it has the expected format for display
          let userScore = 0;
          let maxScore = 0;
          let targetScores = [];
          
          // Find the current user in participants
          if (roundData.participants && roundData.participants.length > 0) {
            // Find the current user's participant record
            // In a real app, you'd use the authenticated user ID
            const participant = roundData.participants[0]; // For demo purposes, use the first participant
            
            userScore = participant.totalScore || 0;
            
            // Process scores from participant data
            if (participant.scores && participant.scores.length > 0) {
              targetScores = participant.scores.map(score => ({
                number: score.targetNumber,
                score: score.totalPoints,
                maxScore: calculateTargetMaxScore(roundData.scoringSystem, score.arrows.length)
              }));
            }
          }
          
          // Calculate max score
          if (roundData.course && roundData.course.targets) {
            if (roundData.scoringSystem === 'ABA') {
              // For ABA scoring, each target has a max score of 20 points total
              maxScore = roundData.course.targets * 20;
              console.log(`ABA scoring: ${roundData.course.targets} targets * 20 points = ${maxScore} maximum points`);
            } else if (roundData.scoringSystem === 'IFAA') {
              // IFAA scoring: each target can score up to 5 points per arrow, default 3 arrows
              const arrowsPerTarget = roundData.arrowsPerTarget || 3;
              maxScore = roundData.course.targets * 5 * arrowsPerTarget;
            }
          }
          
          // Create processed round data
          const processedRound = {
            ...roundData,
            score: userScore,
            maxScore,
            targetScores,
            complete: roundData.status === 'completed'
          };
          
          setRound(processedRound);
        } else {
          console.error('Error fetching round details: Invalid API response');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching round details:', error);
        setLoading(false);
      }
    };
    
    // Function to calculate max score for a target
    const calculateTargetMaxScore = (scoringSystem, arrowCount) => {
      if (scoringSystem === 'ABA') {
        return 20; // 20 points max per target for ABA, regardless of arrow count
      } else if (scoringSystem === 'IFAA') {
        return 5 * (arrowCount || 3); // 5 points max per arrow for IFAA
      }
      return 0;
    };
    
    if (id) {
      fetchRoundDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <RoundDetailsContainer>
        <p>Loading round details...</p>
      </RoundDetailsContainer>
    );
  }

  if (!round) {
    return (
      <RoundDetailsContainer>
        <BackLink to="/rounds">← Back to Rounds</BackLink>
        <p>Round not found. The round may have been removed or you don't have access.</p>
      </RoundDetailsContainer>
    );
  }

  // Calculate stats safely with the real data structure
  const scorePercentage = round.maxScore ? ((round.score / round.maxScore) * 100).toFixed(1) : '0.0';
  const targetsCount = round.course && round.course.targets ? round.course.targets : 0;
  const averagePerTarget = targetsCount ? (round.score / targetsCount).toFixed(1) : '0.0';
  const perfectTargets = round.targetScores ? round.targetScores.filter(t => t.score === t.maxScore).length : 0;
  
  return (
    <RoundDetailsContainer>
      <BackLink to="/rounds">← Back to Rounds</BackLink>
      
      <RoundHeader>
        <RoundTitle>{round.name}</RoundTitle>
        <RoundMeta>
          <p><strong>Date:</strong> {new Date(round.date).toLocaleDateString()}</p>
          <p><strong>Scoring System:</strong> {round.scoringSystem}</p>
          {round.course && (
            <>
              <p><strong>Course:</strong> {round.course.name}</p>
              {round.course.club && (
                <p><strong>Club:</strong> {round.course.club.name}</p>
              )}
            </>
          )}
          {round.weather && <p><strong>Weather:</strong> {round.weather}</p>}
          {round.bowUsed && <p><strong>Bow:</strong> {round.bowUsed}</p>}
          {round.arrowsUsed && <p><strong>Arrows:</strong> {round.arrowsUsed}</p>}
        </RoundMeta>
      </RoundHeader>
      
      <ScoreSummary>
        <ScoreDisplay>
          <h2>Total Score</h2>
          <ScoreValue>
            {round.score} <span>/ {round.maxScore}</span>
          </ScoreValue>
          <ScorePercentage>{scorePercentage}%</ScorePercentage>
        </ScoreDisplay>
        
        <ScoreDisplay>
          <h2>Statistics</h2>
          <p><strong>Average per Target:</strong> {averagePerTarget}</p>
          <p><strong>Perfect Targets:</strong> {perfectTargets} of {targetsCount}</p>
          <p><strong>Targets Completed:</strong> {round.complete ? 'All' : `${round.targetScores ? round.targetScores.length : 0} of ${targetsCount}`}</p>
        </ScoreDisplay>
      </ScoreSummary>
      
      <section>
        <SectionTitle>Performance Visualization</SectionTitle>
        <ChartContainer>
          <PlaceholderChart>
            <p>Score distribution chart would be displayed here</p>
            <p>(In a real implementation, a chart would be rendered showing score distribution)</p>
          </PlaceholderChart>
        </ChartContainer>
      </section>
      
      <section>
        <SectionTitle>Target Scores</SectionTitle>
        <TargetScores>
          <TargetTable>
            <thead>
              <tr>
                <th>Target</th>
                <th>Score</th>
                <th>Max Score</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {round.targetScores && round.targetScores.length > 0 ? (
                round.targetScores.map(target => (
                  <tr key={target.number}>
                    <td>{target.number}</td>
                    <td>{target.score}</td>
                    <td>{target.maxScore}</td>
                    <td>{((target.score / target.maxScore) * 100).toFixed(0)}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No target scores recorded yet</td>
                </tr>
              )}
            </tbody>
          </TargetTable>
        </TargetScores>
      </section>
      
      {round.notes && (
        <section>
          <SectionTitle>Notes</SectionTitle>
          <p>{round.notes}</p>
        </section>
      )}
      
          <ActionButtons>
            {!round.complete && round._id && (
              <Button to={`/rounds/${round._id}/score`}>Continue Scoring</Button>
            )}
            {round._id && (
              <Button to={`/rounds/new?template=${round._id}`} secondary>Start Similar Round</Button>
            )}
          </ActionButtons>
    </RoundDetailsContainer>
  );
};

export default RoundDetails;
