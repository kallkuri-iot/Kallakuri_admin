import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  Fingerprint as FingerprintIcon,
  Business as DistributorIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '../../contexts/AuthContext';
import { marketingStaffActivityService, staffService } from '../../services/api';
import { format } from 'date-fns';
import FilterPanel from '../../components/common/FilterPanel';
import PageHeader from '../../components/common/PageHeader';

function MarketingStaffActivity() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    staffId: '',
    date: null,
    status: ''
  });
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch staff and activities on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff who are Marketing Staff
        const staffResponse = await staffService.getAllStaff({ role: 'Marketing Staff' });
        if (staffResponse && staffResponse.success) {
          setStaff(staffResponse.data);
        }
        
        // Fetch activities
        await fetchActivities();
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbar({
          open: true,
          message: 'Failed to load data. Please try again later.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch activities based on filters
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const { staffId, date, status } = filters;
      const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
      
      const response = await marketingStaffActivityService.getAllActivities(
        staffId || null,
        formattedDate || null,
        status || null
      );
      
      if (response && response.success) {
        setActivities(response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setSnackbar({
        open: true,
        message: 'Failed to load activities. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = () => {
    fetchActivities();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      staffId: '',
      date: null,
      status: ''
    });
    
    // Fetch all activities after resetting filters
    const fetchAllActivities = async () => {
      try {
        setLoading(true);
        const response = await marketingStaffActivityService.getAllActivities();
        if (response && response.success) {
          setActivities(response.data);
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllActivities();
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Filter activities based on tab
    let status = '';
    switch (newValue) {
      case 1:
        status = 'Punched In';
        break;
      case 2:
        status = 'Punched Out';
        break;
      default:
        status = '';
    }
    
    handleFilterChange('status', status);
  };

  // Handle view details
  const handleViewDetails = (activity) => {
    setSelectedActivity(activity);
    setDetailsDialogOpen(true);
  };

  // Handle close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Create filter configurations
  const filterConfigs = [
    {
      type: 'select',
      name: 'staffId',
      label: 'Marketing Staff',
      options: staff.map(s => ({
        value: s._id,
        label: s.name,
        avatar: true
      }))
    },
    {
      type: 'date',
      name: 'date',
      label: 'Filter by Date'
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { 
          value: 'Punched In', 
          label: 'Punched In',
          chip: true,
          color: 'primary'
        },
        { 
          value: 'Punched Out', 
          label: 'Punched Out',
          chip: true,
          color: 'success'
        }
      ]
    }
  ];

  // Stats for header
  const headerStats = [
    {
      value: activities.length,
      label: 'Total Activities'
    },
    {
      value: activities.filter(a => a.status === 'Punched In').length,
      label: 'Punched In',
      color: '#ff9800'
    },
    {
      value: activities.filter(a => a.status === 'Punched Out').length,
      label: 'Punched Out',
      color: '#4caf50'
    }
  ];

  // Render activity table
  const renderActivityTable = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 5,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          minHeight: 200
        }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      );
    }

    if (activities.length === 0) {
      return (
        <Paper sx={{ 
          p: 5, 
          textAlign: 'center', 
          borderRadius: 2,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          backgroundColor: 'white'
        }}>
          <Box 
            component="img"
            src="/empty-state.svg" // This is a placeholder, replace with your empty state image
            alt="No activities"
            sx={{ 
              width: 120, 
              height: 120, 
              opacity: 0.6, 
              mb: 2,
              filter: 'grayscale(1)'
            }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Activities Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters or create a new activity.
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: { xs: 650, sm: 850 } }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: 'rgba(255, 167, 38, 0.05)' 
            }}>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Staff Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2, display: { xs: 'none', sm: 'table-cell' } }}>Distributor</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2, display: { xs: 'none', md: 'table-cell' } }}>Area</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow 
                key={activity._id} 
                hover
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 167, 38, 0.04)',
                    cursor: 'pointer'
                  },
                  transition: 'background-color 0.2s'
                }}
                onClick={() => handleViewDetails(activity)}
              >
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1.5,
                        bgcolor: 'primary.light',
                        fontSize: '0.9rem'
                      }}
                    >
                      {activity.marketingStaffId?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {activity.marketingStaffId?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.marketingStaffId?.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, display: { xs: 'none', sm: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <DistributorIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    {activity.distributor}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2, display: { xs: 'none', md: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <LocationIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    {activity.areaName}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <CalendarIcon color="action" fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    <Box>
                      <Typography variant="body2">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 2 }}>
                  <Chip 
                    label={activity.status}
                    color={
                      activity.status === 'Punched In' 
                        ? 'primary' 
                        : activity.status === 'Punched Out' 
                          ? 'success' 
                          : 'default'
                    }
                    size="small"
                    sx={{ 
                      fontWeight: 'medium',
                      borderRadius: '4px',
                      px: 1
                    }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ py: 2 }}>
                  <Tooltip title="View Details">
                    <IconButton 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(activity);
                      }}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 167, 38, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 167, 38, 0.2)',
                        }
                      }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render details dialog
  const renderDetailsDialog = () => {
    if (!selectedActivity) return null;

    return (
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #fb8c00 0%, #ff9800 50%, #ffb74d 100%)',
          color: 'white',
          py: 2,
          display: 'flex',
          alignItems: 'center'
        }}>
          <FingerprintIcon sx={{ mr: 1 }} />
          Marketing Staff Activity Details
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        mr: 1.5
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">Staff Information</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3 
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {selectedActivity.marketingStaffId?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedActivity.marketingStaffId?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedActivity.marketingStaffId?.email || 'No email provided'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    bgcolor: 'rgba(0, 0, 0, 0.02)', 
                    p: 1.5, 
                    borderRadius: 1,
                    mt: 2
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip 
                        label={selectedActivity.status}
                        color={
                          selectedActivity.status === 'Punched In' 
                            ? 'primary' 
                            : selectedActivity.status === 'Punched Out' 
                              ? 'success' 
                              : 'default'
                        }
                        size="small"
                        sx={{ 
                          fontWeight: 'medium',
                          borderRadius: '4px',
                          px: 1
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ 
                height: '100%',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#ff9800', 
                        color: 'white',
                        mr: 1.5
                      }}
                    >
                      <CalendarIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">Timing Details</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Punch In Time
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(selectedActivity.meetingStartTime).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedActivity.meetingEndTime && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Punch Out Time
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {new Date(selectedActivity.meetingEndTime).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    bgcolor: 'rgba(0, 0, 0, 0.02)', 
                    p: 1.5, 
                    borderRadius: 1,
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Duration:
                    </Typography>
                    <Chip 
                      label={
                        selectedActivity.meetingEndTime
                          ? calculateDuration(selectedActivity.meetingStartTime, selectedActivity.meetingEndTime)
                          : 'Still active'
                      }
                      color={selectedActivity.meetingEndTime ? 'success' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#4caf50', 
                        color: 'white',
                        mr: 1.5
                      }}
                    >
                      <LocationIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">Location Information</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Distributor
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedActivity.distributor}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Retail Shop
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedActivity.retailShop}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Area
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedActivity.areaName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Trip Companion
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.8rem', 
                            mr: 1, 
                            bgcolor: 'primary.light' 
                          }}
                        >
                          {selectedActivity.tripCompanion.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedActivity.tripCompanion.name} 
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({selectedActivity.tripCompanion.category})
                          </Typography>
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Mode of Transport
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {selectedActivity.modeOfTransport}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        mr: 1.5
                      }}
                    >
                      <FingerprintIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">Selfie</Typography>
                  </Box>
                  {selectedActivity.selfieImage ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      p: 2
                    }}>
                      <Box
                        component="img" 
                        src={selectedActivity.selfieImage.startsWith('http') 
                          ? selectedActivity.selfieImage 
                          : `${process.env.REACT_APP_API_BASE_URL}${selectedActivity.selfieImage}`
                        } 
                        alt="Staff Selfie"
                        sx={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' 
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 4, 
                      bgcolor: 'rgba(0, 0, 0, 0.02)', 
                      borderRadius: 1, 
                      textAlign: 'center' 
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        No selfie available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            {/* Brand Supply Estimates Section */}
            {selectedActivity.brandSupplyEstimates && selectedActivity.brandSupplyEstimates.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 152, 0, 0.1)'
                }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      pb: 1.5,
                      borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                      <Avatar sx={{ bgcolor: '#ff9800', color: 'white', mr: 1.5 }}>
                        <AssessmentIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        Brand Supply Estimates
                      </Typography>
                    </Box>

                    {selectedActivity.brandSupplyEstimates.map((brand, index) => (
                      <Box key={brand._id || index} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {brand.name}
                        </Typography>
                        {brand.variants.map((variant, vIndex) => (
                          <Box key={variant._id || vIndex} sx={{ ml: 2, mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {variant.name}
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Size</TableCell>
                                    <TableCell align="right">Opening Stock</TableCell>
                                    <TableCell align="right">Market Rate</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {variant.sizes.map((size, sIndex) => (
                                    <TableRow key={size._id || sIndex}>
                                      <TableCell>{size.name}</TableCell>
                                      <TableCell align="right">{size.openingStock}</TableCell>
                                      <TableCell align="right">₹{size.proposedMarketRate}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Helper function to calculate duration
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs} hrs ${diffMins} mins`;
  };

  return (
    <Container maxWidth="xl">
      <PageHeader 
        title="Marketing Staff Activity"
        subtitle="Monitor and track marketing staff activities and punch-in records."
        icon={<FingerprintIcon fontSize="large" />}
        stats={headerStats}
      />
      
      {/* Filters */}
      <FilterPanel 
        title="Search Filters"
        filters={filterConfigs}
        values={filters}
        onChange={handleFilterChange}
        onApplyFilters={applyFilters}
        onResetFilters={resetFilters}
      />
      
      {/* Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        px: 2,
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        boxShadow: '0 1px 5px rgba(0, 0, 0, 0.05)',
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              py: 2,
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
              minWidth: { xs: 100, sm: 120 },
              '&.Mui-selected': {
                color: 'primary.main',
              }
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                All Activities
                <Chip 
                  size="small" 
                  color="default"
                  label={activities.length} 
                  sx={{ 
                    ml: 1, 
                    height: 20, 
                    minWidth: 28,
                    bgcolor: 'rgba(0, 0, 0, 0.08)'
                  }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Punched In
                <Chip 
                  size="small" 
                  color="primary" 
                  label={activities.filter(a => a.status === 'Punched In').length} 
                  sx={{ ml: 1, height: 20, minWidth: 28 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                Punched Out
                <Chip 
                  size="small" 
                  color="success" 
                  label={activities.filter(a => a.status === 'Punched Out').length} 
                  sx={{ ml: 1, height: 20, minWidth: 28 }} 
                />
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      {/* Activity Table */}
      {renderActivityTable()}
      
      {/* Details Dialog */}
      {renderDetailsDialog()}
      
      {/* Snackbar for feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default MarketingStaffActivity;