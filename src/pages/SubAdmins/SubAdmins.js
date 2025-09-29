import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const permissionLabels = {
  dashboard: 'Dashboard',
  staff: 'Staff Management',
  marketing: 'Marketing Activities',
  orders: 'Order Requests',
  damage: 'Damage Reports',
  tasks: 'Task Management',
  distributors: 'Distributors',
  godown: 'Godown Logs',
  sales: 'Sales Inquiries',
  reports: 'Reports'
};

const SubAdmins = () => {
  const navigate = useNavigate();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentSubAdmin, setCurrentSubAdmin] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: []
  });

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  const fetchSubAdmins = async () => {
    try {
      setLoading(true);
      const response = await authService.getSubAdmins();
      
      if (response.success) {
        setSubAdmins(response.data);
      } else {
        setError(response.error || 'Failed to fetch sub-admins');
      }
    } catch (error) {
      console.error('Error fetching sub-admins:', error);
      setError(error.response?.data?.error || 'Failed to fetch sub-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateDialogOpen = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: []
    });
    setOpenCreateDialog(true);
    setShowPassword(false);
  };

  const handleCreateDialogClose = () => {
    setOpenCreateDialog(false);
  };

  const handleEditDialogOpen = (subAdmin) => {
    setCurrentSubAdmin(subAdmin);
    setFormData({
      name: subAdmin.name,
      email: subAdmin.email,
      password: '',
      permissions: subAdmin.permissions || []
    });
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setCurrentSubAdmin(null);
  };

  const handleDeleteDialogOpen = (subAdmin) => {
    setCurrentSubAdmin(subAdmin);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setCurrentSubAdmin(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePermissionChange = (permission) => {
    const newPermissions = [...formData.permissions];
    
    if (newPermissions.includes(permission)) {
      // Remove permission if already exists
      const index = newPermissions.indexOf(permission);
      newPermissions.splice(index, 1);
    } else {
      // Add permission if it doesn't exist
      newPermissions.push(permission);
    }
    
    setFormData({
      ...formData,
      permissions: newPermissions
    });
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const createSubAdmin = async () => {
    try {
      setLoading(true);
      const response = await authService.createSubAdmin(formData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Sub-admin created successfully',
          severity: 'success'
        });
        setOpenCreateDialog(false);
        fetchSubAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to create sub-admin',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to create sub-admin',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubAdmin = async () => {
    try {
      if (!currentSubAdmin) return;
      
      setLoading(true);
      
      // Extract only the fields we want to update
      const updateData = {
        name: formData.name,
        email: formData.email,
        permissions: formData.permissions
      };
      
      const response = await authService.updateSubAdmin(currentSubAdmin._id, updateData);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Sub-admin updated successfully',
          severity: 'success'
        });
        setOpenEditDialog(false);
        fetchSubAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to update sub-admin',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating sub-admin:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to update sub-admin',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSubAdmin = async () => {
    try {
      if (!currentSubAdmin) return;
      
      setLoading(true);
      
      const response = await authService.deleteSubAdmin(currentSubAdmin._id);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Sub-admin deleted successfully',
          severity: 'success'
        });
        setOpenDeleteDialog(false);
        fetchSubAdmins();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to delete sub-admin',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error deleting sub-admin:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete sub-admin',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter sub-admins based on search query
  const filteredSubAdmins = searchQuery
    ? subAdmins.filter(
        subAdmin =>
          subAdmin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subAdmin.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : subAdmins;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4}>
        Sub-Admin Management
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Total Sub-Admins
              </Typography>
              <Typography variant="h4" sx={{ mb: 2, color: '#B78427', fontWeight: 'bold' }}>
                {subAdmins.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Add */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search for sub-admin..."
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#f5f5f5' }
          }}
          sx={{ width: '70%' }}
        />
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
          sx={{ bgcolor: '#B78427' }}
        >
          Add Sub-Admin
        </Button>
      </Box>

      {/* Sub-Admins Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="error">{error}</Alert>
                  </TableCell>
                </TableRow>
              ) : filteredSubAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No sub-admins found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubAdmins.map((subAdmin) => (
                  <TableRow key={subAdmin._id}>
                    <TableCell>{subAdmin.name}</TableCell>
                    <TableCell>{subAdmin.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(subAdmin.permissions || []).map((permission) => (
                          <Chip
                            key={permission}
                            label={permissionLabels[permission] || permission}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {(!subAdmin.permissions || subAdmin.permissions.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No permissions
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditDialogOpen(subAdmin)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteDialogOpen(subAdmin)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Sub-Admin Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCreateDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Sub-Admin</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Fill in the details to create a new sub-admin. Permissions determine which sections they can access.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleFormChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Permissions
              </Typography>
              <FormGroup>
                <Grid container spacing={1}>
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <Grid item xs={6} key={key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(key)}
                            onChange={() => handlePermissionChange(key)}
                            name={key}
                          />
                        }
                        label={label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button 
            onClick={createSubAdmin} 
            variant="contained" 
            disabled={loading || !formData.name || !formData.email || !formData.password}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sub-Admin Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Sub-Admin</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the sub-admin details and permissions.
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Permissions
              </Typography>
              <FormGroup>
                <Grid container spacing={1}>
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <Grid item xs={6} key={key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(key)}
                            onChange={() => handlePermissionChange(key)}
                            name={key}
                          />
                        }
                        label={label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button 
            onClick={updateSubAdmin} 
            variant="contained" 
            disabled={loading || !formData.name || !formData.email}
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Sub-Admin Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Sub-Admin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {currentSubAdmin?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={deleteSubAdmin} variant="contained" color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete'}
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

export default SubAdmins; 