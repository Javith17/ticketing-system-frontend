import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SnackSeverity = 'success' | 'error' | 'info' | 'warning';

interface SnackState {
  open: boolean;
  message: string;
  severity: SnackSeverity;
}

interface UiState {
  snackbar: SnackState;
  sidenavCollapsed: boolean;
}

const initialState: UiState = {
  snackbar: { open: false, message: '', severity: 'info' },
  sidenavCollapsed: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSnackbar(state, action: PayloadAction<{ message: string; severity?: SnackSeverity }>) {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity ?? 'info',
      };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
    toggleSidenav(state) {
      state.sidenavCollapsed = !state.sidenavCollapsed;
    },
  },
});

export const { showSnackbar, hideSnackbar, toggleSidenav } = uiSlice.actions;
export default uiSlice.reducer;
