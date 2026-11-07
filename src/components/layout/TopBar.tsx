import { useState, type MouseEvent } from 'react';
import { Box, Typography, TextField, InputAdornment, Avatar, Menu, MenuItem, ListItemIcon } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';
import { navMenus } from './navConfig';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import { initialsOf } from '../../utils/format';

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const activeMenu = navMenus.find((m) => location.pathname.startsWith(m.path));
  const pageTitle = activeMenu?.label ?? 'Dashboard';

  const handleOpen = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1.5,
        bgcolor: 'background.paper',
        borderBottom: '1.5px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {pageTitle}
      </Typography>
      <Box sx={{ flex: 1 }} />
      <TextField
        size="small"
        placeholder="Quick search…"
        sx={{ maxWidth: 240, width: '100%' }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Avatar
        onClick={handleOpen}
        sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.main', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
      >
        {authUser ? initialsOf(authUser.displayName) : 'AD'}
      </Avatar>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem disabled sx={{ opacity: '1 !important', fontWeight: 600 }}>
          {authUser?.displayName ?? 'Guest'}
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
