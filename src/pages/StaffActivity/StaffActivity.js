import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
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
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Store as StoreIcon,
  Fingerprint as FingerprintIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  AlternateEmail as AlternateIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { marketingStaffActivityService, staffService, distributorService, staffActivityService } from '../../services/api';

const StaffActivity = () => {
  const theme = useTheme();
  const [activities, setActivities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [page, setPage] = useState(0);
  const [shopPage, setShopPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const itemsPerPage = 5;

  const [filters, setFilters] = useState({
    staffId: '',
    staffType: '',
    distributorId: '',
    fromDate: null,
    toDate: null,
    status: '',
  });

  // Data Fetching Functions
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const response = await marketingStaffActivityService.getAllActivities(null, null, null, null, null, 1, 10);
      if (response && response.success) {
        setActivities(response.data);
        setTotalItems(response.totalCount || 0);
      } else {
        setActivities([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error in initial data fetch:', error);
      setSnackbar({ open: true, message: 'Failed to load initial data. Please try again.', severity: 'error' });
      setActivities([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaff = async () => {
    try {
      setLoading(true);
      const staffResponse = await staffService.getAllStaff(1, 100);
      if (staffResponse && staffResponse.success) {
        setStaff(staffResponse.data);
      }
      const distributorsResponse = await distributorService.getAllDistributors();
      if (distributorsResponse && distributorsResponse.success) {
        setDistributors(distributorsResponse.data);
      }
      setInitialLoadComplete(true);
      await fetchInitialData();
    } catch (error) {
      console.error('Error fetching all staff:', error);
      setSnackbar({ open: true, message: 'Failed to load staff data. Please try again.', severity: 'error' });
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    if (!filters.staffType) return;
    try {
      setLoading(true);
      const staffResponse = await staffService.getAllStaff(1, 100, filters.staffType);
      if (staffResponse && staffResponse.success) {
        setStaff(staffResponse.data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setSnackbar({ open: true, message: 'Failed to load staff data. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { staffId, staffType, distributorId, fromDate, toDate, status } = filters;
      const formattedFromDate = fromDate ? format(fromDate, 'yyyy-MM-dd') : null;
      const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : null;
      const currentPage = page + 1;
      const pageSize = 10;

      let response;
      if (staffType === 'Marketing Staff' || !staffType) {
        response = await marketingStaffActivityService.getAllActivities(
          staffId || null,
          distributorId || null,
          formattedFromDate || null,
          formattedToDate || null,
          status || null,
          currentPage,
          pageSize
        );
      } else {
        response = await staffActivityService.getAllActivities({
          staffId: staffId || null,
          staffType: staffType || null,
          distributorId: distributorId || null,
          fromDate: formattedFromDate || null,
          toDate: formattedToDate || null,
          status: status || null,
          page: currentPage,
          limit: pageSize,
        });
      }

      if (response && response.success) {
        setActivities(response.data);
        setTotalItems(response.totalCount || 0);
        if (response.data.length === 0 && currentPage > 1) {
          setPage(0);
          setTimeout(() => fetchActivities(), 0);
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setSnackbar({ open: true, message: 'Failed to load activities. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Effect Hooks
  useEffect(() => {
    fetchAllStaff();
  }, []);

  useEffect(() => {
    if (initialLoadComplete) {
      fetchStaff();
    }
  }, [filters.staffType, initialLoadComplete]);

  // Handler Functions
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'staffType' ? { staffId: '' } : {}),
    }));
  };

  const applyFilters = () => {
    setPage(0);
    fetchActivities();
  };

  const resetFilters = () => {
    setFilters({
      staffId: '',
      staffType: '',
      distributorId: '',
      fromDate: null,
      toDate: null,
      status: '',
    });
    setPage(0);
    setTimeout(() => fetchInitialData(), 100);
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
    setTimeout(() => fetchActivities(), 100);
  };

  const handleShopPageChange = (event, value) => {
    setShopPage(value);
  };

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setSelectedTab(1);
    setShopPage(1);
  };

  // Utility Functions
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '0 min';
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      if (isNaN(diffMs)) return 'Invalid duration';
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;
    } catch (error) {
      console.error('Duration calculation error:', error);
      return 'Error calculating duration';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const calculateShopSalesValue = (salesOrders) => {
    return salesOrders.reduce((sum, order) => sum + order.quantity * order.rate, 0);
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
        return 'primary';
      default:
        return 'default';
    }
  };

  // Render Functions
  const renderMarketingStaffDetails = () => {
    if (!selectedActivity) return null;

    const shopActivities = selectedActivity.retailerShopActivities || [];
    const paginatedShops = shopActivities.slice((shopPage - 1) * itemsPerPage, shopPage * itemsPerPage);
    const totalShopPages = Math.ceil(shopActivities.length / itemsPerPage);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Staff Information</Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Name:</strong> {selectedActivity.marketingStaffId?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Email:</strong> {selectedActivity.marketingStaffId?.email || 'N/A'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Status:</strong>
                <Chip
                  label={selectedActivity.status}
                  color={getStatusColor(selectedActivity.status)}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Timing Details</Typography>
              </Box>
              <Typography variant="body2" gutterBottom>
                <strong>Punch In:</strong>{' '}
                {new Date(selectedActivity.meetingStartTime || selectedActivity.createdAt).toLocaleString()}
              </Typography>
              {selectedActivity.meetingEndTime && (
                <Typography variant="body2" gutterBottom>
                  <strong>Punch Out:</strong> {new Date(selectedActivity.meetingEndTime).toLocaleString()}
                </Typography>
              )}
              <Typography variant="body2" gutterBottom>
                <strong>Duration:</strong>{' '}
                {calculateDuration(
                  selectedActivity.meetingStartTime || selectedActivity.createdAt,
                  selectedActivity.meetingEndTime || new Date()
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">Location Information</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Distributor:</strong> {selectedActivity.distributor || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Retail Shop:</strong> {selectedActivity.retailShop || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Area:</strong> {selectedActivity.areaName || 'N/A'}
                  </Typography>
                </Grid>
                {selectedActivity.tripCompanion && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Trip Companion:</strong> {selectedActivity.tripCompanion.name} (
                      {selectedActivity.tripCompanion.category})
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Mode of Transport:</strong> {selectedActivity.modeOfTransport || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom fontWeight="medium">
                Activity Summary
              </Typography>
              <Grid container spacing={3} justifyContent="space-around">
                {[
                  { label: 'Shops Visited', value: selectedActivity.totalShopsVisited || 0, color: 'primary' },
                  { label: 'Sales Orders', value: selectedActivity.totalSalesOrders || 0, color: 'success' },
                  {
                    label: 'Total Sales Value',
                    value: formatCurrency(selectedActivity.totalSalesValue),
                    color: 'info',
                  },
                  { label: 'Planned Shops', value: selectedActivity.shops?.length || 0, color: 'warning' },
                ].map((item, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box
                      textAlign="center"
                      p={2}
                      sx={{
                        borderRadius: 2,
                        bgcolor: `${theme.palette[item.color].light}20`,
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Typography variant="h5" color={`${item.color}.main`} fontWeight="bold">
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {shopActivities.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StoreIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Shop Activities ({shopActivities.length})
                  </Typography>
                </Box>
                {paginatedShops.map((shopActivity) => (
                  <Accordion
                    key={shopActivity._id}
                    elevation={2}
                    sx={{ mb: 2, borderRadius: 2, bgcolor: theme.palette.grey[50] }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.light }}>
                          <StoreIcon />
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6" fontWeight="medium">
                            {shopActivity.shopName || 'Unknown Shop'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {shopActivity.shopOwnerName} •{' '}
                            {calculateDuration(shopActivity.visitStartTime, shopActivity.visitEndTime || new Date())}
                          </Typography>
                        </Box>
                        <Chip
                          label={shopActivity.status}
                          color={getStatusColor(shopActivity.status)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {[
                          {
                            title: 'Shop Details',
                            fields: [
                              { label: 'Owner', value: shopActivity.shopOwnerName },
                              { label: 'Address', value: shopActivity.shopAddress },
                              { label: 'Type', value: shopActivity.shopType },
                              { label: 'Mobile', value: shopActivity.mobileNumber || 'N/A' },
                            ],
                          },
                          {
                            title: 'Visit Details',
                            fields: [
                              {
                                label: 'Start',
                                value: new Date(shopActivity.visitStartTime).toLocaleString(),
                              },
                              ...(shopActivity.visitEndTime
                                ? [
                                    {
                                      label: 'End',
                                      value: new Date(shopActivity.visitEndTime).toLocaleString(),
                                    },
                                  ]
                                : []),
                              {
                                label: 'Duration',
                                value: calculateDuration(
                                  shopActivity.visitStartTime,
                                  shopActivity.visitEndTime || new Date()
                                ),
                              },
                              { label: 'Type', value: shopActivity.visitType },
                              { label: 'Objective', value: shopActivity.visitObjective },
                              { label: 'Outcome', value: shopActivity.visitOutcome },
                            ],
                          },
                          {
                            title: 'Sales Summary',
                            fields: [
                              { label: 'Orders', value: shopActivity.salesOrders?.length || 0 },
                              {
                                label: 'Value',
                                value: formatCurrency(calculateShopSalesValue(shopActivity.salesOrders || [])),
                              },
                              {
                                label: 'Alternatives',
                                value: shopActivity.alternateProviders?.length || 0,
                              },
                            ],
                          },
                        ].map((section, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                              {section.title}
                            </Typography>
                            {section.fields.map((field, idx) => (
                              <Typography variant="body2" gutterBottom key={idx}>
                                <strong>{field.label}:</strong> {field.value}
                              </Typography>
                            ))}
                          </Grid>
                        ))}

                        {shopActivity.salesOrders?.length > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium">
                                Sales Orders
                              </Typography>
                            </Box>
                            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: `${theme.palette.primary.light}20` }}>
                                  <TableRow>
                                    <TableCell>Brand</TableCell>
                                    <TableCell>Variant</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="center">Counter</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {shopActivity.salesOrders.map((order, orderIndex) => (
                                    <TableRow key={orderIndex} hover>
                                      <TableCell>{order.brandName}</TableCell>
                                      <TableCell>{order.variant}</TableCell>
                                      <TableCell>{order.size}</TableCell>
                                      <TableCell align="right">{order.quantity}</TableCell>
                                      <TableCell align="center">
                                        <Chip
                                          label={order.isDisplayedInCounter ? 'Yes' : 'No'}
                                          color={order.isDisplayedInCounter ? 'success' : 'default'}
                                          size="small"
                                          variant="outlined"
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}

                        {shopActivity.alternateProviders?.length > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <AlternateIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium">
                                Alternate Providers
                              </Typography>
                            </Box>
                            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: `${theme.palette.secondary.light}20` }}>
                                  <TableRow>
                                    <TableCell>For Brand</TableCell>
                                    <TableCell>Competitor Brand</TableCell>
                                    <TableCell>Variant</TableCell>
                                    <TableCell>Size</TableCell>
                                    <TableCell align="right">Rate</TableCell>
                                    <TableCell>Stock Date</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {shopActivity.alternateProviders.map((provider, idx) => (
                                    <TableRow key={idx} hover>
                                      <TableCell>{provider.for}</TableCell>
                                      <TableCell>{provider.brandName}</TableCell>
                                      <TableCell>{provider.variant}</TableCell>
                                      <TableCell>{provider.size}</TableCell>
                                      <TableCell align="right">{formatCurrency(provider.rate)}</TableCell>
                                      <TableCell>{provider.stockDate}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}

                        {(shopActivity.complaint || shopActivity.marketInsight) && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <AssessmentIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="subtitle2" fontWeight="medium">
                                Feedback & Insights
                              </Typography>
                            </Box>
                            {shopActivity.complaint && (
                              <Box
                                mb={2}
                                p={2}
                                sx={{
                                  borderRadius: 2,
                                  bgcolor: `${theme.palette.warning.light}20`,
                                }}
                              >
                                <Typography variant="body2">
                                  <WarningIcon
                                    sx={{ mr: 1, verticalAlign: 'middle', color: 'warning.main' }}
                                  />
                                  <strong>Complaint:</strong> {shopActivity.complaint}
                                </Typography>
                              </Box>
                            )}
                            {shopActivity.marketInsight && (
                              <Box
                                p={2}
                                sx={{
                                  borderRadius: 2,
                                  bgcolor: `${theme.palette.info.light}20`,
                                }}
                              >
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
                ))}
                {totalShopPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalShopPages}
                      page={shopPage}
                      onChange={handleShopPageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                      sx={{ '& .MuiPaginationItem-root': { borderRadius: 1 } }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {selectedActivity.selfieImage && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FingerprintIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight="medium">
                    Selfie
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={
                      selectedActivity.selfieImage.startsWith('http')
                        ? selectedActivity.selfieImage
                        : `${process.env.REACT_APP_API_BASE_URL}${selectedActivity.selfieImage}`
                    }
                    alt="Staff Selfie"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      boxShadow: theme.shadows[2],
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderActivityList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (activities.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No activities found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or check back later
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {activities.map((activity) => (
          <Card
            key={activity._id}
            sx={{
              mb: 2,
              cursor: 'pointer',
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s',
              '&:hover': { transform: 'scale(1.01)' },
            }}
            onClick={() => handleActivitySelect(activity)}
          >
            <CardContent sx={{ bgcolor: theme.palette.background.paper }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.light }}>
                      {activity.marketingStaffId?.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {activity.marketingStaffId?.name || 'Unknown Staff'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.marketingStaffId?.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Distributor:</strong> {activity.distributor || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Area:</strong> {activity.areaName || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start:</strong>{' '}
                    {new Date(activity.meetingStartTime || activity.createdAt).toLocaleString()}
                  </Typography>
                  {activity.meetingEndTime && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>End:</strong> {new Date(activity.meetingEndTime).toLocaleString()}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status)}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Shops: {activity.totalShopsVisited || 0} | Orders: {activity.totalSalesOrders || 0}
                      </Typography>
                    </Box>
                    <IconButton size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
          {totalItems > 10 ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                color="primary"
                disabled={page === 0}
                onClick={() => handleChangePage(page - 1)}
                startIcon={<span>←</span>}
                sx={{ borderRadius: 1 }}
              >
                Previous
              </Button>
              <Typography variant="body1">
                Page {page + 1} of {Math.max(1, Math.ceil(totalItems / 10))}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                disabled={page >= Math.ceil(totalItems / 10) - 1}
                onClick={() => handleChangePage(page + 1)}
                endIcon={<span>→</span>}
                sx={{ borderRadius: 1 }}
              >
                Next
              </Button>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Loading...' : 'No more records to display'}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
          mb: 4,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}
        >
          Staff Activity
        </Typography>

        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
          <Grid container spacing={2} alignItems="center">
            {[
              {
                label: 'Staff Type',
                value: filters.staffType,
                onChange: (e) => handleFilterChange('staffType', e.target.value),
                options: [
                  { value: '', label: 'All Types' },
                  { value: 'Marketing Staff', label: 'Marketing Staff' },
                  { value: 'Mid-Level Manager', label: 'Mid-Level Manager' },
                  { value: 'Admin', label: 'Admin' },
                ],
              },
              {
                label: 'Staff',
                value: filters.staffId,
                onChange: (e) => handleFilterChange('staffId', e.target.value),
                disabled: !filters.staffType,
                options: [{ value: '', label: 'All Staff' }, ...staff.map((s) => ({ value: s._id, label: s.name }))],
              },
              {
                label: 'Distributor',
                value: filters.distributorId,
                onChange: (e) => handleFilterChange('distributorId', e.target.value),
                options: [
                  { value: '', label: 'All Distributors' },
                  ...distributors.map((d) => ({ value: d._id, label: d.name })),
                ],
              },
            ].map((field, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FormControl fullWidth size="small">
                  <InputLabel>{field.label}</InputLabel>
                  <Select
                    value={field.value}
                    label={field.label}
                    onChange={field.onChange}
                    disabled={field.disabled}
                    sx={{ borderRadius: 1 }}
                  >
                    {field.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="From Date"
                value={filters.fromDate}
                onChange={(date) => handleFilterChange('fromDate', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="To Date"
                value={filters.toDate}
                onChange={(date) => handleFilterChange('toDate', date)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={applyFilters}
                  startIcon={<SearchIcon />}
                  fullWidth
                  sx={{ borderRadius: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={resetFilters}
                  fullWidth
                  sx={{ borderRadius: 1 }}
                >
                  Reset
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[2], bgcolor: theme.palette.background.paper }}>
          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            sx={{ mb: 3 }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Activity List" sx={{ fontWeight: 'medium' }} />
            <Tab label="Activity Details" disabled={!selectedActivity} sx={{ fontWeight: 'medium' }} />
          </Tabs>
          <Box>{selectedTab === 0 ? renderActivityList() : renderMarketingStaffDetails()}</Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default StaffActivity;