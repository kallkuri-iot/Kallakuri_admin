import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
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
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PageHeader from '../../components/common/PageHeader';
import { shopService, distributorService } from '../../services/api';

const PendingShops = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedShop, setSelectedShop] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [filters, setFilters] = useState({
    distributorId: ''
  });
  const [distributors, setDistributors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchPendingShops();
    fetchDistributors();
  }, [page, rowsPerPage, filters]);

  const fetchPendingShops = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const response = await shopService.getPendingShops(params);
      
      if (response.success) {
        setShops(response.data);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        throw new Error(response.error || 'Failed to fetch pending shops');
      }
    } catch (error) {
      console.error('Error fetching pending shops:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to fetch pending shops',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDistributors = async () => {
    try {
      const response = await distributorService.getAllDistributors();
      if (response.success) {
        setDistributors(response.data);
      }
    } catch (error) {
      console.error('Error fetching distributors:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleApproveClick = (shop) => {
    setSelectedShop(shop);
    setApprovalDialogOpen(true);
  };

  const handleRejectClick = (shop) => {
    setSelectedShop(shop);
    setRejectionDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    try {
      const response = await shopService.updateShopApproval(selectedShop._id, {
        approvalStatus: 'Approved',
        notes
      });
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Shop approved successfully',
          severity: 'success'
        });
        
        // Refresh the list
        fetchPendingShops();
      } else {
        throw new Error(response.error || 'Failed to approve shop');
      }
    } catch (error) {
      console.error('Error approving shop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to approve shop',
        severity: 'error'
      });
    } finally {
      setApprovalDialogOpen(false);
      setSelectedShop(null);
      setNotes('');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      setSnackbar({
        open: true,
        message: 'Rejection reason is required',
        severity: 'error'
      });
      return;
    }
    
    try {
      const response = await shopService.updateShopApproval(selectedShop._id, {
        approvalStatus: 'Rejected',
        rejectionReason,
        notes
      });
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Shop rejected successfully',
          severity: 'success'
        });
        
        // Refresh the list
        fetchPendingShops();
      } else {
        throw new Error(response.error || 'Failed to reject shop');
      }
    } catch (error) {
      console.error('Error rejecting shop:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to reject shop',
        severity: 'error'
      });
    } finally {
      setRejectionDialogOpen(false);
      setSelectedShop(null);
      setRejectionReason('');
      setNotes('');
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      distributorId: ''
    });
    setPage(0);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader 
        title="Pending Shops for Approval" 
        subtitle="Review and approve shops added by marketing staff"
      />
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <Box>
            <Button 
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ mr: 1 }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {showFilters && (
              <Button 
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>
        
        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="distributor-filter-label">Distributor</InputLabel>
                <Select
                  labelId="distributor-filter-label"
                  id="distributor-filter"
                  name="distributorId"
                  value={filters.distributorId}
                  onChange={handleFilterChange}
                  label="Distributor"
                >
                  <MenuItem value="">All Distributors</MenuItem>
                  {distributors.map(distributor => (
                    <MenuItem key={distributor._id} value={distributor._id}>
                      {distributor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Paper>
      
      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : shops.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6">No pending shops found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            All shops have been reviewed or no new shops have been added by marketing staff.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Distributor</TableCell>
                  <TableCell>Added By</TableCell>
                  <TableCell>Date Added</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop._id}>
                    <TableCell>{shop.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={shop.type} 
                        color={shop.type === 'Retailer' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{shop.ownerName}</TableCell>
                    <TableCell>{shop.distributorId?.name || 'N/A'}</TableCell>
                    <TableCell>{shop.createdBy?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {format(new Date(shop.createdAt), 'dd MMM yyyy, HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="success" 
                        onClick={() => handleApproveClick(shop)}
                        title="Approve"
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleRejectClick(shop)}
                        title="Reject"
                      >
                        <RejectIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalItems}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      
      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)}>
        <DialogTitle>Approve Shop</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to approve this shop?
          </DialogContentText>
          
          {selectedShop && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">{selectedShop.name}</Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Typography variant="body1">{selectedShop.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Owner:</Typography>
                    <Typography variant="body1">{selectedShop.ownerName}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Address:</Typography>
                    <Typography variant="body1">{selectedShop.address}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveConfirm} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)}>
        <DialogTitle>Reject Shop</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please provide a reason for rejecting this shop.
          </DialogContentText>
          
          {selectedShop && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">{selectedShop.name}</Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Typography variant="body1">{selectedShop.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Owner:</Typography>
                    <Typography variant="body1">{selectedShop.ownerName}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Address:</Typography>
                    <Typography variant="body1">{selectedShop.address}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            id="rejectionReason"
            label="Rejection Reason"
            fullWidth
            required
            multiline
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={!rejectionReason.trim()}
            helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
          />
          
          <TextField
            margin="dense"
            id="notes"
            label="Additional Notes (Optional)"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default PendingShops; 