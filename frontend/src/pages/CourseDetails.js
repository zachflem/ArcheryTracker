import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const CourseDetailsContainer = styled.div`
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

const CourseHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const CourseImage = styled.div`
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
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseName = styled.h1`
  color: #3498db;
  margin-bottom: 0.5rem;
`;

const ClubName = styled(Link)`
  color: #7f8c8d;
  margin-bottom: 1rem;
  display: block;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const CourseDescription = styled.p`
  margin-bottom: 1.5rem;
`;

const CourseStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  div {
    background-color: #f5f7fa;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }
  
  strong {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
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

const StartRoundButton = styled(Link)`
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: 2px solid #3498db;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  text-decoration: none;
  display: inline-block;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const TargetList = styled.div`
  margin-bottom: 2rem;
`;

const TargetItem = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TargetNumber = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3498db;
  margin-right: 2rem;
  min-width: 50px;
  text-align: center;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    align-self: center;
  }
`;

const TargetDetails = styled.div`
  flex: 1;
`;

const RecentRounds = styled.div`
  margin-bottom: 2rem;
`;

const RoundItem = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RoundInfo = styled.div`
  flex: 1;
  
  h3 {
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }
  
  p {
    color: #7f8c8d;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
    width: 100%;
  }
`;

const RoundScore = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  
  span {
    font-size: 0.9rem;
    color: #7f8c8d;
    font-weight: normal;
  }
  
  @media (max-width: 768px) {
    align-self: flex-end;
  }
`;

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [recentRounds, setRecentRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch actual course data from API
        const courseResponse = await axios.get(`/api/courses/${id}`);
        
        if (courseResponse.data && courseResponse.data.success) {
          setCourse(courseResponse.data.data);
        } else {
          console.error('Error fetching course details: Invalid API response');
        }
        
        // Fetch recent rounds for this course
        // This would typically be a separate endpoint, but for now we'll
        // either use a mock or implement it later
        try {
          // Try to fetch recent rounds if API endpoint exists
          const roundsResponse = await axios.get(`/api/rounds?course=${id}&limit=5`);
          if (roundsResponse.data && roundsResponse.data.success) {
            setRecentRounds(roundsResponse.data.data);
          }
        } catch (roundsError) {
          console.log('Recent rounds data not available yet');
          // Set empty array if rounds endpoint doesn't exist yet
          setRecentRounds([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course details:', error);
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <CourseDetailsContainer>
        <p>Loading course details...</p>
      </CourseDetailsContainer>
    );
  }

  if (!course) {
    return (
      <CourseDetailsContainer>
        <BackLink to="/courses">← Back to Courses</BackLink>
        <p>Course not found. The course may have been removed or you don't have access.</p>
      </CourseDetailsContainer>
    );
  }

  return (
    <CourseDetailsContainer>
      <BackLink to="/courses">← Back to Courses</BackLink>
      
      <CourseHeader>
        <CourseImage>🎯</CourseImage>
        <CourseInfo>
          <CourseName>{course.name}</CourseName>
          <ClubName to={`/clubs/${course.club.name}`}>{course.club.name}</ClubName>
          <CourseDescription>{course.description}</CourseDescription>
          
          <CourseStats>
            <div>
              <strong>Targets</strong>
              {course.targets}
            </div>
            <div>
              <strong>Scoring</strong>
              {course.scoringSystem}
            </div>
            <div>
              <strong>Arrows</strong>
              {course.arrowsPerTarget || 3}
            </div>
            <div>
              <strong>Active</strong>
              {course.active ? 'Yes' : 'No'}
            </div>
          </CourseStats>
          
          <ActionButtons>
            <StartRoundButton to={`/rounds/new?course=${course._id}`} primary>Start New Round</StartRoundButton>
            <Button>View on Map</Button>
          </ActionButtons>
          
          <div>
            {course.createdAt && (
              <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
            )}
            {course.qrCode && (
              <p><strong>QR Code:</strong> Available</p>
            )}
          </div>
        </CourseInfo>
      </CourseHeader>
      
      {/* Target information section removed as it's not in the actual data model */}
      
      <section>
        <SectionTitle>Recent Rounds</SectionTitle>
        {recentRounds.length > 0 ? (
          <RecentRounds>
            {recentRounds.map(round => (
              <RoundItem key={round._id}>
                <RoundInfo>
                  <h3>{round.user.name}</h3>
                  <p>{new Date(round.date).toLocaleDateString()}</p>
                </RoundInfo>
                <RoundScore>
                  {round.score} <span>/ {round.maxScore}</span>
                </RoundScore>
              </RoundItem>
            ))}
          </RecentRounds>
        ) : (
          <p>No recent rounds for this course.</p>
        )}
      </section>
    </CourseDetailsContainer>
  );
};

export default CourseDetails;
