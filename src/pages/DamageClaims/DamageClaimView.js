import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  Chip,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  Store as StoreIcon,
  Print as PrintIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import * as damageClaimService from '../../services/api/damageClaimService';
import { formatDistance } from 'date-fns';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

function DamageClaimView() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [replacementModalOpen, setReplacementModalOpen] = useState(false);
  const [replacementData, setReplacementData] = useState({
    trackingId: '',
    dispatchDate: null,
    approvedBy: '',
    channelledTo: '',
    referenceNumber: ''
  });

  // Fetch damage claim details on component mount
  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

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

  // Fetch damage claim details
  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      
      const response = await damageClaimService.getDamageClaimById(id);
      if (response.success) {
        setClaim(response.data);
        
        // Initialize approval data
        setApprovalData({
          status: 'Approved',
          approvedPieces: response.data.pieces,
          comment: ''
        });
      } else {
        throw new Error(response.error || 'Failed to fetch damage claim details');
      }
    } catch (error) {
      console.error('Error fetching damage claim details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load damage claim details: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  // Open approval modal
  const handleOpenApproveModal = () => {
    setApproveModalOpen(true);
  };
  
  // Close approval modal
  const handleCloseApproveModal = () => {
    setApproveModalOpen(false);
  };
  
  // Handle approval form changes
  const handleApprovalChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'status' && value !== 'Partially Approved') {
      // If changing from Partially Approved to another status, set approvedPieces back to max
      setApprovalData({
        ...approvalData,
        status: value,
        approvedPieces: value === 'Approved' ? claim.pieces : 0
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
        
        if (approvalData.approvedPieces >= claim.pieces) {
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
        claim._id, 
        approvalData
      );
      
      if (response.success) {
        // Close the modal
        setApproveModalOpen(false);
        
        // Show success message
        setSnackbar({
          open: true,
          message: `Damage claim ${approvalData.status.toLowerCase()} successfully`,
          severity: 'success'
        });
        
        // Refresh the data
        fetchClaimDetails();
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

  // Handle print function
  const handlePrint = () => {
    window.print();
  };

  // Handle replacement form changes
  const handleReplacementChange = (event) => {
    const { name, value } = event.target;
    setReplacementData({
      ...replacementData,
      [name]: value
    });
  };

  // Handle dispatch date change
  const handleDispatchDateChange = (date) => {
    setReplacementData({
      ...replacementData,
      dispatchDate: date
    });
  };

  // Open replacement modal
  const handleOpenReplacementModal = () => {
    setReplacementData({
      ...replacementData,
      trackingId: claim.trackingId
    });
    setReplacementModalOpen(true);
  };

  // Close replacement modal
  const handleCloseReplacementModal = () => {
    setReplacementModalOpen(false);
  };

  // Submit replacement
  const handleSubmitReplacement = async () => {
    try {
      setLoading(true);

      // Validate form
      if (!replacementData.dispatchDate || 
          !replacementData.approvedBy || 
          !replacementData.channelledTo || 
          !replacementData.referenceNumber) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      const data = {
        ...replacementData,
        dispatchDate: replacementData.dispatchDate.toISOString()
      };

      const response = await damageClaimService.createReplacement(data);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Replacement processed successfully',
          severity: 'success'
        });
        setReplacementModalOpen(false);
        // Refresh claim data
        fetchClaimDetails();
      }
    } catch (error) {
      console.error('Error processing replacement:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process replacement: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render approval modal
  const renderApproveModal = () => {
    if (!claim) return null;
    
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
                  {claim.brand} - {claim.variant} ({claim.size})
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {claim.pieces} pieces claimed by {claim.distributorName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Damage Type: {claim.damageType}
                </Typography>
                <Typography variant="body2">
                  Reason: {claim.reason}
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
                  <MenuItem value="Approved">Approve</MenuItem>
                  <MenuItem value="Partially Approved">Partially Approve</MenuItem>
                  <MenuItem value="Rejected">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {approvalData.status === 'Partially Approved' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Approved Pieces"
                  name="approvedPieces"
                  type="number"
                  value={approvalData.approvedPieces}
                  onChange={handleApprovalChange}
                  inputProps={{ min: 1, max: claim.pieces - 1 }}
                  helperText={`Maximum: ${claim.pieces - 1} pieces`}
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comment"
                name="comment"
                value={approvalData.comment}
                onChange={handleApprovalChange}
                multiline
                rows={3}
                placeholder="Add a comment about your decision..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseApproveModal} variant="outlined">Cancel</Button>
          <Button 
            onClick={handleSubmitApproval} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Decision'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Render replacement modal
  const renderReplacementModal = () => {
    if (!claim) return null;

    return (
      <Dialog
        open={replacementModalOpen}
        onClose={handleCloseReplacementModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Process Replacement
          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Enter replacement details for tracking ID: {claim.trackingId}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Dispatch Date *"
                  value={replacementData.dispatchDate}
                  onChange={handleDispatchDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Approved By *"
                name="approvedBy"
                value={replacementData.approvedBy}
                onChange={handleReplacementChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Channelled To *"
                name="channelledTo"
                value={replacementData.channelledTo}
                onChange={handleReplacementChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference Number *"
                name="referenceNumber"
                value={replacementData.referenceNumber}
                onChange={handleReplacementChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplacementModal} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReplacement}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Process Replacement'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading && !claim) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!claim) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="error">Damage claim not found</Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/damage-reports')} 
            sx={{ mt: 2 }}
          >
            Back to Damage Reports
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="damage-claim-view-container">
      {/* Top bar */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/damage-reports')} 
            sx={{ mr: 1 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Damage Claim Details
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          {claim.status === 'Pending' && (role === 'Administrator' || role === 'Admin' || role === 'Mid-Level Manager') && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<CheckIcon />}
              onClick={handleOpenApproveModal}
            >
              Process Claim
            </Button>
          )}
          {(role === 'Godown Incharge' || role === 'Administrator' || role === 'Admin') && 
           claim.status === 'Approved' && !claim.replacementDetails && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleOpenReplacementModal}
              sx={{ ml: 1 }}
            >
              Process Replacement
            </Button>
          )}
        </Box>
      </Box>

      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Claim details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Claim Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={claim.status} 
                  sx={{ 
                    color: getStatusColor(claim.status).color,
                    backgroundColor: getStatusColor(claim.status).bgColor,
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    px: 1
                  }}
                />
                {(claim.status === 'Approved' || claim.status === 'Partially Approved') && (
                  <Chip 
                    label={claim.replacementStatus === 'Completed' ? 'Replacement Done' : 'Pending Replacement'}
                    sx={{ 
                      color: claim.replacementStatus === 'Completed' ? 'success.main' : 'warning.main',
                      backgroundColor: claim.replacementStatus === 'Completed' ? 'success.light' : 'warning.light',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      px: 1
                    }}
                  />
                )}
              </Box>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ width: '30%', fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Tracking ID
                    </TableCell>
                    <TableCell>
                      {claim.trackingId ? (
                        <Typography variant="body1" fontWeight="medium" color="primary">
                          {claim.trackingId}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned yet
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Distributor
                    </TableCell>
                    <TableCell>{claim.distributorName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Product Details
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        <strong>Brand:</strong> {claim.brand}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Variant:</strong> {claim.variant}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Size:</strong> {claim.size}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Damage Type
                    </TableCell>
                    <TableCell>{claim.damageType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Total Pieces
                    </TableCell>
                    <TableCell>{claim.pieces}</TableCell>
                  </TableRow>
                  {(claim.status === 'Approved' || claim.status === 'Partially Approved') && (
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Approved Pieces
                      </TableCell>
                      <TableCell>{claim.approvedPieces}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Manufacturing Date
                    </TableCell>
                    <TableCell>{formatDate(claim.manufacturingDate)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Batch Details
                    </TableCell>
                    <TableCell>{claim.batchDetails}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Reason for Damage
                    </TableCell>
                    <TableCell>{claim.reason}</TableCell>
                  </TableRow>
                  {claim.comment && (
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Admin Comment
                      </TableCell>
                      <TableCell>{claim.comment}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" component="h3" gutterBottom>
              Timeline
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" sx={{ width: '30%', fontWeight: 'bold', bgcolor: 'grey.50' }}>
                      Created By
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {claim.createdBy ? claim.createdBy.name : 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(claim.createdAt)} ({getRelativeTime(claim.createdAt)})
                      </Typography>
                    </TableCell>
                  </TableRow>
                  {claim.approvedBy && (
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Processed By
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {claim.approvedBy.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(claim.approvedDate)} ({getRelativeTime(claim.approvedDate)})
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Replacement Details Section */}
          {claim.replacementDetails && (
            <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
              <Typography variant="h6" component="h2" gutterBottom>
                Replacement Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" sx={{ width: '30%', fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Dispatch Date
                      </TableCell>
                      <TableCell>{formatDate(claim.replacementDetails.dispatchDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Approved By
                      </TableCell>
                      <TableCell>{claim.replacementDetails.approvedBy}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Channelled To
                      </TableCell>
                      <TableCell>{claim.replacementDetails.channelledTo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Reference Number
                      </TableCell>
                      <TableCell>{claim.replacementDetails.referenceNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" sx={{ fontWeight: 'bold', bgcolor: 'grey.50' }}>
                        Processed By
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {claim.replacementDetails.processedBy?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(claim.replacementDetails.processedAt)} ({getRelativeTime(claim.replacementDetails.processedAt)})
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Grid>

        {/* Right column - Images and status */}
        <Grid item xs={12} md={4}>
          {claim.images && claim.images.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
              <Typography variant="h6" component="h2" gutterBottom>
                Damage Images
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {claim.images.map((image, index) => {
                  // Function to get the correct image URL
                  const getImageUrl = (img) => {
                    if (!img) return '';
                    
                    // If it's already a full URL, return as is
                    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
                      return img;
                    }
                    
                    // If it's a file URI, try to extract the filename and construct a proper URL
                    if (typeof img === 'string' && img.startsWith('file://')) {
                      const filename = img.split('/').pop();
                      return `${process.env.REACT_APP_API_URL || ''}/uploads/${filename}`;
                    }
                    
                    // If it's an object with url/path properties
                    if (typeof img === 'object') {
                      // Check if url exists and is a proper URL
                      if (img.url) {
                        // Fix malformed URL if it's missing a forward slash
                        if (img.url.includes('file://')) {
                          const filename = img.url.split('/').pop();
                          return `/uploads/${filename}`;
                        }
                        return img.url;
                      }
                      // Fallback to path if url doesn't exist
                      if (img.path) {
                        // If path is a full URL, use it
                        if (img.path.startsWith('http')) {
                          return img.path;
                        }
                        // Otherwise, construct the URL
                        return `${process.env.REACT_APP_API_URL || ''}${img.path.startsWith('/') ? '' : '/'}${img.path}`;
                      }
                    }
                    
                    // Default fallback
                    return img;
                  };
                  
                  const imageUrl = getImageUrl(image);
                  
                  return (
                    <Card key={index} sx={{ width: '100%' }}>
                      <CardMedia
                        component="img"
                        height="250"
                        image={imageUrl}
                        alt={`Damage image ${index + 1}`}
                        sx={{ 
                          objectFit: 'contain',
                          cursor: 'pointer',
                          backgroundColor: '#f5f5f5',
                          maxHeight: '300px',
                          width: '100%',
                        }}
                        onClick={() => window.open(imageUrl, '_blank')}
                        onError={(e) => {
                          // If the image fails to load, try to use a fallback
                          if (image.path && e.target.src !== image.path) {
                            e.target.src = image.path;
                          } else {
                            // If no fallback, show a placeholder
                            e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1879f5f8d08%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1879f5f8d08%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22107.1953125%22%20y%3D%2296.6%22%3EImage%20not%20available%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                          }
                        }}
                      />
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Image {index + 1} - Click to enlarge
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Paper>
          )}

          {/* Status card */}
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" component="h2" gutterBottom>
              Status Information
            </Typography>
            <Box sx={{ mb: 2, p: 2, bgcolor: getStatusColor(claim.status).bgColor, borderRadius: 1 }}>
              <Typography variant="body1" fontWeight="bold" sx={{ color: getStatusColor(claim.status).color }}>
                Current Status: {claim.status}
              </Typography>
              {claim.status === 'Pending' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This claim is waiting for review by an administrator.
                </Typography>
              )}
              {claim.status === 'Approved' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  All {claim.pieces} pieces have been approved for replacement.
                </Typography>
              )}
              {claim.status === 'Partially Approved' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {claim.approvedPieces} out of {claim.pieces} pieces have been approved for replacement.
                </Typography>
              )}
              {claim.status === 'Rejected' && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This claim has been rejected. See admin comments for details.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Approval Modal */}
      {renderApproveModal()}

      {/* Replacement Modal */}
      {renderReplacementModal()}

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

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          nav, header, footer, .MuiButton-root, .MuiBreadcrumbs-root {
            display: none !important;
          }
          .damage-claim-view-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .MuiPaper-root {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default DamageClaimView;
