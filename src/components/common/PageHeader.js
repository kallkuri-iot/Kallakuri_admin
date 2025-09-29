import React from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  Chip
} from '@mui/material';

/**
 * A reusable page header component with gradient background and optional stats
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The page title
 * @param {string} props.subtitle - The page subtitle/description
 * @param {JSX.Element} props.icon - Icon component to display
 * @param {Array} props.stats - Array of statistic objects to display
 * @param {Object} props.sx - Additional styling
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  stats = [],
  sx = {}
}) => {
  return (
    <Box sx={{ 
      mb: 4,
      p: 3,
      borderRadius: 2,
      background: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%)',
      boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      ...sx
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {icon && (
          <Avatar sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.2)', 
            width: 56, 
            height: 56, 
            mr: 2,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {icon}
          </Avatar>
        )}
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold', 
            mb: 0.5,
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="rgba(255, 255, 255, 0.9)" sx={{ maxWidth: '600px' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {stats.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap', 
          alignItems: 'center',
          mt: { xs: 2, md: 0 }
        }}>
          {stats.map((stat, index) => (
            <Box 
              key={index}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.15)', 
                p: 1.5, 
                borderRadius: 2,
                minWidth: 140,
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                color: stat.color || 'white'
              }}>
                {stat.value}
                {stat.chip && (
                  <Chip 
                    size="small" 
                    label={stat.chip.label} 
                    color={stat.chip.color || "default"} 
                    sx={{ 
                      ml: 1,
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      minWidth: 24
                    }}
                  />
                )}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader; 