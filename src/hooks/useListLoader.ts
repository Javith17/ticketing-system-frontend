import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { showSnackbar } from '../redux/slices/uiSlice';

// What `dispatch(someAsyncThunk())` returns - a promise of the settled action.
type DispatchedThunk = Promise<{ meta: { requestStatus: 'fulfilled' | 'rejected' } }>;

/**
 * Loads a screen's list data every time the screen opens, and returns a
 * `refresh` for the screen's refresh button.
 *
 * Screens used to load only while their slice was still 'idle', so after the
 * first visit (or after one failed call) opening the menu again never called
 * the API. This always calls it on open, and reports failures instead of
 * failing silently.
 *
 * @param start dispatches the list thunk(s), e.g. `() => [dispatch(fetchUsers()), dispatch(fetchRoles())]`
 * @param what  used in the error message: "Failed to load {what}"
 * @param reloadKey optional value that triggers a reload when it changes (e.g. a status filter)
 */
export function useListLoader(start: () => DispatchedThunk[], what: string, reloadKey?: unknown) {
  const dispatch = useAppDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const startRef = useRef(start);

  useLayoutEffect(() => {
    startRef.current = start;
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const results = await Promise.all(startRef.current());
      if (results.some((r) => r.meta.requestStatus === 'rejected')) {
        dispatch(showSnackbar({ message: `Failed to load ${what}`, severity: 'error' }));
      }
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, what]);

  useEffect(() => {
    refresh();
  }, [refresh, reloadKey]);

  return { refresh, refreshing };
}
