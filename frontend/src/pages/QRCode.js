import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import QRCodeComponent from 'react-qr-code';
import { useAuth } from '../context/AuthContext';

const QRCodeContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const QRWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
`;

const UserInfo = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #7f8c8d;
  }
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  margin: 0.5rem;

  &:hover {
    background-color: #2980b9;
  }
`;

const Instructions = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  text-align: left;
`;

const QRCodePage = () => {
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState('');
  
  useEffect(() => {
    if (user && user._id) {
      // Create a QR code value that contains the user ID
      // Making sure it uses the exact format our scanner expects
      setQrValue(`archery-tracker:user:${user._id}`);
      
      // Debug information for QR code
      console.log("Generated QR code value:", `archery-tracker:user:${user._id}`);
    }
  }, [user]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (!canvas) return;
    
    // Convert the QR code to a data URL
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a link element to download the image
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ArcheryTracker-QRCode-${user ? user.name.replace(/\s+/g, '-') : 'User'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!user) {
    return (
      <QRCodeContainer>
        <Title>Loading user information...</Title>
      </QRCodeContainer>
    );
  }
  
  return (
    <QRCodeContainer>
      <Title>Your QR Code</Title>
      
      <Card>
        <UserInfo>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </UserInfo>
        
        <QRWrapper>
          <QRCodeComponent 
            id="qr-code-canvas"
            value={qrValue} 
            size={200} 
            level="H" 
          />
        </QRWrapper>
        
        <div>
          <Button onClick={handlePrint}>Print QR Code</Button>
          <Button onClick={downloadQRCode}>Download QR Code</Button>
        </div>
      </Card>
      
      <Instructions>
        <h3>How to use your QR Code:</h3>
        <ul>
          <li>Show this QR code when participating in archery events for quick check-in</li>
          <li>Print and laminate the QR code to create a durable ID card</li>
          <li>Let other archers scan your code to quickly add you to rounds</li>
          <li>Download the image to keep on your phone for offline use</li>
        </ul>
        
        <h3 style={{marginTop: '1rem'}}>Scanning Tips:</h3>
        <ul>
          <li>When scanning QR codes, ensure good lighting conditions</li>
          <li>Hold the camera steady and centered on the QR code</li>
          <li>Most mobile browsers will request camera permission - be sure to allow it</li>
          <li>If scanning doesn't work, you can always add participants manually</li>
        </ul>
      </Instructions>
    </QRCodeContainer>
  );
};

export default QRCodePage;
