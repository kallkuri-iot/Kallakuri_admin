import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { distributorService } from '../../services/api';

const AddWholesaleShop = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    shopName: '',
    addressLine1: '',
    addressLine2: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
    if (!formData.ownerName || !formData.shopName || !formData.addressLine1) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare shop data
      const shopData = {
        shopName: formData.shopName,
        ownerName: formData.ownerName,
        address: `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}`
      };
      
      // Call API to add wholesale shop
      const response = await distributorService.addWholesaleShop(id, shopData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Wholesale shop added successfully',
          severity: 'success'
        });
        
        // Navigate back to distributor details after a short delay
        setTimeout(() => {
          navigate(`/distributors/${id}`);
        }, 1500);
      } else {
        throw new Error(response.error || 'Failed to add wholesale shop');
      }
    } catch (error) {
      console.error('Error adding wholesale shop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to add wholesale shop',
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ borderRadius: 4, overflow: 'hidden', p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" mb={4} textAlign="center">
          Add Wholesale Shop
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Shop Owner Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Owner Name"
                name="ownerName"
                value={formData.ownerName}
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

            <Grid item xs={12}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Wholesale Shop Name
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Shop Name"
                name="shopName"
                value={formData.shopName}
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

            <Grid item xs={12}>
              <Typography variant="body1" component="p" sx={{ mb: 1 }}>
                Address
              </Typography>
              <TextField
                fullWidth
                placeholder="Address Line 1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleFormChange}
                variant="outlined"
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Shop'}
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

export default AddWholesaleShop; 