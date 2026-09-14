import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Card, CardContent, CardMedia, Button, TextField, Toolbar, Container, CircularProgress } from '@mui/material';
import productService from '../services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    isFeatured: '',
    isActive: 'true'
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts(filters);
        setProducts(response.products || response.data.products || []);
        // Store pagination info if needed
        // setPagination(response.pagination || response.data.pagination);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearchChange = (e) => {
    handleFilterChange('search', e.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center">
          Products
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            placeholder="Search products..."
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </Box>

        {!loading && products.length > 0 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            {products.map((product) => (
              <Card key={product.id} sx={{ flexGrow: 1, maxWidth: 300 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button variant="outlined" size="small">
                      Add to Cart
                    </Button>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5">No products found</Typography>
            {filters.search || filters.categoryId ? (
              <Button variant="outlined" onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  search: '',
                  categoryId: '',
                  page: 1
                }));
              }}>
                Clear Filters
              </Button>
            ) : (
              <Button variant="contained" sx={{ mt: 2 }}>
                Browse Products
              </Button>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Products;