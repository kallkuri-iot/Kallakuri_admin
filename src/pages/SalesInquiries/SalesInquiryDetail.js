import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  TextField,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { salesInquiryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function SalesInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inquiry, setInquiry] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchInquiryDetails();
  }, [id]);

  const fetchInquiryDetails = async () => {
    try {
      setLoading(true);
      const response = await salesInquiryService.getSalesInquiryById(id);
      setInquiry(response.data);
    } catch (error) {
      console.error('Error fetching inquiry details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load inquiry details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a comment',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await salesInquiryService.addManagerComment(id, comment);
      setInquiry(response.data);
      setCommentDialogOpen(false);
      setComment('');
      setSnackbar({
        open: true,
        message: 'Comment added successfully. Status updated to Commented.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to add comment',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!statusUpdate.status) {
      setSnackbar({
        open: true,
        message: 'Please select a status',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await salesInquiryService.updateSalesInquiryStatus(id, statusUpdate);
      setInquiry(response.data);
      setStatusDialogOpen(false);
      setStatusUpdate({ status: '', notes: '' });
      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
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
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
      />
    );
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleStatusUpdate = (newStatus) => {
    setStatusUpdate({
      status: newStatus,
      notes: newStatus === 'Processing' ? 'Processing based on manager comments' : ''
    });
    setStatusDialogOpen(true);
  };

  const handleDownloadDispatchDetails = () => {
    if (!inquiry) return;
    
    const dispatchData = {
      inquiryId: inquiry._id,
      distributorName: inquiry.distributorName,
      dispatchDate: new Date(inquiry.dispatchDate).toLocaleDateString(),
      vehicleId: inquiry.vehicleId,
      referenceNumber: inquiry.referenceNumber,
      dispatchedBy: inquiry.dispatchedBy?.name,
      products: inquiry.products.map(p => `${p.brand} - ${p.variant} - ${p.size} (Qty: ${p.quantity})`).join('\n')
    };

    const content = `
Dispatch Details:
----------------
Inquiry ID: ${dispatchData.inquiryId}
Distributor: ${dispatchData.distributorName}
Dispatch Date: ${dispatchData.dispatchDate}
Vehicle ID: ${dispatchData.vehicleId}
Reference Number: ${dispatchData.referenceNumber || 'N/A'}
Dispatched By: ${dispatchData.dispatchedBy || 'N/A'}

Products:
${dispatchData.products}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dispatch_${inquiry._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && !inquiry) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/sales-inquiries')}
          sx={{ mb: 2 }}
        >
          Back to Sales Inquiries
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1">
            Sales Inquiry Details
          </Typography>
          
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            {(role === 'admin' || role === 'manager') && inquiry?.status === 'Pending' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CommentIcon />}
                onClick={() => setCommentDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Add Comment
              </Button>
            )}
            
            {(role === 'admin' || role === 'manager') && inquiry?.status === 'Commented' && (
              <Button
                variant="contained"
                color="info"
                startIcon={<EditIcon />}
                onClick={() => handleStatusUpdate('Processing')}
                sx={{ mr: 1 }}
              >
                Process Inquiry
              </Button>
            )}
            
            {(role === 'admin' || role === 'manager') && inquiry?.status === 'Processing' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                  onClick={() => handleStatusUpdate('Completed')}
                  sx={{ mr: 1 }}
                >
                  Mark Completed
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CloseIcon />}
                  onClick={() => handleStatusUpdate('Rejected')}
                  sx={{ mr: 1 }}
                >
                  Reject
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
      
      {inquiry && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Distributor Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Name:</strong> {inquiry.distributorName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Shop Name:</strong> {inquiry.shopName || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Address:</strong> {inquiry.distributorId?.address || 'N/A'}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Contact:</strong> {inquiry.distributorId?.contact || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Inquiry Status
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1" gutterBottom>
                  <strong>Current Status:</strong> {getStatusChip(inquiry.status)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created On:</strong> {new Date(inquiry.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Created By:</strong> {inquiry.createdBy?.name || 'N/A'}
                </Typography>
                {inquiry.processedBy && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Processed By:</strong> {inquiry.processedBy.name}
                  </Typography>
                )}
                {inquiry.processedDate && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Processed On:</strong> {new Date(inquiry.processedDate).toLocaleString()}
                  </Typography>
                )}
                {inquiry.notes && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Processing Notes:</strong> {inquiry.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {inquiry.managerComment && (
            <Grid item xs={12}>
              <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="secondary">
                    Manager Comments
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {inquiry.managerComment}
                  </Typography>
                  {inquiry.managerId && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      <strong>Added by:</strong> {inquiry.managerId.name || 'Unknown Manager'}
                      {inquiry.managerCommentDate && (
                        <span> on {new Date(inquiry.managerCommentDate).toLocaleString()}</span>
                      )}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requested Products
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} variant="outlined">
                  <Table>
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
                      {inquiry.products.map((product, index) => (
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      
      {/* Dispatch Details Section */}
      {inquiry && inquiry.status === 'Dispatched' && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Dispatch Details
              </Typography>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleDownloadDispatchDetails}
              >
                Download Details
              </Button>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Dispatch Date:</strong> {new Date(inquiry.dispatchDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  <strong>Vehicle ID:</strong> {inquiry.vehicleId}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Reference Number:</strong> {inquiry.referenceNumber || 'N/A'}
                </Typography>
                <Typography variant="body1">
                  <strong>Dispatched By:</strong> {inquiry.dispatchedBy?.name || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Manager Comment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Comment"
              multiline
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              placeholder="Enter your comments or instructions for this sales inquiry..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleCommentSubmit}
            disabled={!comment.trim()}
          >
            Submit Comment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Inquiry Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to mark this inquiry as <strong>{statusUpdate.status}</strong>?
            </Typography>
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={statusUpdate.notes}
              onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
              fullWidth
              sx={{ mt: 2 }}
              placeholder="Add any notes about this status update (optional)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            color={
              statusUpdate.status === 'Completed' 
                ? 'success' 
                : statusUpdate.status === 'Rejected' 
                  ? 'error' 
                  : 'primary'
            }
            onClick={handleStatusSubmit}
          >
            Confirm
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

export default SalesInquiryDetail;