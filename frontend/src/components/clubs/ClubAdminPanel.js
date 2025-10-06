import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminPanelContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
`;

const Button = styled.button`
  padding: 0.6rem 1rem;
  background-color: ${props => props.primary ? '#3498db' : props.danger ? '#e74c3c' : 'white'};
  color: ${props => props.primary ? 'white' : props.danger ? 'white' : '#3498db'};
  border: 2px solid ${props => props.danger ? '#e74c3c' : '#3498db'};
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : props.danger ? '#c0392b' : '#f5f7fa'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const TabButtonGroup = styled.div`
  display: flex;
  gap: 1px;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
`;

const TabButton = styled.button`
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.active ? '#3498db' : '#7f8c8d'};
  border-bottom: 2px solid ${props => props.active ? '#3498db' : 'transparent'};
`;

const TabContent = styled.div`
  padding: 1rem 0;
`;

const ItemsList = styled.div`
  margin-top: 1rem;
`;

const Item = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ItemInfo = styled.div`
  flex-grow: 1;
`;

const ItemTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
`;

const ItemDescription = styled.p`
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
`;

const ItemDate = styled.span`
  color: #7f8c8d;
  font-size: 0.8rem;
  display: block;
  margin-top: 0.25rem;
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Form = styled.form`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  
  &:hover {
    color: #34495e;
  }
`;

const ClubAdminPanel = ({ club, onUpdate }) => {
  const { user } = useAuth();
  const history = useHistory();
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Members management
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  
  // Course management
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    description: '',
    scoringSystem: 'ABA',
    targets: 10,
    arrowsPerTarget: 3
  });
  const [editingCourseId, setEditingCourseId] = useState(null);
  
  // Event management
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    visibility: 'club-only',
    fee: { amount: 0, currency: 'AUD' }
  });
  const [editingEventId, setEditingEventId] = useState(null);
  
  // Access control check
  const isClubAdmin = user && (
    user.role === 'super_user' || 
    user.role === 'admin' || 
    user.role === 'club_admin' ||
    (club.admins && club.admins.some(admin => 
      (admin._id === user._id || admin === user._id)
    ))
  );
  
  useEffect(() => {
    if (club) {
      fetchMembers();
      fetchCourses();
      fetchEvents();
    }
  }, [club]);
  
  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Just use the club.members array since it's already populated in getClub
      if (club && club.members) {
        setMembers(club.members);
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/clubs/${club.name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMembers(response.data.data.members || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
      toast.error('Failed to load members');
    }
  };
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`/api/clubs/${club.name}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCourses(response.data.data || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
      toast.error('Failed to load courses');
    }
  };
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`/api/clubs/${club.name}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEvents(response.data.data || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
      toast.error('Failed to load events');
    }
  };
  
  // =============== Member Management ===============
  
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setAddingMember(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.put(
        `/api/clubs/${club.name}/members`, 
        { email: newMemberEmail }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Member added successfully');
        setNewMemberEmail('');
        fetchMembers();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      const errorMsg = error.response?.data?.error || 'Failed to add member';
      toast.error(errorMsg);
    } finally {
      setAddingMember(false);
    }
  };

  const handlePromoteToAdmin = async (member) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Confirm before promoting
      if (!window.confirm(`Are you sure you want to promote ${member.name} to club admin?`)) {
        return;
      }
      
      const response = await axios.put(
        `/api/clubs/${club.name}/admins`, 
        { email: member.email }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Member promoted to admin successfully');
        fetchMembers();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error promoting member:', error);
      const errorMsg = error.response?.data?.error || 'Failed to promote member';
      toast.error(errorMsg);
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Confirm before removing
      const memberToRemove = members.find(m => m._id === memberId);
      if (!window.confirm(`Are you sure you want to remove ${memberToRemove?.name || 'this member'} from the club?`)) {
        return;
      }
      
      const response = await axios.delete(`/api/clubs/${club.name}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Member removed successfully');
        fetchMembers();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMsg = error.response?.data?.error || 'Failed to remove member';
      toast.error(errorMsg);
    }
  };
  
  // =============== Course Management ===============
  
  const handleCourseFormChange = (e) => {
    const { name, value } = e.target;
    setCourseForm({
      ...courseForm,
      [name]: name === 'targets' || name === 'arrowsPerTarget' ? parseInt(value, 10) : value
    });
  };
  
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Validate form
      if (!courseForm.name || !courseForm.description) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      let response;
      
      if (editingCourseId) {
        // Update existing course
        response = await axios.put(
          `/api/clubs/${club.name}/courses/${editingCourseId}`,
          courseForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new course
        response = await axios.post(
          `/api/clubs/${club.name}/courses`,
          courseForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (response.data.success) {
        toast.success(`Course ${editingCourseId ? 'updated' : 'created'} successfully`);
        fetchCourses();
        setShowCourseModal(false);
        resetCourseForm();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error saving course:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save course';
      toast.error(errorMsg);
    }
  };
  
  const handleEditCourse = (course) => {
    setCourseForm({
      name: course.name,
      description: course.description,
      scoringSystem: course.scoringSystem,
      targets: course.targets,
      arrowsPerTarget: course.arrowsPerTarget || 3
    });
    setEditingCourseId(course._id);
    setShowCourseModal(true);
  };
  
  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Confirm before deleting
      const courseToDelete = courses.find(c => c._id === courseId);
      if (!window.confirm(`Are you sure you want to delete the course "${courseToDelete?.name || 'this course'}"?`)) {
        return;
      }
      
      const response = await axios.delete(
        `/api/clubs/${club.name}/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Course deleted successfully');
        fetchCourses();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete course';
      toast.error(errorMsg);
    }
  };
  
  const resetCourseForm = () => {
    setCourseForm({
      name: '',
      description: '',
      scoringSystem: 'ABA',
      targets: 10,
      arrowsPerTarget: 3
    });
    setEditingCourseId(null);
  };
  
  // =============== Event Management ===============
  
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fee.amount') {
      setEventForm({
        ...eventForm,
        fee: {
          ...eventForm.fee,
          amount: parseFloat(value) || 0
        }
      });
    } else {
      setEventForm({
        ...eventForm,
        [name]: value
      });
    }
  };
  
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Validate form
      if (!eventForm.name || !eventForm.description || !eventForm.startDate || !eventForm.endDate) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      let response;
      
      if (editingEventId) {
        // Update existing event
        response = await axios.put(
          `/api/clubs/${club.name}/events/${editingEventId}`,
          eventForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new event
        response = await axios.post(
          `/api/clubs/${club.name}/events`,
          eventForm,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (response.data.success) {
        toast.success(`Event ${editingEventId ? 'updated' : 'created'} successfully`);
        fetchEvents();
        setShowEventModal(false);
        resetEventForm();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMsg = error.response?.data?.error || 'Failed to save event';
      toast.error(errorMsg);
    }
  };
  
  const handleEditEvent = (event) => {
    // Format dates for input type="datetime-local"
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString().slice(0, 16);
    };
    
    setEventForm({
      name: event.name,
      description: event.description,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      status: event.status,
      visibility: event.visibility,
      fee: event.fee || { amount: 0, currency: 'AUD' }
    });
    setEditingEventId(event._id);
    setShowEventModal(true);
  };
  
  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Confirm before deleting
      const eventToDelete = events.find(e => e._id === eventId);
      if (!window.confirm(`Are you sure you want to delete the event "${eventToDelete?.name || 'this event'}"?`)) {
        return;
      }
      
      const response = await axios.delete(
        `/api/clubs/${club.name}/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Event deleted successfully');
        fetchEvents();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMsg = error.response?.data?.error || 'Failed to delete event';
      toast.error(errorMsg);
    }
  };
  
  const resetEventForm = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 16);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().slice(0, 16);
    
    setEventForm({
      name: '',
      description: '',
      startDate: tomorrowStr,
      endDate: nextWeekStr,
      status: 'upcoming',
      visibility: 'club-only',
      fee: { amount: 0, currency: 'AUD' }
    });
    setEditingEventId(null);
  };
  
  if (!isClubAdmin) {
    return null; // Don't render anything if user is not an admin
  }
  
  return (
    <AdminPanelContainer>
      <SectionTitle>Club Administration</SectionTitle>
      
      <TabContainer>
        <TabButtonGroup>
          <TabButton 
            active={activeTab === 'members'} 
            onClick={() => setActiveTab('members')}
          >
            Members
          </TabButton>
          <TabButton 
            active={activeTab === 'courses'} 
            onClick={() => setActiveTab('courses')}
          >
            Courses
          </TabButton>
          <TabButton 
            active={activeTab === 'events'} 
            onClick={() => setActiveTab('events')}
          >
            Events
          </TabButton>
        </TabButtonGroup>
        
        {/* Members Tab */}
        {activeTab === 'members' && (
          <TabContent>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Input
                type="email"
                placeholder="Enter member email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <Button 
                primary 
                type="submit"
                disabled={addingMember}
              >
                {addingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </form>
            
            <ItemsList>
              {members.length === 0 ? (
                <p>No members found.</p>
              ) : (
                members.map(member => (
                  <Item key={member._id}>
                    <ItemInfo>
                      <ItemTitle>{member.name}</ItemTitle>
                      <ItemDescription>{member.email}</ItemDescription>
                    </ItemInfo>
                    <ItemActions>
                      {!club.admins.some(admin => 
                        admin._id === member._id || admin === member._id
                      ) && (
                        <Button 
                          onClick={() => handlePromoteToAdmin(member)}
                        >
                          Make Admin
                        </Button>
                      )}
                      <Button 
                        danger
                        onClick={() => handleRemoveMember(member._id)}
                      >
                        Remove
                      </Button>
                    </ItemActions>
                  </Item>
                ))
              )}
            </ItemsList>
          </TabContent>
        )}
        
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <TabContent>
            <Button 
              primary
              onClick={() => {
                resetCourseForm();
                setShowCourseModal(true);
              }}
            >
              Add Course
            </Button>
            
            <ItemsList>
              {courses.length === 0 ? (
                <p>No courses found.</p>
              ) : (
                courses.map(course => (
                  <Item key={course._id}>
                    <ItemInfo>
                      <ItemTitle>{course.name}</ItemTitle>
                      <ItemDescription>{course.description}</ItemDescription>
                      <ItemDescription>Scoring: {course.scoringSystem}</ItemDescription>
                      <ItemDescription>Targets: {course.targets}</ItemDescription>
                    </ItemInfo>
                    <ItemActions>
                      <Button 
                        onClick={() => handleEditCourse(course)}
                      >
                        Edit
                      </Button>
                      <Button 
                        danger
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        Delete
                      </Button>
                    </ItemActions>
                  </Item>
                ))
              )}
            </ItemsList>
          </TabContent>
        )}
        
        {/* Events Tab */}
        {activeTab === 'events' && (
          <TabContent>
            <Button 
              primary
              onClick={() => {
                resetEventForm();
                setShowEventModal(true);
              }}
            >
              Add Event
            </Button>
            
            <ItemsList>
              {events.length === 0 ? (
                <p>No events found.</p>
              ) : (
                events.map(event => (
                  <Item key={event._id}>
                    <ItemInfo>
                      <ItemTitle>{event.name}</ItemTitle>
                      <ItemDescription>{event.description}</ItemDescription>
                      <ItemDate>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </ItemDate>
                      <ItemDescription>Status: {event.status}</ItemDescription>
                    </ItemInfo>
                    <ItemActions>
                      <Button 
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </Button>
                      <Button 
                        danger
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete
                      </Button>
                    </ItemActions>
                  </Item>
                ))
              )}
            </ItemsList>
          </TabContent>
        )}
      </TabContainer>
      
      {/* Course Modal */}
      {showCourseModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingCourseId ? 'Edit Course' : 'Add New Course'}</ModalTitle>
              <ModalClose onClick={() => setShowCourseModal(false)}>×</ModalClose>
            </ModalHeader>
            
            <Form onSubmit={handleCourseSubmit}>
              <FormGroup>
                <Label htmlFor="name">Course Name *</Label>
                <Input 
                  id="name"
                  name="name"
                  value={courseForm.name}
                  onChange={handleCourseFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description *</Label>
                <TextArea 
                  id="description"
                  name="description"
                  value={courseForm.description}
                  onChange={handleCourseFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="scoringSystem">Scoring System *</Label>
                <Select 
                  id="scoringSystem"
                  name="scoringSystem"
                  value={courseForm.scoringSystem}
                  onChange={handleCourseFormChange}
                  required
                >
                  <option value="ABA">ABA</option>
                  <option value="IFAA">IFAA</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="targets">Number of Targets *</Label>
                <Input 
                  id="targets"
                  name="targets"
                  type="number"
                  min="1"
                  value={courseForm.targets}
                  onChange={handleCourseFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="arrowsPerTarget">Arrows per Target</Label>
                <Input 
                  id="arrowsPerTarget"
                  name="arrowsPerTarget"
                  type="number"
                  min="1"
                  max="3"
                  value={courseForm.arrowsPerTarget}
                  onChange={handleCourseFormChange}
                />
              </FormGroup>
              
              <FormActions>
                <Button type="button" onClick={() => setShowCourseModal(false)}>Cancel</Button>
                <Button primary type="submit">{editingCourseId ? 'Update Course' : 'Create Course'}</Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
      
      {/* Event Modal */}
      {showEventModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingEventId ? 'Edit Event' : 'Add New Event'}</ModalTitle>
              <ModalClose onClick={() => setShowEventModal(false)}>×</ModalClose>
            </ModalHeader>
            
            <Form onSubmit={handleEventSubmit}>
              <FormGroup>
                <Label htmlFor="name">Event Name *</Label>
                <Input 
                  id="name"
                  name="name"
                  value={eventForm.name}
                  onChange={handleEventFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="description">Description *</Label>
                <TextArea 
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="startDate">Start Date and Time *</Label>
                <Input 
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  value={eventForm.startDate}
                  onChange={handleEventFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="endDate">End Date and Time *</Label>
                <Input 
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={eventForm.endDate}
                  onChange={handleEventFormChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select 
                  id="status"
                  name="status"
                  value={eventForm.status}
                  onChange={handleEventFormChange}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="visibility">Visibility</Label>
                <Select 
                  id="visibility"
                  name="visibility"
                  value={eventForm.visibility}
                  onChange={handleEventFormChange}
                >
                  <option value="public">Public</option>
                  <option value="club-only">Club Members Only</option>
                  <option value="private">Private</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="fee.amount">Event Fee (AUD)</Label>
                <Input 
                  id="fee.amount"
                  name="fee.amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={eventForm.fee.amount}
                  onChange={handleEventFormChange}
                />
              </FormGroup>
              
              <FormActions>
                <Button type="button" onClick={() => setShowEventModal(false)}>Cancel</Button>
                <Button primary type="submit">{editingEventId ? 'Update Event' : 'Create Event'}</Button>
              </FormActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </AdminPanelContainer>
  );
};

export default ClubAdminPanel;
