import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Avatar,
  InputAdornment
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

/**
 * A reusable component for filter panels across the admin interface
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the filter panel
 * @param {Array} props.filters - Array of filter configurations
 * @param {Function} props.onApplyFilters - Function to call when filters are applied
 * @param {Function} props.onResetFilters - Function to call when filters are reset
 * @param {Object} props.values - Current filter values
 * @param {Function} props.onChange - Function to call when a filter changes
 */
const FilterPanel = ({ 
  title = 'Filters', 
  filters = [], 
  onApplyFilters, 
  onResetFilters, 
  values = {}, 
  onChange
}) => {
  // Calculate grid item size based on number of filters
  const getGridSize = () => {
    const filtersCount = filters.length;
    switch (filtersCount) {
      case 1:
        return 12;
      case 2:
        return 6;
      case 3:
        return 4;
      default:
        return 3;
    }
  };

  const getIconForFilter = (filterType, filterName) => {
    if (filterType === 'select') {
      if (filterName.toLowerCase().includes('staff')) {
        return <PersonIcon color="action" />;
      }
    } else if (filterType === 'date') {
      return <CalendarIcon color="action" />;
    }
    return null;
  };

  const renderFilterControl = (filter) => {
    const { type, name, label, options, ...rest } = filter;
    const icon = getIconForFilter(type, name);
    
    switch (type) {
      case 'select':
        return (
          <FormControl 
            fullWidth 
            variant="outlined" 
            size="medium"
          >
            <InputLabel id={`${name}-select-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-select-label`}
              id={`${name}-select`}
              value={values[name] || ''}
              label={label}
              onChange={(e) => onChange(name, e.target.value)}
              sx={{ 
                height: '56px',
                '& .MuiSelect-select': { 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '12px 14px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.16)',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.32)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }}
              startAdornment={
                icon ? (
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    {icon}
                  </InputAdornment>
                ) : null
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                  }
                }
              }}
              {...rest}
            >
              <MenuItem value="">
                <em>All {label}s</em>
              </MenuItem>
              {options?.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.avatar && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.8rem', 
                          mr: 1, 
                          bgcolor: 'primary.light' 
                        }}
                      >
                        {option.label.charAt(0)}
                      </Avatar>
                      {option.label}
                    </Box>
                  )}
                  {option.chip && (
                    <Chip 
                      label={option.label} 
                      size="small" 
                      color={option.color || "default"} 
                      sx={{ mr: 1 }} 
                    />
                  )}
                  {!option.avatar && !option.chip && option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={values[name] || null}
              onChange={(newValue) => onChange(name, newValue)}
              inputFormat="MM/dd/yyyy"
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    ...params.InputProps,
                    sx: { height: '56px' },
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 1 }}>
                        {icon}
                      </InputAdornment>
                    )
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.16)',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 0, 0, 0.32)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        borderWidth: 2
                      }
                    }
                  }}
                />
              )}
            />
          </LocalizationProvider>
        );
      
      case 'text':
        return (
          <TextField
            label={label}
            value={values[name] || ''}
            onChange={(e) => onChange(name, e.target.value)}
            fullWidth
            variant="outlined"
            size="medium"
            InputProps={{
              sx: { height: '56px' },
              startAdornment: icon ? (
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  {icon}
                </InputAdornment>
              ) : null
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.16)',
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.32)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: 2
                }
              }
            }}
            {...rest}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ 
      p: 3, 
      mb: 3, 
      borderRadius: 2,
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
      background: 'linear-gradient(to right, #ffffff, #f9fafb)'
    }}>
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'primary.main'
      }}>
        <FilterListIcon sx={{ mr: 1 }} />
        {title}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        {filters.map((filter, index) => (
          <Grid item xs={12} sm={6} md={getGridSize()} key={index}>
            {renderFilterControl(filter)}
          </Grid>
        ))}
        
        <Grid item xs={12} sm={6} md={getGridSize()}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            height: '56px',
            alignItems: 'center'
          }}>
            <Button 
              variant="contained" 
              onClick={onApplyFilters}
              startIcon={<SearchIcon />}
              fullWidth
              sx={{ 
                height: '100%',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              Apply
            </Button>
            <Button 
              variant="outlined" 
              onClick={onResetFilters}
              fullWidth
              sx={{ 
                height: '100%',
                border: '1px solid rgba(0, 0, 0, 0.16)',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.32)',
                },
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterPanel; 