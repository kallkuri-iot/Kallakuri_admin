import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { distributorService } from '../../services/api';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const EditDistributor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    addressLine1: '',
    addressLine2: '',
    contact: '',
    phoneNumber: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch distributor data on component mount
  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        setFetchLoading(true);
        const response = await distributorService.getDistributorById(id);
        
        if (response.success) {
          const distributor = response.data;
          
          // Parse address into addressLine1 and addressLine2
          let addressLine1 = distributor.address;
          let addressLine2 = '';
          
          if (distributor.address && distributor.address.includes(',')) {
            const addressParts = distributor.address.split(',');
            addressLine1 = addressParts[0];
            addressLine2 = addressParts.slice(1).join(',').trim();
          }
          
          setFormData({
            name: distributor.name || '',
            shopName: distributor.shopName || '',
            addressLine1: addressLine1 || '',
            addressLine2: addressLine2 || '',
            contact: distributor.contact || '',
            phoneNumber: distributor.phoneNumber || ''
          });
        } else {
          throw new Error(response.error || 'Failed to fetch distributor details');
        }
      } catch (error) {
        console.error('Error fetching distributor:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Failed to fetch distributor details',
          severity: 'error'
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate(`/distributors/${id}`);
        }, 1500);
      } finally {
        setFetchLoading(false);
      }
    };
    
    fetchDistributor();
  }, [id, navigate]);

  // Handle form field changes
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.addressLine1) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    // Prepare data for API
    const distributorData = {
      name: formData.name,
      shopName: formData.shopName,
      contact: formData.contact || '0000000000', // Default value if empty
      phoneNumber: formData.phoneNumber || '',
      address: `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}`
    };
    
    // Submit data to API
    setLoading(true);
    try {
      const response = await distributorService.updateDistributor(id, distributorData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Distributor updated successfully',
          severity: 'success'
        });
        
        // Navigate back after a short delay
        setTimeout(() => {
          navigate(`/distributors/${id}`);
        }, 1500);
      } else {
        throw new Error(response.error || 'Failed to update distributor');
      }
    } catch (error) {
      console.error('Error updating distributor:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update distributor',
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

  const handleBackClick = () => {
    navigate(`/distributors/${id}`);
  };

  if (fetchLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={handleBackClick} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center" sx={{ flexGrow: 1, mr: 6 }}>
            Edit Distributor
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Distributor Name*
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Distributor Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                variant="outlined"
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Distributor Shop Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleFormChange}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Contact Number*
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleFormChange}
                variant="outlined"
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Phone Number
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Address*
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleFormChange}
                variant="outlined"
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Address Line 2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleFormChange}
                variant="outlined"
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  bgcolor: '#B78427',
                  px: 4, 
                  py: 1.5, 
                  borderRadius: 50, 
                  width: { xs: '100%', sm: 'auto', minWidth: '300px' }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Distributor'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditDistributor; 