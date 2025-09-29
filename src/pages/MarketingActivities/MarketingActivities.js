import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  PhotoCamera as CameraIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// Mock data
const distributors = [
  { id: 'd1', name: 'ABC Distributors' },
  { id: 'd2', name: 'XYZ Enterprises' },
  { id: 'd3', name: 'PQR Trading' },
  { id: 'd4', name: 'LMN Enterprises' },
  { id: 'd5', name: 'RST Supply Co.' }
];

const retailShops = [
  { id: 'r1', name: 'Shop 1', distributor: 'd1' },
  { id: 'r2', name: 'Shop 2', distributor: 'd1' },
  { id: 'r3', name: 'Shop 3', distributor: 'd2' },
  { id: 'r4', name: 'Shop 4', distributor: 'd3' },
  { id: 'r5', name: 'Shop 5', distributor: 'd4' }
];

// Product options
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

function MarketingActivities() {
  const { } = useAuth();
  const [activeTab, setActiveTab] = useState('marketing');
  const [activeStep, setActiveStep] = useState(0);
  const [marketingData, setMarketingData] = useState({
    distributor: '',
    initialSupplyEstimate: '',
    distributorStaffType: '',
    distributorStaffName: '',
    modeOfTransport: '',
    selfieWithDistributor: null,
    punchInTime: null,
    punchOutTime: null,
    retailShops: [],
    currentShop: null,
    marketingReport: null
  });
  
  const [orderForm, setOrderForm] = useState({
    brand: '',
    variant: '',
    size: '',
    boxes: ''
  });
  
  const [competitorInfo, setCompetitorInfo] = useState([
    { brand: '', variant: '', size: '', rate: '', stockDate: '' },
    { brand: '', variant: '', size: '', rate: '', stockDate: '' }
  ]);
  
  const [shopFormData, setShopFormData] = useState({
    complaints: '',
    phoneNumber: '',
    photos: [],
    marketingInsights: '',
    isProductDisplayed: 'yes',
    orders: []
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Steps for marketing workflow
  const steps = ['Select Distributor', 'Distributor Details', 'Retail Shop Interaction'];

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle step change
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !marketingData.distributor) {
      setSnackbar({
        open: true,
        message: 'Please select a distributor',
        severity: 'error'
      });
      return;
    }

    if (activeStep === 1) {
      // Set punch in time
      setMarketingData({
        ...marketingData,
        punchInTime: new Date().toISOString()
      });
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle form change
  const handleMarketingChange = (e) => {
    const { name, value } = e.target;
    setMarketingData({
      ...marketingData,
      [name]: value
    });
  };

  // Handle shop form change
  const handleShopFormChange = (e) => {
    const { name, value } = e.target;
    setShopFormData({
      ...shopFormData,
      [name]: value
    });
  };

  // Handle order form change
  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm({
      ...orderForm,
      [name]: value
    });

    // Reset dependent fields
    if (name === 'brand') {
      setOrderForm(prev => ({
        ...prev,
        variant: '',
        size: '',
        [name]: value
      }));
    } else if (name === 'variant') {
      setOrderForm(prev => ({
        ...prev,
        size: '',
        [name]: value
      }));
    }
  };

  // Add order to shop orders
  const handleAddOrder = () => {
    if (!orderForm.brand || !orderForm.variant || !orderForm.size || !orderForm.boxes) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    setShopFormData({
      ...shopFormData,
      orders: [
        ...shopFormData.orders,
        { ...orderForm, id: Date.now().toString() }
      ]
    });

    // Reset order form
    setOrderForm({
      brand: '',
      variant: '',
      size: '',
      boxes: ''
    });
  };

  // Handle competitor info change
  const handleCompetitorChange = (index, field, value) => {
    const updatedInfo = [...competitorInfo];
    updatedInfo[index] = {
      ...updatedInfo[index],
      [field]: value
    };
    setCompetitorInfo(updatedInfo);
  };

  // Handle select shop
  const handleSelectShop = (shop) => {
    setMarketingData({
      ...marketingData,
      currentShop: shop
    });

    // Reset shop form
    setShopFormData({
      complaints: '',
      phoneNumber: '',
      photos: [],
      marketingInsights: '',
      isProductDisplayed: 'yes',
      orders: []
    });
  };

  // Handle save shop data
  const handleSaveShopData = () => {
    // Validate form
    if (!shopFormData.complaints || !shopFormData.phoneNumber) {
      setSnackbar({
        open: true,
        message: 'Please fill all required fields',
        severity: 'error'
      });
      return;
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(shopFormData.phoneNumber)) {
      setSnackbar({
        open: true,
        message: 'Phone number must be 10 digits',
        severity: 'error'
      });
      return;
    }

    // Add shop data to marketing data
    const updatedShops = [...marketingData.retailShops];
    const existingShopIndex = updatedShops.findIndex(
      shop => shop.id === marketingData.currentShop.id
    );

    if (existingShopIndex >= 0) {
      updatedShops[existingShopIndex] = {
        ...marketingData.currentShop,
        data: shopFormData
      };
    } else {
      updatedShops.push({
        ...marketingData.currentShop,
        data: shopFormData
      });
    }

    setMarketingData({
      ...marketingData,
      retailShops: updatedShops,
      currentShop: null
    });

    setSnackbar({
      open: true,
      message: 'Shop data saved successfully',
      severity: 'success'
    });
  };

  // Handle punch out
  const handlePunchOut = () => {
    // Validate that at least one shop has been visited
    if (marketingData.retailShops.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please visit at least one shop before punching out',
        severity: 'error'
      });
      return;
    }

    // Generate marketing report
    const report = {
      punchInTime: marketingData.punchInTime,
      punchOutTime: new Date().toISOString(),
      distributor: distributors.find(d => d.id === marketingData.distributor),
      shopsVisited: marketingData.retailShops.length,
      totalOrders: marketingData.retailShops.reduce(
        (total, shop) => total + (shop.data?.orders?.length || 0), 0
      ),
      ordersByBrand: {},
      ordersBySize: {}
    };

    // Calculate orders by brand and size
    marketingData.retailShops.forEach(shop => {
      if (shop.data && shop.data.orders) {
        shop.data.orders.forEach(order => {
          // By brand
          if (!report.ordersByBrand[order.brand]) {
            report.ordersByBrand[order.brand] = 0;
          }
          report.ordersByBrand[order.brand] += parseInt(order.boxes);

          // By size
          const sizeKey = `${order.brand}-${order.variant}-${order.size}`;
          if (!report.ordersBySize[sizeKey]) {
            report.ordersBySize[sizeKey] = 0;
          }
          report.ordersBySize[sizeKey] += parseInt(order.boxes);
        });
      }
    });

    setMarketingData({
      ...marketingData,
      punchOutTime: new Date().toISOString(),
      marketingReport: report
    });

    setSnackbar({
      open: true,
      message: 'Punched out successfully. Report generated.',
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

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
            <FormControl fullWidth required>
              <InputLabel>Select Distributor</InputLabel>
              <Select
                name="distributor"
                value={marketingData.distributor}
                label="Select Distributor"
                onChange={handleMarketingChange}
              >
                {distributors.map(distributor => (
                  <MenuItem key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Initial Supply Estimate"
                  name="initialSupplyEstimate"
                  value={marketingData.initialSupplyEstimate}
                  onChange={handleMarketingChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Distributor Staff</InputLabel>
                  <Select
                    name="distributorStaffType"
                    value={marketingData.distributorStaffType}
                    label="Distributor Staff"
                    onChange={handleMarketingChange}
                  >
                    <MenuItem value="distributor">Distributor</MenuItem>
                    <MenuItem value="distributorStaff">Distributor Staff</MenuItem>
                    <MenuItem value="peer">Peer</MenuItem>
                    <MenuItem value="none">None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {marketingData.distributorStaffType && marketingData.distributorStaffType !== 'none' && (
                <Grid item xs={12}>
                  <TextField
                    label="Staff Name"
                    name="distributorStaffName"
                    value={marketingData.distributorStaffName}
                    onChange={handleMarketingChange}
                    fullWidth
                    required
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  label="Mode of Transport"
                  name="modeOfTransport"
                  value={marketingData.modeOfTransport}
                  onChange={handleMarketingChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CameraIcon />}
                  fullWidth
                >
                  Upload Selfie with Distributor
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      // In a real app, this would upload the image to a server
                      setMarketingData({
                        ...marketingData,
                        selfieWithDistributor: e.target.files[0]?.name || null
                      });
                    }}
                  />
                </Button>
                {marketingData.selfieWithDistributor && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Uploaded: {marketingData.selfieWithDistributor}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        );
      
      case 2:
        // If no current shop selected, show the shop selection
        if (!marketingData.currentShop) {
          return (
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Select Retail Shop
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handlePunchOut}
                  disabled={marketingData.retailShops.length === 0}
                >
                  Punch Out
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {retailShops
                  .filter(shop => shop.distributor === marketingData.distributor)
                  .map(shop => (
                    <Grid item xs={12} sm={6} md={4} key={shop.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: marketingData.retailShops.some(s => s.id === shop.id) 
                            ? '2px solid #4caf50' 
                            : 'none' 
                        }}
                        onClick={() => handleSelectShop(shop)}
                      >
                        <CardContent>
                          <Typography variant="h6">{shop.name}</Typography>
                          {marketingData.retailShops.some(s => s.id === shop.id) && (
                            <Typography variant="body2" color="success.main">
                              Visited
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                
                {/* Add new shop button */}
                <Grid item xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CardContent>
                      <Button 
                        variant="outlined" 
                        startIcon={<AddIcon />}
                        onClick={() => {
                          // In a real app, this would show a dialog to add a new shop
                          alert('This feature would add a new shop, pending approval by manager');
                        }}
                      >
                        Add New Shop
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Report preview if available */}
              {marketingData.marketingReport && (
                <Paper sx={{ mt: 4, p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Marketing Report
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Punch In Time
                      </Typography>
                      <Typography variant="body1">
                        {new Date(marketingData.marketingReport.punchInTime).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Punch Out Time
                      </Typography>
                      <Typography variant="body1">
                        {new Date(marketingData.marketingReport.punchOutTime).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Distributor
                      </Typography>
                      <Typography variant="body1">
                        {marketingData.marketingReport.distributor.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Shops Visited
                      </Typography>
                      <Typography variant="body1">
                        {marketingData.marketingReport.shopsVisited}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                      <Typography variant="body1">
                        {marketingData.marketingReport.totalOrders} boxes
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Orders by Brand
                      </Typography>
                      <List dense>
                        {Object.entries(marketingData.marketingReport.ordersByBrand).map(([brand, count]) => (
                          <ListItem key={brand}>
                            <ListItemText primary={`${brand}: ${count} boxes`} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => {
                        // In a real app, this would download the report
                        alert('In a real app, this would download the Excel report');
                      }}
                    >
                      Download Report
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          );
        }
        
        // Shop form
        return (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                {marketingData.currentShop.name}
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setMarketingData({...marketingData, currentShop: null})}
              >
                Back to Shop List
              </Button>
            </Box>
            
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Order Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Brand</InputLabel>
                    <Select
                      name="brand"
                      value={orderForm.brand}
                      label="Brand"
                      onChange={handleOrderFormChange}
                    >
                      {Object.keys(productOptions).map((brand) => (
                        <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!orderForm.brand}>
                    <InputLabel>Variant</InputLabel>
                    <Select
                      name="variant"
                      value={orderForm.variant}
                      label="Variant"
                      onChange={handleOrderFormChange}
                    >
                      {orderForm.brand && productOptions[orderForm.brand].variants.map((variant) => (
                        <MenuItem key={variant} value={variant}>{variant}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!orderForm.variant}>
                    <InputLabel>Size</InputLabel>
                    <Select
                      name="size"
                      value={orderForm.size}
                      label="Size"
                      onChange={handleOrderFormChange}
                    >
                      {orderForm.brand && orderForm.variant && 
                        productOptions[orderForm.brand].sizes[orderForm.variant].map((size) => (
                          <MenuItem key={size} value={size}>{size}</MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Number of Boxes"
                    name="boxes"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={orderForm.boxes}
                    onChange={handleOrderFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleAddOrder}
                    startIcon={<AddIcon />}
                  >
                    Add Order
                  </Button>
                </Grid>
              </Grid>
              
              {shopFormData.orders.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Orders
                  </Typography>
                  <List>
                    {shopFormData.orders.map((order, index) => (
                      <ListItem 
                        key={order.id}
                        secondaryAction={
                          <IconButton 
                            edge="end"
                            onClick={() => {
                              const updatedOrders = [...shopFormData.orders];
                              updatedOrders.splice(index, 1);
                              setShopFormData({...shopFormData, orders: updatedOrders});
                            }}
                          >
                            {/* Delete icon would go here */}
                          </IconButton>
                        }
                      >
                        <ListItemText 
                          primary={`${order.brand} - ${order.variant} (${order.size})`}
                          secondary={`${order.boxes} boxes`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Shop Details
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Complaints (Required)"
                    name="complaints"
                    value={shopFormData.complaints}
                    onChange={handleShopFormChange}
                    fullWidth
                    required
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Phone Number (10 digits)"
                    name="phoneNumber"
                    value={shopFormData.phoneNumber}
                    onChange={handleShopFormChange}
                    fullWidth
                    required
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CameraIcon />}
                    fullWidth
                  >
                    Upload Photos
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      multiple
                      onChange={(e) => {
                        // In a real app, this would upload images to a server
                        const fileNames = Array.from(e.target.files || []).map(file => file.name);
                        setShopFormData({
                          ...shopFormData,
                          photos: [...shopFormData.photos, ...fileNames]
                        });
                      }}
                    />
                  </Button>
                  {shopFormData.photos.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Uploaded {shopFormData.photos.length} photos
                      </Typography>
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Market Insights"
                    name="marketingInsights"
                    value={shopFormData.marketingInsights}
                    onChange={handleShopFormChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter text or upload voice recording"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Is Product Displayed?</FormLabel>
                    <RadioGroup
                      row
                      name="isProductDisplayed"
                      value={shopFormData.isProductDisplayed}
                      onChange={handleShopFormChange}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Competitor Information (At least 2 brands)
              </Typography>
              
              {competitorInfo.map((info, index) => (
                <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < competitorInfo.length - 1 ? '1px solid #eee' : 'none' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Competitor {index + 1}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Brand Name"
                        value={info.brand}
                        onChange={(e) => handleCompetitorChange(index, 'brand', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Variant"
                        value={info.variant}
                        onChange={(e) => handleCompetitorChange(index, 'variant', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Size"
                        value={info.size}
                        onChange={(e) => handleCompetitorChange(index, 'size', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Rate"
                        value={info.rate}
                        onChange={(e) => handleCompetitorChange(index, 'rate', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Stock Date (MM/YYYY)"
                        value={info.stockDate}
                        onChange={(e) => handleCompetitorChange(index, 'stockDate', e.target.value)}
                        fullWidth
                        required
                        placeholder="MM/YYYY"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              {competitorInfo.length < 5 && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCompetitorInfo([
                      ...competitorInfo,
                      { brand: '', variant: '', size: '', rate: '', stockDate: '' }
                    ]);
                  }}
                  sx={{ mt: 2 }}
                >
                  Add Another Competitor
                </Button>
              )}
            </Paper>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained"
                onClick={handleSaveShopData}
              >
                Save Shop Data
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Render marketing workflow
  const renderMarketingWorkflow = () => {
    return (
      <Box>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mt: 3 }}>
          {renderStepContent()}
        </Box>
        
        {/* Bottom navigation */}
        {activeStep !== 2 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
            >
              {activeStep === steps.length - 2 ? 'Punch In' : 'Next'}
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'marketing':
        return renderMarketingWorkflow();
      
      case 'orders':
        return (
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Requests
            </Typography>
            <Typography variant="body1">
              This section will contain order request management.
            </Typography>
          </Paper>
        );
      
      case 'damage':
        return (
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Damage & Leakage
            </Typography>
            <Typography variant="body1">
              This section will contain damage and leakage reporting.
            </Typography>
          </Paper>
        );
      
      case 'tasks':
        return (
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Tasks
            </Typography>
            <Typography variant="body1">
              This section will contain task management.
            </Typography>
          </Paper>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Marketing Activities
        </Typography>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Grid container>
              <Grid item xs={3}>
                <Button 
                  fullWidth 
                  sx={{ 
                    py: 2, 
                    borderRadius: 0,
                    borderBottom: activeTab === 'marketing' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'marketing' ? 'primary.main' : 'text.primary'
                  }}
                  onClick={() => handleTabChange('marketing')}
                >
                  Marketing
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button 
                  fullWidth 
                  sx={{ 
                    py: 2, 
                    borderRadius: 0,
                    borderBottom: activeTab === 'orders' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'orders' ? 'primary.main' : 'text.primary'
                  }}
                  onClick={() => handleTabChange('orders')}
                >
                  Order Requests
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button 
                  fullWidth 
                  sx={{ 
                    py: 2, 
                    borderRadius: 0,
                    borderBottom: activeTab === 'damage' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'damage' ? 'primary.main' : 'text.primary'
                  }}
                  onClick={() => handleTabChange('damage')}
                >
                  Damage & Leakage
                </Button>
              </Grid>
              <Grid item xs={3}>
                <Button 
                  fullWidth 
                  sx={{ 
                    py: 2, 
                    borderRadius: 0,
                    borderBottom: activeTab === 'tasks' ? '2px solid #1976d2' : 'none',
                    color: activeTab === 'tasks' ? 'primary.main' : 'text.primary'
                  }}
                  onClick={() => handleTabChange('tasks')}
                >
                  Tasks
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      
      {renderTabContent()}
      
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

export default MarketingActivities; 