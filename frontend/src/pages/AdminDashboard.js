import React from 'react';
import { Box, Typography, Stack, Card, CardContent, CardActions, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TypographyVariant } from '@mui/material';

const AdminDashboard = () => {
  // Sample stats - in a real app, this would come from an API
  const stats = [
    { label: 'Total Sales', value: '$24,560', change: '+12%', trend: 'up' },
    { label: 'Orders', value: '1,240', change: '+8%', trend: 'up' },
    { label: 'Customers', value: '890', change: '+5%', trend: 'up' },
    { label: 'Conversion Rate', value: '3.2%', change: '-0.5%', trend: 'down' },
  ];

  // Sample recent orders - in a real app, this would come from an API
  const recentOrders = [
    { id: '#ORD001', customer: 'John Doe', date: '2026-09-10', total: '$89.99', status: 'delivered' },
    { id: '#ORD002', customer: 'Jane Smith', date: '2026-09-09', total: '$199.99', status: 'processing' },
    { id: '#ORD003', customer: 'Bob Wilson', date: '2026-09-08', total: '$45.99', status: 'shipped' },
    { id: '#ORD004', customer: 'Alice Brown', date: '2026-09-07', total: '$135.98', status: 'pending' },
  ];

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Card key={index} sx={{ flexGrow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    color={stat.trend === 'up' ? 'success' : 'error'}
                    variant="body2"
                  >
                    {stat.change}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Recent Orders */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Orders
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell align="left">Customer</TableCell>
                <TableCell align="left">Date</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell component="th" scope="row">
                    {order.id}
                  </TableCell>
                  <TableCell align="left">{order.customer}</TableCell>
                  <TableCell align="left">{order.date}</TableCell>
                  <TableCell align="right">{order.total}</TableCell>
                  <TableCell align="center">
                    {order.status === 'delivered' ? (
                      <span sx={{ color: 'success.fontWeightBold' }}>
                        {order.status}
                      </span>
                    ) : order.status === 'processing' ? (
                      <span sx={{ color: 'warning.fontWeightBold' }}>
                        {order.status}
                      </span>
                    ) : order.status === 'shipped' ? (
                      <span sx={{ color: 'info.fontWeightBold' }}>
                        {order.status}
                      </span>
                    ) : (
                      <span sx={{ color: 'error.fontWeightBold' }}>
                        {order.status}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 2 }}>
        <Button variant="contained" color="primary" sx={{ px: 4, py: 2 }}>
          Add Product
        </Button>
        <Button variant="contained" color="secondary" sx={{ px: 4, py: 2 }}>
          View Analytics
        </Button>
        <Button variant="outlined" color="primary" sx={{ px: 4, py: 2 }}>
          Manage Inventory
        </Button>
        <Button variant="outlined" color="secondary" sx={{ px: 4, py: 2 }}>
          Customer Support
        </Button>
      </Box>
    </Box>
  );
};

export default AdminDashboard;