import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  FormHelperText,
  IconButton
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as damageClaimService from '../../services/api/damageClaimService';

function NewDamageClaim() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [formData, setFormData] = useState({
    distributorId: '',
    brand: '',
    variant: '',
    size: '',
    pieces: 1,
    manufacturingDate: null,
    batchDetails: '',
    damageType: '',
    reason: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  // Fetch distributors on component mount
  useEffect(() => {
    fetchDistributors();
  }, []);

  // Fetch distributors for the form
  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const response = await damageClaimService.getDistributorsForDamageClaims();
      if (response.success) {
        setDistributors(response.data);
      }
    } catch (error) {
      console.error('Error fetching distributors:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load distributors: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'pieces' ? parseInt(value, 10) || '' : value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      manufacturingDate: date
    });
    
    // Clear error for this field if it exists
    if (errors.manufacturingDate) {
      setErrors({
        ...errors,
        manufacturingDate: ''
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    e.preventDefault();
    
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 5 images
    if (imageFiles.length + files.length > 5) {
      setSnackbar({
        open: true,
        message: 'You can upload a maximum of 5 images',
        severity: 'warning'
      });
      return;
    }
    
    // Create preview URLs
    const newImageFiles = [...imageFiles];
    const newImagePreviewUrls = [...imagePreviewUrls];
    
    files.forEach(file => {
      newImageFiles.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviewUrls.push(reader.result);
        setImagePreviewUrls([...newImagePreviewUrls]);
      };
      reader.readAsDataURL(file);
    });
    
    setImageFiles(newImageFiles);
    
    // Clear error for this field if it exists
    if (errors.images) {
      setErrors({
        ...errors,
        images: ''
      });
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newImageFiles = [...imageFiles];
    const newImagePreviewUrls = [...imagePreviewUrls];
    
    newImageFiles.splice(index, 1);
    newImagePreviewUrls.splice(index, 1);
    
    setImageFiles(newImageFiles);
    setImagePreviewUrls(newImagePreviewUrls);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.distributorId) newErrors.distributorId = 'Distributor is required';
    if (!formData.brand) newErrors.brand = 'Brand is required';
    if (!formData.variant) newErrors.variant = 'Variant is required';
    if (!formData.size) newErrors.size = 'Size is required';
    if (!formData.pieces || formData.pieces < 1) newErrors.pieces = 'At least 1 piece is required';
    if (!formData.manufacturingDate) newErrors.manufacturingDate = 'Manufacturing date is required';
    if (!formData.batchDetails) newErrors.batchDetails = 'Batch details are required';
    if (!formData.damageType) newErrors.damageType = 'Damage type is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields correctly',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create form data for multipart/form-data submission
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && key !== 'manufacturingDate') {
          submitData.append(key, formData[key]);
        }
      });
      
      // Add manufacturing date in ISO format
      if (formData.manufacturingDate) {
        submitData.append('manufacturingDate', formData.manufacturingDate.toISOString());
      }
      
      // Add images
      imageFiles.forEach(file => {
        submitData.append('images', file);
      });
      
      // Submit the form
      const response = await damageClaimService.createDamageClaim(submitData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Damage claim submitted successfully',
          severity: 'success'
        });
        
        // Redirect to damage claims list after a short delay
        setTimeout(() => {
          navigate('/damage-claims');
        }, 1500);
      }
    } catch (error) {
      console.error('Error submitting damage claim:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit damage claim: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Submit New Damage Claim
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Distributor */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.distributorId}>
                  <InputLabel>Distributor *</InputLabel>
                  <Select
                    name="distributorId"
                    value={formData.distributorId}
                    onChange={handleChange}
                    label="Distributor *"
                  >
                    {distributors.map(distributor => (
                      <MenuItem key={distributor._id} value={distributor._id}>
                        {distributor.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.distributorId && <FormHelperText>{errors.distributorId}</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Brand */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Brand *"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  error={!!errors.brand}
                  helperText={errors.brand}
                />
              </Grid>
              
              {/* Variant */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Variant *"
                  name="variant"
                  value={formData.variant}
                  onChange={handleChange}
                  error={!!errors.variant}
                  helperText={errors.variant}
                />
              </Grid>
              
              {/* Size */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size *"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  error={!!errors.size}
                  helperText={errors.size}
                />
              </Grid>
              
              {/* Pieces */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Number of Pieces *"
                  name="pieces"
                  type="number"
                  value={formData.pieces}
                  onChange={handleChange}
                  inputProps={{ min: 1 }}
                  error={!!errors.pieces}
                  helperText={errors.pieces}
                />
              </Grid>
              
              {/* Manufacturing Date */}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Manufacturing Date *"
                    value={formData.manufacturingDate}
                    onChange={handleDateChange}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.manufacturingDate}
                        helperText={errors.manufacturingDate}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
              
              {/* Batch Details */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Batch Details *"
                  name="batchDetails"
                  value={formData.batchDetails}
                  onChange={handleChange}
                  error={!!errors.batchDetails}
                  helperText={errors.batchDetails}
                />
              </Grid>
              
              {/* Damage Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.damageType}>
                  <InputLabel>Damage Type *</InputLabel>
                  <Select
                    name="damageType"
                    value={formData.damageType}
                    onChange={handleChange}
                    label="Damage Type *"
                  >
                    <MenuItem value="Box Damage">Box Damage</MenuItem>
                    <MenuItem value="Product Damage">Product Damage</MenuItem>
                    <MenuItem value="Seal Broken">Seal Broken</MenuItem>
                    <MenuItem value="Expiry Date Issue">Expiry Date Issue</MenuItem>
                    <MenuItem value="Quality Issue">Quality Issue</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {errors.damageType && <FormHelperText>{errors.damageType}</FormHelperText>}
                </FormControl>
              </Grid>
              
              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Damage *"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  error={!!errors.reason}
                  helperText={errors.reason}
                />
              </Grid>
              
              {/* Image Upload */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Damage Images (Max 5)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    sx={{ mr: 2 }}
                  >
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Typography variant="caption" color="textSecondary">
                    {imageFiles.length} of 5 images uploaded
                  </Typography>
                </Box>
                
                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    {imagePreviewUrls.map((url, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 100,
                          height: 100,
                          border: '1px solid #ddd',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <PhotoCamera />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
              
              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Claim'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/damage-claims')}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
      
      {/* Snackbar */}
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

export default NewDamageClaim; 