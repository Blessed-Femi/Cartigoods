import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Card, CardContent, CardMedia, CircularProgress, Container } from '@mui/material';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch featured products
        const productsResponse = await productService.getFeaturedProducts({ limit: 3 });
        setFeaturedProducts(productsResponse.products || productsResponse);

        // Fetch categories
        const categoriesResponse = await categoryService.getCategories();
        setCategories(categoriesResponse);
      } catch (err) {
        console.error('Error loading home data:', err);
        setError('Failed to load home data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
          Welcome to Cartigoods
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ mb: 4 }}>
          Discover amazing products at great prices
        </Typography>

        {featuredProducts.length > 0 ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 5 }}>
            {featuredProducts.map((product) => (
              <Card key={product.id} sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={product.images?.[0] || '/images/placeholder.jpg'}
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Button sx={{ mt: 2 }} variant="contained" size="small">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" textAlign="center">
            No featured products available
          </Typography>
        )}

        {categories.length > 0 ? (
          <>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Featured Categories
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {categories.slice(0, 3).map((category) => (
                <Card key={category.id} sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={category.image || `/images/category-${category.id}.jpg`}
                    alt={category.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {category.name}
                    </Typography>
                    <Button variant="outlined" size="small">
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </>
        ) : (
          <Typography variant="body2" textAlign="center" sx={{ mb: 4 }}>
            No categories available
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default Home;