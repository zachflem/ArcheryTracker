import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ClubManagementContainer = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #3498db;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: ${props => props.secondary ? 'white' : props.danger ? '#e74c3c' : '#3498db'};
  color: ${props => props.secondary ? '#3498db' : 'white'};
  border: 2px solid ${props => props.danger ? '#e74c3c' : '#3498db'};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.secondary ? '#f5f7fa' : props.danger ? '#c0392b' : '#2980b9'};
  }
`;

const SocialMediaSection = styled.div`
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
`;

const SocialMediaItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
`;

const SocialMediaSelect = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  margin-right: 0.5rem;
  min-width: 120px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1rem;
  margin-left: 0.5rem;
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f5f7fa;
  border: 1px dashed #3498db;
  color: #3498db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #eef2f7;
  }
`;

const LogoSection = styled.div`
  margin-bottom: 2rem;
`;

const LogoPreview = styled.div`
  width: 200px;
  height: 200px;
  border: 2px dashed ${props => props.hasImage ? 'transparent' : '#ddd'};
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.hasImage ? 'transparent' : '#f9f9f9'};
  
  img {
    max-width: 100%;
    max-height: 100%;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f5f7fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #eef2f7;
  }
`;

const ClubManagement = () => {
  const { name } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    affiliation: '',
    description: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    website: ''
  });
  
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'facebook', url: '' },
    { platform: 'instagram', url: '' },
    { platform: 'twitter', url: '' }
  ]);
  
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const socialMediaPlatforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    const fetchClubDetails = async () => {
      try {
        setLoading(true);
        
        if (!name || name === 'new') {
          // Creating a new club
          setLoading(false);
          return;
        }
        
        // For a real implementation, this would be an API call
        // For now, we'll use mock data
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockClub = {
          _id: 'some-id',
          name: name,
          description: 'The premier archery club in central Sydney. We offer various programs for archers of all skill levels, from beginners to advanced competitors.',
          location: {
            address: '123 Main St, Sydney, NSW 2000',
          },
          contactInfo: {
            email: 'info@centralarchery.example.com',
            phone: '+61 2 1234 5678',
            website: 'www.centralarchery.example.com'
          },
          socialLinks: {
            facebook: 'https://facebook.com/centralarchery',
            instagram: 'https://instagram.com/centralarchery',
            twitter: 'https://twitter.com/centralarchery'
          },
          contactPerson: 'John Smith',
          affiliation: 'Australian Archery Association'
        };
        
        // Transform the mock data to match our form structure
        setFormData({
          name: mockClub.name,
          address: mockClub.location.address,
          affiliation: mockClub.affiliation || '',
          description: mockClub.description,
          contactPerson: mockClub.contactPerson || '',
          contactPhone: mockClub.contactInfo.phone || '',
          contactEmail: mockClub.contactInfo.email || '',
          website: mockClub.contactInfo.website || ''
        });
        
        // Transform social links
        const formattedSocialLinks = Object.entries(mockClub.socialLinks || {})
          .filter(([_, url]) => url)
          .map(([platform, url]) => ({ platform, url }));
        
        if (formattedSocialLinks.length > 0) {
          setSocialLinks(formattedSocialLinks);
        }
        
        // If there's a logo, set the preview
        if (mockClub.logo) {
          setLogoPreview(`${process.env.REACT_APP_API_URL}/uploads/images/${mockClub.logo}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching club details:', error);
        setLoading(false);
        setErrors({ general: 'Failed to load club details. Please try again.' });
      }
    };
    
    fetchClubDetails();
  }, [name]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    setSocialLinks(updatedLinks);
  };
  
  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: 'facebook', url: '' }]);
  };
  
  const handleRemoveSocialLink = (index) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, logo: 'Please upload an image file' });
      return;
    }
    
    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setErrors({ ...errors, logo: 'Image must be less than 1MB' });
      return;
    }
    
    setLogo(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear any logo error
    if (errors.logo) {
      setErrors({
        ...errors,
        logo: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    // Validate email format if provided
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    // Validate URL format if provided
    if (formData.website) {
      try {
        new URL(formData.website.startsWith('http') ? formData.website : `https://${formData.website}`);
      } catch (e) {
        newErrors.website = 'Please enter a valid URL';
      }
    }
    
    // Validate social links URLs
    socialLinks.forEach((link, index) => {
      if (link.url) {
        try {
          new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`);
        } catch (e) {
          newErrors[`socialLink${index}`] = 'Please enter a valid URL';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ submit: 'You must be logged in to perform this action' });
        setSubmitting(false);
        return;
      }
      
      // Prepare data for API
      const clubData = {
        name: formData.name,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city || 'Not specified',
          state: formData.state || 'Not specified', 
          country: formData.country || 'Not specified'
        },
        contactInfo: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
          website: formData.website
        },
        contactPerson: formData.contactPerson,
        affiliation: formData.affiliation,
        // Auto-approve clubs created by admins or super_users
        approved: user.role === 'super_user' || user.role === 'admin' ? true : false
      };
      
      // Transform social links to object format
      const socialLinksObj = {};
      socialLinks.forEach(link => {
        if (link.url) {
          socialLinksObj[link.platform] = link.url;
        }
      });
      clubData.socialLinks = socialLinksObj;
      
      console.log('Submitting club data:', clubData);
      
      let response;
      
      // Create or update the club
      if (name && name !== 'new') {
        // Update existing club
        response = await axios.put(`/api/clubs/${name}`, clubData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new club
        response = await axios.post('/api/clubs', clubData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      console.log('API response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to save club');
      }
      
      const clubId = response.data.data._id;
      
      // If there's a new logo, handle file upload
      if (logo) {
        console.log('Uploading logo:', logo.name);
        
        const formData = new FormData();
        formData.append('logo', logo);
        
        // Use club name for the logo upload if available, otherwise use club ID
        const clubIdentifier = response.data.data.name || clubId;
        
        const logoResponse = await axios.put(`/api/clubs/${clubIdentifier}/logo`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (!logoResponse.data.success) {
          console.warn('Logo upload failed:', logoResponse.data);
          // Continue even if logo upload fails
        }
      }
      
      setSuccessMessage(name && name !== 'new' ? 'Club updated successfully' : 'Club created successfully');
      
      // Redirect to the club page after a brief delay
      const clubNameToRedirect = name !== 'new' ? name : response.data.data.name;
      setTimeout(() => {
        history.push(`/clubs/${clubNameToRedirect}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving club:', error);
      setErrors({ submit: 'Failed to save club. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <ClubManagementContainer>
        <p>Loading...</p>
      </ClubManagementContainer>
    );
  }
  
  return (
    <ClubManagementContainer>
      <Title>{name && name !== 'new' ? 'Edit Club' : 'Create New Club'}</Title>
      
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="name">Club Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter club name"
            required
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter club address"
            required
          />
          {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="affiliation">Affiliation</Label>
          <Input
            id="affiliation"
            name="affiliation"
            value={formData.affiliation}
            onChange={handleChange}
            placeholder="e.g. Australian Archery Association"
          />
        </FormGroup>
        
        <LogoSection>
          <Label>Club Logo</Label>
          <LogoPreview hasImage={logoPreview}>
            {logoPreview ? (
              <img src={logoPreview} alt="Club logo preview" />
            ) : (
              <span>No logo uploaded</span>
            )}
          </LogoPreview>
          
          <FileInput
            ref={fileInputRef}
            type="file"
            id="logo"
            accept="image/*"
            onChange={handleLogoChange}
          />
          <FileInputLabel htmlFor="logo">
            {logoPreview ? 'Change Logo' : 'Upload Logo'}
          </FileInputLabel>
          
          {errors.logo && <ErrorMessage>{errors.logo}</ErrorMessage>}
        </LogoSection>
        
        <FormGroup>
          <Label htmlFor="description">Club Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a description of your club"
            required
          />
          {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="contactPerson">Club Contact Person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            placeholder="Enter name of main contact person"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            placeholder="Enter contact phone number"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Enter contact email"
          />
          {errors.contactEmail && <ErrorMessage>{errors.contactEmail}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="website">Website URL</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="e.g. www.yourclub.com"
          />
          {errors.website && <ErrorMessage>{errors.website}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label>Social Media Links</Label>
          <SocialMediaSection>
            {socialLinks.map((link, index) => (
              <SocialMediaItem key={index}>
                <SocialMediaSelect
                  value={link.platform}
                  onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                >
                  {socialMediaPlatforms.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </SocialMediaSelect>
                <Input
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                  placeholder={`Enter ${socialMediaPlatforms.find(p => p.value === link.platform)?.label} URL`}
                />
                <RemoveButton 
                  type="button"
                  onClick={() => handleRemoveSocialLink(index)}
                  disabled={socialLinks.length === 1}
                >
                  ✕
                </RemoveButton>
              </SocialMediaItem>
            ))}
            
            {errors[`socialLink${socialLinks.length - 1}`] && (
              <ErrorMessage>{errors[`socialLink${socialLinks.length - 1}`]}</ErrorMessage>
            )}
            
            <AddButton type="button" onClick={handleAddSocialLink}>
              + Add Social Media
            </AddButton>
          </SocialMediaSection>
        </FormGroup>
        
        <div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : name && name !== 'new' ? 'Update Club' : 'Create Club'}
          </Button>
          <Button type="button" secondary onClick={() => history.goBack()}>
            Cancel
          </Button>
        </div>
        
        {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      </Form>
    </ClubManagementContainer>
  );
};

export default ClubManagement;
