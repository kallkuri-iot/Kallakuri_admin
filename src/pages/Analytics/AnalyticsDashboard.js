import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  Menu,
  MenuItem
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
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Report as ReportIcon,
  Fingerprint as FingerprintIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import DamageClaimsAnalytics from './DamageClaimsAnalytics';
import StaffActivityAnalytics from './StaffActivityAnalytics';
import BrandOrderAnalytics from './BrandOrderAnalytics';
import InventoryManagement from './InventoryManagement';
import analyticsService from '../../services/analyticsService';
import { downloadCSV, formatAnalyticsForExport } from '../../utils/csvExport';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const [analyticsData, setAnalyticsData] = useState({
    damageClaimsCount: 0,
    ordersCount: 0,
    activitiesCount: 0,
    claimsApprovalRate: 0,
    orderFulfillmentRate: 0,
    activityProductivity: 0,
    combinedMonthlyData: []
  });
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getOverviewAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
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
      case 'overview':
        exportData = formatAnalyticsForExport(analyticsData.combinedMonthlyData, 'overview');
        fileName = 'overview_analytics.csv';
        break;
        
      case 'summaryMetrics':
        exportData = [{
          'Period': getTimeRangeLabel(timeRange),
          'Total Damage Claims': analyticsData.damageClaimsCount,
          'Claims Approval Rate': `${analyticsData.claimsApprovalRate}%`,
          'Total Orders': analyticsData.ordersCount,
          'Order Fulfillment Rate': `${analyticsData.orderFulfillmentRate}%`,
          'Total Staff Activities': analyticsData.activitiesCount,
          'Staff Productivity': `${analyticsData.activityProductivity}%`
        }];
        fileName = 'summary_metrics.csv';
        break;
        
      case 'all':
        // Export all data in one file
        const metricsData = [{
          'Period': getTimeRangeLabel(timeRange),
          'Total Damage Claims': analyticsData.damageClaimsCount,
          'Claims Approval Rate': `${analyticsData.claimsApprovalRate}%`,
          'Total Orders': analyticsData.ordersCount,
          'Order Fulfillment Rate': `${analyticsData.orderFulfillmentRate}%`,
          'Total Staff Activities': analyticsData.activitiesCount,
          'Staff Productivity': `${analyticsData.activityProductivity}%`
        }];
        
        const overviewData = formatAnalyticsForExport(analyticsData.combinedMonthlyData, 'overview');
        
        // Combine the data (simple approach - separate sections with headers)
        const allData = [
          { 'SUMMARY METRICS': '' },
          ...metricsData,
          { 'MONTHLY TRENDS': '' },
          ...overviewData
        ];
        
        exportData = allData;
        fileName = 'all_analytics.csv';
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

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Analytics Dashboard
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Analytics">
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
            <MenuItem onClick={() => handleExport('overview')}>Export Monthly Trends</MenuItem>
            <MenuItem onClick={() => handleExport('all')}>Export All Data</MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': { 
              py: 2,
              fontWeight: 600
            }
          }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<ReportIcon />} label="Damage Claims" />
          <Tab icon={<FingerprintIcon />} label="Staff Activity" />
          <Tab icon={<AssessmentIcon />} label="Brand Orders" />
          <Tab icon={<InventoryIcon />} label="Inventory Management" />
        </Tabs>

        {/* Overview Dashboard */}
        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                  Overview Analytics
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  Key metrics across all business areas. Select specific tabs for detailed analysis.
                </Typography>
              </Grid>

              {/* Summary Cards */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      Damage Claims
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsData.claimsApprovalRate}%
                    </Typography>
                    <Typography variant="body2">
                      Claims approval rate last 30 days
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => setTabValue(1)} 
                      sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #7986cb 0%, #3f51b5 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      Staff Activity
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
                      {analyticsData.activityProductivity}%
                    </Typography>
                    <Typography variant="body2">
                      Staff productivity score last 30 days
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="small"
                      onClick={() => setTabValue(2)}  
                      sx={{ mt: 2, backgroundColor: 'rgba(255,255,255,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' } }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Combined Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    Monthly Performance Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={analyticsData.combinedMonthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="damageClaimsCount" stroke="#ffa726" name="Damage Claims" strokeWidth={2} />
                      {/* <Line type="monotone" dataKey="orderCount" stroke="#4caf50" name="Orders" strokeWidth={2} /> */}
                      <Line type="monotone" dataKey="activityCount" stroke="#3f51b5" name="Staff Activity" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        {/* Damage Claims Analytics */}
        <TabPanel value={tabValue} index={1}>
          <DamageClaimsAnalytics />
        </TabPanel>

        {/* Staff Activity Analytics */}
        <TabPanel value={tabValue} index={2}>
          <StaffActivityAnalytics />
        </TabPanel>

        {/* Brand Order Analytics */}
        <TabPanel value={tabValue} index={3}>
          <BrandOrderAnalytics />
        </TabPanel>

        {/* Inventory Management */}
        <TabPanel value={tabValue} index={4}>
          <InventoryManagement />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsDashboard;