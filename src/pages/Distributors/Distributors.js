import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { distributorService } from '../../services/api';

const Distributors = () => {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDistributors: 0,
    totalRetailShops: 0
  });
  
  const navigate = useNavigate();

  // Fetch distributors on component mount
  useEffect(() => {
    fetchDistributors();
  }, []);

  // Function to fetch distributors from API
  const fetchDistributors = async () => {
    setLoading(true);
    try {
      const response = await distributorService.getAllDistributors();
      if (response.success) {
        setDistributors(response.data);
        
        // Calculate stats
        let retailShopCount = 0;
        response.data.forEach(distributor => {
          if (distributor.retailShops) {
            retailShopCount += distributor.retailShops.length;
          }
        });
        
        setStats({
          totalDistributors: response.data.length,
          totalRetailShops: retailShopCount
        });
      } else {
        setError(response.error || 'Failed to load distributors');
      }
    } catch (error) {
      console.error('Error fetching distributors:', error);
      setError(error.message || 'Failed to load distributors');
    } finally {
      setLoading(false);
    }
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filtered distributors based on search
  const filteredDistributors = distributors.filter(
    distributor => 
      distributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distributor.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add distributor
  const handleAddDistributor = () => {
    navigate('/distributors/add');
  };

  // Handle distributor click
  const handleDistributorClick = (id) => {
    navigate(`/distributors/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
        Manage Distributors
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Total Distributor
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: '#B78427', fontWeight: 'bold' }}>
                {stats.totalDistributors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +12% then last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Total Retail Shops
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: '#B78427', fontWeight: 'bold' }}>
                {stats.totalRetailShops}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +11% then last week
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Distributors Section */}
      <Typography variant="h5" component="h2" fontWeight="bold" mb={2}>
        Distributors
      </Typography>

      {/* Search and Add Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search for anything..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#f5f5f5' }
          }}
          sx={{ width: '70%' }}
        />
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDistributor}
          sx={{ bgcolor: '#B78427' }}
        >
          Add Distributor
        </Button>
      </Box>

      {/* Distributors List */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : filteredDistributors.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>No distributors found</Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {filteredDistributors.map((distributor, index) => (
              <React.Fragment key={distributor._id}>
                <ListItem 
                  button 
                  onClick={() => handleDistributorClick(distributor._id)}
                  sx={{ py: 2 }}
                >
                  <Box sx={{ width: '100%', p: 2 }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {distributor.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {distributor.shopName || 'No shop name provided'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LocationIcon fontSize="small" sx={{ color: '#B78427', mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {distributor.address}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {index < filteredDistributors.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Distributors; 