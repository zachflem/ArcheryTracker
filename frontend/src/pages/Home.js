import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Hero = styled.div`
  background-color: #f5f7fa;
  border-radius: 10px;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #3498db;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #555;
  max-width: 800px;
  margin: 0 auto 2rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.primary ? '#3498db' : 'white'};
  color: ${props => props.primary ? 'white' : '#3498db'};
  border: 2px solid #3498db;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#eaf4fd'};
    transform: translateY(-2px);
  }
`;

const FeaturesSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const FeatureTitle = styled.h3`
  color: #3498db;
  margin-bottom: 0.8rem;
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Home = () => {
  return (
    <HomeContainer>
      <Hero>
        <Title>🎯 ArcheryTracker.io</Title>
        <Subtitle>
          Track your archery scores, join clubs, participate in events, and improve your shooting with our comprehensive archery score tracking application.
        </Subtitle>
        <ButtonContainer>
          <Button to="/register" primary>Get Started</Button>
          <Button to="/login">Sign In</Button>
        </ButtonContainer>
      </Hero>

      <FeaturesSection>
        <FeatureCard>
          <FeatureIcon>📊</FeatureIcon>
          <FeatureTitle>Score Tracking</FeatureTitle>
          <p>Record and analyze your shooting data with support for multiple scoring systems including ABA and IFAA.</p>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>🏆</FeatureIcon>
          <FeatureTitle>Clubs & Events</FeatureTitle>
          <p>Join archery clubs, participate in events, and compete with archers from around the world.</p>
        </FeatureCard>

        <FeatureCard>
          <FeatureIcon>📱</FeatureIcon>
          <FeatureTitle>Mobile First</FeatureTitle>
          <p>Designed for mobile use, our app works offline so you can score without worrying about connectivity.</p>
        </FeatureCard>
      </FeaturesSection>

      <div>
        <h2>Ready to improve your archery?</h2>
        <ButtonContainer>
          <Button to="/register" primary>Create an Account</Button>
        </ButtonContainer>
      </div>
    </HomeContainer>
  );
};

export default Home;
