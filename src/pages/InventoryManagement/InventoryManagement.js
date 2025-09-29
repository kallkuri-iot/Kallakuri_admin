import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Balance as BalanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Store as StoreIcon,
  LocalShipping as LocalShippingIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, startOfDay, endOfDay } from 'date-fns';
import { staffService } from '../../services/api';
import analyticsService from '../../services/analyticsService';
import { downloadCSV } from '../../utils/csvExport';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Detailed Inventory View Modal Component
function InventoryDetailModal({ open, onClose, inventoryItem }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState('panel1');
  
  if (!inventoryItem) return null;

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical': return theme.palette.error.dark;
      case 'Low': return theme.palette.warning.dark;
      case 'Adequate': return theme.palette.info.dark;
      case 'Sufficient': return theme.palette.success.dark;
      default: return theme.palette.text.primary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Critical': return <WarningIcon color="error" />;
      case 'Low': return <WarningIcon color="warning" />;
      case 'Adequate': return <InfoIcon color="info" />;
      case 'Sufficient': return <CheckCircleIcon color="success" />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Inventory Details: {inventoryItem.brandName} - {inventoryItem.variant}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Header Info Card */}
        <Card sx={{ m: 3, mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Distributor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {inventoryItem.distributorName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Product Size
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {inventoryItem.size}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Initial Stock Section */}
        <Paper sx={{ m: 3, mb: 2 }}>
          <Box sx={{ p: 2, bgcolor: theme.palette.primary.light, color: 'white' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1 }} />
              Initial Stock Estimate and Rate
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.grey[50] }}>
                  <TableCell><strong>Brand</strong></TableCell>
                  <TableCell><strong>Variant</strong></TableCell>
                  <TableCell><strong>Size</strong></TableCell>
                  <TableCell align="center"><strong>Stock Quantity</strong></TableCell>
                  <TableCell align="center"><strong>Rate (₹)</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{inventoryItem.brandName}</TableCell>
                  <TableCell>{inventoryItem.variant}</TableCell>
                  <TableCell>{inventoryItem.size}</TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      {inventoryItem.currentStock} units
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      ₹{inventoryItem.proposedRate || 0}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Sales Orders Section */}
        <Paper sx={{ m: 3, mb: 2 }}>
          <Accordion 
            expanded={expanded === 'panel1'} 
            onChange={handleChange('panel1')}
            elevation={0}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: theme.palette.secondary.light,
                color: 'white',
                '&:hover': { bgcolor: theme.palette.secondary.dark }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <ShoppingCartIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Sales Orders & Requirements
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={`${inventoryItem.uniqueShopsCount} Shops`} 
                    size="small" 
                    sx={{ mr: 1, color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                  <Chip 
                    label={`${inventoryItem.orderCount} Orders`} 
                    size="small" 
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }} 
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Shop Name</strong></TableCell>
                      <TableCell align="right"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Order Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItem.uniqueShops && inventoryItem.uniqueShops.length > 0 ? (
                      inventoryItem.uniqueShops.map((shop, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body2">
                              {shop.shopName || 'Unnamed Shop'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Order ID: {shop.shopId?.toString().slice(-6) || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={`${shop.quantity} units`} 
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatDate(shop.orderDate)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No order data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Summary Row */}
                    <TableRow sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          Total Orders
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" color="secondary">
                          {inventoryItem.totalRequirement} units
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="textSecondary">
                          {inventoryItem.latestOrderDate ? 
                            `Last order: ${formatDate(inventoryItem.latestOrderDate)}` : 
                            'No orders'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Paper>

        {/* Inventory Calculation Section */}
        <Paper sx={{ m: 3, mb: 2, border: `2px solid ${getStatusColor(inventoryItem.stockStatus)}` }}>
          <Accordion 
            expanded={expanded === 'panel2'} 
            onChange={handleChange('panel2')}
            defaultExpanded
            elevation={0}
            sx={{
              '&:before': { display: 'none' },
              border: 'none',
              boxShadow: 'none'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: `${getStatusColor(inventoryItem.stockStatus)}10`,
                '&:hover': { 
                  bgcolor: `${getStatusColor(inventoryItem.stockStatus)}20`,
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: 'white'
                  }
                },
                p: 0
              }}
            >
            <Box sx={{ 
              p: 2, 
              bgcolor: getStatusColor(inventoryItem.stockStatus), 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              width: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {getStatusIcon(inventoryItem.stockStatus)}
                <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                  Inventory Status: {inventoryItem.stockStatus}
                </Typography>
                <Chip 
                  label={`${inventoryItem.stockPercentage}% Coverage`} 
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" color="primary">
                      {inventoryItem.currentStock}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Initial Stock (units)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ShoppingCartIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h4" color="secondary">
                      {inventoryItem.totalRequirement}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Shop Orders (units)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ bgcolor: `${getStatusColor(inventoryItem.stockStatus)}10` }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    {getStatusIcon(inventoryItem.stockStatus)}
                    <Typography 
                      variant="h4" 
                      sx={{ color: getStatusColor(inventoryItem.stockStatus), fontWeight: 'bold' }}
                    >
                      {inventoryItem.stockDifference >= 0 ? '+' : ''}{inventoryItem.stockDifference}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inventory Status (units)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Formula Display */}
            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.grey[50], 
              borderRadius: 1, 
              textAlign: 'center' 
            }}>
              <Typography variant="h6" gutterBottom>
                Calculation Formula
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
                <strong>Inventory Status = Initial Stock - Total Shop Orders</strong>
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', mt: 1 }}>
                {inventoryItem.currentStock} - {inventoryItem.totalRequirement} = {inventoryItem.stockDifference >= 0 ? '+' : ''}{inventoryItem.stockDifference}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={getStatusIcon(inventoryItem.stockStatus)}
                  label={`Status: ${inventoryItem.stockStatus}`}
                  color={inventoryItem.stockStatus === 'Shortage' ? 'error' : inventoryItem.stockStatus === 'Sufficient' ? 'success' : 'warning'}
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={`Stock Coverage: ${inventoryItem.stockPercentage}%`}
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Status Explanation */}
            <Box sx={{ mt: 2 }}>
              {inventoryItem.stockDifference > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Sufficient Stock:</strong> You have {Math.abs(inventoryItem.stockDifference)} extra units available beyond the current shop requirements.
                  </Typography>
                </Alert>
              )}
              {inventoryItem.stockDifference < 0 && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Stock Shortage:</strong> You need {Math.abs(inventoryItem.stockDifference)} additional units to fulfill all shop orders.
                  </Typography>
                </Alert>
              )}
              {inventoryItem.stockDifference === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Balanced Stock:</strong> Your current stock exactly matches the shop requirements with no surplus or shortage.
                  </Typography>
                </Alert>
              )}
            </Box>
          </Box>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InventoryManagement() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [inventoryData, setInventoryData] = useState({
    inventoryAnalysis: [],
    summary: {},
    distributorSummary: [],
    timeRange: 'last30days',
    generatedAt: null
  });
  const [filters, setFilters] = useState({
    timeRange: 'last30days',
    distributorId: '',
    staffId: '',
    stockStatus: '',
    searchQuery: '',
    fromDate: null,
    toDate: null
  });
  const [staff, setStaff] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [error, setError] = useState(null);
  
  // Modal state for detailed view
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);

  // Time range options
  const timeRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'last6months', label: 'Last 6 Months' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Stock status options
  const stockStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Shortage', label: 'Shortage' },
    { value: 'Sufficient', label: 'Sufficient' },
    { value: 'Balanced', label: 'Balanced' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (filters.timeRange || filters.distributorId || filters.staffId || filters.fromDate || filters.toDate) {
      fetchInventoryData();
    }
  }, [filters.timeRange, filters.distributorId, filters.staffId, filters.fromDate, filters.toDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff data
      const staffResponse = await staffService.getAllStaff(1, 100, 'Marketing Staff');
      if (staffResponse && staffResponse.success) {
        setStaff(staffResponse.data);
      }

      await fetchInventoryData();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        timeRange: filters.timeRange,
        ...(filters.distributorId && { distributorId: filters.distributorId }),
        ...(filters.staffId && { staffId: filters.staffId })
      };

      // Add custom date range if selected
      if (filters.timeRange === 'custom' && filters.fromDate && filters.toDate) {
        params.fromDate = format(startOfDay(filters.fromDate), 'yyyy-MM-dd');
        params.toDate = format(endOfDay(filters.toDate), 'yyyy-MM-dd');
      }

      const response = await analyticsService.getInventoryAnalysis(params);
      
      if (response && response.success) {        
        setInventoryData(response.data);
        
        // Extract unique distributors for filter dropdown
        const uniqueDistributors = response.data.distributorSummary.map(dist => ({
          id: dist.distributorId,
          name: dist.distributorName
        }));
        setDistributors(uniqueDistributors);
      } else {
        throw new Error('Failed to fetch inventory data');
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset custom dates when timeRange changes away from custom
      ...(name === 'timeRange' && value !== 'custom' && {
        fromDate: null,
        toDate: null
      })
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchInventoryData();
  };

  // Handle view button click
  const handleViewDetails = (inventoryItem) => {
    setSelectedInventoryItem(inventoryItem);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedInventoryItem(null);
  };

  const handleExport = (type = 'all') => {
    const dataToExport = filteredInventoryData.length > 0 ? filteredInventoryData : inventoryData.inventoryAnalysis;
    
    if (dataToExport.length === 0) {
      alert('No data available to export');
      return;
    }

    let exportData, fileName;

    switch (type) {
      case 'summary':
        exportData = [{
          'Period': filters.timeRange === 'custom' && filters.fromDate && filters.toDate 
            ? `${format(filters.fromDate, 'yyyy-MM-dd')} to ${format(filters.toDate, 'yyyy-MM-dd')}`
            : timeRangeOptions.find(opt => opt.value === filters.timeRange)?.label || 'Last 30 Days',
          'Total Products': inventoryData.summary.totalProducts || 0,
          'Shortage Products': inventoryData.summary.shortageProducts || 0,
          'Sufficient Products': inventoryData.summary.sufficientProducts || 0,
          'Critical Shortages': inventoryData.summary.criticalShortages || 0,
          'Average Stock Health': `${inventoryData.summary.averageStockPercentage || 0}%`,
          'Total Shortage Quantity': inventoryData.summary.totalShortageQuantity || 0,
          'Total Surplus Quantity': inventoryData.summary.totalSurplusQuantity || 0
        }];
        fileName = 'inventory_summary.csv';
        break;

      case 'distributors':
        exportData = inventoryData.distributorSummary.map(dist => ({
          'Distributor': dist.distributorName,
          'Total Products': dist.totalProducts,
          'Shortage Count': dist.shortageCount,
          'Sufficient Count': dist.sufficientCount,
          'Balanced Count': dist.balancedCount,
          'Total Shortage Quantity': dist.totalShortage,
          'Total Surplus Quantity': dist.totalSurplus
        }));
        fileName = 'distributor_wise_inventory.csv';
        break;

      default:
        exportData = dataToExport.map(item => ({
          'Date': inventoryData.generatedAt ? format(new Date(inventoryData.generatedAt), 'yyyy-MM-dd') : 'N/A',
          'Distributor': item.distributorName,
          'Brand': item.brandName,
          'Variant': item.variant,
          'Size': item.size,
          'Current Stock': item.currentStock,
          'Total Requirement': item.totalRequirement,
          'Stock Difference': item.stockDifference,
          'Stock Status': item.stockStatus,
          'Stock Percentage': `${item.stockPercentage}%`,
          'Number of Orders': item.orderCount,
          'Unique Shops': item.uniqueShopsCount,
          'Total Order Value': item.totalOrderValue || 0,
          'Proposed Rate': item.proposedRate || 0
        }));
        fileName = `inventory_analysis_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    }

    downloadCSV(exportData, fileName);
  };

  // Filter and search inventory data
  const filteredInventoryData = inventoryData.inventoryAnalysis.filter(item => {
    const matchesStatus = !filters.stockStatus || item.stockStatus === filters.stockStatus;
    const matchesSearch = !filters.searchQuery || 
      item.brandName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.variant.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      item.distributorName.toLowerCase().includes(filters.searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Group data by date for date-wise view
  const groupedByDate = inventoryData.inventoryAnalysis.reduce((acc, item) => {
    const date = item.lastStockUpdate ? format(new Date(item.lastStockUpdate), 'yyyy-MM-dd') : 'Unknown Date';
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Group data by distributor for distributor-wise view
  const groupedByDistributor = inventoryData.distributorSummary;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Shortage': return 'error';
      case 'Sufficient': return 'success';
      case 'Balanced': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Shortage': return <TrendingDownIcon fontSize="small" />;
      case 'Sufficient': return <TrendingUpIcon fontSize="small" />;
      case 'Balanced': return <BalanceIcon fontSize="small" />;
      default: return <InventoryIcon fontSize="small" />;
    }
  };

  const renderSummaryCards = () => {
    const { summary } = inventoryData;
    
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" component="div">
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {summary.totalProducts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <Typography variant="h6" component="div">
                  Shortages
                </Typography>
              </Box>
              <Typography variant="h4" color="error">
                {summary.shortageProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.criticalShortages || 0} Critical (&lt;25%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, color: theme.palette.success.main }} />
                <Typography variant="h6" component="div">
                  Sufficient Stock
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {summary.sufficientProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {summary.totalSurplusQuantity || 0} units surplus
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BalanceIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="h6" component="div">
                  Stock Health
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {summary.averageStockPercentage || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Stock Coverage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFilters = () => {
    return (
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={filters.timeRange}
                label="Time Range"
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
              >
                {timeRangeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {filters.timeRange === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="From Date"
                    value={filters.fromDate}
                    onChange={(date) => handleFilterChange('fromDate', date)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="To Date"
                    value={filters.toDate}
                    onChange={(date) => handleFilterChange('toDate', date)}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Staff</InputLabel>
              <Select
                value={filters.staffId}
                label="Staff"
                onChange={(e) => handleFilterChange('staffId', e.target.value)}
              >
                <MenuItem value="">All Staff</MenuItem>
                {staff.map(staffMember => (
                  <MenuItem key={staffMember._id} value={staffMember._id}>
                    {staffMember.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Distributor</InputLabel>
              <Select
                value={filters.distributorId}
                label="Distributor"
                onChange={(e) => handleFilterChange('distributorId', e.target.value)}
              >
                <MenuItem value="">All Distributors</MenuItem>
                {distributors.map(distributor => (
                  <MenuItem key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Stock Status</InputLabel>
              <Select
                value={filters.stockStatus}
                label="Stock Status"
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              >
                {stockStatusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              placeholder="Brand, Variant, Distributor"
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('all')}
            disabled={loading || filteredInventoryData.length === 0}
          >
            Export All
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('summary')}
            disabled={loading}
          >
            Export Summary
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExport('distributors')}
            disabled={loading}
          >
            Export Distributors
          </Button>
        </Box>
      </Paper>
    );
  };

  const renderInventoryTable = (data) => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
              <TableCell><strong>Distributor</strong></TableCell>
              <TableCell><strong>Brand</strong></TableCell>
              <TableCell><strong>Variant</strong></TableCell>
              <TableCell><strong>Size</strong></TableCell>
              <TableCell align="center"><strong>Current Stock</strong></TableCell>
              <TableCell align="center"><strong>Requirements</strong></TableCell>
              <TableCell align="center"><strong>Difference</strong></TableCell>
              <TableCell align="center"><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Stock %</strong></TableCell>
              <TableCell align="center"><strong>Orders</strong></TableCell>
              <TableCell align="center"><strong>Shops</strong></TableCell>
              <TableCell align="center"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                      <StoreIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">
                      {item.distributorName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {item.brandName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.variant}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.size}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {item.currentStock}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.totalRequirement}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={item.stockDifference >= 0 ? 'success.main' : 'error.main'}
                  >
                    {item.stockDifference >= 0 ? '+' : ''}{item.stockDifference}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    icon={getStatusIcon(item.stockStatus)}
                    label={item.stockStatus}
                    color={getStatusColor(item.stockStatus)}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(item.stockPercentage, 100)}
                        color={item.stockPercentage >= 75 ? 'success' : item.stockPercentage >= 50 ? 'warning' : 'error'}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {item.stockPercentage}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.orderCount}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {item.uniqueShopsCount}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleViewDetails(item)}
                    sx={{ 
                      backgroundColor: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {data.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InventoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Inventory Data Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or check if staff activities have been completed.
            </Typography>
          </Box>
        )}
      </TableContainer>
    );
  };

  const renderDateWiseView = () => {
    const dates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Date-wise Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete staff activities will appear here grouped by date.
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {dates.map(date => (
          <Accordion key={date} defaultExpanded={dates.indexOf(date) === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  {date === 'Unknown Date' ? date : format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                </Typography>
                <Chip 
                  label={`${groupedByDate[date].length} items`} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {renderInventoryTable(groupedByDate[date])}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderDistributorWiseView = () => {
    if (groupedByDistributor.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Distributor-wise Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Completed staff activities will appear here grouped by distributor.
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {groupedByDistributor.map(distributor => {
          const distributorItems = inventoryData.inventoryAnalysis.filter(
            item => item.distributorId === distributor.distributorId
          );
          
          return (
            <Accordion key={distributor.distributorId} defaultExpanded={groupedByDistributor.indexOf(distributor) === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {distributor.distributorName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`${distributor.totalProducts} products`} 
                      size="small" 
                      color="primary" 
                    />
                    <Chip 
                      label={`${distributor.shortageCount} shortages`} 
                      size="small" 
                      color="error" 
                    />
                    <Chip 
                      label={`${distributor.sufficientCount} sufficient`} 
                      size="small" 
                      color="success" 
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderInventoryTable(distributorItems)}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  };

  if (loading && inventoryData.inventoryAnalysis.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1">
            Inventory Management System
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {inventoryData.generatedAt && (
            `Last updated: ${format(new Date(inventoryData.generatedAt), 'PPp')}`
          )}
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Track distributor stock levels against shop requirements with detailed analysis accessible via "View" buttons.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {renderSummaryCards()}
      {renderFilters()}
      
      <Paper sx={{ mb: 3 }}>
        {loading && <LinearProgress />}
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<InventoryIcon />} label="All Inventory" />
          <Tab icon={<CalendarIcon />} label="Date-wise View" />
          <Tab icon={<BusinessIcon />} label="Distributor-wise View" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderInventoryTable(filteredInventoryData)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderDateWiseView()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderDistributorWiseView()}
        </TabPanel>
      </Paper>

      {/* Detailed Inventory View Modal */}
      <InventoryDetailModal 
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        inventoryItem={selectedInventoryItem}
      />
    </Container>
  );
}

export default InventoryManagement; 