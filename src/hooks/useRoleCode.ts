import { useAppSelector } from '../redux/hooks';

export function useRoleCode(): string | undefined {
  const roleId = useAppSelector((s) => s.auth.user?.roleId);
  const directRoleCode = useAppSelector((s) => s.auth.user?.roleCode);
  const roles = useAppSelector((s) => s.roles.items);
  const role = roles.find((r) => r.id === roleId);
  return role?.roleCode ?? directRoleCode;
}
