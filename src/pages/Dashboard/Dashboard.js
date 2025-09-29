import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography,
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Chip
} from '@mui/material';
import { 
  People as PeopleIcon,
  ShoppingCart as OrderIcon,
  Report as ReportIcon,
  Assignment as TaskIcon 
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

// Mock data for charts and summaries
const roleData = [
  { name: 'Admin', count: 1 },
  { name: 'Managing Staff', count: 12 },
  { name: 'Mid-Level Manager', count: 4 },
  { name: 'Godown Incharge', count: 2 },
];

const orderData = [
  { name: 'Surya Chandra', pending: 4, approved: 12, rejected: 2 },
  { name: 'Surya Teja', pending: 2, approved: 8, rejected: 1 },
  { name: 'KG Brand', pending: 6, approved: 10, rejected: 3 },
];

const recentActivities = [
  { id: 1, user: 'Raj Kumar', role: 'Managing Staff', action: 'Submitted order request', time: '10 minutes ago' },
  { id: 2, user: 'Priya Singh', role: 'Mid-Level Manager', action: 'Approved order #1234', time: '25 minutes ago' },
  { id: 3, user: 'Amit Patel', role: 'Godown Incharge', action: 'Dispatched order #1231', time: '1 hour ago' },
  { id: 4, user: 'Deepak Sharma', role: 'Managing Staff', action: 'Reported damage for Surya Chandra', time: '2 hours ago' },
  { id: 5, user: 'Neha Gupta', role: 'Mid-Level Manager', action: 'Assigned task to Raj Kumar', time: '3 hours ago' },
];

const pendingTasks = [
  { id: 1, title: 'Visit Distributor XYZ', assignedTo: 'Raj Kumar', deadline: '2023-05-12' },
  { id: 2, title: 'Follow up on leakage report', assignedTo: 'Amit Patel', deadline: '2023-05-10' },
  { id: 3, title: 'Submit monthly sales report', assignedTo: 'Deepak Sharma', deadline: '2023-05-15' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SummaryCard = ({ title, count, icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      bgcolor: color,
      color: 'white',
      borderRadius: 2,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h3">
      {count}
    </Typography>
  </Paper>
);

function Dashboard() {
  const { user } = useAuth();

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back, {user?.name || 'User'}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <SummaryCard 
            title="Total Users" 
            count={roleData.reduce((acc, curr) => acc + curr.count, 0)} 
            icon={<PeopleIcon fontSize="large" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <SummaryCard 
            title="Pending Orders" 
            count={orderData.reduce((acc, curr) => acc + curr.pending, 0)} 
            icon={<OrderIcon fontSize="large" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <SummaryCard 
            title="Damage Reports" 
            count="8" 
            icon={<ReportIcon fontSize="large" />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <SummaryCard 
            title="Pending Tasks" 
            count={pendingTasks.length} 
            icon={<TaskIcon fontSize="large" />}
            color="#ed6c02"
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 360, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Status by Brand
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={orderData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" name="Pending" fill="#FFBB28" />
                <Bar dataKey="approved" name="Approved" fill="#00C49F" />
                <Bar dataKey="rejected" name="Rejected" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 360, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} users`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={activity.action}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.user} ({activity.role})
                          </Typography>
                          {` — ${activity.time}`}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Pending Tasks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pending Tasks
            </Typography>
            <List>
              {pendingTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Assigned to: {task.assignedTo}
                          </Typography>
                          {` — Due: ${task.deadline}`}
                        </React.Fragment>
                      }
                    />
                    <Chip 
                      label="Pending" 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  </ListItem>
                  {index < pendingTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard; 