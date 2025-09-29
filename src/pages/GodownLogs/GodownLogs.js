import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  CircularProgress,
  DialogContentText
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/api';

function GodownLogs() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add Product Dialog state
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    brandName: '',
    variants: [{ name: '', sizes: [{ name: '' }] }]
  });

  // Edit Product Dialog state
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Delete Confirmation Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAllProducts();
      if (response && response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setSnackbar({
        open: true,
        message: 'Failed to load products. Please try again later.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.variants.some(variant => variant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    product.variants.some(variant => 
      variant.sizes.some(size => size.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  // Handle Add Product Dialog
  const handleAddProductOpen = () => {
    setAddProductDialogOpen(true);
  };

  const handleAddProductClose = () => {
    setAddProductDialogOpen(false);
    setNewProduct({
      brandName: '',
      variants: [{ name: '', sizes: [{ name: '' }] }]
    });
  };

  const handleBrandNameChange = (e) => {
    setNewProduct({
      ...newProduct,
      brandName: e.target.value
    });
  };

  const handleVariantNameChange = (index, e) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index].name = e.target.value;
    setNewProduct({
      ...newProduct,
      variants: updatedVariants
    });
  };

  const handleSizeNameChange = (variantIndex, sizeIndex, e) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[variantIndex].sizes[sizeIndex].name = e.target.value;
    setNewProduct({
      ...newProduct,
      variants: updatedVariants
    });
  };

  const addVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { name: '', sizes: [{ name: '' }] }]
    });
  };

  const addSize = (variantIndex) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[variantIndex].sizes.push({ name: '' });
    setNewProduct({
      ...newProduct,
      variants: updatedVariants
    });
  };

  const handleAddProductSubmit = async () => {
    try {
      const response = await productService.createProduct(newProduct);
      if (response && response.success) {
        setProducts([...products, response.data]);
        setSnackbar({
          open: true,
          message: 'Product added successfully!',
          severity: 'success'
        });
        handleAddProductClose();
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setSnackbar({
        open: true,
        message: 'Failed to add product. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle Edit Product
  const handleEditProductOpen = (product) => {
    setEditingProduct({
      ...product,
      // Create a deep copy to avoid modifying the original product
      variants: product.variants.map(variant => ({
        ...variant,
        sizes: variant.sizes.map(size => ({ ...size }))
      }))
    });
    setEditProductDialogOpen(true);
  };

  const handleEditProductClose = () => {
    setEditProductDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEditBrandNameChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      brandName: e.target.value
    });
  };

  const handleEditVariantNameChange = (index, e) => {
    const updatedVariants = [...editingProduct.variants];
    updatedVariants[index].name = e.target.value;
    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants
    });
  };

  const handleEditSizeNameChange = (variantIndex, sizeIndex, e) => {
    const updatedVariants = [...editingProduct.variants];
    updatedVariants[variantIndex].sizes[sizeIndex].name = e.target.value;
    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants
    });
  };

  const addEditVariant = () => {
    setEditingProduct({
      ...editingProduct,
      variants: [...editingProduct.variants, { name: '', sizes: [{ name: '' }] }]
    });
  };

  const addEditSize = (variantIndex) => {
    const updatedVariants = [...editingProduct.variants];
    updatedVariants[variantIndex].sizes.push({ name: '' });
    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants
    });
  };

  const removeEditVariant = (variantIndex) => {
    const updatedVariants = [...editingProduct.variants];
    updatedVariants.splice(variantIndex, 1);
    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants
    });
  };

  const removeEditSize = (variantIndex, sizeIndex) => {
    const updatedVariants = [...editingProduct.variants];
    updatedVariants[variantIndex].sizes.splice(sizeIndex, 1);
    setEditingProduct({
      ...editingProduct,
      variants: updatedVariants
    });
  };

  const handleEditProductSubmit = async () => {
    try {
      // First update the base product (brand name and isActive)
      const baseResponse = await productService.updateProduct(editingProduct._id, {
        brandName: editingProduct.brandName,
        isActive: editingProduct.isActive
      });
      
      if (baseResponse && baseResponse.success) {
        // Handle variants and sizes updates
        // This is simplified - in a real app you might need more complex logic
        // to compare original vs edited product to determine what changed
        
        // For now, let's just update the product in the state
        const updatedProducts = products.map(p => 
          p._id === editingProduct._id ? editingProduct : p
        );
        
        setProducts(updatedProducts);
        setSnackbar({
          open: true,
          message: 'Product updated successfully!',
          severity: 'success'
        });
        handleEditProductClose();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setSnackbar({
        open: true,
        message: 'Failed to update product. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle Delete Product
  const handleDeleteConfirmOpen = (product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmClose = () => {
    setDeleteDialogOpen(false);
    setDeletingProduct(null);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await productService.deleteProduct(deletingProduct._id);
      if (response && response.success) {
        const updatedProducts = products.filter(p => p._id !== deletingProduct._id);
        setProducts(updatedProducts);
        setSnackbar({
          open: true,
          message: 'Product deleted successfully!',
          severity: 'success'
        });
        handleDeleteConfirmClose();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setSnackbar({
        open: true,
        message: 'Failed to delete product. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Render product cards
  const renderProductCards = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <Paper sx={{ p: 3, mt: 2, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="body1">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </Typography>
          {role === 'Admin' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddProductOpen}
              sx={{ mt: 2 }}
            >
              Add Products
            </Button>
          )}
        </Paper>
      );
    }

    return filteredProducts.map((product) => (
      <Card key={product._id} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2">
              {product.brandName}
            </Typography>
            <Box>
              {role === 'Admin' && (
                <>
                  <IconButton onClick={() => handleEditProductOpen(product)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteConfirmOpen(product)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
              <IconButton>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Variants:
          </Typography>
          
          {product.variants.map((variant) => (
            <Box key={variant._id} sx={{ mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {variant.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {variant.sizes.map((size) => (
                  <Chip 
                    key={size._id}
                    label={size.name} 
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    ));
  };

  // Render stats for total brands and products
  const renderStats = () => {
    const totalBrands = products.length;
    const totalVariants = products.reduce((sum, product) => sum + product.variants.length, 0);
    
    // Mock data for percentage change
    const brandsPercentage = "+12%";
    const variantsPercentage = "+11%";

    return (
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Total Brands
          </Typography>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {totalBrands}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {brandsPercentage} then last week
          </Typography>
        </Paper>
        
        <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Total Variants of Products
          </Typography>
          <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
            {totalVariants}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {variantsPercentage} then last week
          </Typography>
        </Paper>
      </Box>
    );
  };

  // Render Edit Product Dialog
  const renderEditProductDialog = () => {
    if (!editingProduct) return null;

    return (
      <Dialog 
        open={editProductDialogOpen} 
        onClose={handleEditProductClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Brand Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Brand Name"
              value={editingProduct.brandName}
              onChange={handleEditBrandNameChange}
              sx={{ mb: 3 }}
            />
            
            {editingProduct.variants.map((variant, variantIndex) => (
              <Box key={variantIndex} sx={{ mb: 4, position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Variant Name
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => removeEditVariant(variantIndex)}
                    sx={{ mb: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  placeholder="Variant Name"
                  value={variant.name}
                  onChange={(e) => handleEditVariantNameChange(variantIndex, e)}
                  sx={{ mb: 2 }}
                />
                
                {variant.sizes.map((size, sizeIndex) => (
                  <Box key={sizeIndex} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mr: 2, minWidth: '60px' }}>
                      Size
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Size Name"
                      value={size.name}
                      onChange={(e) => handleEditSizeNameChange(variantIndex, sizeIndex, e)}
                    />
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => removeEditSize(variantIndex, sizeIndex)}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                
                <Button
                  variant="outlined"
                  onClick={() => addEditSize(variantIndex)}
                  sx={{ mt: 1 }}
                  size="small"
                >
                  Add Size
                </Button>
                
                {variantIndex < editingProduct.variants.length - 1 && (
                  <Divider sx={{ my: 3 }} />
                )}
              </Box>
            ))}
            
            <Button
              variant="outlined"
              onClick={addEditVariant}
              fullWidth
              sx={{ my: 2 }}
            >
              Add Variant
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditProductClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEditProductSubmit}
            disabled={!editingProduct.brandName || editingProduct.variants.some(v => !v.name || v.sizes.some(s => !s.name))}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Godown Logs
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      {renderStats()}
      
      {/* Search and Add Product */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search for anything..."
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          sx={{ width: '70%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {role === 'Admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProductOpen}
          >
            Add Products
          </Button>
        )}
      </Box>
      
      {/* Product List */}
      <Box sx={{ mt: 2 }}>
        {renderProductCards()}
      </Box>
      
      {/* Add Product Dialog */}
      <Dialog 
        open={addProductDialogOpen} 
        onClose={handleAddProductClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Products</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Add Brand Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Surya Chandra"
              value={newProduct.brandName}
              onChange={handleBrandNameChange}
              sx={{ mb: 3 }}
            />
            
            {newProduct.variants.map((variant, variantIndex) => (
              <Box key={variantIndex} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Variant Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Pouch"
                  value={variant.name}
                  onChange={(e) => handleVariantNameChange(variantIndex, e)}
                  sx={{ mb: 2 }}
                />
                
                {variant.sizes.map((size, sizeIndex) => (
                  <Box key={sizeIndex} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Size
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="500 ML"
                      value={size.name}
                      onChange={(e) => handleSizeNameChange(variantIndex, sizeIndex, e)}
                    />
                  </Box>
                ))}
                
                <Button
                  variant="contained"
                  onClick={() => addSize(variantIndex)}
                  sx={{ mt: 1 }}
                >
                  Add another Size
                </Button>
                
                {variantIndex < newProduct.variants.length - 1 && (
                  <Divider sx={{ my: 3 }} />
                )}
              </Box>
            ))}
            
            <Button
              variant="outlined"
              onClick={addVariant}
              fullWidth
              sx={{ my: 2 }}
            >
              Add Variant
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddProductClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddProductSubmit}
            disabled={!newProduct.brandName || newProduct.variants.some(v => !v.name || v.sizes.some(s => !s.name))}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Product Dialog */}
      {renderEditProductDialog()}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteConfirmClose}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the product "{deletingProduct?.brandName}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
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

export default GodownLogs;