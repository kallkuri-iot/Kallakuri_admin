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
  useTheme
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
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import analyticsService from '../../services/analyticsService';
import { distributorService } from '../../services/api';
import { downloadCSV } from '../../utils/csvExport';

const MarketInquiryAnalytics = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    inquiryAnalytics: [],
    frequencyDistribution: [],
    topBrandsByInquiry: [],
    inquiryTrend: [],
    summary: {}
  });

  // Filters
  const [filters, setFilters] = useState({
    timeRange: 'last30days',
    distributorId: '',
    brandName: '',
    variant: '',
    frequencyType: ''
  });

  // Options for filters
  const [distributors, setDistributors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variants, setVariants] = useState([]);

  const timeRanges = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastYear', label: 'Last Year' }
  ];

  const frequencyTypes = [
    { value: 'First Time', label: 'First Time' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Rarely', label: 'Rarely' }
  ];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d084d0'];

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
      
      const data = await analyticsService.getMarketInquiryAnalytics(filters);
      setAnalyticsData(data.data);
    } catch (err) {
      console.error('Error fetching market inquiry analytics:', err);
      setError('Failed to load market inquiry analytics. Please try again later.');
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

      // Extract unique brands and variants from analytics data
      const uniqueBrands = [...new Set(analyticsData.inquiryAnalytics.map(item => item.brandName))];
      const uniqueVariants = [...new Set(analyticsData.inquiryAnalytics.map(item => item.variant))];
      
      setBrands(uniqueBrands);
      setVariants(uniqueVariants);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleExport = (type) => {
    let data = [];
    let filename = '';

    switch (type) {
      case 'inquiryAnalytics':
        data = analyticsData.inquiryAnalytics.map(item => ({
          'Distributor': item.distributorName,
          'Shop Name': item.shopName,
          'Shop Type': item.shopType,
          'Brand': item.brandName,
          'Variant': item.variant,
          'Inquiry Type': item.inquiryType,
          'Frequency': item.frequencyOfInquiry,
          'Total Inquiries': item.totalInquiries,
          'Avg Expected Quantity': item.avgExpectedQuantity,
          'High Demand %': item.highDemandPercentage,
          'Follow-up Required': item.followUpRequiredCount,
          'Last Inquiry Date': item.lastInquiryDate ? format(new Date(item.lastInquiryDate), 'yyyy-MM-dd') : 'N/A'
        }));
        filename = 'market_inquiry_analytics.csv';
        break;
      
      case 'frequencyDistribution':
        data = analyticsData.frequencyDistribution.map(item => ({
          'Frequency': item.frequency,
          'Count': item.count
        }));
        filename = 'inquiry_frequency_distribution.csv';
        break;
      
      case 'topBrands':
        data = analyticsData.topBrandsByInquiry.map(item => ({
          'Brand Variant': item.brandVariant,
          'Total Inquiries': item.totalInquiries,
          'Unique Shops': item.shopCount,
          'Unique Distributors': item.distributorCount
        }));
        filename = 'top_brands_by_inquiry.csv';
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
      'First Time': '#82ca9d',
      'Weekly': '#8884d8',
      'Monthly': '#ffc658',
      'Quarterly': '#ff7300',
      'Rarely': '#d084d0'
    };
    return colorMap[frequency] || theme.palette.grey[400];
  };

  const getInquiryTypeColor = (type) => {
    const colorMap = {
      'Product Availability': 'success',
      'Price Inquiry': 'info',
      'Stock Status': 'warning',
      'New Product Request': 'primary',
      'Quality Issue': 'error'
    };
    return colorMap[type] || 'default';
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
          <AssessmentIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Market Inquiry Analytics
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
          <Grid item xs={12} md={2}>
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
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Distributor</InputLabel>
              <Select
                value={filters.distributorId}
                onChange={(e) => handleFilterChange('distributorId', e.target.value)}
                label="Distributor"
              >
                <MenuItem value="">All Distributors</MenuItem>
                {distributors.map(distributor => (
                  <MenuItem key={distributor._id} value={distributor._id}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
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

          <Grid item xs={12} md={2}>
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

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={filters.frequencyType}
                onChange={(e) => handleFilterChange('frequencyType', e.target.value)}
                label="Frequency"
              >
                <MenuItem value="">All Frequencies</MenuItem>
                {frequencyTypes.map(freq => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
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
                Total Inquiries
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.totalInquiries || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Shops
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.totalActivitiesWithInquiries || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Inquiries/Shop
              </Typography>
              <Typography variant="h4">
                {analyticsData.summary.avgInquiriesPerShop || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Top Brands
              </Typography>
              <Typography variant="h4">
                {analyticsData.topBrandsByInquiry.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Frequency Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Inquiry Frequency Distribution
              </Typography>
              <Tooltip title="Export Chart Data">
                <IconButton onClick={() => handleExport('frequencyDistribution')}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.frequencyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ frequency, count }) => `${frequency}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.frequencyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getFrequencyColor(entry.frequency)} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Brands by Inquiry */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Top Brands by Inquiry Volume
              </Typography>
              <Tooltip title="Export Chart Data">
                <IconButton onClick={() => handleExport('topBrands')}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topBrandsByInquiry.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="brandVariant" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="totalInquiries" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inquiry Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Market Inquiry Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.inquiryTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="inquiries" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Analytics Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Detailed Market Inquiry Analytics
          </Typography>
          <Tooltip title="Export Table Data">
            <IconButton onClick={() => handleExport('inquiryAnalytics')}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Distributor</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Brand</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Inquiry Type</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell align="right">Total Inquiries</TableCell>
                <TableCell align="right">Avg Expected Qty</TableCell>
                <TableCell align="right">High Demand %</TableCell>
                <TableCell align="right">Follow-ups</TableCell>
                <TableCell>Last Inquiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {analyticsData.inquiryAnalytics.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.distributorName}</TableCell>
                  <TableCell>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="body2" fontWeight="bold">
                        {row.shopName}
                      </Typography>
                      <Chip 
                        label={row.shopType} 
                        size="small" 
                        color={row.shopType === 'Retail' ? 'primary' : 'secondary'}
                      />
                    </Stack>
                  </TableCell>
                  <TableCell>{row.brandName}</TableCell>
                  <TableCell>{row.variant}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.inquiryType} 
                      size="small" 
                      color={getInquiryTypeColor(row.inquiryType)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.frequencyOfInquiry} 
                      size="small" 
                      sx={{ 
                        bgcolor: getFrequencyColor(row.frequencyOfInquiry),
                        color: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{row.totalInquiries}</TableCell>
                  <TableCell align="right">{row.avgExpectedQuantity}</TableCell>
                  <TableCell align="right">{row.highDemandPercentage}%</TableCell>
                  <TableCell align="right">{row.followUpRequiredCount}</TableCell>
                  <TableCell>
                    {row.lastInquiryDate 
                      ? format(new Date(row.lastInquiryDate), 'MMM dd, yyyy')
                      : 'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default MarketInquiryAnalytics; 