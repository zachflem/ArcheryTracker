import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 50vh;
`;

const Icon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1rem;
  font-size: 2.5rem;
`;

const Message = styled.p`
  color: #555;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const BackLink = styled(Link)`
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

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Icon>🏹</Icon>
      <Title>Page Not Found</Title>
      <Message>
        Sorry, the page you are looking for does not exist or has been moved.
      </Message>
      <BackLink to="/">Return to Home Page</BackLink>
    </NotFoundContainer>
  );
};

export default NotFound;
