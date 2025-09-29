import React, { useState, useEffect } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { staffService } from '../../services/api';

// Role definitions for UI display
const roleLabels = {
  'Admin': { label: 'Admin', color: 'primary' },
  'Marketing Staff': { label: 'Marketing Staff', color: 'success' },
  'Mid-Level Manager': { label: 'Mid-Level Manager', color: 'info' },
  'Godown Incharge': { label: 'Godown Incharge', color: 'warning' },
};

function Users() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    password: '',
    role: '',
    mobile: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await staffService.getAllStaff();
      if (response.success) {
        setUsers(response.data);
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to fetch users: ' + (response.error || 'Unknown error'),
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching users: ' + (error.message || 'Unknown error'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        gender: user.gender || '',
        email: user.email,
        mobile: user.phone || '',
        role: user.role,
        password: '' // Don't populate password for editing
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        gender: '',
        email: '',
        mobile: '',
        role: '',
        password: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.role) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    // Prepare data for API
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      gender: formData.gender,
      phone: formData.mobile,
      password: formData.password
    };

    try {
      let response;
      
      if (selectedUser) {
        // Update existing user
        response = await staffService.updateStaff(selectedUser._id, userData);
        if (response.success) {
          setSnackbar({
            open: true,
            message: 'User updated successfully',
            severity: 'success'
          });
          fetchUsers(); // Refresh the user list
        }
      } else {
        // Create new user
        if (!formData.password) {
          setSnackbar({
            open: true,
            message: 'Password is required for new users',
            severity: 'error'
          });
          return;
        }
        
        response = await staffService.createStaff(userData);
        if (response.success) {
          setSnackbar({
            open: true,
            message: 'User created successfully',
            severity: 'success'
          });
          fetchUsers(); // Refresh the user list
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: 'Error: ' + (error.response?.data?.error || error.message || 'Unknown error'),
        severity: 'error'
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await staffService.deleteStaff(selectedUser._id);
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success'
        });
        fetchUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting user: ' + (error.response?.data?.error || error.message || 'Unknown error'),
        severity: 'error'
      });
    }
    
    setDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={roleLabels[user.role]?.label || user.role} 
                        color={roleLabels[user.role]?.color || 'default'} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        aria-label="edit"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        aria-label="delete"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
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
            onChange={handleChange}
            required
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="gender-label">Gender</InputLabel>
            <Select
              labelId="gender-label"
              name="gender"
              value={formData.gender}
              label="Gender"
              onChange={handleChange}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="mobile"
            label="Mobile Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.mobile}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              name="role"
              value={formData.role}
              label="Role"
              onChange={handleChange}
              required
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Marketing Staff">Marketing Staff</MenuItem>
              <MenuItem value="Mid-Level Manager">Mid-Level Manager</MenuItem>
              <MenuItem value="Godown Incharge">Godown Incharge</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="password"
            label={selectedUser ? "New Password (leave blank to keep unchanged)" : "Password"}
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={handleChange}
            required={!selectedUser}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
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
}

export default Users; 