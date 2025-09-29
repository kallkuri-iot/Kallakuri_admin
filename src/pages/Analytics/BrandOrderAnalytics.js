import React, { useState, useEffect } from 'react';
import {
  Box, 
  Paper, 
  Typography, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  LocalOffer as BrandIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Store as StoreIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import analyticsService from '../../services/analyticsService';
import { distributorService, staffService } from '../../services/api';
import { downloadCSV } from '../../utils/csvExport';

const BrandOrderAnalytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    brandOrderAnalytics: [],
    distributorBrandPerformance: [],
    brandOrderTrend: [],
    topBrands: [],
    summary: {}
  });

  // Filters
  const [filters, setFilters] = useState({
    timeRange: 'last30days',
    distributorIds: [], // Changed to array for multi-select
    staffId: '',
    brandName: '',
    variant: ''
  });

  // Options for filters
  const [distributors, setDistributors] = useState([]);
  const [marketingStaff, setMarketingStaff] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);

  // Expanded rows for retailer/wholesaler breakdown
  const [expandedRows, setExpandedRows] = useState(new Set());

  const timeRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0', '#8dd1e1', '#d084d0'];

  useEffect(() => {
    fetchAnalyticsData();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert distributorIds array to the format expected by the service
      const apiFilters = {
        ...filters,
        distributorIds: filters.distributorIds.length > 0 ? filters.distributorIds : undefined
      };
      
      const data = await analyticsService.getBrandOrderAnalytics(apiFilters);
      setAnalyticsData(data.data);
    } catch (err) {
      console.error('Error fetching brand order analytics:', err);
      setError('Failed to load brand order analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch distributors
      const distributorResponse = await distributorService.getAllDistributors();
      if (distributorResponse.success) {
        setDistributors(distributorResponse.data);
      }

      // Fetch marketing staff
      const staffResponse = await staffService.getStaffByRole('Marketing Staff');
      if (staffResponse.success) {
        setMarketingStaff(staffResponse.data);
      }

      // Get initial analytics data if not already loaded
      if (!analyticsData.brandOrderAnalytics.length) {
        const data = await analyticsService.getBrandOrderAnalytics({ timeRange: 'last30days' });
        if (data.success && data.data) {
          // Extract unique brands and variants
          const uniqueBrands = [...new Set(data.data.brandOrderAnalytics.map(item => item.brandName))].filter(Boolean);
          const uniqueVariants = [...new Set(data.data.brandOrderAnalytics.map(item => item.variant))].filter(Boolean);
          
          setBrands(uniqueBrands);
          setVariants(uniqueVariants);
          setAnalyticsData(data.data);
        }
      } else {
        // Extract from existing data
        const uniqueBrands = [...new Set(analyticsData.brandOrderAnalytics.map(item => item.brandName))].filter(Boolean);
        const uniqueVariants = [...new Set(analyticsData.brandOrderAnalytics.map(item => item.variant))].filter(Boolean);
        
        setBrands(uniqueBrands);
        setVariants(uniqueVariants);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Failed to load filter options. Please try again later.');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDistributorChange = (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      distributorIds: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const toggleRowExpansion = (rowIndex) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'brandAnalytics':
        data = analyticsData.brandOrderAnalytics.map(item => ({
          'Distributor': item.distributorName,
          'Brand': item.brandName,
          'Variant': item.variant,
          'Size': item.size,
          'Total Orders': item.totalOrders,
          'Total Quantity': item.totalQuantity,
          'Total Value': item.totalValue,
          'Avg Quantity/Order': item.avgQuantityPerOrder,
          'Avg Rate': item.avgRate,
          'Shop Count': item.shopCount,
          'Order Frequency': item.orderFrequency,
          'Last Order': item.lastOrderDate ? format(new Date(item.lastOrderDate), 'yyyy-MM-dd') : 'N/A',
          'First Order': item.firstOrderDate ? format(new Date(item.firstOrderDate), 'yyyy-MM-dd') : 'N/A'
        }));
        filename = 'brand_order_analytics.csv';
        break;
      
      case 'distributorPerformance':
        data = analyticsData.distributorBrandPerformance.map(item => ({
          'Distributor': item.distributorName,
          'Total Orders': item.totalOrders,
          'Total Quantity': item.totalQuantity,
          'Total Value': item.totalValue
        }));
        filename = 'distributor_brand_performance.csv';
        break;
      
      case 'topBrands':
        data = analyticsData.topBrands.map(item => ({
          'Brand': item.brandName,
          'Total Orders': item.totalOrders,
          'Total Quantity': item.totalQuantity,
          'Total Value': item.totalValue
        }));
        filename = 'top_performing_brands.csv';
        break;
      
      default:
        return;
    }

    if (data.length > 0) {
      downloadCSV(data, filename);
    }
  };

  const getFrequencyColor = (frequency) => {
    const colorMap = {
      'Very High': '#d32f2f',
      'High': '#f57c00',
      'Medium': '#fbc02d',
      'Low': '#388e3c',
      'None': '#757575'
    };
    return colorMap[frequency] || theme.palette.grey[400];
  };

  const renderShopBreakdown = (retailers, wholesalers) => {
    return (
      <Box sx={{ pl: 4, pr: 2, py: 1, bgcolor: theme.palette.grey[50] }}>
        <Grid container spacing={2}>
          {retailers.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StoreIcon sx={{ mr: 1, fontSize: 16 }} />
                Retailers ({retailers.length})
              </Typography>
              <List dense>
                {retailers.slice(0, 3).map((retailer, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={retailer.shopName || 'Unknown Shop'}
                      secondary={`Qty: ${retailer.quantity}, Value: ₹${retailer.value?.toFixed(2) || 0}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
                {retailers.length > 3 && (
                  <Typography variant="caption" color="textSecondary">
                    ... and {retailers.length - 3} more retailers
                  </Typography>
                )}
              </List>
            </Grid>
          )}
          
          {wholesalers.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 16 }} />
                Wholesalers ({wholesalers.length})
              </Typography>
              <List dense>
                {wholesalers.slice(0, 3).map((wholesaler, idx) => (
                  <ListItem key={idx} sx={{ py: 0.5 }}>
                    <ListItemText
                      primary={wholesaler.shopName || 'Unknown Shop'}
                      secondary={`Qty: ${wholesaler.quantity}, Value: ₹${wholesaler.value?.toFixed(2) || 0}`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
                {wholesalers.length > 3 && (
                  <Typography variant="caption" color="textSecondary">
                    ... and {wholesalers.length - 3} more wholesalers
                  </Typography>
                )}
              </List>
            </Grid>
          )}
        </Grid>
      </Box>
    );
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
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BrandIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Brand Order Analytics
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                label="Time Range"
              >
                {timeRanges.map(range => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Staff Name</InputLabel>
              <Select
                value={filters.staffId}
                onChange={(e) => handleFilterChange('staffId', e.target.value)}
                label="Staff Name"
              >
                <MenuItem value="">All Staff</MenuItem>
                {marketingStaff.map(staff => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Distributors</InputLabel>
              <Select
                multiple
                value={filters.distributorIds}
                onChange={handleDistributorChange}
                input={<OutlinedInput label="Distributors" />}
                renderValue={(selected) => {
                  if (selected.length === 0) return 'All Distributors';
                  if (selected.length === 1) {
                    const distributor = distributors.find(d => d._id === selected[0]);
                    return distributor?.name || 'Unknown';
                  }
                  return `${selected.length} distributors selected`;
                }}
              >
                {distributors.map(distributor => (
                  <MenuItem key={distributor._id} value={distributor._id}>
                    <Checkbox checked={filters.distributorIds.indexOf(distributor._id) > -1} />
                    <ListItemText primary={distributor.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                value={filters.brandName}
                onChange={(e) => handleFilterChange('brandName', e.target.value)}
                label="Brand"
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map(brand => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Variant</InputLabel>
              <Select
                value={filters.variant}
                onChange={(e) => handleFilterChange('variant', e.target.value)}
                label="Variant"
              >
                <MenuItem value="">All Variants</MenuItem>
                {variants.map(variant => (
                  <MenuItem key={variant} value={variant}>
                    {variant}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Brand Orders
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.totalBrandOrders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unique Brands
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.uniqueBrands || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Distributors
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.uniqueDistributors || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Orders/Brand
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.uniqueBrands > 0 
                  ? Math.round(analyticsData.summary.totalBrandOrders / analyticsData.summary.uniqueBrands)
                  : 0
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Brand Order Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Brand Order Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.brandOrderTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" strokeWidth={2} name="Orders" />
                <Line type="monotone" dataKey="quantity" stroke="#82ca9d" strokeWidth={2} name="Quantity" />
                <Line type="monotone" dataKey="value" stroke="#ffc658" strokeWidth={2} name="Value (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Analytics Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Detailed Brand Order Analytics
          </Typography>
          <Tooltip title="Export Table Data">
            <IconButton onClick={() => handleExport('brandAnalytics')}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Expand</TableCell>
                <TableCell>Distributor</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Size</TableCell>
                <TableCell align="right">Orders</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell align="right">Shops</TableCell>
                <TableCell>Last Order</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.brandOrderAnalytics.map((row, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpansion(index)}
                        disabled={(!row.retailers || row.retailers.length === 0) && (!row.wholesalers || row.wholesalers.length === 0)}
                      >
                        {expandedRows.has(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.distributorName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {row.brandName}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.variant}</TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell align="right">{row.totalOrders}</TableCell>
                    <TableCell align="right">{row.totalQuantity}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.orderFrequency} 
                        size="small" 
                        sx={{ 
                          bgcolor: getFrequencyColor(row.orderFrequency),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">{row.shopCount}</TableCell>
                    <TableCell>
                      {row.lastOrderDate 
                        ? format(new Date(row.lastOrderDate), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                      <Collapse in={expandedRows.has(index)} timeout="auto" unmountOnExit>
                        {renderShopBreakdown(row.retailers || [], row.wholesalers || [])}
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default BrandOrderAnalytics;