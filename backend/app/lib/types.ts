export type ModuleKey = string;

export type PermissionAction = 'read' | 'edit' | 'download';

export type ModulePermissions = Record<
  ModuleKey,
  Record<PermissionAction, boolean>
>;

export interface AuthUser {
  id: number;
  account: string;
  name: string;
  role: string;
  isAdmin: boolean;
  needModifiedPwd: boolean;
  permissions: ModulePermissions;
}
