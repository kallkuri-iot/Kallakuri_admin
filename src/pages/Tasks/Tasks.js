import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Snackbar,
  Alert,
  Avatar,
  Radio,
  RadioGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Switch,
  Tabs,
  Tab,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AddShoppingCart as CartIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { taskService, staffService, distributorService, authService } from '../../services/api';
import { formatDistance } from 'date-fns';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

// Product options
const productOptions = {
  'Surya Chandra': {
    variants: [
      '15 KG', '5 LTR', 'Pouch', 'Tin', 'Jar', 'Sachets', 'SC Gold', 'SC Cow', 'Flavoured Milk'
    ],
    sizes: {
      'Pouch': ['1 LTR', '500ML', '200ML', '100ML'],
      'Tin': ['1 LTR', '500ML', '200ML', '100ML'],
      'Jar': ['1 LTR', '500ML', '200ML', '100ML'],
      'Sachets': ['Rs. 5/-', 'Rs. 10/-', 'Rs. 20/-', 'Rs. 30/-'],
      'SC Gold': ['750 ML', '500 ML', '150 ML'],
      'SC Cow': ['1 LTR', '500 ML', '200 ML', '100 ML'],
      '15 KG': ['15 KG'],
      '5 LTR': ['5 LTR'],
      'Flavoured Milk': ['NA']
    }
  },
  'Surya Teja': {
    variants: ['Pouch', 'Jar'],
    sizes: {
      'Pouch': ['1 LTR', '500ML', '200ML', '100ML'],
      'Jar': ['1 LTR', '500ML', '200ML', '100ML']
    }
  },
  'KG Brand': {
    variants: ['KG Tins', 'Pouch', 'Jars'],
    sizes: {
      'KG Tins': ['KG Yellow', 'KG White', 'KG LGV', 'KG Plain Tins'],
      'Pouch': ['1 LTR', '500 ML'],
      'Jars': ['800 ML', '400 ML']
    }
  }
};

// Task type options for Mid-level Manager
const midLevelTaskOptions = ['Order Review', 'Inventory Check', 'Staff Supervision', 'Documentation', 'Other'];

function Tasks() {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedStaffRole, setSelectedStaffRole] = useState("Marketing Staff");
  const [taskType, setTaskType] = useState("all");
  const [activeTab, setActiveTab] = useState(0);
  const [internalTaskDialogOpen, setInternalTaskDialogOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState("all");
  const [selectedCreatorRole, setSelectedCreatorRole] = useState("all");
  
  // New state for the view task modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // State for Marketing Staff tasks
  const [marketingTaskData, setMarketingTaskData] = useState({
    title: 'Distributor Visit',
    description: '',
    assignedTo: '',
    distributorId: '',
    deadline: null,
    assignedDate: new Date(),
    isExternalUser: false,
    assigneeName: ''
  });
  
  // State for Mid-Level Manager tasks
  const [midLevelTaskData, setMidLevelTaskData] = useState({
    taskType: 'Other',
    description: '',
    assignedTo: '',
    assignedDate: new Date(),
    isExternalUser: false,
    assigneeName: ''
  });
  
  // State for Godown Incharge tasks
  const [godownTaskData, setGodownTaskData] = useState({
    title: 'Order Dispatch',
    description: '',
    assignedTo: '',
    brand: '',
    variant: '',
    size: '',
    quantity: '',
    assignedDate: new Date(),
    isExternalUser: false,
    assigneeName: ''
  });
  
  // For managing multiple items in Godown Incharge tasks
  const [godownItems, setGodownItems] = useState([]);
  
  // State for Internal Task
  const [internalTaskData, setInternalTaskData] = useState({
    taskDetail: '',
    assignTo: '',
    isOtherUser: false,
    otherUserName: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get relative time for display
  const getRelativeTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  // Fetch tasks and staff members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let filters = {};
        
        // Set up proper filters based on active tab
        if (activeTab === 0) {
          // All Tasks Tab - Use the task type filter selected by user
          if (taskType !== 'all') {
            filters.type = taskType;
          }
          console.log(`All Tasks tab - Using filter type: ${taskType}`);
        } else if (activeTab === 1) {
          // Internal Tasks Tab - Always use internal task type
          filters.type = 'internal';
          // Set creatorRole to include both Marketing Staff and App Developer
          filters.creatorRole = ["Marketing Staff", "App Developer"];
          console.log("Internal Tasks tab - Using filters:", JSON.stringify(filters));
        }
        
        // Apply common filters
        if (filterStatus !== "all") {
          filters.status = filterStatus;
        }
        
        if (selectedStaffMember !== "all") {
          filters.assignedTo = selectedStaffMember;
        }
        
        // Fetch tasks with applied filters
        console.log("Fetching tasks with filters:", JSON.stringify(filters));
        const tasksResponse = await taskService.getAllTasks(filters);
        console.log("Tasks API response:", tasksResponse);
        
        if (tasksResponse.success) {
          setTasks(tasksResponse.data);
          console.log(`Received ${tasksResponse.data.length} tasks`);
          // Debug log task details
          if (tasksResponse.data.length > 0) {
            console.log("Sample tasks:", tasksResponse.data.slice(0, 3).map(t => ({
              id: t._id,
              title: t.title,
              createdBy: t.createdBy ? `${t.createdBy.name} (${t.createdBy.role})` : 'Unknown',
              taskType: t.taskType || 'Not specified'
            })));
          } else {
            console.log("No tasks found matching the filters");
          }
        }
        
        // Fetch marketing staff for the dropdown
        const staffResponse = await staffService.getStaffByRole("Marketing Staff");
        if (staffResponse.success) {
          setStaffMembers(staffResponse.data);
        }

        // Fetch all users for the dropdown
        const usersResponse = await authService.getAllUsers();
        if (usersResponse.success) {
          setAllUsers(usersResponse.data);
        }

        // Fetch distributors for the dropdown
        const distributorsResponse = await distributorService.getAllDistributors();
        if (distributorsResponse.success) {
          setDistributors(distributorsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load data: ' + (error.message || 'Unknown error'),
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [taskType, filterStatus, selectedStaffMember, activeTab, selectedCreatorRole]);

  // Initialize correct filters based on active tab on component mount
  useEffect(() => {
    // Only run once on initial mount
    if (activeTab === 0) {
      console.log("Component mounted with All Tasks tab active");
      setTaskType('all');
      setSelectedCreatorRole('all');
    } else if (activeTab === 1) {
      console.log("Component mounted with Internal Tasks tab active");
      setTaskType('internal');
      setSelectedCreatorRole(['Marketing Staff', 'App Developer']);
    }
  }, [activeTab]);

  // Calculate task counts
  const pendingTasks = tasks.filter(task => task.status === "Pending").length;
  const inProgressTasks = tasks.filter(task => task.status === "In Progress").length;
  const completedTasks = tasks.filter(task => task.status === "Completed").length;
  const totalTasks = tasks.length;

  // Filter tasks based on selected filter - used directly in the render function
  // const filteredTasks = filterStatus === "all" 
  //   ? tasks 
  //   : tasks.filter(task => task.status.toLowerCase() === filterStatus);

  // Handle dialog open
  const handleDialogOpen = () => {
    const defaultRole = "Marketing Staff";
    setSelectedStaffRole(defaultRole);
    
    // Fetch staff for the default role
    fetchStaffByRole(defaultRole);
    
    setMarketingTaskData({
      title: 'Distributor Visit',
      description: '',
      assignedTo: '',
      distributorId: '',
      deadline: null,
      assignedDate: new Date(),
      isExternalUser: false,
      assigneeName: ''
    });
    setMidLevelTaskData({
      taskType: 'Other',
      description: '',
      assignedTo: '',
      assignedDate: new Date(),
      isExternalUser: false,
      assigneeName: ''
    });
    setGodownTaskData({
      title: 'Order Dispatch',
      description: '',
      assignedTo: '',
      brand: '',
      variant: '',
      size: '',
      quantity: '',
      assignedDate: new Date(),
      isExternalUser: false,
      assigneeName: ''
    });
    setGodownItems([]);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  // Handle staff role change
  const handleStaffRoleChange = (event) => {
    const role = event.target.value;
    setSelectedStaffRole(role);
    
    // Fetch staff by the selected role
    fetchStaffByRole(role);
  };

  // Function to fetch staff by role
  const fetchStaffByRole = async (role) => {
    try {
      const response = await staffService.getStaffByRole(role);
      if (response.success) {
        // Update the staffMembers state to only show staff of the selected role
        const filteredStaff = response.data;
        setStaffMembers(filteredStaff);
      }
    } catch (error) {
      console.error('Error fetching staff by role:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load staff members: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    console.log(`Changing to tab ${newValue}`);
    
    if (newValue === 0) {
      // All Tasks tab - keep current filters
      setTaskType('all'); // Reset to show all types
      setSelectedCreatorRole('all'); // Reset creator role filter
    } else if (newValue === 1) {
      // Internal Tasks tab - specifically set filters for internal tasks
      setTaskType('internal');
      setSelectedCreatorRole(['Marketing Staff', 'App Developer']);
    }
    
    // Reset other filters when changing tabs
    setFilterStatus('all');
    setSelectedStaffMember('all');
  };

  const handleMarketingFormChange = (event) => {
    const { name, value } = event.target;
    setMarketingTaskData({
      ...marketingTaskData,
      [name]: value
    });
  };

  // External user toggle function - currently not used
  const handleExternalUserToggle = (taskType) => (event) => {
    const isExternal = event.target.checked;
    // Function is currently unused but kept for future reference
    console.log('External user toggle:', taskType, isExternal);
  };

  // Handle form field changes for Mid-Level Manager tasks
  const handleMidLevelFormChange = (event) => {
    const { name, value } = event.target;
    setMidLevelTaskData({
      ...midLevelTaskData,
      [name]: value
    });
  };

  // Handle form field changes for Godown Incharge tasks
  const handleGodownFormChange = (event) => {
    const { name, value } = event.target;
    setGodownTaskData({
      ...godownTaskData,
      [name]: value
    });

    // Reset dependent fields when brand or variant changes
    if (name === 'brand') {
      setGodownTaskData(prev => ({
        ...prev,
        variant: '',
        size: '',
        [name]: value
      }));
    } else if (name === 'variant') {
      setGodownTaskData(prev => ({
        ...prev,
        size: '',
        [name]: value
      }));
    }
  };

  // Handle assigned date change
  const handleAssignedDateChange = (date, taskType) => {
    if (taskType === 'marketing') {
      setMarketingTaskData({
        ...marketingTaskData,
        assignedDate: date
      });
    } else if (taskType === 'midLevel') {
      setMidLevelTaskData({
        ...midLevelTaskData,
        assignedDate: date
      });
    } else {
      setGodownTaskData({
        ...godownTaskData,
        assignedDate: date
      });
    }
  };

  // Handle deadline date change for Marketing Staff
  const handleDeadlineChange = (date) => {
    setMarketingTaskData({
      ...marketingTaskData,
      deadline: date
    });
  };

  // Add brand/variant/size to list for Godown Incharge
  const handleAddGodownItem = () => {
    if (godownTaskData.brand && godownTaskData.variant && godownTaskData.quantity) {
      const newItem = {
        brand: godownTaskData.brand,
        variant: godownTaskData.variant,
        size: godownTaskData.size || 'N/A',
        quantity: godownTaskData.quantity
      };
      
      setGodownItems([...godownItems, newItem]);
      
      // Reset form fields except assignedTo and assignedDate
      setGodownTaskData({
        ...godownTaskData,
        brand: '',
        variant: '',
        size: '',
        quantity: ''
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    let taskData;
    let isValid = true;
    let errorMessage = '';

    if (selectedStaffRole === 'Marketing Staff') {
      // Validate Marketing Staff task data
      if (!marketingTaskData.title || !marketingTaskData.assignedTo) {
        isValid = false;
        errorMessage = 'Please fill all required fields';
      }

      taskData = {
        ...marketingTaskData,
        staffRole: selectedStaffRole
      };
    } else if (selectedStaffRole === 'Mid-Level Manager') {
      // Validate Mid-Level Manager task data
      if (!midLevelTaskData.taskType || !midLevelTaskData.assignedTo) {
        isValid = false;
        errorMessage = 'Please fill all required fields';
      }

      taskData = {
        title: midLevelTaskData.taskType,
        description: midLevelTaskData.description,
        assignedTo: midLevelTaskData.assignedTo,
        staffRole: selectedStaffRole,
        assignedDate: midLevelTaskData.assignedDate.toISOString()
      };
    } else if (selectedStaffRole === 'Godown Incharge') {
      // Validate Godown Incharge task data
      if (!godownTaskData.title || !godownTaskData.assignedTo) {
        isValid = false;
        errorMessage = 'Please fill all required fields';
      }

      // If single item entry
      if (godownItems.length === 0 && godownTaskData.brand && godownTaskData.variant) {
        taskData = {
          ...godownTaskData,
          staffRole: selectedStaffRole,
          assignedDate: godownTaskData.assignedDate.toISOString()
        };
      } 
      // If multiple items added
      else if (godownItems.length > 0) {
        // Use the first item for the main task data
        const firstItem = godownItems[0];
        taskData = {
          title: godownTaskData.title,
          description: godownTaskData.description || 
            `Multiple items: ${godownItems.map(item => `${item.brand} ${item.variant} (${item.quantity})`).join(', ')}`,
          assignedTo: godownTaskData.assignedTo,
          brand: firstItem.brand,
          variant: firstItem.variant,
          size: firstItem.size,
          quantity: firstItem.quantity,
          staffRole: selectedStaffRole,
          assignedDate: godownTaskData.assignedDate.toISOString(),
          // Add items array to handle multiple items in the future
          items: godownItems.length > 1 ? godownItems.slice(1) : []
        };
      } else {
        isValid = false;
        errorMessage = 'Please add at least one product';
      }
    }

    if (!isValid) {
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await taskService.createTask(taskData);
      
      if (response.success) {
        // Add new task to the list
        setTasks([...tasks, response.data]);
        
        setSnackbar({
          open: true,
          message: 'Task created successfully',
          severity: 'success'
        });
        
        setDialogOpen(false);
      } else {
        throw new Error(response.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create task',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      
      if (response.success) {
        // Update task in the list
        setTasks(tasks.map(task => 
          task._id === taskId ? response.data : task
        ));
        
        setSnackbar({
          open: true,
          message: `Task marked as ${newStatus}`,
          severity: 'success'
        });
      } else {
        throw new Error(response.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update task',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      
      // Confirm deletion
      const confirmation = window.confirm('Are you sure you want to delete this task?');
      if (!confirmation) {
        setLoading(false);
        return;
      }
      
      // Make API call to delete the task
      const response = await taskService.deleteTask(taskId);
      
      if (response && response.success) {
        // Remove the task from the local state
        setTasks(tasks.filter(task => task._id !== taskId));
        
        setSnackbar({
          open: true,
          message: 'Task deleted successfully',
          severity: 'success'
        });
      } else {
        throw new Error(response?.error || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete task',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { color: '#B78427', bgColor: '#FFF5E6' };
      case 'In Progress':
        return { color: '#2196F3', bgColor: '#E3F2FD' };
      case 'Completed':
        return { color: '#52C41A', bgColor: '#F0FFF5' };
      default:
        return { color: 'default', bgColor: 'default' };
    }
  };

  // Render Marketing Staff form
  const renderMarketingStaffForm = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assign To</Typography>
            <FormControl fullWidth>
              <Select
                name="assignedTo"
                value={marketingTaskData.assignedTo}
                onChange={handleMarketingFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Staff Name</Typography>;
                  }
                  const selectedStaff = staffMembers.find(staff => staff._id === selected);
                  return selectedStaff ? selectedStaff.name : '';
                }}
                sx={{ borderRadius: 1 }}
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assigned Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={marketingTaskData.assignedDate}
                onChange={(date) => handleAssignedDateChange(date, 'marketing')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="MM/dd/yyyy"
                mask="__/__/____"
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Task Title</Typography>
            <TextField
              name="title"
              fullWidth
              value={marketingTaskData.title}
              onChange={handleMarketingFormChange}
              placeholder="Distributor Visit"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Distributor</Typography>
            <FormControl fullWidth>
              <Select
                name="distributorId"
                value={marketingTaskData.distributorId}
                onChange={handleMarketingFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Distributor Name</Typography>;
                  }
                  const selectedDist = distributors.find(dist => dist._id === selected);
                  return selectedDist ? selectedDist.name : '';
                }}
                sx={{ borderRadius: 1 }}
              >
                {distributors.map((distributor) => (
                  <MenuItem key={distributor._id} value={distributor._id}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Description</Typography>
            <TextField
              name="description"
              fullWidth
              multiline
              rows={4}
              value={marketingTaskData.description}
              onChange={handleMarketingFormChange}
              placeholder="Enter Description"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Deadline</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={marketingTaskData.deadline}
                onChange={handleDeadlineChange}
                renderInput={(params) => <TextField {...params} fullWidth placeholder="Enter Deadline" />}
                inputFormat="MM/dd/yyyy"
                mask="__/__/____"
              />
            </LocalizationProvider>
          </Box>
        </Grid>
      </Grid>
    );
  };

  // Render Mid-Level Manager form
  const renderMidLevelManagerForm = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assign To</Typography>
            <FormControl fullWidth>
              <Select
                name="assignedTo"
                value={midLevelTaskData.assignedTo}
                onChange={handleMidLevelFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Staff Name</Typography>;
                  }
                  const selectedStaff = staffMembers.find(staff => staff._id === selected);
                  return selectedStaff ? selectedStaff.name : '';
                }}
                sx={{ borderRadius: 1 }}
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assigned Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={midLevelTaskData.assignedDate}
                onChange={(date) => handleAssignedDateChange(date, 'midLevel')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="MM/dd/yyyy"
                mask="__/__/____"
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Task</Typography>
            <FormControl fullWidth>
              <Select
                name="taskType"
                value={midLevelTaskData.taskType}
                onChange={handleMidLevelFormChange}
                displayEmpty
                sx={{ borderRadius: 1 }}
              >
                {midLevelTaskOptions.map((task) => (
                  <MenuItem key={task} value={task}>
                    {task}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Description</Typography>
            <TextField
              name="description"
              fullWidth
              multiline
              rows={4}
              value={midLevelTaskData.description}
              onChange={handleMidLevelFormChange}
              placeholder="Enter Description"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  // Render Godown Incharge form
  const renderGodownInchargeForm = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assign To</Typography>
            <FormControl fullWidth>
              <Select
                name="assignedTo"
                value={godownTaskData.assignedTo}
                onChange={handleGodownFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Staff Name</Typography>;
                  }
                  const selectedStaff = staffMembers.find(staff => staff._id === selected);
                  return selectedStaff ? selectedStaff.name : '';
                }}
                sx={{ borderRadius: 1 }}
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff._id} value={staff._id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Assigned Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={godownTaskData.assignedDate}
                onChange={(date) => handleAssignedDateChange(date, 'godown')}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="MM/dd/yyyy"
                mask="__/__/____"
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Title</Typography>
            <TextField
              name="title"
              fullWidth
              value={godownTaskData.title}
              onChange={handleGodownFormChange}
              placeholder="Order Dispatch"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Brand</Typography>
            <FormControl fullWidth>
              <Select
                name="brand"
                value={godownTaskData.brand}
                onChange={handleGodownFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Brand Name</Typography>;
                  }
                  return selected;
                }}
                sx={{ borderRadius: 1 }}
              >
                {Object.keys(productOptions).map((brand) => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Variant</Typography>
            <FormControl fullWidth disabled={!godownTaskData.brand}>
              <Select
                name="variant"
                value={godownTaskData.variant}
                onChange={handleGodownFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Variant Name</Typography>;
                  }
                  return selected;
                }}
                sx={{ borderRadius: 1 }}
              >
                {godownTaskData.brand && productOptions[godownTaskData.brand].variants.map((variant) => (
                  <MenuItem key={variant} value={variant}>{variant}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Size</Typography>
            <FormControl fullWidth disabled={!godownTaskData.variant}>
              <Select
                name="size"
                value={godownTaskData.size}
                onChange={handleGodownFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Brand Name</Typography>;
                  }
                  return selected;
                }}
                sx={{ borderRadius: 1 }}
              >
                {godownTaskData.brand && godownTaskData.variant && 
                  productOptions[godownTaskData.brand].sizes[godownTaskData.variant].map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Enter quantity</Typography>
            <FormControl fullWidth>
              <Select
                name="quantity"
                value={godownTaskData.quantity}
                onChange={handleGodownFormChange}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return <Typography color="text.secondary">Select Brand Name</Typography>;
                  }
                  return selected;
                }}
                sx={{ borderRadius: 1 }}
                input={
                  <TextField
                    name="quantity"
                    type="number"
                    value={godownTaskData.quantity}
                    onChange={handleGodownFormChange}
                    fullWidth
                    placeholder="Enter quantity"
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                  />
                }
              />
            </FormControl>
          </Box>
        </Grid>
        
        {godownItems.length > 0 && (
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Brand</TableCell>
                    <TableCell>Variant</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {godownItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell>{item.variant}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}
        
        {godownTaskData.brand && godownTaskData.variant && godownTaskData.quantity && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={handleAddGodownItem}
                startIcon={<AddIcon />}
                sx={{ mr: 1 }}
              >
                Add Brand
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleAddGodownItem}
                startIcon={<AddIcon />}
              >
                Add Variant
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    );
  };

  // Inside the Tasks component
  // Add a function to render the task assignee information
  const renderAssignee = (task) => {
    if (task.assignedTo && task.assignedTo.name) {
      return task.assignedTo.name;
    } else if (task.externalAssignee && task.externalAssignee.name) {
      return `${task.externalAssignee.name} ${task.externalAssignee.isExternalUser ? '(External)' : ''}`;
    } else {
      return 'Unassigned';
    }
  };

  // Handle internal task dialog open
  const handleInternalTaskDialogOpen = () => {
    setInternalTaskData({
      taskDetail: '',
      assignTo: '',
      isOtherUser: false,
      otherUserName: ''
    });
    setInternalTaskDialogOpen(true);
  };

  // Handle internal task dialog close
  const handleInternalTaskDialogClose = () => {
    setInternalTaskDialogOpen(false);
  };

  // Handle internal task form change
  const handleInternalTaskFormChange = (event) => {
    const { name, value } = event.target;
    setInternalTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle internal task other user toggle
  const handleInternalTaskOtherUserToggle = (event) => {
    const checked = event.target.checked;
    setInternalTaskData(prev => ({
      ...prev,
      isOtherUser: checked,
      // Clear assignTo if switching to other user
      assignTo: checked ? '' : prev.assignTo,
      // Clear otherUserName if switching to system user
      otherUserName: !checked ? '' : prev.otherUserName
    }));
  };

  // Handle staff member filter change
  const handleStaffMemberFilterChange = (event) => {
    setSelectedStaffMember(event.target.value);
    // Reload tasks with the new filter
    fetchTasksWithFilters(filterStatus, event.target.value, taskType);
  };

  // Fetch tasks with filters
  const fetchTasksWithFilters = async (status = 'all', staffMember = 'all', type = 'all') => {
    setLoading(true);
    try {
      // Build filter object
      const filters = {};
      
      if (status !== 'all') {
        filters.status = status;
      }
      
      if (staffMember !== 'all') {
        filters.assignedTo = staffMember;
      }
      
      if (type) {
        filters.type = type;
      }
      
      // If in the internal tasks tab, only show tasks created by Marketing Staff or App Developers
      if (activeTab === 1) {
        filters.creatorRole = ['Marketing Staff', 'App Developer'];
        filters.type = 'internal';
        console.log("Internal Tasks tab - Using filters:", JSON.stringify(filters));
      } else if (selectedStaffRole !== 'all') {
        filters.staffRole = selectedStaffRole;
      }
      
      // Use the taskService to get filtered tasks
      const response = await taskService.getTasks(filters);
      
      if (response.success) {
        console.log(`Received ${response.data.length} tasks`);
        setTasks(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch tasks: ' + (error.response?.data?.error || error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit internal task
  const handleInternalTaskSubmit = async () => {
    try {
      // Validate form
      if (internalTaskData.taskDetail.trim() === '') {
        setSnackbar({
          open: true,
          message: 'Task detail is required',
          severity: 'error'
        });
        return;
      }

      if (internalTaskData.isOtherUser && internalTaskData.otherUserName.trim() === '') {
        setSnackbar({
          open: true,
          message: 'Other user name is required',
          severity: 'error'
        });
        return;
      }

      if (!internalTaskData.isOtherUser && !internalTaskData.assignTo) {
        setSnackbar({
          open: true,
          message: 'Please select a user to assign the task',
          severity: 'error'
        });
        return;
      }

      setLoading(true);
      
      // Create payload
      const payload = {
        taskDetail: internalTaskData.taskDetail,
        isOtherUser: internalTaskData.isOtherUser
      };

      // Add appropriate assignee field based on user type
      if (internalTaskData.isOtherUser) {
        payload.otherUserName = internalTaskData.otherUserName;
      } else {
        payload.assignTo = internalTaskData.assignTo;
      }

      // Send API request using the taskService
      const response = await taskService.createInternalTask(payload);
      
      if (response.success) {
        // Close dialog
        setInternalTaskDialogOpen(false);
        
        // Set to internal tasks tab
        setActiveTab(1);
        
        // Refresh tasks with correct filters for internal tasks tab
        fetchTasksWithFilters(filterStatus, selectedStaffMember, 'internal');
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Internal task created successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error creating internal task:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create internal task: ' + (error.response?.data?.error || error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render internal task form dialog
  const renderInternalTaskForm = () => {
    return (
      <Dialog open={internalTaskDialogOpen} onClose={handleInternalTaskDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Create Internal Task</DialogTitle>
        <DialogContent>
          <Box mb={2} mt={2}>
            <TextField
              fullWidth
              label="Task Detail"
              name="taskDetail"
              value={internalTaskData.taskDetail}
              onChange={handleInternalTaskFormChange}
              multiline
              rows={3}
              required
              placeholder="Please visit tomorrow Moti Nagar for review."
            />
          </Box>
          
          <Box mb={2} display="flex" alignItems="center">
            <Typography variant="body1" mr={2}>
              Assign to other user not in the system?
            </Typography>
            <Switch 
              checked={internalTaskData.isOtherUser}
              onChange={handleInternalTaskOtherUserToggle}
              color="primary"
            />
          </Box>
          
          {internalTaskData.isOtherUser ? (
            <Box mb={2}>
              <TextField
                fullWidth
                label="Other User Name"
                name="otherUserName"
                value={internalTaskData.otherUserName}
                onChange={handleInternalTaskFormChange}
                required
                placeholder="Naman"
              />
            </Box>
          ) : (
            <Box mb={2}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  name="assignTo"
                  value={internalTaskData.assignTo}
                  onChange={handleInternalTaskFormChange}
                  label="Assign To"
                  required
                >
                  {allUsers.map(user => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInternalTaskDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleInternalTaskSubmit} color="primary" variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render View Task Modal
  const renderViewTaskModal = () => {
    if (!selectedTask) return null;
    
    return (
      <Dialog open={viewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.light', py: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            Task Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseViewModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[700],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Header section with title and status */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                      {selectedTask.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                    <Chip 
                      label={selectedTask.status} 
                      color={getStatusColor(selectedTask.status).color}
                      sx={{ 
                        backgroundColor: getStatusColor(selectedTask.status).bgColor,
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        px: 1
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Description section */}
            {selectedTask.description && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                    {selectedTask.description}
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {/* Main information section */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 0, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" sx={{ width: '30%', fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          Assigned To
                        </TableCell>
                        <TableCell>{renderAssignee(selectedTask)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          Created By
                        </TableCell>
                        <TableCell>{selectedTask.createdBy ? selectedTask.createdBy.name : 'Unknown'}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          Created On
                        </TableCell>
                        <TableCell>{formatDate(selectedTask.createdAt)}</TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                          Staff Role
                        </TableCell>
                        <TableCell>{selectedTask.staffRole}</TableCell>
                      </TableRow>
                      
                      {selectedTask.distributorId && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            Distributor
                          </TableCell>
                          <TableCell>{selectedTask.distributorId.name}</TableCell>
                        </TableRow>
                      )}
                      
                      {selectedTask.deadline && (
                        <TableRow>
                          <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                            Deadline
                          </TableCell>
                          <TableCell>{formatDate(selectedTask.deadline)}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
            
            {/* Godown Incharge specific details */}
            {selectedTask.staffRole === 'Godown Incharge' && selectedTask.brand && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Product Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Brand</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedTask.brand}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Variant</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedTask.variant}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Size</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedTask.size || 'N/A'}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">Quantity</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{selectedTask.quantity}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
            
            {/* Items list for Godown Incharge tasks */}
            {selectedTask.items && selectedTask.items.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                    Additional Items
                  </Typography>
                  <TableContainer sx={{ border: '1px solid rgba(224, 224, 224, 1)', borderRadius: 1 }}>
                    <Table size="medium">
                      <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Brand</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Variant</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTask.items.map((item, index) => (
                          <TableRow key={index} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>{item.variant}</TableCell>
                            <TableCell>{item.size || 'N/A'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
            
            {/* Report section */}
            {selectedTask.report && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Report
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
                    {selectedTask.report}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleCloseViewModal} variant="outlined" startIcon={<CloseIcon />}>
            Close
          </Button>
          {selectedTask.status !== 'Completed' && (
            <Button
              variant="contained"
              color="primary" 
              onClick={() => {
                handleStatusChange(selectedTask._id, 'Completed');
                handleCloseViewModal();
              }}
              startIcon={<CheckIcon />}
            >
              Mark as Completed
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  };

  // Render internal tasks tab content
  const renderInternalTasksTab = () => {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Internal Tasks</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleInternalTaskDialogOpen}
          >
            Create Internal Task
        </Button>
      </Box>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <FilterIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Staff Member</InputLabel>
                <Select
                  value={selectedStaffMember}
                  onChange={handleStaffMemberFilterChange}
                  label="Staff Member"
                >
                  <MenuItem value="all">All Staff</MenuItem>
                  {allUsers.filter(user => user.role === 'Marketing Staff').map(staff => (
                    <MenuItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 2 }}>
              Note: This tab only shows tasks created by Marketing Staff or App Developers
            </Typography>
          </Grid>
        </Paper>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : tasks.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task._id}>
                      <TableCell>
                      <Typography variant="subtitle2">{task.title}</Typography>
                      {task.description && (
                        <Typography variant="caption" color="textSecondary">
                          {task.description}
                        </Typography>
                      )}
                      </TableCell>
                      <TableCell>
                      {renderAssignee(task)}
                      </TableCell>
                      <TableCell>
                      {task.createdBy ? task.createdBy.name : 'Unknown'}
                      </TableCell>
                      <TableCell>
                            <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status).color}
                        sx={{ backgroundColor: getStatusColor(task.status).bgColor }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(task.createdAt)}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {getRelativeTime(task.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Tooltip title="View Details">
                          <IconButton
                              size="small" 
                              color="primary" 
                            onClick={() => handleViewTask(task)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        {task.status !== 'Completed' && (
                          <Tooltip title="Mark as Completed">
                            <IconButton
                                size="small" 
                              color="success"
                              onClick={() => handleStatusChange(task._id, 'Completed')}
                              sx={{ mr: 1 }}
                            >
                              <CheckIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Delete Task">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeleteTask(task._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                          </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              No tasks found matching the current filters.
            </Typography>
          </Paper>
        )}
      </Box>
    );
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Task Management
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="All Tasks" />
            <Tab label="Internal Tasks (Marketing Staff & App Developer)" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">All Tasks</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleDialogOpen}
              >
                Create Task
              </Button>
            </Box>
            
            {/* Task filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={handleFilterChange}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Staff Role</InputLabel>
                    <Select
                      value={selectedStaffRole}
                      onChange={handleStaffRoleChange}
                      label="Staff Role"
                    >
                      <MenuItem value="Marketing Staff">Marketing Staff</MenuItem>
                      <MenuItem value="Godown Incharge">Godown Incharge</MenuItem>
                      <MenuItem value="Mid-Level Manager">Mid-Level Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Task Type</InputLabel>
                    <Select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value)}
                      label="Task Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="internal">System Users</MenuItem>
                      <MenuItem value="external">External Users</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Task list */}
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : tasks.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Deadline</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map(task => (
                      <TableRow key={task._id}>
                        <TableCell>
                          <Typography variant="subtitle2">{task.title}</Typography>
                          <Typography variant="caption" color="textSecondary">{task.description}</Typography>
                      </TableCell>
                      <TableCell>
                          {renderAssignee(task)}
                        </TableCell>
                        <TableCell>
                          {task.externalAssignee?.isExternalUser ? 'External' : 'System'} User
                      </TableCell>
                      <TableCell>
                        <Chip 
                            label={task.status} 
                            color={getStatusColor(task.status).color}
                            sx={{ backgroundColor: getStatusColor(task.status).bgColor }}
                        />
                      </TableCell>
                      <TableCell>
                          {task.deadline ? formatDate(task.deadline) : 'No deadline'}
                      </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatDate(task.createdAt)}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getRelativeTime(task.createdAt)}
                      </Typography>
                    </TableCell>
                        <TableCell>
                          <Box>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleViewTask(task)}
                                sx={{ mr: 1 }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {task.status !== 'Completed' && (
                              <Tooltip title="Mark as Completed">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleStatusChange(task._id, 'Completed')}
                                  sx={{ mr: 1 }}
                                >
                                  <CheckIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            <Tooltip title="Delete Task">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteTask(task._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No tasks found matching the current filters.
                </Typography>
      </Paper>
            )}
          </>
        ) : (
          renderInternalTasksTab()
        )}
      </Box>
      
      {/* Create Task Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mb: 2, mt: 1 }}>
            <RadioGroup
              row
                value={selectedStaffRole}
                onChange={handleStaffRoleChange}
            >
              <FormControlLabel value="Marketing Staff" control={<Radio />} label="Marketing Staff" />
              <FormControlLabel value="Godown Incharge" control={<Radio />} label="Godown Incharge" />
              <FormControlLabel value="Mid-Level Manager" control={<Radio />} label="Mid-Level Manager" />
            </RadioGroup>
            </FormControl>
          
          {selectedStaffRole === 'Marketing Staff' && renderMarketingStaffForm()}
          {selectedStaffRole === 'Mid-Level Manager' && renderMidLevelManagerForm()}
          {selectedStaffRole === 'Godown Incharge' && renderGodownInchargeForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Internal Task Dialog */}
      {renderInternalTaskForm()}
      
      {/* View Task Modal */}
      {renderViewTaskModal()}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Tasks;