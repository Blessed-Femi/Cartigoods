import React from 'react';
import { Box, Typography, Button, Avatar, Stack, Card, CardContent, CardActions, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  // Mock user data (in a real app, this would come from auth context or API)
  const user = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Software engineer and avid hiker.',
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  return (
    <Box sx={{ pt: 4, px: 3 }}>
      <Card sx={{ maxWidth: 400, margin: '0 auto' }}>
        <CardContent>
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Avatar sx={{ width: 120, height: 120 }} alt={user.name}>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </Avatar>
            <Typography variant="h4" component="div">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ textAlign: 'left', width: '100%' }}>
              <Typography variant="h6" gutterBottom>
                About Me
              </Typography>
              <Typography variant="body1">
                {user.bio}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
        <CardActions>
          <Button variant="outlined" onClick={handleEditProfile} sx={{ mt: 2 }}>
            Edit Profile
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Profile;