import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete, Edit, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';
import { format } from 'date-fns';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function StaffDistributorAssignments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [marketingStaff, setMarketingStaff] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedDistributors, setSelectedDistributors] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch assignments, staff, and distributors on component mount
  useEffect(() => {
    fetchAssignments();
    fetchMarketingStaff();
    fetchDistributors();
  }, [page, rowsPerPage]);

  // Fetch assignments with pagination
  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff-assignments?page=${page + 1}&limit=${rowsPerPage}`);
      
      if (response.data.success) {
        setAssignments(response.data.data);
        setTotalCount(response.data.pagination.totalItems);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch assignments',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch marketing staff
  const fetchMarketingStaff = async () => {
    try {
      const response = await api.get('/staff?role=Marketing%20Staff');
      
      if (response.data.success) {
        setMarketingStaff(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching marketing staff:', error);
    }
  };

  // Fetch distributors
  const fetchDistributors = async () => {
    try {
      const response = await api.get('/distributors');
      
      if (response.data.success) {
        setDistributors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching distributors:', error);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open form for creating a new assignment
  const handleOpenForm = () => {
    setIsEditMode(false);
    setSelectedStaff('');
    setSelectedDistributors([]);
    setIsFormOpen(true);
  };

  // Open form for editing an existing assignment
  const handleEditAssignment = async (staffId) => {
    try {
      setLoading(true);
      const response = await api.get(`/staff-assignments/${staffId}`);
      
      if (response.data.success) {
        const assignment = response.data.data;
        setCurrentAssignmentId(assignment._id);
        setSelectedStaff(assignment.staffId._id);
        setSelectedDistributors(assignment.distributorIds.map(dist => dist._id));
        setIsEditMode(true);
        setIsFormOpen(true);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch assignment details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Handle staff selection change
  const handleStaffChange = (event) => {
    setSelectedStaff(event.target.value);
  };

  // Handle distributors selection change
  const handleDistributorsChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDistributors(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // Submit form to create or update assignment
  const handleSubmitForm = async () => {
    if (!selectedStaff || selectedDistributors.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select a staff member and at least one distributor',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      const data = {
        staffId: selectedStaff,
        distributorIds: selectedDistributors
      };
      
      if (isEditMode) {
        // Update existing assignment
        await api.post('/staff-assignments', data);
        setSnackbar({
          open: true,
          message: 'Assignment updated successfully',
          severity: 'success'
        });
      } else {
        // Create new assignment
        await api.post('/staff-assignments', data);
        setSnackbar({
          open: true,
          message: 'Assignment created successfully',
          severity: 'success'
        });
      }
      
      // Refresh assignments and close form
      fetchAssignments();
      handleCloseForm();
    } catch (error) {
      console.error('Error saving assignment:', error);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditMode ? 'update' : 'create'} assignment`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAssignmentToDelete(null);
  };

  // Delete assignment
  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      setLoading(true);
      await api.delete(`/staff-assignments/${assignmentToDelete._id}`);
      
      setSnackbar({
        open: true,
        message: 'Assignment deleted successfully',
        severity: 'success'
      });
      
      // Refresh assignments and close dialog
      fetchAssignments();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete assignment',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader 
        title="Staff-Distributor Assignments" 
        subtitle="Manage marketing staff assignments to distributors"
        icon={<PersonAdd fontSize="large" />}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAdd />}
          onClick={handleOpenForm}
        >
          Create Assignment
        </Button>
      </Box>
      
      <Card>
        <CardContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {!loading && assignments.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 3 }}>
              No assignments found. Create a new assignment to get started.
            </Typography>
          )}
          
          {!loading && assignments.length > 0 && (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>Assigned Distributors</TableCell>
                      <TableCell>Assigned By</TableCell>
                      <TableCell>Assigned Date</TableCell>
                      <TableCell>Last Updated</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell>{assignment.staffId?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {assignment.distributorIds?.map((dist, index) => (
                            <Chip 
                              key={dist._id} 
                              label={dist.name} 
                              size="small" 
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </TableCell>
                        <TableCell>{assignment.assignedBy?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          {assignment.assignedAt ? format(new Date(assignment.assignedAt), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {assignment.lastUpdatedAt ? format(new Date(assignment.lastUpdatedAt), 'dd/MM/yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="primary" 
                            onClick={() => handleEditAssignment(assignment.staffId._id)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(assignment)}
                          >
                            <Delete />
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
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit Staff-Distributor Assignment' : 'Create Staff-Distributor Assignment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Marketing Staff</InputLabel>
                <Select
                  value={selectedStaff}
                  onChange={handleStaffChange}
                  label="Marketing Staff"
                  disabled={isEditMode}
                >
                  {marketingStaff.map((staff) => (
                    <MenuItem key={staff._id} value={staff._id}>
                      {staff.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Distributors</InputLabel>
                <Select
                  multiple
                  value={selectedDistributors}
                  onChange={handleDistributorsChange}
                  input={<OutlinedInput label="Distributors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const distributor = distributors.find(d => d._id === value);
                        return (
                          <Chip key={value} label={distributor ? distributor.name : value} />
                        );
                      })}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {distributors.map((distributor) => (
                    <MenuItem key={distributor._id} value={distributor._id}>
                      <Checkbox checked={selectedDistributors.indexOf(distributor._id) > -1} />
                      <ListItemText primary={distributor.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button 
            onClick={handleSubmitForm} 
            variant="contained" 
            color="primary" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Delete Assignment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the assignment for {assignmentToDelete?.staffId?.name}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteAssignment} 
            color="error" 
            variant="contained" 
            disabled={loading}
          >
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
    </Box>
  );
}

export default StaffDistributorAssignments; 