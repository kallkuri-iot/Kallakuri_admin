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
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  LocalShipping as LocalShippingIcon 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { salesInquiryService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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

// Visit purpose options
const visitPurposeOptions = ['Distributor Search', 'Collection', 'Others'];

function SalesInquiries() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [newInquiry, setNewInquiry] = useState({
    distributorName: '',
    products: [{ brand: '', variant: '', size: '', quantity: 1 }],
    visitPurpose: '',
    otherReason: '',
    area: ''
  });
  const [assignForm, setAssignForm] = useState({
    assignedTo: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    distributorName: 'all'
  });

  useEffect(() => {
    fetchInquiries();
    fetchDistributors();
  }, []);

  // Fetch all inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await salesInquiryService.getAllSalesInquiries(filters);
      setInquiries(response.data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load sales inquiries',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch distributors for dropdown
  const fetchDistributors = async () => {
    try {
      const response = await salesInquiryService.getDistributorsForSalesInquiries();
      setDistributors(response.data || []);
    } catch (error) {
      console.error('Error fetching distributors:', error);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = () => {
    fetchInquiries();
  };

  // Handle dialog open
  const handleDialogOpen = () => {
    setNewInquiry({
      distributorName: '',
      products: [{ brand: '', variant: '', size: '', quantity: 1 }],
      visitPurpose: '',
      otherReason: '',
      area: ''
    });
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  // Handle new inquiry form change
  const handleInquiryFormChange = (e) => {
    const { name, value } = e.target;
    setNewInquiry({
      ...newInquiry,
      [name]: value
    });
  };

  // Handle product form change
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newInquiry.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };

    // Reset dependent fields if brand or variant changes
    if (field === 'brand') {
      updatedProducts[index].variant = '';
      updatedProducts[index].size = '';
    } else if (field === 'variant') {
      updatedProducts[index].size = '';
    }

    setNewInquiry({
      ...newInquiry,
      products: updatedProducts
    });
  };

  // Add a new product
  const handleAddProduct = () => {
    setNewInquiry({
      ...newInquiry,
      products: [...newInquiry.products, { brand: '', variant: '', size: '', quantity: 1 }]
    });
  };

  // Remove a product
  const handleRemoveProduct = (index) => {
    if (newInquiry.products.length === 1) {
      // Don't remove the last product
      return;
    }
    
    const updatedProducts = newInquiry.products.filter((_, i) => i !== index);
    setNewInquiry({
      ...newInquiry,
      products: updatedProducts
    });
  };

  // Handle new inquiry submit
  const handleInquirySubmit = async () => {
    // Validate form
    if (
      !newInquiry.distributorName ||
      !newInquiry.products.every(product => 
        product.brand && product.variant && product.size && product.quantity) ||
      !newInquiry.visitPurpose ||
      (newInquiry.visitPurpose === 'Others' && !newInquiry.otherReason) ||
      !newInquiry.area
    ) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      // Create new inquiry
      const inquiryData = {
        distributorName: newInquiry.distributorName,
        products: newInquiry.products,
        visitPurpose: newInquiry.visitPurpose,
        otherReason: newInquiry.otherReason,
        area: newInquiry.area
      };

      await salesInquiryService.createSalesInquiry(inquiryData);
      setDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Sales inquiry submitted successfully',
        severity: 'success'
      });
      
      // Refresh inquiries list
      fetchInquiries();
    } catch (error) {
      console.error('Error creating sales inquiry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit sales inquiry',
        severity: 'error'
      });
    }
  };

  // Handle assign dialog open
  const handleAssignDialogOpen = (inquiry) => {
    setSelectedInquiry(inquiry);
    setAssignForm({
      assignedTo: inquiry.assignedTo || '',
      notes: inquiry.notes || ''
    });
    setAssignDialogOpen(true);
  };

  // Handle view dialog open
  const handleViewDialogOpen = (inquiry) => {
    setSelectedInquiry(inquiry);
    setViewDialogOpen(true);
  };

  // Handle view dialog close
  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
  };

  // Handle assign dialog close
  const handleAssignDialogClose = () => {
    setAssignDialogOpen(false);
  };

  // Handle assign form change
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm({
      ...assignForm,
      [name]: value
    });
  };

  // Handle assign submit
  const handleAssignSubmit = async () => {
    // Validate form
    if (!assignForm.assignedTo) {
      setSnackbar({
        open: true,
        message: 'Please select someone to assign',
        severity: 'error'
      });
      return;
    }

    try {
      // Update inquiry status
      await salesInquiryService.updateSalesInquiryStatus(selectedInquiry._id, {
        status: 'Processing',
        assignedTo: assignForm.assignedTo,
        notes: assignForm.notes
      });
      
      setAssignDialogOpen(false);
      
      setSnackbar({
        open: true,
        message: 'Inquiry assigned successfully',
        severity: 'success'
      });
      
      // Refresh inquiries list
      fetchInquiries();
    } catch (error) {
      console.error('Error assigning inquiry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to assign inquiry',
        severity: 'error'
      });
    }
  };

  // Handle mark as completed
  const handleMarkCompleted = async (id) => {
    try {
      await salesInquiryService.updateSalesInquiryStatus(id, {
        status: 'Completed'
      });
      
      setSnackbar({
        open: true,
        message: 'Inquiry marked as completed',
        severity: 'success'
      });
      
      // Refresh inquiries list
      fetchInquiries();
    } catch (error) {
      console.error('Error completing inquiry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark inquiry as completed',
        severity: 'error'
      });
    }
  };

  // Handle delete inquiry
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }
    
    try {
      await salesInquiryService.deleteSalesInquiry(id);
      
      setSnackbar({
        open: true,
        message: 'Inquiry deleted successfully',
        severity: 'success'
      });
      
      // Refresh inquiries list
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete inquiry',
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle process inquiry after comment
  const handleProcessInquiry = async (id) => {
    try {
      await salesInquiryService.updateSalesInquiryStatus(id, {
        status: 'Processing',
        notes: 'Processing based on manager comments'
      });
      
      setSnackbar({
        open: true,
        message: 'Inquiry status updated to Processing',
        severity: 'success'
      });
      
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update inquiry status',
        severity: 'error'
      });
    }
  };

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'Pending':
        color = 'warning';
        break;
      case 'Processing':
        color = 'info';
        break;
      case 'Completed':
        color = 'success';
        break;
      case 'Commented':
        color = 'secondary';
        break;
      case 'Rejected':
        color = 'error';
        break;
      case 'Dispatched':
        color = 'success';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status}
        color={color}
        size="small"
        icon={status === 'Dispatched' ? <LocalShippingIcon /> : undefined}
      />
    );
  };

  const handleExportDispatchedOrders = () => {
    // Filter only dispatched orders
    const dispatchedOrders = inquiries.filter(i => i.status === 'Dispatched');
    
    // Prepare CSV data
    const csvData = [
      ['Inquiry ID', 'Distributor', 'Dispatch Date', 'Vehicle ID', 'Reference Number', 'Products', 'Dispatched By'],
      ...dispatchedOrders.map(order => [
        order._id,
        order.distributorName,
        new Date(order.dispatchDate).toLocaleDateString(),
        order.vehicleId,
        order.referenceNumber || 'N/A',
        order.products.map(p => `${p.brand} - ${p.variant} - ${p.size} (${p.quantity})`).join('; '),
        order.dispatchedBy?.name || 'N/A'
      ])
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispatched_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Sales Inquiries
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportDispatchedOrders}
          disabled={!inquiries.some(i => i.status === 'Dispatched')}
        >
          Export Dispatched Orders
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Processing">Processing</MenuItem>
                <MenuItem value="Commented">Commented</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Dispatched">Dispatched</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Distributor</InputLabel>
              <Select
                name="distributorName"
                value={filters.distributorName}
                label="Distributor"
                onChange={handleFilterChange}
              >
                <MenuItem value="all">All Distributors</MenuItem>
                {distributors.map((distributor) => (
                  <MenuItem key={distributor._id} value={distributor.name}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2} md={2}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={applyFilters}
              startIcon={<RefreshIcon />}
            >
              Apply
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Distributor</TableCell>
                <TableCell>Shop Name</TableCell>
                <TableCell>Products</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry._id} hover>
                    <TableCell>{inquiry.distributorName}</TableCell>
                    <TableCell>{inquiry.shopName || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`Products (${inquiry.products?.length || 0})`} 
                        color="primary" 
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(inquiry.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {inquiry.status === 'Dispatched' ? (
                        <>
                          {getStatusChip(inquiry.status)}
                          <Typography variant="caption" display="block" color="text.secondary">
                            Vehicle: {inquiry.vehicleId}
                          </Typography>
                        </>
                      ) : (
                        getStatusChip(inquiry.status)
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/sales-inquiries/${inquiry._id}`)}
                        sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                      >
                        View
                      </Button>

                      {(role === 'admin' || role === 'manager') && inquiry.status !== 'Completed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => handleAssignDialogOpen(inquiry)}
                          sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                        >
                          {inquiry.status === 'Pending' ? 'Assign' : 'Update'}
                        </Button>
                      )}

                      {inquiry.status === 'Commented' && (role === 'admin' || role === 'manager') && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleProcessInquiry(inquiry._id)}
                          sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                        >
                          Process
                        </Button>
                      )}
                      
                      {inquiry.status === 'Processing' && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleMarkCompleted(inquiry._id)}
                          sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                        >
                          Complete
                        </Button>
                      )}
                      
                      {(role === 'admin') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteInquiry(inquiry._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" py={2}>
                      No sales inquiries found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* New Inquiry Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="lg" fullWidth>
        <DialogTitle>New Sales Inquiry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Distributor</InputLabel>
                <Select
                  name="distributorName"
                  value={newInquiry.distributorName}
                  label="Distributor"
                  onChange={handleInquiryFormChange}
                >
                  {distributors.map((dist) => (
                    <MenuItem key={dist._id} value={dist.name}>{dist.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Purpose of Visit</InputLabel>
                <Select
                  name="visitPurpose"
                  value={newInquiry.visitPurpose}
                  label="Purpose of Visit"
                  onChange={handleInquiryFormChange}
                >
                  {visitPurposeOptions.map((purpose) => (
                    <MenuItem key={purpose} value={purpose}>{purpose}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {newInquiry.visitPurpose === 'Others' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Specify Reason"
                  name="otherReason"
                  value={newInquiry.otherReason}
                  onChange={handleInquiryFormChange}
                  fullWidth
                  required
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Area"
                name="area"
                value={newInquiry.area}
                onChange={handleInquiryFormChange}
                fullWidth
                required
                placeholder="Enter area details"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Products
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  sx={{ ml: 2 }}
                >
                  Add Product
                </Button>
              </Typography>
              
              {newInquiry.products.map((product, index) => (
                <Card key={index} sx={{ mb: 2, position: 'relative' }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth required>
                          <InputLabel>Brand</InputLabel>
                          <Select
                            value={product.brand}
                            label="Brand"
                            onChange={(e) => handleProductChange(index, 'brand', e.target.value)}
                          >
                            {Object.keys(productOptions).map((brand) => (
                              <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth required disabled={!product.brand}>
                          <InputLabel>Variant</InputLabel>
                          <Select
                            value={product.variant}
                            label="Variant"
                            onChange={(e) => handleProductChange(index, 'variant', e.target.value)}
                          >
                            {product.brand && productOptions[product.brand].variants.map((variant) => (
                              <MenuItem key={variant} value={variant}>{variant}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth required disabled={!product.variant}>
                          <InputLabel>Size</InputLabel>
                          <Select
                            value={product.size}
                            label="Size"
                            onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                          >
                            {product.brand && product.variant && 
                              productOptions[product.brand].sizes[product.variant].map((size) => (
                                <MenuItem key={size} value={size}>{size}</MenuItem>
                              ))
                            }
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={2}>
                        <TextField
                          label="Quantity"
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          InputProps={{ inputProps: { min: 1 } }}
                          fullWidth
                          required
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemoveProduct(index)}
                          disabled={newInquiry.products.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleInquirySubmit}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleViewDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Sales Inquiry Details
        </DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Distributor Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Name:</strong> {selectedInquiry.distributorName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Shop Name:</strong> {selectedInquiry.shopName || 'N/A'}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong> {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Status:</strong> {selectedInquiry.status}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Request Details
                      </Typography>
                      <Typography variant="body1">
                        <strong>Created By:</strong> {selectedInquiry.createdBy?.name || 'N/A'}
                      </Typography>
                      {selectedInquiry.processedBy && (
                        <Typography variant="body1">
                          <strong>Processed By:</strong> {selectedInquiry.processedBy.name || 'N/A'}
                        </Typography>
                      )}
                      {selectedInquiry.processedDate && (
                        <Typography variant="body1">
                          <strong>Processed Date:</strong> {new Date(selectedInquiry.processedDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {selectedInquiry.notes && (
                        <Typography variant="body1">
                          <strong>Notes:</strong> {selectedInquiry.notes}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {selectedInquiry.managerComment && (
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ mb: 2, bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="secondary">
                          Manager Comments
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                          {selectedInquiry.managerComment}
                        </Typography>
                        {selectedInquiry.managerId && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>By:</strong> {selectedInquiry.managerId.name || 'Unknown Manager'}
                            {selectedInquiry.managerCommentDate && (
                              <span> on {new Date(selectedInquiry.managerCommentDate).toLocaleString()}</span>
                            )}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Products
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Variant</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedInquiry.products.map((product, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.variant}</TableCell>
                            <TableCell>{product.size}</TableCell>
                            <TableCell align="right">{product.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewDialogClose}>Close</Button>
          {selectedInquiry && selectedInquiry.status === 'Commented' && (role === 'admin' || role === 'manager') && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => {
                handleProcessInquiry(selectedInquiry._id);
                handleViewDialogClose();
              }}
            >
              Process This Inquiry
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleAssignDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedInquiry?.status === 'Pending' ? 'Assign Inquiry' : 'Update Assignment'}
        </DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedInquiry.distributorName} - {selectedInquiry.area}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Assign To"
                    name="assignedTo"
                    value={assignForm.assignedTo}
                    onChange={handleAssignFormChange}
                    fullWidth
                    required
                    margin="normal"
                    placeholder="Enter name of person to assign"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes/Instructions"
                    name="notes"
                    value={assignForm.notes}
                    onChange={handleAssignFormChange}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    placeholder="Enter any notes or instructions for the assignee"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAssignSubmit}
          >
            {selectedInquiry?.status === 'Pending' ? 'Assign' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SalesInquiries;