import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  background-color: #3498db;
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
`;

const Logo = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  
  span {
    margin-left: 0.5rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
`;

// Menu styles
const MenuContainer = styled.div`
  position: relative;
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Nav = styled.nav`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  position: absolute;
  top: 45px;
  right: 0;
  width: 250px;
  background-color: white;
  flex-direction: column;
  z-index: 10;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
`;

const NavSection = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NavSectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 0.8rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: bold;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  color: #2c3e50;
  text-decoration: none;
  padding: 12px 16px;
  transition: background-color 0.2s;
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};

  &:hover {
    background-color: #f8f9fa;
  }
`;

const NavButton = styled.button`
  display: flex;
  width: 100%;
  text-align: left;
  align-items: center;
  background: none;
  border: none;
  color: ${props => props.danger ? '#e74c3c' : '#2c3e50'};
  padding: 12px 16px;
  transition: background-color 0.2s;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  color: white;
`;

const UserRoleBadge = styled.span`
  display: inline-block;
  background-color: ${props => {
    switch(props.role) {
      case 'super_user': return '#e74c3c';
      case 'admin': return '#f39c12';
      case 'club_admin': return '#27ae60';
      default: return '#7f8c8d';
    }
  }};
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  text-transform: uppercase;
`;

const Content = styled.main`
  flex: 1;
  padding: 2rem;
  max-width: ${props => props.fullWidth ? '100%' : '1200px'};
  margin: 0 auto;
  width: 100%;
`;

const Footer = styled.footer`
  background-color: #f5f7fa;
  padding: 1rem;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
`;

const MainLayout = ({ children, fullWidth = false }) => {
  const [navOpen, setNavOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const history = useHistory();
  const navRef = useRef(null);

  // Close menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target) && 
          !event.target.closest('button[aria-label="Toggle menu"]')) {
        setNavOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navRef]);

  const handleLogout = async () => {
    setNavOpen(false);
    await logout();
    history.push('/');
  };

  // Check if user has elevated role - backend uses underscores in role names
  const hasElevatedRole = user && (user.role === 'super_user' || user.role === 'admin' || user.role === 'club_admin');
  
  // Debug the user role to ensure it's properly detected
  useEffect(() => {
    if (user) {
      console.log('Current user role:', user.role);
      console.log('Has elevated role?', hasElevatedRole);
    }
  }, [user, hasElevatedRole]);

  return (
    <LayoutContainer>
      <Header>
        <HeaderContent>
          <Logo to="/">
            🎯 <span>ArcheryTracker.io</span>
          </Logo>
          
          <HeaderRight>
            {isAuthenticated && user && (
              <ProfileSection>
                {user.name}
                {hasElevatedRole && (
                  <UserRoleBadge role={user.role}>
                    {user.role.replace('_', ' ')}
                  </UserRoleBadge>
                )}
              </ProfileSection>
            )}
            
            <MenuContainer>
              <HamburgerButton 
                onClick={() => setNavOpen(!navOpen)} 
                aria-label="Toggle menu"
              >
                ☰
              </HamburgerButton>
              
              <Nav isOpen={navOpen} ref={navRef}>
                {isAuthenticated ? (
                  <>
                    <NavSection>
                      <NavLink to="/dashboard">Dashboard</NavLink>
                      <NavLink to="/rounds">Rounds</NavLink>
                    </NavSection>
                    
                    <NavSection>
                      <NavLink to="/clubs">Clubs</NavLink>
                      <NavLink to="/courses">Courses</NavLink>
                    </NavSection>
                    
                    {/* Admin section for admin roles */}
                    {user && (user.role === 'super_user' || user.role === 'admin' || user.role === 'club_admin') && (
                      <NavSection>
                        <NavSectionTitle>Administration</NavSectionTitle>
                        {/* Only super_user and admin can access users and backups */}
                        {(user.role === 'super_user' || user.role === 'admin') && (
                          <>
                            <NavLink to="/admin/users">Users</NavLink>
                            <NavLink to="/admin/backups">Backups</NavLink>
                          </>
                        )}
                        {/* All admin roles can access club management */}
                        <NavLink to="/admin/clubs">Clubs</NavLink>
                        {/* Only super_user can access system settings */}
                        {user.role === 'super_user' && (
                          <NavLink to="/admin/system">System Settings</NavLink>
                        )}
                      </NavSection>
                    )}
                    
                    <NavSection>
                      <NavSectionTitle>My Account</NavSectionTitle>
                      <NavLink to="/profile">Profile</NavLink>
                      <NavLink to="/qrcode">My QR Code</NavLink>
                      <NavButton danger onClick={handleLogout}>Log Out</NavButton>
                    </NavSection>
                  </>
                ) : (
                  <NavSection>
                    <NavLink to="/login">Sign In</NavLink>
                    <NavLink to="/register">Register</NavLink>
                  </NavSection>
                )}
              </Nav>
            </MenuContainer>
          </HeaderRight>
        </HeaderContent>
      </Header>
      
      <Content fullWidth={fullWidth}>
        {children}
      </Content>
      
      <Footer>
        &copy; {new Date().getFullYear()} ArcheryTracker.io. All rights reserved.
      </Footer>
    </LayoutContainer>
  );
};

export default MainLayout;
