import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Menu
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { GetApp as ExportIcon } from '@mui/icons-material';
import analyticsService from '../../services/analyticsService';
import { downloadCSV, formatAnalyticsForExport } from '../../utils/csvExport';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#4caf50', '#ff5722'];

const OrderAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    approvedOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    dispatchedOrders: 0,
    fulfillmentRate: 0,
    avgProcessingTime: 0,
    ordersByDistributor: [],
    orderStatusDistribution: [],
    orderTrend: [],
    fulfillmentTrend: [],
    topProducts: []
  });
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    fetchOrderAnalytics();
  }, [timeRange]);

  const fetchOrderAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getOrderAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching order analytics:', err);
      setError('Failed to load order analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };
  
  const handleExport = (type) => {
    handleExportMenuClose();
    
    let exportData;
    let fileName;
    
    switch (type) {
      case 'summaryMetrics':
        exportData = [{
          'Period': getTimeRangeLabel(timeRange),
          'Total Orders': analyticsData.totalOrders,
          'Approved Orders': analyticsData.approvedOrders,
          'Pending Orders': analyticsData.pendingOrders,
          'Rejected Orders': analyticsData.rejectedOrders,
          'Dispatched Orders': analyticsData.dispatchedOrders,
          'Fulfillment Rate': `${analyticsData.fulfillmentRate}%`,
          'Avg Processing Time': `${analyticsData.avgProcessingTime} days`
        }];
        fileName = 'order_summary_metrics.csv';
        break;
        
      case 'ordersByDistributor':
        exportData = formatAnalyticsForExport(analyticsData.ordersByDistributor, 'byDistributor');
        fileName = 'orders_by_distributor.csv';
        break;
        
      case 'orderStatusDistribution':
        exportData = formatAnalyticsForExport(analyticsData.orderStatusDistribution, 'statusDistribution');
        fileName = 'order_status_distribution.csv';
        break;
        
      case 'topProducts':
        exportData = analyticsData.topProducts.map(item => ({
          'Product': item.name,
          'Orders': item.orders,
          'Quantity': item.quantity || 0,
          'Value': item.value || 0
        }));
        fileName = 'top_ordered_products.csv';
        break;
        
      case 'fulfillmentTrend':
        exportData = analyticsData.fulfillmentTrend.map(item => ({
          'Month': item.month,
          'Fulfillment Rate': `${item.fulfillmentRate}%`
        }));
        fileName = 'order_fulfillment_trend.csv';
        break;
        
      case 'orderTrend':
        exportData = formatAnalyticsForExport(analyticsData.orderTrend, 'trend');
        fileName = 'order_trend.csv';
        break;
        
      case 'all':
        // Export all data
        const allData = [
          { 'ORDER SUMMARY': '' },
          {
            'Period': getTimeRangeLabel(timeRange),
            'Total Orders': analyticsData.totalOrders,
            'Approved Orders': analyticsData.approvedOrders,
            'Pending Orders': analyticsData.pendingOrders,
            'Rejected Orders': analyticsData.rejectedOrders,
            'Dispatched Orders': analyticsData.dispatchedOrders,
            'Fulfillment Rate': `${analyticsData.fulfillmentRate}%`,
            'Avg Processing Time': `${analyticsData.avgProcessingTime} days`
          },
          { 'ORDERS BY DISTRIBUTOR': '' },
          ...formatAnalyticsForExport(analyticsData.ordersByDistributor, 'byDistributor'),
          { 'ORDER STATUS DISTRIBUTION': '' },
          ...formatAnalyticsForExport(analyticsData.orderStatusDistribution, 'statusDistribution'),
          { 'TOP ORDERED PRODUCTS': '' },
          ...analyticsData.topProducts.map(item => ({
            'Product': item.name,
            'Orders': item.orders,
            'Quantity': item.quantity || 0,
            'Value': item.value || 0
          })),
          { 'MONTHLY ORDER TREND': '' },
          ...formatAnalyticsForExport(analyticsData.orderTrend, 'trend')
        ];
        
        exportData = allData;
        fileName = 'all_order_analytics.csv';
        break;
        
      default:
        return;
    }
    
    if (exportData && exportData.length > 0) {
      downloadCSV(exportData, fileName);
    } else {
      alert('No data available to export');
    }
  };
  
  // Helper function to get human-readable time range label
  const getTimeRangeLabel = (range) => {
    switch (range) {
      case 'last7days': return 'Last 7 Days';
      case 'last30days': return 'Last 30 Days';
      case 'last3months': return 'Last 3 Months';
      case 'last6months': return 'Last 6 Months';
      case 'lastYear': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Order Analytics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200, mr: 1 }} size="small">
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="last7days">Last 7 Days</MenuItem>
              <MenuItem value="last30days">Last 30 Days</MenuItem>
              <MenuItem value="last3months">Last 3 Months</MenuItem>
              <MenuItem value="last6months">Last 6 Months</MenuItem>
              <MenuItem value="lastYear">Last Year</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Export Data">
            <IconButton onClick={handleExportMenuOpen}>
              <ExportIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleExportMenuClose}
          >
            <MenuItem onClick={() => handleExport('summaryMetrics')}>Export Summary Metrics</MenuItem>
            <MenuItem onClick={() => handleExport('ordersByDistributor')}>Export Orders by Distributor</MenuItem>
            <MenuItem onClick={() => handleExport('orderStatusDistribution')}>Export Status Distribution</MenuItem>
            <MenuItem onClick={() => handleExport('topProducts')}>Export Top Products</MenuItem>
            <MenuItem onClick={() => handleExport('fulfillmentTrend')}>Export Fulfillment Trend</MenuItem>
            <MenuItem onClick={() => handleExport('orderTrend')}>Export Order Trend</MenuItem>
            <MenuItem onClick={() => handleExport('all')}>Export All Data</MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Fulfillment Rate
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.fulfillmentRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.pendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Processing Time
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.avgProcessingTime} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Orders by Distributor */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Orders by Distributor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of order requests across distributors
            </Typography>
            {analyticsData.ordersByDistributor.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.ordersByDistributor}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#4caf50">
                    {analyticsData.ordersByDistributor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Order Status Distribution */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Current status of all orders in the system
            </Typography>
            {analyticsData.orderStatusDistribution.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.orderStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.orderStatusDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#4caf50' : index === 1 ? '#ff9800' : '#f44336'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} orders`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Ordered Products
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Most frequently ordered products
            </Typography>
            {analyticsData.topProducts.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.topProducts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => `${value} orders`} />
                  <Bar dataKey="orders" fill="#8884d8">
                    {analyticsData.topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Fulfillment Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Fulfillment Rate Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly order fulfillment rate trend
            </Typography>
            {analyticsData.fulfillmentTrend.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={analyticsData.fulfillmentTrend}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFulfillment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Area 
                    type="monotone" 
                    dataKey="fulfillmentRate" 
                    stroke="#4caf50" 
                    fillOpacity={1} 
                    fill="url(#colorFulfillment)" 
                    name="Fulfillment Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Order Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly trend of requested, approved, and dispatched orders
            </Typography>
            {analyticsData.orderTrend.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analyticsData.orderTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="requested" fill="#bbdefb" name="Requested Orders" />
                  <Bar dataKey="approved" fill="#4caf50" name="Approved Orders" />
                  <Bar dataKey="dispatched" fill="#2196f3" name="Dispatched Orders" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderAnalytics; 