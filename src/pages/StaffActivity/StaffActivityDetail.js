import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Store as StoreIcon,
  AccessTime as AccessTimeIcon,
  ShoppingCart as ShoppingCartIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { api } from '../../services/api';

const StaffActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/marketing-activity/${id}`);
      setActivity(response.data.data);
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('Failed to fetch activity details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Punched In':
        return 'info';
      case 'Punched Out':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        </Box>
    );
  }

  if (!activity) {
    return (
      <Box p={3}>
        <Alert severity="info">Activity not found</Alert>
        </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/staff-activity')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Staff Activity Details
        </Typography>
        <Box ml="auto">
          <Chip
            label={activity.status}
            color={getStatusColor(activity.status)}
            size="large"
          />
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Staff Information
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      {activity.marketingStaffId?.name?.charAt(0) || 'S'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.marketingStaffId?.name || 'Unknown Staff'}
                    secondary={activity.marketingStaffId?.email || 'No email'}
                  />
                </ListItem>
              </List>
              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" mb={1}>
                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Start:</strong> {new Date(activity.meetingStartTime).toLocaleString()}
                </Typography>
              </Box>
              {activity.meetingEndTime && (
                <Box display="flex" alignItems="center" mb={1}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    <strong>End:</strong> {new Date(activity.meetingEndTime).toLocaleString()}
                  </Typography>
                </Box>
              )}
              <Box display="flex" alignItems="center">
                <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Duration:</strong> {formatDuration(activity.durationMinutes)}
            </Typography>
            </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Distributor Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Distributor Information
            </Typography>
              <Typography variant="h6">{activity.distributorId?.name || 'Unknown Distributor'}</Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{activity.distributorId?.address || 'No address'}</Typography>
              </Box>
              <Box display="flex" alignItems="center" mt={1}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{activity.distributorId?.contact || 'No contact'}</Typography>
            </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Summary Stats */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Activity Summary
            </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      {activity.totalShopsVisited || 0}
                  </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shops Visited
                  </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {activity.totalSalesOrders || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sales Orders
                  </Typography>
                </Box>
              </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      {formatCurrency(activity.totalSalesValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Sales Value
                    </Typography>
                </Box>
              </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {activity.shops?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Planned Shops
                  </Typography>
                </Box>
              </Grid>
            </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

        {/* Shop Activities */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Shop Activities ({activity.retailerShopActivities?.length || 0})
              </Typography>
              
              {activity.retailerShopActivities && activity.retailerShopActivities.length > 0 ? (
                activity.retailerShopActivities.map((shopActivity, index) => (
                  <Accordion key={shopActivity._id} elevation={1} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <StoreIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6">
                            {shopActivity.shopName || 'Unknown Shop'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {shopActivity.shopOwnerName} • {formatDuration(shopActivity.visitDurationMinutes)}
                          </Typography>
              </Box>
                          <Chip 
                          label={shopActivity.status}
                          color={getStatusColor(shopActivity.status)}
                            size="small"
                          />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                        {/* Shop Details */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>Shop Details</Typography>
                          <Typography variant="body2"><strong>Owner:</strong> {shopActivity.shopOwnerName}</Typography>
                          <Typography variant="body2"><strong>Address:</strong> {shopActivity.shopAddress}</Typography>
                          <Typography variant="body2"><strong>Type:</strong> {shopActivity.shopType}</Typography>
                          <Typography variant="body2"><strong>Mobile:</strong> {shopActivity.mobileNumber || 'N/A'}</Typography>
                        </Grid>

                        {/* Visit Details */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>Visit Details</Typography>
                          <Typography variant="body2">
                            <strong>Start:</strong> {new Date(shopActivity.visitStartTime).toLocaleString()}
                          </Typography>
                          {shopActivity.visitEndTime && (
                            <Typography variant="body2">
                              <strong>End:</strong> {new Date(shopActivity.visitEndTime).toLocaleString()}
                            </Typography>
                          )}
                          <Typography variant="body2">
                            <strong>Duration:</strong> {formatDuration(shopActivity.visitDurationMinutes)}
                          </Typography>
                          <Typography variant="body2"><strong>Type:</strong> {shopActivity.visitType}</Typography>
                          <Typography variant="body2"><strong>Objective:</strong> {shopActivity.visitObjective}</Typography>
                          <Typography variant="body2"><strong>Outcome:</strong> {shopActivity.visitOutcome}</Typography>
                        </Grid>

                        {/* Sales Summary */}
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle2" gutterBottom>Sales Summary</Typography>
                          <Typography variant="body2">
                            <strong>Orders:</strong> {shopActivity.salesOrders?.length || 0}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Value:</strong> {formatCurrency(shopActivity.totalSalesValue)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Alternatives:</strong> {shopActivity.alternateProviders?.length || 0}
                          </Typography>
                          </Grid>

                        {/* Sales Orders */}
                        {shopActivity.salesOrders && shopActivity.salesOrders.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Sales Orders
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Brand</TableCell>
                                    <TableCell>Variant</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Rate</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="center">Counter</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {shopActivity.salesOrders.map((order, orderIndex) => (
                                      <TableRow key={orderIndex}>
                                        <TableCell>{order.brandName}</TableCell>
                                        <TableCell>{order.variant}</TableCell>
                                        <TableCell>{order.size}</TableCell>
                                      <TableCell align="right">{order.quantity}</TableCell>
                                      <TableCell align="right">{formatCurrency(order.rate)}</TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(order.quantity * order.rate)}
                                      </TableCell>
                                      <TableCell align="center">
                                        <Chip
                                          label={order.isDisplayedInCounter ? 'Yes' : 'No'}
                                          color={order.isDisplayedInCounter ? 'success' : 'default'}
                                          size="small"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}

                        {/* Feedback */}
                        {(shopActivity.complaint || shopActivity.marketInsight) && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                              <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                              Feedback & Insights
                            </Typography>
                            {shopActivity.complaint && (
                              <Box mb={1}>
                                <Typography variant="body2">
                                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }} />
                                  <strong>Complaint:</strong> {shopActivity.complaint}
                                </Typography>
                              </Box>
                            )}
                            {shopActivity.marketInsight && (
                              <Box>
                                <Typography variant="body2">
                                  <strong>Market Insight:</strong> {shopActivity.marketInsight}
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box textAlign="center" py={4}>
                  <StoreIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No shop activities recorded
                  </Typography>
                      </Box>
              )}
                  </CardContent>
                </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffActivityDetail; 