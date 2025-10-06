import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-reader';
import styled from 'styled-components';

const ScannerContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const ScannerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const QRScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'pending', 'granted', 'denied', or 'unsupported'
  
  // Explicitly request camera permission on component mount
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        // Check if navigator.mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("Media devices API not supported in this browser");
          setCameraPermission('unsupported');
          setError("Camera access is not supported by this browser. Try using a different browser or device.");
          return;
        }
        
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Cleanup the stream we just requested (the QR scanner will request it again)
        stream.getTracks().forEach(track => track.stop());
        
        setCameraPermission('granted');
      } catch (err) {
        console.error("Camera permission error:", err);
        
        if (err.name === 'NotAllowedError') {
          setCameraPermission('denied');
          setError('Camera permission denied. Please allow camera access to scan QR codes.');
        } else if (err.name === 'NotFoundError') {
          setCameraPermission('unsupported');
          setError('No camera found. Please try a different device.');
        } else {
          setCameraPermission('error');
          setError('Error accessing camera: ' + err.message);
        }
      }
    };
    
    requestCameraPermission();
  }, []);

  const handleScan = (data) => {
    if (data) {
      setLoading(true);
      console.log("Scanned QR code data:", data);
      
      // Parse the QR code data
      try {
        // Expected format: "archery-tracker:user:{userId}" but we should be flexible
        let userId;
        
        // First, try the standard format
        const parts = data.split(':');
        if (parts.length === 3 && parts[0] === 'archery-tracker' && parts[1] === 'user') {
          userId = parts[2];
        } 
        // If that fails, see if it's just a user ID (more robust)
        else {
          // Just use whatever was scanned as the ID
          userId = data.trim();
        }
        
        // In a real app, we would make an API call to get the user details
        // For this MVP, we'll simulate it with a timeout
        setTimeout(() => {
          onScan({
            id: userId,
            name: 'QR User ' + userId.substring(0, 5),
            email: `user-${userId.substring(0, 5)}@example.com`
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        setError('Invalid QR code format. Please scan a valid archer ID card.');
        setLoading(false);
      }
    }
  };

  const handleError = (err) => {
    console.error("QR Scanner error:", err);
    
    // Handle permission errors specifically
    if (err.name === 'NotAllowedError') {
      setError('Camera permission denied. Please allow camera access and try again.');
    } else if (err.name === 'NotFoundError') {
      setError('No camera found. Please try a different device or add the participant manually.');
    } else if (err.name === 'NotReadableError') {
      setError('Camera is already in use by another application. Please close other camera apps and try again.');
    } else {
      setError('Error scanning QR code. Please try again or add the participant manually.');
    }
  };

  // Render different UI based on camera permission state
  const renderContent = () => {
    switch (cameraPermission) {
      case 'granted':
        return (
          <ScannerWrapper>
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
              facingMode="environment"
              resolution={600}
              constraints={{
                audio: false,
                video: {
                  facingMode: "environment",
                  width: { min: 640, ideal: 1280, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1080 }
                }
              }}
            />
            {loading && (
              <LoadingOverlay>
                Loading participant data...
              </LoadingOverlay>
            )}
          </ScannerWrapper>
        );
      
      case 'denied':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Camera Access Denied</h3>
            <p>You need to allow camera access to scan QR codes.</p>
            <div style={{ marginTop: '1.5rem' }}>
              <h4>How to enable camera access:</h4>
              <ol style={{ textAlign: 'left', marginTop: '1rem' }}>
                <li>Click on the camera/lock icon in your browser's address bar</li>
                <li>Select "Allow" for the camera permission</li>
                <li>Refresh the page</li>
              </ol>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '1.5rem',
                padding: '0.8rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Page
            </button>
          </div>
        );
        
      case 'unsupported':
        return (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Camera Not Available</h3>
            <p>{error || 'No camera was found or your browser does not support camera access.'}</p>
            <p style={{ marginTop: '1rem' }}>Please try using a different device or browser.</p>
          </div>
        );
        
      case 'pending':
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem', fontSize: '2rem' }}>📸</div>
            <h3>Requesting Camera Permission...</h3>
            <p>Please allow camera access when prompted by your browser.</p>
          </div>
        );
    }
  };
  
  return (
    <ScannerContainer>
      {renderContent()}
      
      {cameraPermission === 'granted' && error && <ErrorMessage>{error}</ErrorMessage>}
      
      {cameraPermission === 'granted' && (
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d', textAlign: 'center' }}>
          Note: On mobile devices, you may need to grant camera permission through your browser settings.
          If scanning doesn't work, try adding the participant manually.
        </div>
      )}
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#3498db', 
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Cancel Scanning
        </button>
      </div>
    </ScannerContainer>
  );
};

export default QRScanner;
