import React from 'react';
import { Box, Typography, TypographyVariant, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 4, mt: 5 }}>
      <Typography variant="h6" gutterBottom>
        Cartigoods
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Building the future of e-commerce
      </Typography>
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Link href="#" underline="none" color="text.secondary">
          About Us
        </Link>
        <Link href="#" underline="none" color="text.secondary">
          Contact
        </Link>
        <Link href="#" underline="none" color="text.secondary">
          Privacy Policy
        </Link>
        <Link href="#" underline="none" color="text.secondary">
          Terms of Service
        </Link>
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Cartigoods. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;