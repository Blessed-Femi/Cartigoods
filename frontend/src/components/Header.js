import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Badge, Stack } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import cartService from '../services/cartService';

const Header = () => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        setLoading(true);
        const response = await cartService.getCartCount();
        setCartCount(response.count || 0);
      } catch (err) {
        console.error('Error loading cart count:', err);
        // Keep cartCount as 0 if there's an error
      } finally {
        setLoading(false);
      }
    };

    // Load cart count on mount
    loadCartCount();

    // Reload cart count periodically (every 30 seconds) to stay updated
    const interval = setInterval(loadCartCount, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <AppBar position="fixed" sx={{ zIndex: 1100 + 1 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Cartigoods
          </Link>
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton color="inherit" aria-label="cart">
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          {localStorage.getItem('token') ? (
            <>
              <IconButton color="inherit" aria-label="account">
                <PersonIcon />
              </IconButton>
              <Button color="inherit" onClick={() => {
                // TODO: Implement logout functionality
                localStorage.removeItem('token');
                window.location.href = '/';
              }}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit">Login</Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;