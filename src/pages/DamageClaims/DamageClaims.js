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
  CardMedia,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  Badge,
  DialogContentText
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  CalendarToday as CalendarIcon,
  Store as StoreIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import * as damageClaimService from '../../services/api/damageClaimService';
import { formatDistance } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useDamageClaims } from '../DamageReports/DamageReports';

function DamageClaims() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { setPendingClaimsCount } = useDamageClaims();
  const [damageClaims, setDamageClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDistributor, setSelectedDistributor] = useState("all");
  const [distributors, setDistributors] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: 'Approved',
    approvedPieces: 0,
    comment: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [claimToDelete, setClaimToDelete] = useState(null);

  // Fetch damage claims and distributors on component mount
  useEffect(() => {
    fetchData();
  }, [filterStatus, selectedDistributor]);

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

  // Fetch damage claims and distributors
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch damage claims
      const filters = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      if (selectedDistributor !== "all") {
        filters.distributorId = selectedDistributor;
      }
      
      const claimsResponse = await damageClaimService.getAllDamageClaims(filters);
      if (claimsResponse.success) {
        setDamageClaims(claimsResponse.data);
      }
      
      // Fetch distributors
      const distributorsResponse = await damageClaimService.getDistributorsForDamageClaims();
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

  // Handle status filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };
  
  // Handle distributor filter change
  const handleDistributorChange = (event) => {
    setSelectedDistributor(event.target.value);
  };

  // Navigate to dedicated view page for a claim
  const handleViewClaim = (claim) => {
    navigate(`/damage-reports/${claim._id}`);
  };
  
  // Close view modal
  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedClaim(null);
  };
  
  // Open approval modal
  const handleOpenApproveModal = (claim) => {
    setSelectedClaim(claim);
    setApprovalData({
      status: 'Approved',
      approvedPieces: claim.pieces,
      comment: ''
    });
    setApproveModalOpen(true);
  };
  
  // Close approval modal
  const handleCloseApproveModal = () => {
    setApproveModalOpen(false);
    setSelectedClaim(null);
  };
  
  // Handle approval form changes
  const handleApprovalChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'status' && value !== 'Partially Approved') {
      // If changing from Partially Approved to another status, set approvedPieces back to max
      setApprovalData({
        ...approvalData,
        status: value,
        approvedPieces: value === 'Approved' ? selectedClaim.pieces : 0
      });
    } else {
      setApprovalData({
        ...approvalData,
        [name]: name === 'approvedPieces' ? parseInt(value, 10) : value
      });
    }
  };
  
  // Submit approval decision
  const handleSubmitApproval = async () => {
    try {
      setLoading(true);
      
      // Validation for partially approved status
      if (approvalData.status === 'Partially Approved') {
        if (!approvalData.approvedPieces || approvalData.approvedPieces <= 0) {
          setSnackbar({
            open: true,
            message: 'Approved pieces must be greater than 0 for partial approval',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
        
        if (approvalData.approvedPieces >= selectedClaim.pieces) {
          setSnackbar({
            open: true,
            message: 'For partial approval, approved pieces must be less than total pieces',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
      }
      
      // Submit the approval
      const response = await damageClaimService.updateDamageClaimStatus(
        selectedClaim._id, 
        approvalData
      );
      
      if (response.success) {
        // Close the modal
        setApproveModalOpen(false);
        setSelectedClaim(null);
        
        // Show success message
        setSnackbar({
          open: true,
          message: `Damage claim ${approvalData.status.toLowerCase()} successfully`,
          severity: 'success'
        });
        
        // Refresh the data
        fetchData();
      }
    } catch (error) {
      console.error('Error processing damage claim:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process claim: ' + (error.message || 'Unknown error'),
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { color: '#B78427', bgColor: '#FFF5E6' };
      case 'Approved':
        return { color: '#52C41A', bgColor: '#F0FFF5' };
      case 'Partially Approved':
        return { color: '#2196F3', bgColor: '#E3F2FD' };
      case 'Rejected':
        return { color: '#F44336', bgColor: '#FFEBEE' };
      default:
        return { color: 'default', bgColor: 'default' };
    }
  };

  // Count claims by status
  const pendingClaims = damageClaims.filter(claim => claim.status === 'Pending').length;
  const approvedClaims = damageClaims.filter(claim => claim.status === 'Approved').length;
  const partiallyApprovedClaims = damageClaims.filter(claim => claim.status === 'Partially Approved').length;
  const rejectedClaims = damageClaims.filter(claim => claim.status === 'Rejected').length;
  
  // Update the pending claims count in context
  useEffect(() => {
    setPendingClaimsCount(pendingClaims);
  }, [pendingClaims, setPendingClaimsCount]);

  // Open delete confirmation modal
  const handleDeleteClick = (claim) => {
    setClaimToDelete(claim);
    setDeleteModalOpen(true);
  };
  
  // Close delete confirmation modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClaimToDelete(null);
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!claimToDelete) return;
    
    try {
      setLoading(true);
      const response = await damageClaimService.deleteDamageClaim(claimToDelete._id);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Damage claim deleted successfully',
          severity: 'success'
        });
        
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting damage claim:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete claim: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setClaimToDelete(null);
    }
  };

  // Add new function for CSV export
  const handleExportCSV = () => {
    if (damageClaims.length === 0) {
      setSnackbar({
        open: true,
        message: 'No data available to export',
        severity: 'warning'
      });
      return;
    }

    const csvData = [
      // Headers
      ['ID', 'Distributor', 'Brand', 'Variant', 'Size', 'Total Pieces', 'Approved Pieces', 'Damage Type', 
       'Manufacturing Date', 'Batch Details', 'Reason', 'Status', 'Tracking ID', 'Created By', 'Created Date', 
       'Processed By', 'Processed Date', 'Comment']
    ];

    // Add data rows
    damageClaims.forEach(claim => {
      csvData.push([
        claim._id,
        claim.distributorName,
        claim.brand,
        claim.variant,
        claim.size,
        claim.pieces,
        claim.approvedPieces || 0,
        claim.damageType,
        new Date(claim.manufacturingDate).toLocaleDateString(),
        claim.batchDetails,
        claim.reason,
        claim.status,
        claim.trackingId || 'N/A',
        claim.createdBy?.name || 'Unknown',
        new Date(claim.createdAt).toLocaleDateString(),
        claim.approvedBy?.name || 'N/A',
        claim.approvedDate ? new Date(claim.approvedDate).toLocaleDateString() : 'N/A',
        claim.comment || 'N/A'
      ]);
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `damage_claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render view modal removed - now using dedicated view page
  
  // Render approval modal
  const renderApproveModal = () => {
    if (!selectedClaim) return null;
    
    return (
      <Dialog 
        open={approveModalOpen} 
        onClose={handleCloseApproveModal} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Process Damage Claim
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Make a decision on this damage claim
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedClaim.brand} - {selectedClaim.variant} ({selectedClaim.size})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedClaim.pieces} pieces claimed by {selectedClaim.distributorName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Damage Type: {selectedClaim.damageType}
                </Typography>
                <Typography variant="body2">
                  Reason: {selectedClaim.reason}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Decision</InputLabel>
                <Select
                  name="status"
                  value={approvalData.status}
                  onChange={handleApprovalChange}
                  label="Decision"
                >
                  <MenuItem value="Approved">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                      Approve Full Amount
                    </Box>
                  </MenuItem>
                  <MenuItem value="Partially Approved">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon sx={{ color: 'info.main', mr: 1 }} />
                      Partially Approve
                    </Box>
                  </MenuItem>
                  <MenuItem value="Rejected">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CloseIcon sx={{ color: 'error.main', mr: 1 }} />
                      Reject
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {approvalData.status === 'Partially Approved' && (
              <Grid item xs={12}>
                <TextField
                  name="approvedPieces"
                  label="Approved Pieces"
                  type="number"
                  fullWidth
                  value={approvalData.approvedPieces}
                  onChange={handleApprovalChange}
                  InputProps={{ 
                    inputProps: { 
                      min: 1, 
                      max: selectedClaim.pieces - 1 
                    } 
                  }}
                  helperText={`Must be between 1 and ${selectedClaim.pieces - 1}`}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                name="comment"
                label="Comment"
                multiline
                rows={4}
                fullWidth
                value={approvalData.comment}
                onChange={handleApprovalChange}
                placeholder="Add a comment explaining your decision"
              />
            </Grid>

            {(approvalData.status === 'Approved' || approvalData.status === 'Partially Approved') && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  A tracking ID will be automatically generated when you approve this claim.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveModal} variant="outlined">Cancel</Button>
          <Button 
            variant="contained" 
            color={approvalData.status === 'Rejected' ? 'error' : 'success'}
            onClick={handleSubmitApproval}
            disabled={loading}
            startIcon={approvalData.status === 'Rejected' ? <CloseIcon /> : <CheckIcon />}
          >
            {loading ? <CircularProgress size={24} /> : (
              approvalData.status === 'Rejected' 
                ? 'Reject Claim' 
                : (approvalData.status === 'Partially Approved' 
                  ? 'Partially Approve' 
                  : 'Approve Claim')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Damage Claims</Typography>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportCSV}
            disabled={damageClaims.length === 0}
          >
            Export to CSV
          </Button>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Claims
                </Typography>
                <Typography variant="h4">
                  {pendingClaims}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved Claims
                </Typography>
                <Typography variant="h4" sx={{ color: 'success.main' }}>
                  {approvedClaims}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Partially Approved
                </Typography>
                <Typography variant="h4" sx={{ color: 'info.main' }}>
                  {partiallyApprovedClaims}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected Claims
                </Typography>
                <Typography variant="h4" sx={{ color: 'error.main' }}>
                  {rejectedClaims}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Filters */}
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
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Partially Approved">Partially Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Distributor</InputLabel>
                <Select
                  value={selectedDistributor}
                  onChange={handleDistributorChange}
                  label="Distributor"
                >
                  <MenuItem value="all">All Distributors</MenuItem>
                  {distributors.map(distributor => (
                    <MenuItem key={distributor._id} value={distributor._id}>
                      {distributor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Claims Table */}
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : damageClaims.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
<TableCell>Image</TableCell>
                    <TableCell>Distributor</TableCell>
                    <TableCell>Damage Type</TableCell>
                    <TableCell>Pieces</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Replacement</TableCell>
                    <TableCell>Tracking ID</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {damageClaims.map(claim => (
                    <TableRow 
                      key={claim._id}
                      sx={claim.status === 'Pending' ? { 
                        backgroundColor: 'rgba(183, 132, 39, 0.05)',
                        '&:hover': { backgroundColor: 'rgba(183, 132, 39, 0.1)' } 
                      } : {}}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{claim.brand}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {claim.variant} - {claim.size}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {claim.images && claim.images.length > 0 ? (
                          <img
                            src={claim.images[0]}
                            alt="Damage"
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: '1px solid #eee' }}
                            onClick={() => window.open(claim.images[0], '_blank')}
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            No Image
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{claim.distributorName}</TableCell>
                      <TableCell>{claim.damageType}</TableCell>
                      <TableCell>
                        {claim.status === 'Partially Approved' ? 
                          `${claim.approvedPieces} / ${claim.pieces}` : 
                          claim.pieces
                        }
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={claim.status} 
                          sx={{ 
                            color: getStatusColor(claim.status).color,
                            backgroundColor: getStatusColor(claim.status).bgColor
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {(claim.status === 'Approved' || claim.status === 'Partially Approved') && (
                          <Chip 
                            label={claim.replacementStatus === 'Completed' ? 'Done' : 'Pending'}
                            sx={{ 
                              color: claim.replacementStatus === 'Completed' ? 'success.main' : 'warning.main',
                              backgroundColor: claim.replacementStatus === 'Completed' ? 'success.light' : 'warning.light'
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {claim.trackingId ? (
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            {claim.trackingId}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(claim.createdAt)}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {getRelativeTime(claim.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewClaim(claim)}
                          >
                            View
                          </Button>
                          
                          {claim.status === 'Pending' && (role === 'Administrator' || role === 'Admin' || role === 'Mid-Level Manager') && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleOpenApproveModal(claim)}
                            >
                              Approve
                            </Button>
                          )}
                          
                          {(role === 'Administrator' || role === 'Admin') && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(claim)}
                            >
                              Delete
                            </Button>
                          )}
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
                No damage claims found matching the current filters.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* View Modal removed - now using dedicated view page */}
      
      {/* Approve Modal */}
      {renderApproveModal()}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this damage claim? This action cannot be undone.
            {claimToDelete && (
              <Box mt={2}>
                <Typography variant="subtitle2">
                  {claimToDelete.brand} - {claimToDelete.variant} ({claimToDelete.size})
                </Typography>
                <Typography variant="body2">
                  Distributor: {claimToDelete.distributorName}
                </Typography>
                <Typography variant="body2">
                  Status: {claimToDelete.status}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default DamageClaims;