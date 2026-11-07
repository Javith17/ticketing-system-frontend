import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Typography, Tooltip, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useLocation, useNavigate } from 'react-router-dom';
import { navMenus } from './navConfig';
import { useThemeMode } from '../../theme/ThemeModeContext';
import { sidenav } from '../../theme/palette';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleSidenav } from '../../redux/slices/uiSlice';

const EXPANDED_WIDTH = 230;
const COLLAPSED_WIDTH = 64;

export default function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidenavCollapsed);
  const authUser = useAppSelector((state) => state.auth.user);
  const { mode, toggleMode } = useThemeMode();
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: 'width .25s ease',
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          bgcolor: sidenav.bg,
          color: sidenav.textSecondary,
          transition: 'width .25s ease',
          overflowX: 'hidden',
          border: 'none',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          py: 2,
          minHeight: 62,
          borderBottom: `1px solid ${sidenav.border}`,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1,
            border: `1.5px solid ${sidenav.accent}`,
            color: sidenav.accentIcon,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ConfirmationNumberIcon sx={{ fontSize: 16 }} />
        </Box>
        {!collapsed && (
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: sidenav.textPrimary, whiteSpace: 'nowrap' }}>
            Ticketing
          </Typography>
        )}
        {!collapsed && (
          <IconButton
            size="small"
            onClick={() => dispatch(toggleSidenav())}
            sx={{ ml: 'auto', color: sidenav.textMuted }}
            aria-label="Collapse navigation"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {collapsed && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <IconButton
            size="small"
            onClick={() => dispatch(toggleSidenav())}
            sx={{ color: sidenav.textMuted }}
            aria-label="Expand navigation"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navMenus.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          const button = (
            <ListItemButton
              key={item.id}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: sidenav.textSecondary,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&:hover': { bgcolor: sidenav.hoverBg, color: sidenav.textPrimary },
                '&.Mui-selected': { bgcolor: sidenav.selectedBg, color: sidenav.textPrimary },
                '&.Mui-selected:hover': { bgcolor: sidenav.selectedHoverBg },
              }}
            >
              <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', justifyContent: 'center' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: 500 } } }} />
              )}
            </ListItemButton>
          );
          return collapsed ? (
            <Tooltip key={item.id} title={item.label} placement="right">
              {button}
            </Tooltip>
          ) : (
            button
          );
        })}
      </List>

      <Divider sx={{ borderColor: sidenav.border }} />
      <Box sx={{ p: 1 }}>
        <Tooltip title={mode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} placement="right">
          <ListItemButton
            onClick={toggleMode}
            sx={{
              borderRadius: 2,
              color: sidenav.textSecondary,
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': { bgcolor: sidenav.hoverBg, color: sidenav.textPrimary },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit', justifyContent: 'center' }}>
              {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary={mode === 'light' ? 'Dark mode' : 'Light mode'}
                slotProps={{ primary: { sx: { fontSize: 13.5, fontWeight: 500 } } }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
      {!collapsed && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${sidenav.border}`,
            fontSize: 11,
            color: sidenav.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          v2.4.1 · Signed in as {authUser?.displayName ?? 'Guest'}
        </Box>
      )}
    </Drawer>
  );
}
