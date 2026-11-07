import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavMenuItem {
  id: string;
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const navMenus: NavMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
  { id: 'tickets', label: 'Tickets', path: '/tickets', icon: ConfirmationNumberOutlinedIcon },
  { id: 'users', label: 'Users', path: '/users', icon: PeopleAltOutlinedIcon },
  { id: 'roles-features', label: 'Roles & Features', path: '/roles-features', icon: AdminPanelSettingsOutlinedIcon },
  { id: 'categories-sources', label: 'Categories & Sources', path: '/categories-sources', icon: CategoryOutlinedIcon },
  { id: 'assets', label: 'Assets', path: '/assets', icon: Inventory2OutlinedIcon },
  { id: 'ncr', label: 'NCR Tickets', path: '/ncr-tickets', icon: ReportProblemOutlinedIcon },
  { id: 'reports', label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon },
  { id: 'settings', label: 'Settings', path: '/settings', icon: SettingsOutlinedIcon },
];
