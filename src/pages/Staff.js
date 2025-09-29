import React, { useState, useEffect } from 'react';
import { staffService } from '../services/api';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const StaffPage = () => {
  // State for staff list
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  
  // Form data
  const [currentStaff, setCurrentStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Marketing Staff',
    active: true
  });
  const [newPassword, setNewPassword] = useState('');
  
  // Notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Load staff data
  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await staffService.getAllStaff(
        page + 1,
        rowsPerPage,
        roleFilter || undefined,
        activeFilter === 'true' ? true : activeFilter === 'false' ? false : undefined
      );
      
      if (response.success) {
        setStaff(response.data);
        setTotalCount(response.count);
      } else {
        setError('Failed to load staff data');
      }
    } catch (err) {
      setError('An error occurred while fetching staff data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadStaff();
  }, [page, rowsPerPage, roleFilter, activeFilter]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Marketing Staff',
      active: true
    });
  };
  
  // Open add dialog
  const handleOpenAddDialog = () => {
    resetFormData();
    setOpenAddDialog(true);
  };
  
  // Close add dialog
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  // Open edit dialog
  const handleOpenEditDialog = (staffMember) => {
    setCurrentStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      active: staffMember.active
    });
    setOpenEditDialog(true);
  };
  
  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setCurrentStaff(null);
  };
  
  // Open delete dialog
  const handleOpenDeleteDialog = (staffMember) => {
    setCurrentStaff(staffMember);
    setOpenDeleteDialog(true);
  };
  
  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentStaff(null);
  };
  
  // Open reset password dialog
  const handleOpenResetPasswordDialog = (staffMember) => {
    setCurrentStaff(staffMember);
    setNewPassword('');
    setOpenResetPasswordDialog(true);
  };
  
  // Close reset password dialog
  const handleCloseResetPasswordDialog = () => {
    setOpenResetPasswordDialog(false);
    setCurrentStaff(null);
  };
  
  // Handle add staff
  const handleAddStaff = async () => {
    try {
      setLoading(true);
      
      const response = await staffService.createStaff(formData);
      
      if (response.success) {
        setNotification({
          open: true,
          message: 'Staff member added successfully',
          severity: 'success'
        });
        handleCloseAddDialog();
        loadStaff();
      } else {
        setNotification({
          open: true,
          message: response.error || 'Failed to add staff member',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit staff
  const handleEditStaff = async () => {
    try {
      setLoading(true);
      
      const response = await staffService.updateStaff(currentStaff._id, formData);
      
      if (response.success) {
        setNotification({
          open: true,
          message: 'Staff member updated successfully',
          severity: 'success'
        });
        handleCloseEditDialog();
        loadStaff();
      } else {
        setNotification({
          open: true,
          message: response.error || 'Failed to update staff member',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete staff
  const handleDeleteStaff = async () => {
    try {
      setLoading(true);
      
      const response = await staffService.deleteStaff(currentStaff._id);
      
      if (response.success) {
        setNotification({
          open: true,
          message: 'Staff member deleted successfully',
          severity: 'success'
        });
        handleCloseDeleteDialog();
        loadStaff();
      } else {
        setNotification({
          open: true,
          message: response.error || 'Failed to delete staff member',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      
      const response = await staffService.resetPassword(currentStaff._id, newPassword);
      
      if (response.success) {
        setNotification({
          open: true,
          message: 'Password reset successfully',
          severity: 'success'
        });
        handleCloseResetPasswordDialog();
      } else {
        setNotification({
          open: true,
          message: response.error || 'Failed to reset password',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle toggle staff status
  const handleToggleStatus = async (staffId) => {
    try {
      setLoading(true);
      
      const response = await staffService.toggleStatus(staffId);
      
      if (response.success) {
        setNotification({
          open: true,
          message: response.message || 'Staff status updated successfully',
          severity: 'success'
        });
        loadStaff();
      } else {
        setNotification({
          open: true,
          message: response.error || 'Failed to update staff status',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'An error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Staff Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Staff
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Marketing Staff">Marketing Staff</MenuItem>
              <MenuItem value="Mid-Level Manager">Mid-Level Manager</MenuItem>
              <MenuItem value="Godown Incharge">Godown Incharge</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={activeFilter}
              label="Status"
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={() => {
              setRoleFilter('');
              setActiveFilter('');
              setPage(0);
            }}
          >
            Reset Filters
          </Button>
        </Box>
      </Paper>
      
      {/* Staff Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && page === 0 && staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="error">{error}</Typography>
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography>No staff members found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((staffMember) => (
                  <TableRow key={staffMember._id}>
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>{staffMember.email}</TableCell>
                    <TableCell>{staffMember.role}</TableCell>
                    <TableCell>
                      <Chip 
                        label={staffMember.active ? 'Active' : 'Inactive'} 
                        color={staffMember.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {staffMember.lastLogin 
                        ? new Date(staffMember.lastLogin).toLocaleString() 
                        : 'Never'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(staffMember)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        onClick={() => handleOpenResetPasswordDialog(staffMember)}
                        size="small"
                      >
                        <LockIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(staffMember)}
                        size="small"
                        disabled={staffMember.role === 'Admin'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add Staff Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Staff</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange}
            required
            helperText="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleInputChange}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Marketing Staff">Marketing Staff</MenuItem>
              <MenuItem value="Mid-Level Manager">Mid-Level Manager</MenuItem>
              <MenuItem value="Godown Incharge">Godown Incharge</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddStaff} 
            variant="contained" 
            color="primary"
            disabled={loading || !formData.name || !formData.email || !formData.password}
          >
            {loading ? <CircularProgress size={24} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Staff Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Staff</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleInputChange}
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Marketing Staff">Marketing Staff</MenuItem>
              <MenuItem value="Mid-Level Manager">Mid-Level Manager</MenuItem>
              <MenuItem value="Godown Incharge">Godown Incharge</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="active"
              value={formData.active}
              label="Status"
              onChange={(e) => setFormData({...formData, active: e.target.value})}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleEditStaff} 
            variant="contained" 
            color="primary"
            disabled={loading || !formData.name || !formData.email}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Staff Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Staff</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentStaff?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteStaff} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={openResetPasswordDialog} onClose={handleCloseResetPasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new password for {currentStaff?.name}.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="newPassword"
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetPasswordDialog}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            variant="contained" 
            color="primary"
            disabled={loading || !newPassword || newPassword.length < 8}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StaffPage; 