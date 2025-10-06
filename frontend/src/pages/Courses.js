import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const CoursesContainer = styled.div`
  padding: 1rem;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
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

const SearchInput = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
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
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CourseImage = styled.div`
  height: 150px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
`;

const CourseDetails = styled.div`
  padding: 1.5rem;
`;

const CourseName = styled.h2`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const ClubName = styled.p`
  color: #7f8c8d;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const CourseInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  div {
    text-align: center;
  }
  
  strong {
    display: block;
    margin-bottom: 0.25rem;
  }
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: #f5f7fa;
  border-radius: 8px;
`;

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreType, setScoreType] = useState('all');
  const [targetCount, setTargetCount] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        
        // Make an actual API call to fetch courses
        const response = await axios.get('/api/courses');
        
        if (response.data && response.data.success) {
          const actualCourses = response.data.data;
          setCourses(actualCourses);
          setFilteredCourses(actualCourses);
        } else {
          console.error('Error fetching courses: Invalid API response');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  useEffect(() => {
    // Apply filters whenever they change
    let result = [...courses];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by scoring system
    if (scoreType !== 'all') {
      result = result.filter(course => course.scoringSystem === scoreType);
    }
    
    // Filter by target count
    if (targetCount !== 'all') {
      const targetRanges = {
        'small': [1, 10],
        'medium': [11, 20],
        'large': [21, 100]
      };
      
      if (targetRanges[targetCount]) {
        const [min, max] = targetRanges[targetCount];
        result = result.filter(course => 
          course.targets >= min && course.targets <= max
        );
      }
    }
    
    setFilteredCourses(result);
  }, [searchTerm, scoreType, targetCount, courses]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <CoursesContainer>
      <Title>Archery Courses</Title>
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel htmlFor="search">Search</FilterLabel>
          <SearchInput
            id="search"
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </FilterGroup>
        
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
          <FilterLabel htmlFor="targetCount">Target Count</FilterLabel>
          <FilterSelect 
            id="targetCount"
            value={targetCount}
            onChange={(e) => setTargetCount(e.target.value)}
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (1-10)</option>
            <option value="medium">Medium (11-20)</option>
            <option value="large">Large (21+)</option>
          </FilterSelect>
        </FilterGroup>
      </FiltersContainer>
      
      {loading ? (
        <p>Loading courses...</p>
      ) : filteredCourses.length > 0 ? (
        <CourseGrid>
          {filteredCourses.map(course => (
            <CourseCard key={course._id}>
              <CourseImage>🎯</CourseImage>
              <CourseDetails>
                <CourseName>{course.name}</CourseName>
                <ClubName>{course.club.name}</ClubName>
                <p>{course.description}</p>
                <CourseInfo>
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
                </CourseInfo>
                <CourseLink to={`/courses/${course._id}`}>View Details</CourseLink>
              </CourseDetails>
            </CourseCard>
          ))}
        </CourseGrid>
      ) : (
        <EmptyState>
          <h2>No courses found</h2>
          <p>Try adjusting your filters or check back later for new courses.</p>
        </EmptyState>
      )}
    </CoursesContainer>
  );
};

export default Courses;
