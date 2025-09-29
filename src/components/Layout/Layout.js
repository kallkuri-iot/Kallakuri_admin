import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  useTheme,
  ThemeProvider,
  createTheme,
  Badge,
  ListSubheader
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrderIcon,
  Report as ReportIcon,
  Assignment as TaskIcon,
  Store as MarketingIcon,
  Inventory as GodownIcon,
  ContactSupport as SalesIcon,
  AssessmentOutlined as ReportsIcon,
  Business as DistributorIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Fingerprint as FingerprintIcon,
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
  BarChart as BarChartIcon,
  Inventory2 as InventoryIcon,
  GroupWork as GroupWorkIcon,
  PendingActions as PendingActionsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { DamageClaimsContext } from '../../pages/DamageReports/DamageReports';

const drawerWidth = 260;

const navigationItems = [
  { name: 'Analytics', icon: <BarChartIcon />, path: '/analytics', permission: 'reports' },
  { name: 'Staff', icon: <PeopleIcon />, path: '/staff', permission: 'staff' },
  // { name: 'Marketing Activities', icon: <MarketingIcon />, path: '/marketing-activities', permission: 'marketing' },
  { name: 'Staff Activity', icon: <FingerprintIcon />, path: '/staff-activity', permission: 'staff_activity' },
  // { name: 'Retailer Shop Activity', icon: <StoreIcon />, path: '/retailer-shop-activity', permission: 'staff_activity' },
  // { name: 'Order Requests', icon: <OrderIcon />, path: '/order-requests', permission: 'orders' },
  { name: 'Damage & Leakage Reports', icon: <ReportIcon />, path: '/damage-reports', permission: 'damage' },
  // { name: 'Task Management', icon: <TaskIcon />, path: '/tasks', permission: 'tasks' },
  { name: 'Staff Assignments', icon: <GroupWorkIcon />, path: '/staff-assignments', permission: 'staff' },
  { name: 'Distributors', icon: <DistributorIcon />, path: '/distributors', permission: 'distributors' },
  { name: 'Godown Logs', icon: <GodownIcon />, path: '/godown-logs', permission: 'godown' },
  { name: 'Sales Inquiries', icon: <SalesIcon />, path: '/sales-inquiries', permission: 'sales' },
  // { name: 'Reports', icon: <ReportsIcon />, path: '/reports', permission: 'reports' },
  // { name: 'Analytics', icon: <BarChartIcon />, path: '/analytics', permission: 'reports' },
];

// Add distributors submenu
const distributorsSubmenu = [
  { name: 'All Distributors', icon: <DistributorIcon />, path: '/distributors', permission: 'distributors' },
  { name: 'Pending Shops', icon: <PendingActionsIcon />, path: '/distributors/pending-shops', permission: 'distributors' }
];

// Define a theme object with our gradient colors
const appTheme = createTheme({
  palette: {
    primary: {
      main: '#ffa726', // Light orange as main color
      light: '#ffcc80', // Very light orange
      dark: '#fb8c00', // Slightly darker orange
      contrastText: '#fff',
    },
    secondary: {
      main: '#5c6bc0', // Indigo
      dark: '#3f51b5',
      light: '#7986cb',
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%)',
          boxShadow: '0 4px 10px rgba(255, 152, 0, 0.15)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 50%, #fb8c00 100%)',
            boxShadow: '0 6px 15px rgba(255, 152, 0, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { isAuthenticated, user, logout, isSubAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [showUnauthorized, setShowUnauthorized] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  
  // Access the damage claims context
  const { pendingClaimsCount = 0 } = React.useContext(DamageClaimsContext) || { pendingClaimsCount: 0 };

  // If not authenticated, redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (item) => {
    if (isSubAdmin && !hasPermission(item.permission)) {
      // Don't navigate if sub-admin doesn't have permission
      return;
    }
    navigate(item.path);
  };

  const toggleUnauthorizedItems = () => {
    setShowUnauthorized(!showUnauthorized);
  };

  // Check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Filter navigation items based on permissions
  const authorizedItems = navigationItems.filter(
    item => !isSubAdmin || hasPermission(item.permission)
  );

  const unauthorizedItems = isSubAdmin ? 
    navigationItems.filter(item => !hasPermission(item.permission)) : 
    [];

  // State for distributors submenu
  const [distributorsOpen, setDistributorsOpen] = useState(
    location.pathname.startsWith('/distributors')
  );

  const handleDistributorsClick = () => {
    setDistributorsOpen(!distributorsOpen);
  };

  // Update the drawer content to include the distributors submenu
  const drawer = (
    <div>
      {/* User Profile Card */}
      {user && (
        <Box sx={{ p: 3, textAlign: 'center', mt: 2, mb: 1 }}>
          <Avatar 
            sx={{ 
              width: 64, 
              height: 64, 
              margin: '0 auto',
              bgcolor: '#ffcc80',
              color: '#e65100',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {user.name ? user.name.charAt(0) : 'U'}
          </Avatar>
          <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.role}
          </Typography>
        </Box>
      )}
      
      <Divider />
      
      {/* Authorized Navigation Items */}
      <List sx={{ px: 1 }}>
        {authorizedItems.map((item) => {
          // Special handling for Distributors to show submenu
          if (item.name === 'Distributors') {
            return (
              <React.Fragment key={item.name}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={handleDistributorsClick}
                    sx={{
                      backgroundColor: location.pathname.startsWith('/distributors') 
                        ? 'rgba(255, 167, 38, 0.1)' 
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 167, 38, 0.05)',
                      },
                      borderLeft: location.pathname.startsWith('/distributors') 
                        ? '4px solid #ffa726' 
                        : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.name} />
                    {distributorsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={distributorsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {distributorsSubmenu.map((subItem) => (
                      <ListItem key={subItem.name} disablePadding>
                        <ListItemButton 
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            pl: 4,
                            backgroundColor: isActive(subItem.path) 
                              ? 'rgba(255, 167, 38, 0.1)' 
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 167, 38, 0.05)',
                            },
                            borderLeft: isActive(subItem.path) 
                              ? '4px solid #ffa726' 
                              : '4px solid transparent',
                          }}
                        >
                          <ListItemIcon>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          
          // Regular menu items
          const active = isActive(item.path);
          const isDamageReports = item.name === 'Damage & Leakage Reports';
          const showBadge = isDamageReports && pendingClaimsCount > 0;
          
          return (
            <ListItem 
              key={item.name} 
              disablePadding 
              onClick={() => handleNavigation(item)}
              sx={{ 
                color: 'inherit', 
                textDecoration: 'none', 
                cursor: 'pointer',
                mb: 0.5,
                overflow: 'hidden',
                borderRadius: '8px',
              }}
            >
              <ListItemButton
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  backgroundColor: active ? 'primary.main' : 'transparent',
                  background: active ? 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%)' : 'transparent',
                  color: active ? '#fff' : 'inherit',
                  '&:hover': {
                    backgroundColor: active ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <ListItemIcon sx={{ color: active ? 'white' : 'inherit' }}>
                  {item.name === 'Damage & Leakage Reports' && pendingClaimsCount > 0 ? (
                    <Badge badgeContent={pendingClaimsCount} color="error">
                  {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.name} />
                {showBadge && (
                  <Badge 
                    badgeContent={pendingClaimsCount} 
                    color="error"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {/* Unauthorized Navigation Items (for sub-admins only) */}
      {isSubAdmin && unauthorizedItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListItem 
            disablePadding
            onClick={toggleUnauthorizedItems}
            sx={{ 
              color: 'text.secondary', 
              cursor: 'pointer',
              px: 1,
              mb: 0.5
            }}
          >
            <ListItemButton sx={{ borderRadius: '8px' }}>
              <ListItemIcon>
                <LockIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Restricted Sections" 
                secondary={`${unauthorizedItems.length} items`}
              />
              {showUnauthorized ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={showUnauthorized} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ px: 1 }}>
              {unauthorizedItems.map((item) => (
                <ListItem 
                  key={item.name} 
                  disablePadding
                  sx={{
                    color: 'text.disabled',
                    textDecoration: 'none',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                    mb: 0.5,
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <Tooltip title="You don't have permission to access this">
                    <ListItemButton disabled sx={{ borderRadius: '8px' }}>
                      <ListItemIcon sx={{ position: 'relative' }}>
                        {item.icon}
                        <LockIcon 
                          fontSize="small"
                          sx={{ 
                            position: 'absolute',
                            bottom: 4,
                            right: 4,
                            color: 'text.disabled'
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.name} 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontSize: '0.9rem',
                            filter: 'blur(0.5px)' 
                          } 
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </>
      )}
      
      <Box sx={{ flexGrow: 1, minHeight: '20px' }} />
      
      <Divider />
      <List sx={{ px: 1 }}>
        {user && user.role === 'Admin' && (
          <ListItem 
            disablePadding 
            onClick={() => navigate('/sub-admins')}
            sx={{ 
              color: 'inherit', 
              textDecoration: 'none', 
              cursor: 'pointer',
              mb: 0.5,
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <ListItemButton
              sx={{
                borderRadius: '8px',
                py: 1,
                backgroundColor: isActive('/sub-admins') ? 'primary.main' : 'transparent',
                background: isActive('/sub-admins') ? 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%)' : 'transparent',
                color: isActive('/sub-admins') ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: isActive('/sub-admins') ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ color: isActive('/sub-admins') ? 'white' : 'inherit' }}>
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Sub-Admin Management" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding sx={{ borderRadius: '8px', overflow: 'hidden', mb: 0.5 }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: '8px' }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={appTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Company Management System {isSubAdmin && '(Sub-Admin Mode)'}
            </Typography>
            
            {isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton color="inherit" sx={{ mx: 1 }}>
                  <NotificationsIcon />
                </IconButton>
                <IconButton color="inherit" sx={{ mr: 2 }}>
                  <SettingsIcon />
                </IconButton>
                <Tooltip title="Your Profile">
                  <Button 
                    color="inherit" 
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      textTransform: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderRadius: '24px',
                      px: 2
                    }}
                    startIcon={
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: '#ffcc80',
                        color: '#e65100'
                      }}>
                        {user?.name ? user.name.charAt(0) : 'U'}
                      </Avatar>
                    }
                  >
                    {user?.name}
                  </Button>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      width: 200,
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px'
                    }
                  }}
                >
                  <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
                  <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)'
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                boxShadow: '4px 0 10px rgba(0, 0, 0, 0.05)',
                border: 'none'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: '64px', // Toolbar height
            backgroundColor: '#f9fafc'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout; 