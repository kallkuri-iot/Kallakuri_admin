import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  InputAdornment,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  BarChart as ChartIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { distributorService, taskService, supplyEstimateService } from '../../services/api';

const DistributorDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [distributor, setDistributor] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shopFilter, setShopFilter] = useState('all');
  const [stockEstimates, setStockEstimates] = useState([]);
  const [addShopMenuAnchorEl, setAddShopMenuAnchorEl] = useState(null);
  
  useEffect(() => {
    const fetchDistributorData = async () => {
      try {
        setLoading(true);
        
        // Fetch distributor details with shop information
        const distributorResponse = await distributorService.getDistributorDetails(id);
        if (distributorResponse.success) {
          setDistributor(distributorResponse.data);
          
          // Fetch tasks related to this distributor
          const tasksResponse = await taskService.getAllTasks({});
          if (tasksResponse.success) {
            // Filter tasks related to this distributor
            const relatedTasks = tasksResponse.data.filter(task => 
              task.distributorId === id
            );
            setTasks(relatedTasks);
          }
          
          // Fetch supply estimates for this distributor
          try {
            const estimatesResponse = await supplyEstimateService.getEstimatesByDistributor(id);
            if (estimatesResponse.success) {
              setStockEstimates(estimatesResponse.data || []);
            }
          } catch (estimateError) {
            console.error('Error fetching supply estimates:', estimateError);
          }
        } else {
          setError(distributorResponse.error || 'Failed to load distributor details');
          setTimeout(() => navigate('/distributors'), 3000);
        }
      } catch (err) {
        console.error('Error fetching distributor details:', err);
        setError(err.message || 'Failed to load distributor details');
        setTimeout(() => navigate('/distributors'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDistributorData();
  }, [id, navigate]);

  const handleBackClick = () => {
    navigate('/distributors');
  };

  const handleAddShopMenuOpen = (event) => {
    setAddShopMenuAnchorEl(event.currentTarget);
  };

  const handleAddShopMenuClose = () => {
    setAddShopMenuAnchorEl(null);
  };

  const handleAddRetailShop = () => {
    handleAddShopMenuClose();
    navigate(`/distributors/${id}/add-shop`);
  };
  
  const handleAddWholesaleShop = () => {
    handleAddShopMenuClose();
    navigate(`/distributors/${id}/add-wholesale-shop`);
  };
  
  const handleEditDistributor = () => {
    navigate(`/distributors/${id}/edit`);
  };
  
  const handleViewStockEstimate = () => {
    // Navigate to stock estimate or open a modal
    console.log('View stock estimate clicked');
  };

  const handleShopFilterChange = (event) => {
    setShopFilter(event.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'pending':
      case 'assigned':
        return 'warning';
      case 'In Progress':
      case 'in progress':
      case 'active':
        return 'info';
      case 'Completed':
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/distributors')}>
          Back to Distributors
        </Button>
      </Container>
    );
  }

  if (!distributor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Distributor not found. Redirecting to distributors list...</Alert>
      </Container>
    );
  }
  
  // Filter shops based on selected filter
  let filteredShops = [];
  if (distributor) {
    if (shopFilter === 'all') {
      // Check if the data structure includes shops.retailShops for the new API
      if (distributor.shops) {
        filteredShops = [...(distributor.shops.retailShops || []), ...(distributor.shops.wholesaleShops || [])];
      } else {
        // Fallback to old structure
        filteredShops = [...(distributor.retailShops || []), ...(distributor.wholesaleShops || [])];
      }
    } else if (shopFilter === 'retail') {
      // Check for new structure
      if (distributor.shops) {
        filteredShops = distributor.shops.retailShops || [];
      } else {
        // Fallback to old structure
        filteredShops = distributor.retailShops || [];
      }
    } else {
      // Wholesale filter
      if (distributor.shops) {
        filteredShops = distributor.shops.wholesaleShops || [];
      } else {
        // Fallback to old structure
        filteredShops = distributor.wholesaleShops || [];
      }
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back button and Distributor Name */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {distributor.name}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEditDistributor}
          sx={{ bgcolor: '#4CAF50', mr: 2 }}
        >
          Edit
        </Button>
      </Box>

      {/* Distributor Info Card */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              Distributor Name:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {distributor.name}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              Shop Name:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {distributor.shopName || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              Address:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {distributor.address || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              Contact:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {distributor.contact || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="medium">
              Phone Number:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {distributor.phoneNumber || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Total Retail Shops
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: '#B78427', fontWeight: 'bold' }}>
                {distributor.retailShopCount || 
                 (distributor.shops ? distributor.shops.retailShops.length : 
                 (distributor.retailShops ? distributor.retailShops.length : 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +11% then last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Total Whole Sellers
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: '#B78427', fontWeight: 'bold' }}>
                {distributor.wholesaleShopCount || 
                 (distributor.shops ? distributor.shops.wholesaleShops.length : 
                 (distributor.wholesaleShops ? distributor.wholesaleShops.length : 0))}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +11% then last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Initial Stock Estimate Button */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          onClick={handleViewStockEstimate}
          sx={{ bgcolor: '#B78427', '&:hover': { bgcolor: '#9c7022' } }}
        >
          See Initial Stock Estimate and Rate
        </Button>
      </Box>

      {/* Retail shops & Whole sellers section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
          Retail shops & Whole sellers
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <RadioGroup
            row
            name="shop-filter"
            value={shopFilter}
            onChange={handleShopFilterChange}
          >
            <FormControlLabel 
              value="all" 
              control={<Radio sx={{ 
                '&.Mui-checked': { color: '#B78427' } 
              }} />} 
              label="All" 
            />
            <FormControlLabel 
              value="retail" 
              control={<Radio />} 
              label="Retail Shops" 
            />
            <FormControlLabel 
              value="wholesale" 
              control={<Radio />} 
              label="Whole sellers" 
            />
          </RadioGroup>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ width: '70%' }}>
            <TextField
              placeholder="Search for anything..."
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: '#f5f5f5' }
              }}
            />
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            endIcon={<ArrowDropDownIcon />}
            onClick={handleAddShopMenuOpen}
            sx={{ bgcolor: '#B78427' }}
          >
            Add Shop
          </Button>
          <Menu
            anchorEl={addShopMenuAnchorEl}
            open={Boolean(addShopMenuAnchorEl)}
            onClose={handleAddShopMenuClose}
          >
            <MenuItem onClick={handleAddRetailShop}>Add Retail Shop</MenuItem>
            <MenuItem onClick={handleAddWholesaleShop}>Add Wholesale Shop</MenuItem>
          </Menu>
        </Box>
        
        {/* Shops Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shop Name</TableCell>
                <TableCell>Owner Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShops.length > 0 ? (
                filteredShops.map((shop, index) => (
                  <TableRow key={index}>
                    <TableCell>{shop.shopName || shop.name}</TableCell>
                    <TableCell>{shop.ownerName}</TableCell>
                    <TableCell>{shop.address}</TableCell>
                    <TableCell>
                      {shop.type || 
                        (shopFilter === 'retail' ? 'Retail Shop' : 
                         shopFilter === 'wholesale' ? 'Wholesale Shop' : 
                         (shop.shopName && distributor.retailShops?.some(rs => rs.shopName === shop.shopName) ? 'Retail Shop' : 'Wholesale Shop'))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No shops found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Tasks Table */}
      <Typography variant="h5" component="h2" fontWeight="bold" mt={4} mb={2}>
        Associated Tasks
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Staff Role</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {task.assignedTo && task.assignedTo.name ? task.assignedTo.name.charAt(0) : 'U'}
                      </Avatar>
                      {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
                    </Box>
                  </TableCell>
                  <TableCell>{task.staffRole || 'N/A'}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status)}
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No tasks assigned to this distributor
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DistributorDetails; 