import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Mock data for orders
const initialOrders = [
  {
    id: '1',
    distributorName: 'ABC Distributors',
    staffName: 'Raj Kumar',
    brand: 'Surya Chandra',
    variant: 'Pouch',
    size: '1 LTR',
    boxes: 10,
    status: 'pending',
    date: '2023-05-08',
    comments: ''
  },
  {
    id: '2',
    distributorName: 'XYZ Enterprises',
    staffName: 'Deepak Sharma',
    brand: 'Surya Teja',
    variant: 'Jar',
    size: '500ML',
    boxes: 15,
    status: 'approved',
    date: '2023-05-07',
    comments: 'Approved by Manager'
  },
  {
    id: '3',
    distributorName: 'PQR Trading',
    staffName: 'Raj Kumar',
    brand: 'KG Brand',
    variant: 'KG Tins',
    size: 'KG Yellow',
    boxes: 5,
    status: 'rejected',
    date: '2023-05-06',
    comments: 'Out of stock'
  },
  {
    id: '4',
    distributorName: 'LMN Enterprises',
    staffName: 'Deepak Sharma',
    brand: 'Surya Chandra',
    variant: 'SC Gold',
    size: '750 ML',
    boxes: 20,
    status: 'pending',
    date: '2023-05-08',
    comments: ''
  },
  {
    id: '5',
    distributorName: 'ABC Distributors',
    staffName: 'Raj Kumar',
    brand: 'KG Brand',
    variant: 'Pouch',
    size: '1 LTR',
    boxes: 8,
    status: 'approved',
    date: '2023-05-05',
    comments: 'Priority order'
  }
];

// Mock data for product options
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

// Mock distributors
const distributors = [
  'ABC Distributors',
  'XYZ Enterprises',
  'PQR Trading',
  'LMN Enterprises',
  'RST Supply Co.'
];

function OrderRequests() {
  const { role } = useAuth();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedTab, setSelectedTab] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionType, setActionType] = useState('');
  const [comments, setComments] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [newOrder, setNewOrder] = useState({
    distributorName: '',
    brand: '',
    variant: '',
    size: '',
    boxes: '',
  });

  // Filter orders based on tab
  const filteredOrders = orders.filter(order => {
    if (selectedTab === 0) return true; // All
    if (selectedTab === 1) return order.status === 'pending';
    if (selectedTab === 2) return order.status === 'approved';
    if (selectedTab === 3) return order.status === 'rejected';
    return true;
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle view dialog
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  // Handle approve/reject dialog
  const handleActionClick = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
    setComments('');
    setActionDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setViewDialogOpen(false);
    setActionDialogOpen(false);
    setNewOrderDialogOpen(false);
  };

  // Handle approve/reject action
  const handleActionConfirm = () => {
    const updatedOrders = orders.map(order => {
      if (order.id === selectedOrder.id) {
        return {
          ...order,
          status: actionType,
          comments: comments
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    setActionDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: `Order ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`,
      severity: 'success'
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle new order dialog
  const handleNewOrderClick = () => {
    setNewOrder({
      distributorName: '',
      brand: '',
      variant: '',
      size: '',
      boxes: '',
    });
    setNewOrderDialogOpen(true);
  };

  // Handle new order form change
  const handleNewOrderChange = (e) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value
    });

    // Reset dependent fields if brand or variant changes
    if (name === 'brand') {
      setNewOrder(prev => ({
        ...prev,
        variant: '',
        size: '',
        [name]: value
      }));
    } else if (name === 'variant') {
      setNewOrder(prev => ({
        ...prev,
        size: '',
        [name]: value
      }));
    }
  };

  // Handle new order submit
  const handleNewOrderSubmit = () => {
    // Validate form
    if (!newOrder.distributorName || !newOrder.brand || !newOrder.variant || !newOrder.size || !newOrder.boxes) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    // Create new order
    const order = {
      id: Date.now().toString(),
      distributorName: newOrder.distributorName,
      staffName: 'Admin User',
      brand: newOrder.brand,
      variant: newOrder.variant,
      size: newOrder.size,
      boxes: parseInt(newOrder.boxes),
      status: 'pending',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      comments: ''
    };

    setOrders([order, ...orders]);
    setNewOrderDialogOpen(false);
    
    setSnackbar({
      open: true,
      message: 'Order request created successfully',
      severity: 'success'
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Order Requests
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewOrderClick}
        >
          New Order Request
        </Button>
      </Box>

      <Box sx={{ width: '100%', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={handleTabChange} 
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Distributor</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Boxes</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell width={180}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.distributorName}</TableCell>
                    <TableCell>{order.staffName}</TableCell>
                    <TableCell>
                      {`${order.brand} - ${order.variant} (${order.size})`}
                    </TableCell>
                    <TableCell>{order.boxes}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} 
                        color={
                          order.status === 'pending' ? 'warning' :
                          order.status === 'approved' ? 'success' : 'error'
                        } 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewOrder(order)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      {order.status === 'pending' && (role === 'admin' || role === 'manager') && (
                        <>
                          <IconButton size="small" color="success" onClick={() => handleActionClick(order, 'approved')}>
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleActionClick(order, 'rejected')}>
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" py={2}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Order Details
          <Chip 
            label={selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)} 
            color={
              selectedOrder?.status === 'pending' ? 'warning' :
              selectedOrder?.status === 'approved' ? 'success' : 'error'
            } 
            size="small"
            sx={{ ml: 2 }}
          />
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Order ID</Typography>
                <Typography variant="body1" gutterBottom>{selectedOrder.id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Date</Typography>
                <Typography variant="body1" gutterBottom>{selectedOrder.date}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Distributor</Typography>
                <Typography variant="body1" gutterBottom>{selectedOrder.distributorName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Staff</Typography>
                <Typography variant="body1" gutterBottom>{selectedOrder.staffName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Product</Typography>
                <Typography variant="body1" gutterBottom>
                  {`${selectedOrder.brand} - ${selectedOrder.variant} (${selectedOrder.size})`}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Quantity</Typography>
                <Typography variant="body1" gutterBottom>{selectedOrder.boxes} boxes</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Comments</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedOrder.comments || 'No comments'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
          {selectedOrder?.status === 'pending' && (role === 'admin' || role === 'manager') && (
            <>
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => {
                  handleDialogClose();
                  handleActionClick(selectedOrder, 'approved');
                }}
              >
                Approve
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={() => {
                  handleDialogClose();
                  handleActionClick(selectedOrder, 'rejected');
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={actionDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approved' ? 'Approve Order' : 'Reject Order'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approved' 
              ? 'Are you sure you want to approve this order request?'
              : 'Are you sure you want to reject this order request?'
            }
          </DialogContentText>
          <TextField
            margin="dense"
            label="Comments"
            fullWidth
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            color={actionType === 'approved' ? 'success' : 'error'}
            onClick={handleActionConfirm}
          >
            {actionType === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={newOrderDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>New Order Request</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Distributor</InputLabel>
              <Select
                name="distributorName"
                value={newOrder.distributorName}
                label="Distributor"
                onChange={handleNewOrderChange}
              >
                {distributors.map((dist) => (
                  <MenuItem key={dist} value={dist}>{dist}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Brand</InputLabel>
              <Select
                name="brand"
                value={newOrder.brand}
                label="Brand"
                onChange={handleNewOrderChange}
              >
                {Object.keys(productOptions).map((brand) => (
                  <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required disabled={!newOrder.brand}>
              <InputLabel>Variant</InputLabel>
              <Select
                name="variant"
                value={newOrder.variant}
                label="Variant"
                onChange={handleNewOrderChange}
              >
                {newOrder.brand && productOptions[newOrder.brand].variants.map((variant) => (
                  <MenuItem key={variant} value={variant}>{variant}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required disabled={!newOrder.variant}>
              <InputLabel>Size</InputLabel>
              <Select
                name="size"
                value={newOrder.size}
                label="Size"
                onChange={handleNewOrderChange}
              >
                {newOrder.brand && newOrder.variant && 
                  productOptions[newOrder.brand].sizes[newOrder.variant].map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            
            <TextField
              label="Number of Boxes"
              name="boxes"
              type="number"
              inputProps={{ min: 1 }}
              value={newOrder.boxes}
              onChange={handleNewOrderChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleNewOrderSubmit}
          >
            Submit
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

export default OrderRequests; 