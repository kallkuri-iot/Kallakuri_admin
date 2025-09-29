import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  InputAdornment,
  Card,
  CardContent,
  Collapse,
  TableSortLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider,
  Avatar
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as OrderIcon,
  QuestionAnswer as InquiryIcon,
  Compare as AlternativeIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as TaskIcon,
  Store as ShopIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { retailerShopActivityService, staffService, distributorService } from '../../services/api';

const RetailerShopActivityList = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Enhanced Filters for task-based activities
  const [filters, setFilters] = useState({
    staffId: '',
    distributorId: '',
    status: '',
    fromDate: null,
    toDate: null,
    searchQuery: ''
  });
  
  // Filter options
  const [staffOptions, setStaffOptions] = useState([]);
  const [distributorOptions, setDistributorOptions] = useState([]);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Static options
  const statusOptions = [
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];

  useEffect(() => {
    fetchActivities();
    fetchFilterOptions();
  }, [page, rowsPerPage]);

  useEffect(() => {
    const delayedFilter = setTimeout(() => {
      if (Object.values(filters).some(value => value !== '' && value !== null)) {
        setPage(0); // Reset to first page when filtering
        fetchActivities();
      }
    }, 500);

    return () => clearTimeout(delayedFilter);
  }, [filters]);
  
  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        ...filters,
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : null,
        toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : null
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });
      
      console.log('Fetching grouped activities with params:', params);
      
      // Use the new grouped API endpoint
      const response = await retailerShopActivityService.getActivitiesGroupedByTask(params);
      
      if (response && response.success) {
        console.log('Grouped activities fetched successfully:', response.data.length);
        setActivities(response.data);
        setTotalItems(response.pagination?.totalItems || response.data.length);
      } else {
        console.error('Failed to fetch grouped activities:', response);
        setError(response?.error || "Failed to fetch staff activities");
      }
    } catch (err) {
      console.error("Error fetching grouped staff activities:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch staff activities");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchFilterOptions = async () => {
    try {
      const [staffResponse, distributorResponse] = await Promise.all([
        staffService.getAllStaff(),
        distributorService.getAllDistributors()
      ]);
      
      if (staffResponse && staffResponse.success) {
        setStaffOptions(staffResponse.data);
      }
      
      if (distributorResponse && distributorResponse.success) {
        setDistributorOptions(distributorResponse.data);
      }
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      staffId: '',
      distributorId: '',
      status: '',
      fromDate: null,
      toDate: null,
      searchQuery: ''
    });
    setPage(0);
  };

  const handleToggleRow = (taskId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(taskId)) {
      newExpandedRows.delete(taskId);
    } else {
      newExpandedRows.add(taskId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleViewTaskDetails = (taskId) => {
    navigate(`/staff-activity/task/${taskId}`);
  };

  const handleViewShopActivity = (taskActivity, shopActivityId) => {
    // Navigate to task-based detail view with specific shop activity highlighted
    navigate(`/staff-activity/task/${taskActivity._id}`, { 
      state: { highlightActivity: shopActivityId }
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      return format(new Date(dateTimeString), 'HH:mm');
    } catch (error) {
      return 'Invalid time';
    }
  };

  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      return format(new Date(dateTimeString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      return format(new Date(dateTimeString), 'MMM dd, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'warning';
      case 'Incomplete':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderShopActivitiesExpanded = (taskActivity) => {
    if (!taskActivity.shopActivities || taskActivity.shopActivities.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12} sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No shop activities found for this task
            </Typography>
          </TableCell>
        </TableRow>
      );
    }

    return taskActivity.shopActivities.map((shopActivity, index) => {
      const shop = taskActivity.shops?.find(s => s._id === shopActivity.shopId);
      
      return (
        <TableRow key={shopActivity._id} sx={{ backgroundColor: '#f8f9fa' }}>
          <TableCell sx={{ pl: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShopIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {shop?.name || 'Unknown Shop'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {shop?.ownerName}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Typography variant="body2">
              {formatTime(shopActivity.punchInTime)}
              {shopActivity.punchOutTime && ` - ${formatTime(shopActivity.punchOutTime)}`}
            </Typography>
          </TableCell>
          <TableCell>
            <Chip 
              label={shopActivity.status} 
              color={getStatusColor(shopActivity.status)} 
              size="small" 
            />
          </TableCell>
          <TableCell>
            <Stack direction="row" spacing={1}>
              <Chip label={shopActivity.visitType} size="small" variant="outlined" />
              <Chip label={shopActivity.visitObjective} size="small" variant="outlined" />
            </Stack>
          </TableCell>
          <TableCell align="center">
            <Badge badgeContent={shopActivity.salesOrders?.length || 0} color="primary">
              <OrderIcon fontSize="small" />
            </Badge>
          </TableCell>
          <TableCell align="center">
            <Badge badgeContent={shopActivity.marketInquiries?.length || 0} color="secondary">
              <InquiryIcon fontSize="small" />
            </Badge>
          </TableCell>
          <TableCell align="center">
            <Badge badgeContent={shopActivity.alternateProviders?.length || 0} color="info">
              <AlternativeIcon fontSize="small" />
            </Badge>
          </TableCell>
          <TableCell>
            <Chip 
              label={shopActivity.salesPotential || 'N/A'} 
              size="small" 
              variant="outlined"
              color={shopActivity.salesPotential === 'High' ? 'success' : 
                     shopActivity.salesPotential === 'Medium' ? 'warning' : 'default'}
            />
          </TableCell>
          <TableCell>
            <Typography variant="body2" noWrap>
              {shopActivity.complaint || 'None'}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" noWrap>
              {shopActivity.marketInsight || 'N/A'}
            </Typography>
          </TableCell>
          <TableCell>
            <Tooltip title="View Shop Activity Details">
              <IconButton 
                size="small" 
                onClick={() => handleViewShopActivity(taskActivity, shopActivity._id)}
                color="primary"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </TableCell>
        </TableRow>
      );
    });
  };

  if (loading && activities.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading staff activities...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Staff Activity Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track marketing staff activities grouped by tasks, including distributor visits and shop activities
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Enhanced Filters */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Marketing Staff</InputLabel>
                    <Select
                      value={filters.staffId}
                      label="Marketing Staff"
                      onChange={(e) => handleFilterChange('staffId', e.target.value)}
                    >
                      <MenuItem value="">All Staff</MenuItem>
                      {staffOptions.map((staff) => (
                        <MenuItem key={staff._id} value={staff._id}>
                          {staff.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Distributor</InputLabel>
                    <Select
                      value={filters.distributorId}
                      label="Distributor"
                      onChange={(e) => handleFilterChange('distributorId', e.target.value)}
                    >
                      <MenuItem value="">All Distributors</MenuItem>
                      {distributorOptions.map((distributor) => (
                        <MenuItem key={distributor._id} value={distributor._id}>
                          {distributor.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      label="Status"
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="From Date"
                      value={filters.fromDate}
                      onChange={(date) => handleFilterChange('fromDate', date)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="To Date"
                      value={filters.toDate}
                      onChange={(date) => handleFilterChange('toDate', date)}
                      renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      onClick={fetchActivities}
                      disabled={loading}
                      size="small"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleResetFilters}
                      size="small"
                      startIcon={<ClearIcon />}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Collapse>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task & Staff Info</TableCell>
                <TableCell>Distributor</TableCell>
                <TableCell>Activity Summary</TableCell>
                <TableCell>Timing</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activities.map((taskActivity) => (
                <React.Fragment key={taskActivity._id}>
                  <TableRow hover sx={{ cursor: 'pointer' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <TaskIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {taskActivity.task?.title || 'Unknown Task'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {taskActivity.task?.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <PersonIcon fontSize="small" color="primary" />
                            <Typography variant="caption">
                              {taskActivity.marketingStaff?.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {taskActivity.distributor?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {taskActivity.distributor?.shopName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2}>
                        <Badge badgeContent={taskActivity.totalShopsVisited} color="primary">
                          <Tooltip title="Shops Visited">
                            <ShopIcon fontSize="small" />
                          </Tooltip>
                        </Badge>
                        <Badge badgeContent={taskActivity.totalSalesOrders} color="secondary">
                          <Tooltip title="Sales Orders">
                            <OrderIcon fontSize="small" />
                          </Tooltip>
                        </Badge>
                        <Badge badgeContent={taskActivity.totalMarketInquiries} color="info">
                          <Tooltip title="Market Inquiries">
                            <InquiryIcon fontSize="small" />
                          </Tooltip>
                        </Badge>
                        <Badge badgeContent={taskActivity.totalAlternateProviders} color="warning">
                          <Tooltip title="Alternate Providers">
                            <AlternativeIcon fontSize="small" />
                          </Tooltip>
                        </Badge>
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Completed: {taskActivity.completedShops}/{taskActivity.totalShopsVisited}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                          Start: {formatDateTime(taskActivity.punchInTime)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Last: {formatDateTime(taskActivity.lastActivity)}
                        </Typography>
                        {taskActivity.task?.deadline && (
                          <Typography variant="caption" color="warning.main">
                            Due: {formatDate(taskActivity.task.deadline)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={taskActivity.distributorActivity?.status || 'In Progress'} 
                        color={getTaskStatusColor(taskActivity.distributorActivity?.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Task Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewTaskDetails(taskActivity._id)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={expandedRows.has(taskActivity._id) ? "Hide Shop Activities" : "Show Shop Activities"}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleToggleRow(taskActivity._id)}
                          >
                            <ExpandMoreIcon 
                              fontSize="small" 
                              sx={{ 
                                transform: expandedRows.has(taskActivity._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded Row for Shop Activities */}
                  {expandedRows.has(taskActivity._id) && (
                    <>
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0 }}>
                          <Collapse in={expandedRows.has(taskActivity._id)} timeout="auto" unmountOnExit>
                            <Box sx={{ py: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                Shop Activities Details
                              </Typography>
                              <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Shop</TableCell>
                                      <TableCell>Visit Time</TableCell>
                                      <TableCell>Status</TableCell>
                                      <TableCell>Visit Info</TableCell>
                                      <TableCell align="center">Orders</TableCell>
                                      <TableCell align="center">Inquiries</TableCell>
                                      <TableCell align="center">Alternatives</TableCell>
                                      <TableCell>Sales Potential</TableCell>
                                      <TableCell>Complaint</TableCell>
                                      <TableCell>Market Insight</TableCell>
                                      <TableCell>Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {renderShopActivitiesExpanded(taskActivity)}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default RetailerShopActivityList;