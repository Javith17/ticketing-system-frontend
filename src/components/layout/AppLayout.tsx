import { useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks';
import { fetchRoles } from '../../redux/slices/rolesSlice';
import SideNav from './SideNav';
import TopBar from './TopBar';

export default function AppLayout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Roles carry each user's feature list, needed app-wide by useHasFeature -
    // load them whenever the signed-in layout mounts (i.e. after every login),
    // regardless of whether the user ever visits the Roles page.
    dispatch(fetchRoles());
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SideNav />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
