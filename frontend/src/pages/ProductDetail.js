import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, Card, CardContent, CardMedia, Button, Divider, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';
import reviewService from '../services/reviewService';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({});
  const [reviewFilters, setReviewFilters] = useState({ page: 1, limit: 5 });

  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await productService.getProductById(id);
        setProduct(productResponse);

        // Fetch reviews for this product
        const reviewsResponse = await reviewService.getProductReviews(id, reviewFilters);
        setReviews(reviewsResponse.reviews || reviewsResponse.data.reviews || []);
        setReviewPagination(reviewsResponse.pagination || reviewsResponse.data.pagination || {});
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProductData();
    }
  }, [id, reviewFilters]);

  // Handle review filter changes
  const handleReviewFilterChange = (field, value) => {
    setReviewFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filters change
    }));
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

  if (!product) {
    return (
      <Box sx={{ pt: 4, px: 3, textAlign: 'center', py: 4 }}>
        <Typography variant="h5">Product not found</Typography>
        <Button variant="contained" onClick={() => window.location.href = '/products'}>
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Product Images */}
        <Box sx={{ flex: '0 0 40%' }}>
          <CardMedia
            component="img"
            height="400"
            image={product.images?.[0] || '/images/placeholder.jpg'}
            alt={product.name}
          />
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            {product.images.slice(1).map((img, index) => (
              <Box key={index} sx={{ flexGrow: 1 }}>
                <CardMedia
                  component="img"
                  height="80"
                  image={img}
                  alt={`${product.name} ${index + 2}`}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Product Details */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {product.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {reviewPagination.total || 0} reviews •
              {(product.averageRating || 0).toFixed(1)}★
            </Typography>
          </Box>
          <Typography variant="h3" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              In stock ({product.stockQuantity} available)
            </Typography>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Product Description
          </Typography>
          <Typography variant="body1">
            {product.description || 'No description available'}
          </Typography>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h5" gutterBottom>
            Key Features
          </Typography>
          <Box sx={{ mb: 4 }}>
            {product.tags && product.tags.length > 0 ? (
              product.tags.map((tag, index) => (
                <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                  <Typography sx={{ mr: 1, flexShrink: 0 }}>• </Typography>
                  <Typography variant="body1">{tag}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No features specified</Typography>
            )}
          </Box>
          <Box sx={{ mb: 4 }}>
            <Button variant="contained" size="large" sx={{ width: '100%', mb: 2 }}>
              Add to Cart
            </Button>
            <Button variant="outlined" size="large" sx={{ width: '100%' }}>
              Buy Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <Box sx={{ mt: 6, pt: 4, px: 3 }}>
          <Typography variant="h4" gutterBottom>
            Customer Reviews ({reviewPagination.total || 0})
          </Typography>
          <Box sx={{ mb: 4 }}>
            {/* Review filters */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Minimum Rating"
                select
                labelId="review-rating-label"
                id="review-rating-select"
                value={reviewFilters.rating || ''}
                onChange={(e) => handleReviewFilterChange('rating', e.target.value)}
                sx={{ minWidth: 150 }}
              >
                <option value="">All Ratings</option>
                <option value={5}>5★</option>
                <option value={4}>4★</option>
                <option value={3}>3★</option>
                <option value={2}>2★</option>
                <option value={1}>1★</option>
              </TextField>
            </Stack>
          </Box>

          <Box sx={{ mb: 4 }}>
            {reviews.map((review) => (
              <Card key={review.id} sx={{ mb: 3, p: 3 }}>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {review.user?.firstName} {review.user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Typography key={star} sx={{ mr: 0.5 }}>
                        {star <= review.rating ? '★' : '☆'}
                      </Typography>
                    ))}
                  </Box>
                </Box>
                {review.title && (
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {review.title}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment || 'No comment provided'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Button variant="outlined" size="small" onClick={() => {
                      // TODO: Implement helpful vote functionality
                      alert('Helpful vote functionality coming soon!');
                    }}>
                      Helpful ({review.helpfulVotes || 0})
                    </Button>
                  </Box>
                  {review.isVerifiedPurchase && (
                    <Badge badgeContent="Verified Purchase" color="success" sx={{ ml: 2 }}>
                      <Typography variant="caption">Verified Purchase</Typography>
                    </Badge>
                  )}
                </Box>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          {reviewPagination.totalPages && reviewPagination.totalPages > 1 && (
            <Box sx={{ textAlign: 'center', pt: 4 }}>
              <Typography variant="body2">
                Page {reviewPagination.page} of {reviewPagination.totalPages}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {reviewPagination.page > 1 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleReviewFilterChange('page', reviewPagination.page - 1)}
                  >
                    Previous
                  </Button>
                )}
                {reviewPagination.page < reviewPagination.totalPages && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleReviewFilterChange('page', reviewPagination.page + 1)}
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      )}
    );
  };

export default ProductDetail;