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
  Divider,
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
  Cell
} from 'recharts';
import { GetApp as ExportIcon } from '@mui/icons-material';
import analyticsService from '../../services/analyticsService';
import { downloadCSV, formatAnalyticsForExport } from '../../utils/csvExport';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffa726', '#ff5722'];

const DamageClaimsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const [timeGranularity, setTimeGranularity] = useState('daily'); 
  const [analyticsData, setAnalyticsData] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    pendingClaims: 0,
    approvalRate: 0,
    avgProcessingTime: 0,
    claimsByDistributor: [],
    claimsByProduct: [],
    claimsByDamageType: [],
    approvalRateByMonth: [],
    claimsTrend: [],
    claimsFrequency: [],
    claimsByClaimant: []
  });
  
  // Helper function to safely map over arrays that might be undefined
  const safeMap = (array, callback) => {
    return Array.isArray(array) ? array.map(callback) : [];
  };
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    fetchDamageClaimsAnalytics();
  }, [timeRange, timeGranularity]);

  const fetchDamageClaimsAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getDamageClaimsAnalytics(timeRange, timeGranularity);
      // Ensure all expected properties exist with default values
      setAnalyticsData({
        totalClaims: data?.totalClaims || 0,
        approvedClaims: data?.approvedClaims || 0,
        rejectedClaims: data?.rejectedClaims || 0,
        pendingClaims: data?.pendingClaims || 0,
        approvalRate: data?.approvalRate || 0,
        avgProcessingTime: data?.avgProcessingTime || 0,
        claimsByDistributor: Array.isArray(data?.claimsByDistributor) ? data.claimsByDistributor : [],
        claimsByProduct: Array.isArray(data?.claimsByProduct) ? data.claimsByProduct : [],
        claimsByDamageType: Array.isArray(data?.claimsByDamageType) ? data.claimsByDamageType : [],
        approvalRateByMonth: Array.isArray(data?.approvalRateByMonth) ? data.approvalRateByMonth : [],
        claimsTrend: Array.isArray(data?.claimsTrend) ? data.claimsTrend : [],
        claimsFrequency: Array.isArray(data?.claimsFrequency) ? data.claimsFrequency : [],
        claimsByClaimant: Array.isArray(data?.claimsByClaimant) ? data.claimsByClaimant : []
      });
    } catch (err) {
      console.error('Error fetching damage claims analytics:', err);
      setError('Failed to load damage claims analytics. Please try again later.');
      // Reset to default state on error
      setAnalyticsData({
        totalClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        pendingClaims: 0,
        approvalRate: 0,
        avgProcessingTime: 0,
        claimsByDistributor: [],
        claimsByProduct: [],
        claimsByDamageType: [],
        approvalRateByMonth: [],
        claimsTrend: [],
        claimsFrequency: [],
        claimsByClaimant: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleTimeGranularityChange = (event) => {
    setTimeGranularity(event.target.value);
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
          'Total Claims': analyticsData.totalClaims,
          'Approved Claims': analyticsData.approvedClaims,
          'Pending Claims': analyticsData.pendingClaims,
          'Rejected Claims': analyticsData.rejectedClaims,
          'Approval Rate': `${analyticsData.approvalRate}%`,
          'Avg Processing Time': `${analyticsData.avgProcessingTime} days`
        }];
        fileName = 'damage_claims_summary_metrics.csv';
        break;

      case 'claimsByDistributor':
        exportData = formatAnalyticsForExport(analyticsData.claimsByDistributor, 'byDistributor');
        fileName = 'damage_claims_by_distributor.csv';
        break;

      case 'claimsByProduct':
        exportData = formatAnalyticsForExport(analyticsData.claimsByProduct, 'byProduct');
        fileName = 'damage_claims_by_product.csv';
        break;

      case 'claimsByDamageType':
        exportData = analyticsData.claimsByDamageType.map(item => ({
          'Damage Type': item.name,
          'Number of Claims': item.value
        }));
        fileName = 'damage_claims_by_type.csv';
        break;

      case 'approvalTrend':
        exportData = analyticsData.approvalRateByMonth.map(item => ({
          'Month': item.month,
          'Approval Rate': `${item.approvalRate}%`
        }));
        fileName = 'damage_claims_approval_trend.csv';
        break;

      case 'claimsTrend':
        exportData = formatAnalyticsForExport(analyticsData.claimsTrend, 'trend');
        fileName = 'damage_claims_trend.csv';
        break;

      case 'claimsFrequency':
        exportData = analyticsData.claimsFrequency.map(item => ({
          'Time Interval': item.time,
          'Number of Claims': item.count
        }));
        fileName = `damage_claims_frequency_${timeGranularity}.csv`;
        break;

      case 'claimsByClaimant':
        exportData = analyticsData.claimsByClaimant.map(item => ({
          'Claimant': item.name,
          'Number of Claims': item.value
        }));
        fileName = 'damage_claims_by_claimant.csv';
        break;

      case 'all':
        exportData = [
          { 'DAMAGE CLAIMS SUMMARY': '' },
          {
            'Period': getTimeRangeLabel(timeRange),
            'Total Claims': analyticsData.totalClaims,
            'Approved Claims': analyticsData.approvedClaims,
            'Pending Claims': analyticsData.pendingClaims,
            'Rejected Claims': analyticsData.rejectedClaims,
            'Approval Rate': `${analyticsData.approvalRate}%`,
            'Avg Processing Time': `${analyticsData.avgProcessingTime} days`
          },
          { 'CLAIMS BY DISTRIBUTOR': '' },
          ...formatAnalyticsForExport(analyticsData.claimsByDistributor, 'byDistributor'),
          { 'CLAIMS BY PRODUCT': '' },
          ...formatAnalyticsForExport(analyticsData.claimsByProduct, 'byProduct'),
          { 'CLAIMS BY DAMAGE TYPE': '' },
          ...analyticsData.claimsByDamageType.map(item => ({
            'Damage Type': item.name,
            'Number of Claims': item.value
          })),
          { 'MONTHLY CLAIMS TREND': '' },
          ...formatAnalyticsForExport(analyticsData.claimsTrend, 'trend'),
          { 'CLAIMS FREQUENCY': '' },
          ...analyticsData.claimsFrequency.map(item => ({
            'Time Interval': item.time,
            'Number of Claims': item.count
          })),
          { 'CLAIMS BY CLAIMANT': '' },
          ...analyticsData.claimsByClaimant.map(item => ({
            'Claimant': item.name,
            'Number of Claims': item.value
          }))
        ];
        fileName = 'all_damage_claims_analytics.csv';
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

  const getGranularityLabel = (granularity) => {
    switch (granularity) {
      case 'hourly': return 'Hourly';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return 'Daily';
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
          Damage Claims Analytics
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
          <FormControl sx={{ minWidth: 150, mr: 1 }} size="small">
            <InputLabel id="granularity-select-label">Granularity</InputLabel>
            <Select
              labelId="granularity-select-label"
              id="granularity-select"
              value={timeGranularity}
              label="Granularity"
              onChange={handleTimeGranularityChange}
            >
              <MenuItem value="hourly">Hourly</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
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
            <MenuItem onClick={() => handleExport('claimsByDistributor')}>Export Claims by Distributor</MenuItem>
            <MenuItem onClick={() => handleExport('claimsByProduct')}>Export Claims by Product</MenuItem>
            <MenuItem onClick={() => handleExport('claimsByDamageType')}>Export Claims by Damage Type</MenuItem>
            <MenuItem onClick={() => handleExport('approvalTrend')}>Export Approval Rate Trend</MenuItem>
            <MenuItem onClick={() => handleExport('claimsTrend')}>Export Claims Trend</MenuItem>
            <MenuItem onClick={() => handleExport('claimsFrequency')}>Export Claims Frequency</MenuItem>
            <MenuItem onClick={() => handleExport('claimsByClaimant')}>Export Claims by Claimant</MenuItem>
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
                Total Claims
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.totalClaims}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Approval Rate
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.approvalRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Claims
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.pendingClaims}
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
        {/* Claims Frequency */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Claims Frequency
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Number of claims submitted over time ({getGranularityLabel(timeGranularity)})
            </Typography>
            {(!analyticsData.claimsFrequency || analyticsData.claimsFrequency.length === 0) ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analyticsData.claimsFrequency}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `${value} claims`} />
                  <Line type="monotone" dataKey="count" stroke="#3f51b5" strokeWidth={2} name="Claims" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Claims by Claimant */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Claims by Claimant
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of claims by claimant
            </Typography>
            {(!analyticsData.claimsByClaimant || analyticsData.claimsByClaimant.length === 0) ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.claimsByClaimant}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analyticsData.claimsByClaimant.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value} claims`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Claims by Distributor */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Claims by Distributor
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Which distributors submit the most damage claims
            </Typography>
            {analyticsData.claimsByDistributor.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.claimsByDistributor}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <RechartsTooltip />
                  <Bar dataKey="claims" fill="#ffa726">
                    {analyticsData.claimsByDistributor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Claims by Product */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Claims by Product
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Which products have the most damage issues reported
            </Typography>
            {analyticsData.claimsByProduct.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.claimsByProduct}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <RechartsTooltip />
                  <Bar dataKey="claims" fill="#66bb6a">
                    {analyticsData.claimsByProduct.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Claims by Damage Type */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Claims by Damage Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of different types of damages reported
            </Typography>
            {analyticsData.claimsByDamageType.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.claimsByDamageType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.claimsByDamageType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => `${value} claims`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Approval Rate Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Approval Rate Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly approval rate for damage claims
            </Typography>
            {analyticsData.approvalRateByMonth.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analyticsData.approvalRateByMonth}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Line 
                    type="monotone" 
                    dataKey="approvalRate" 
                    stroke="#ff9800" 
                    strokeWidth={2}
                    name="Approval Rate" 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Claims Submission Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Claims Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly trend of submitted, approved, and rejected claims
            </Typography>
            {analyticsData.claimsTrend.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analyticsData.claimsTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="submitted" stackId="a" fill="#8884d8" name="Submitted Claims" />
                  <Bar dataKey="approved" stackId="b" fill="#82ca9d" name="Approved Claims" />
                  <Bar dataKey="rejected" stackId="b" fill="#ff8042" name="Rejected Claims" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DamageClaimsAnalytics;