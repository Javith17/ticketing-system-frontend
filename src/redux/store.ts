import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import ticketsReducer from './slices/ticketsSlice';
import usersReducer from './slices/usersSlice';
import categoriesReducer from './slices/categoriesSlice';
import sourcesReducer from './slices/sourcesSlice';
import assetsReducer from './slices/assetsSlice';
import ncrReducer from './slices/ncrSlice';
import uiReducer from './slices/uiSlice';
import featuresReducer from './slices/featuresSlice';
import rolesReducer from './slices/rolesSlice';
import emailSettingsReducer from './slices/emailSettingsSlice';
import locationsReducer from './slices/locationsSlice';
import sectionsReducer from './slices/sectionsSlice';
import polesReducer from './slices/polesSlice';
import ncrThresholdReducer from './slices/ncrThresholdSlice';
import ncrAlertsReducer from './slices/ncrAlertsSlice';
import reportsReducer from './slices/reportsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketsReducer,
    users: usersReducer,
    categories: categoriesReducer,
    sources: sourcesReducer,
    assets: assetsReducer,
    ncr: ncrReducer,
    ui: uiReducer,
    features: featuresReducer,
    roles: rolesReducer,
    emailSettings: emailSettingsReducer,
    locations: locationsReducer,
    sections: sectionsReducer,
    poles: polesReducer,
    ncrThreshold: ncrThresholdReducer,
    ncrAlerts: ncrAlertsReducer,
    reports: reportsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
