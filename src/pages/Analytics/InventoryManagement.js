import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Store as StoreIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { staffService } from '../../services/api';
import analyticsService from '../../services/analyticsService';
import { downloadCSV } from '../../utils/csvExport';

function InventoryManagement() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    inventoryAnalysis: [],
    summary: {},
    distributorSummary: [],
    timeRange: 'last30days',
    generatedAt: null
  });
  const [filters, setFilters] = useState({
    timeRange: 'last30days',
    distributorId: '',
    staffId: '',
    stockStatus: '',
    searchQuery: ''
  });
  const [staff, setStaff] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [error, setError] = useState(null);

  // Time range options
  const timeRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  // Stock status options
  const stockStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Shortage', label: 'Shortage' },
    { value: 'Sufficient', label: 'Sufficient' },
    { value: 'Balanced', label: 'Balanced' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filters.timeRange || filters.distributorId || filters.staffId) {
      fetchInventoryData();
    }
  }, [filters.timeRange, filters.distributorId, filters.staffId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff data
      const staffResponse = await staffService.getAllStaff(1, 100, 'Marketing Staff');
      if (staffResponse && staffResponse.success) {
        setStaff(staffResponse.data);
      }

      // Extract distributors from inventory data or fetch separately if needed
      await fetchInventoryData();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        timeRange: filters.timeRange,
        ...(filters.distributorId && { distributorId: filters.distributorId }),
        ...(filters.staffId && { staffId: filters.staffId })
      };

      const response = await analyticsService.getInventoryAnalysis(params);
      
      if (response && response.success) {        
        setInventoryData(response.data);
        
        // Extract unique distributors for filter dropdown
        const uniqueDistributors = response.data.distributorSummary.map(dist => ({
          id: dist.distributorId,
          name: dist.distributorName
        }));
        setDistributors(uniqueDistributors);
      } else {
        throw new Error('Failed to fetch inventory data');
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    fetchInventoryData();
  };

  const handleExport = () => {
    if (filteredInventoryData.length === 0) {
      alert('No data available to export');
      return;
    }

    const exportData = filteredInventoryData.map(item => ({
      'Distributor': item.distributorName,
      'Brand': item.brandName,
      'Variant': item.variant,
      'Size': item.size,
      'Current Stock': item.currentStock,
      'Total Requirement': item.totalRequirement,
      'Stock Difference': item.stockDifference,
      'Stock Status': item.stockStatus,
      'Stock Percentage': `${item.stockPercentage}%`,
      'Number of Orders': item.orderCount,
      'Unique Shops': item.uniqueShopsCount,
      'Total Order Value': item.totalOrderValue || 0,
      'Proposed Rate': item.proposedRate || 0
    }));

    downloadCSV(exportData, `inventory_analysis_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  // Filter and search inventory data
  const filteredInventoryData = inventoryData.inventoryAnalysis.filter(item => {
    const matchesStatus = !filters.stockStatus || item.stockStatus === filters.stockStatus;
    const matchesSearch = !filters.searchQuery || 
      item.brandName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.variant.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.distributorName.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortage': return 'error';
      case 'Sufficient': return 'success';
      case 'Balanced': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Shortage': return <TrendingDownIcon fontSize="small" />;
      case 'Sufficient': return <TrendingUpIcon fontSize="small" />;
      case 'Balanced': return <BalanceIcon fontSize="small" />;
      default: return <InventoryIcon fontSize="small" />;
    }
  };

  const renderSummaryCards = () => {
    const { summary } = inventoryData;
    
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" component="div">
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {summary.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h6" component="div">
                  Shortages
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {summary.shortageProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.criticalShortages || 0} Critical (&lt;25%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" component="div">
                  Sufficient Stock
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {summary.sufficientProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.totalSurplusQuantity || 0} units surplus
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BalanceIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6" component="div">
                  Stock Health
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {summary.averageStockPercentage || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Stock Coverage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFilters = () => {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={filters.timeRange}
                label="Time Range"
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                {timeRangeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Staff</InputLabel>
              <Select
                value={filters.staffId}
                label="Staff"
                onChange={(e) => handleFilterChange('staffId', e.target.value)}
              >
                <MenuItem value="">All Staff</MenuItem>
                {staff.map(staffMember => (
                  <MenuItem key={staffMember._id} value={staffMember._id}>
                    {staffMember.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Distributor</InputLabel>
              <Select
                value={filters.distributorId}
                label="Distributor"
                onChange={(e) => handleFilterChange('distributorId', e.target.value)}
              >
                <MenuItem value="">All Distributors</MenuItem>
                {distributors.map(distributor => (
                  <MenuItem key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filters.stockStatus}
                label="Stock Status"
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              >
                {stockStatusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Brand, Variant, Distributor"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton onClick={handleExport} disabled={loading || filteredInventoryData.length === 0}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderInventoryTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell><strong>Distributor</strong></TableCell>
              <TableCell><strong>Brand</strong></TableCell>
              <TableCell><strong>Variant</strong></TableCell>
              <TableCell><strong>Size</strong></TableCell>
              <TableCell align="center"><strong>Current Stock</strong></TableCell>
              <TableCell align="center"><strong>Requirements</strong></TableCell>
              <TableCell align="center"><strong>Difference</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Stock %</strong></TableCell>
              <TableCell align="center"><strong>Orders</strong></TableCell>
              <TableCell align="center"><strong>Shops</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventoryData.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                      <StoreIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">
                      {item.distributorName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.brandName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.variant}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.size}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {item.currentStock}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.totalRequirement}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={item.stockDifference >= 0 ? 'success.main' : 'error.main'}
                  >
                    {item.stockDifference >= 0 ? '+' : ''}{item.stockDifference}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    icon={getStatusIcon(item.stockStatus)}
                    label={item.stockStatus}
                    color={getStatusColor(item.stockStatus)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(item.stockPercentage, 100)}
                        color={item.stockPercentage >= 75 ? 'success' : item.stockPercentage >= 50 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.stockPercentage}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.orderCount}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.uniqueShopsCount}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredInventoryData.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Inventory Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or check if staff activities have been completed.
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  if (loading && inventoryData.inventoryAnalysis.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Inventory Management
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {inventoryData.generatedAt && (
            `Last updated: ${format(new Date(inventoryData.generatedAt), 'PPp')}`
          )}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track distributor stock levels against shop requirements to identify shortages and surpluses.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderSummaryCards()}
      {renderFilters()}
      
      <Paper sx={{ mb: 3 }}>
        {loading && <LinearProgress />}
        {renderInventoryTable()}
      </Paper>
    </Container>
  );
}

export default InventoryManagement;
