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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { GetApp as ExportIcon } from '@mui/icons-material';
import analyticsService from '../../services/analyticsService';
import { downloadCSV, formatAnalyticsForExport } from '../../utils/csvExport';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#3f51b5', '#ff5722'];

const StaffActivityAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('last30days');
  const [analyticsData, setAnalyticsData] = useState({
    totalActivities: 0,
    completedActivities: 0,
    pendingActivities: 0,
    inProgressActivities: 0,
    avgProductivity: 0,
    activityByStaff: [],
    activityByType: [],
    activityTrend: [],
    productivityByStaff: [],
    topPerformers: []
  });
  const [error, setError] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    fetchStaffActivityAnalytics();
  }, [timeRange]);

  const fetchStaffActivityAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getStaffActivityAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching staff activity analytics:', err);
      setError('Failed to load staff activity analytics. Please try again later.');
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
          'Total Activities': analyticsData.totalActivities,
          'Completed Activities': analyticsData.completedActivities,
          'Pending Activities': analyticsData.pendingActivities,
          'In Progress Activities': analyticsData.inProgressActivities,
          'Average Productivity': `${analyticsData.avgProductivity}%`
        }];
        fileName = 'staff_activity_summary_metrics.csv';
        break;
        
      case 'activityByStaff':
        exportData = formatAnalyticsForExport(analyticsData.activityByStaff, 'byDistributor');
        fileName = 'activities_by_staff.csv';
        break;
        
      case 'activityByType':
        exportData = formatAnalyticsForExport(analyticsData.activityByType, 'statusDistribution');
        fileName = 'activities_by_type.csv';
        break;
        
      case 'productivityByStaff':
        exportData = formatAnalyticsForExport(analyticsData.productivityByStaff, 'productivityByStaff');
        fileName = 'staff_productivity.csv';
        break;
        
      case 'activityTrend':
        exportData = analyticsData.activityTrend.map(item => ({
          'Month': item.month,
          'Tasks': item.tasks,
          'Orders': item.orders,
          'Damage Claims': item.damageClaims
        }));
        fileName = 'activity_trend.csv';
        break;
        
      case 'topPerformers':
        exportData = formatAnalyticsForExport(analyticsData.topPerformers, 'topPerformers');
        fileName = 'top_performing_staff.csv';
        break;
        
      case 'all':
        // Export all data
        const allData = [
          { 'STAFF ACTIVITY SUMMARY': '' },
          {
            'Period': getTimeRangeLabel(timeRange),
            'Total Activities': analyticsData.totalActivities,
            'Completed Activities': analyticsData.completedActivities,
            'Pending Activities': analyticsData.pendingActivities,
            'In Progress Activities': analyticsData.inProgressActivities,
            'Average Productivity': `${analyticsData.avgProductivity}%`
          },
          { 'ACTIVITIES BY STAFF': '' },
          ...formatAnalyticsForExport(analyticsData.activityByStaff, 'byDistributor'),
          { 'ACTIVITIES BY TYPE': '' },
          ...formatAnalyticsForExport(analyticsData.activityByType, 'statusDistribution'),
          { 'STAFF PRODUCTIVITY': '' },
          ...formatAnalyticsForExport(analyticsData.productivityByStaff, 'productivityByStaff'),
          { 'TOP PERFORMING STAFF': '' },
          ...formatAnalyticsForExport(analyticsData.topPerformers, 'topPerformers'),
          { 'MONTHLY ACTIVITY TREND': '' },
          ...analyticsData.activityTrend.map(item => ({
            'Month': item.month,
            'Tasks': item.tasks,
            'Orders': item.orders,
            'Damage Claims': item.damageClaims
          }))
        ];
        
        exportData = allData;
        fileName = 'all_staff_activity_analytics.csv';
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
          Staff Activity Analytics
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
            <MenuItem onClick={() => handleExport('activityByStaff')}>Export Activities by Staff</MenuItem>
            <MenuItem onClick={() => handleExport('activityByType')}>Export Activities by Type</MenuItem>
            <MenuItem onClick={() => handleExport('productivityByStaff')}>Export Staff Productivity</MenuItem>
            <MenuItem onClick={() => handleExport('activityTrend')}>Export Activity Trend</MenuItem>
            <MenuItem onClick={() => handleExport('topPerformers')}>Export Top Performers</MenuItem>
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
                Total Activities
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.totalActivities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Productivity
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.avgProductivity}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Completed Activities
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.completedActivities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Pending Activities
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {analyticsData.pendingActivities}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Activity by Staff */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Activity by Staff Member
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Number of activities performed by each staff member
            </Typography>
            {analyticsData.activityByStaff.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.activityByStaff}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="activities" fill="#3f51b5">
                    {analyticsData.activityByStaff.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Activity by Type */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Activity by Type
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Distribution of different types of activities
            </Typography>
            {analyticsData.activityByType.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.activityByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.activityByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} activities`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Staff Productivity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Staff Productivity
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Productivity score by staff member
            </Typography>
            {analyticsData.productivityByStaff.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.productivityByStaff}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="productivity" fill="#8884d8" minPointSize={5}>
                    {analyticsData.productivityByStaff.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.productivity > 80 ? '#4caf50' : entry.productivity > 70 ? '#ff9800' : '#f44336'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Activity Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Activity Trend
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Monthly trend of different activity types
            </Typography>
            {analyticsData.activityTrend.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={analyticsData.activityTrend}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tasks" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} name="Tasks" />
                  <Line type="monotone" dataKey="orders" stroke="#4caf50" strokeWidth={2} name="Orders" />
                  <Line type="monotone" dataKey="damageClaims" stroke="#ff9800" strokeWidth={2} name="Damage Claims" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Staff
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Staff members with highest productivity scores
            </Typography>
            {analyticsData.topPerformers.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <Typography color="text.secondary">No data available</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell align="right">Activities</TableCell>
                      <TableCell align="right">Completion Rate</TableCell>
                      <TableCell align="right">Avg Response Time</TableCell>
                      <TableCell align="right">Productivity Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.topPerformers.map((performer) => (
                      <TableRow
                        key={performer.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {performer.name}
                        </TableCell>
                        <TableCell align="right">{performer.activities}</TableCell>
                        <TableCell align="right">{performer.completionRate}%</TableCell>
                        <TableCell align="right">{performer.avgResponseTime}</TableCell>
                        <TableCell align="right">{performer.productivityScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StaffActivityAnalytics; 