import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

function Reports() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>
      </Box>
      
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1">
          The Reports module is under development. Check back soon for updates.
        </Typography>
      </Paper>
    </Container>
  );
}

export default Reports; 