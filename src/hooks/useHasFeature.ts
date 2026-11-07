import { useAppSelector } from '../redux/hooks';

export function useHasFeature(feature: string): boolean {
  const roleId = useAppSelector((s) => s.auth.user?.roleId);
  const roles = useAppSelector((s) => s.roles.items);
  const role = roles.find((r) => r.id === roleId);
  return role?.features.includes(feature) || role?.features.includes('*') || false;
}
