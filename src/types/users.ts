export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
  metadata?: UserMetadata;
  statistics?: UserStatistics;
}

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
  isSystemRole: boolean;
  isDefault: boolean;
  level: number; // Higher number = more permissions
  color?: string;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  conditions?: string[];
}

export interface UserSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  notifications?: NotificationSettings;
  editor?: EditorSettings;
  privacy?: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  desktop: boolean;
  commentReplies: boolean;
  newFollowers: boolean;
  mentions: boolean;
  systemUpdates: boolean;
}

export interface EditorSettings {
  defaultEditor: 'tiptap' | 'markdown' | 'html';
  autoSave: boolean;
  showWordCount: boolean;
  showLineNumbers: boolean;
  tabSize: number;
  theme: string;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showOnlineStatus: boolean;
  allowSearchByEmail: boolean;
  allowSearchByName: boolean;
}

export interface UserMetadata {
  website?: string;
  location?: string;
  company?: string;
  jobTitle?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
  };
  customFields?: Record<string, string>;
}

export interface UserStatistics {
  postsPublished: number;
  postsDraft: number;
  pagesCreated: number;
  mediaUploaded: number;
  commentsMade: number;
  lastActiveAt?: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export type AuthProvider = 'email' | 'google' | 'github' | 'facebook' | 'twitter';

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
}

export interface UserInvite {
  id: string;
  email: string;
  roleId: string;
  role?: UserRole;
  invitedBy: string;
  invitedByUser?: User;
  message?: string;
  expiresAt: string;
  acceptedAt?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'asc' | 'desc';
}

export interface RoleFilters {
  search?: string;
  isSystemRole?: boolean;
  sortBy?: 'name' | 'level' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: UserFilters;
}

export interface RoleListResponse {
  roles: UserRole[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: RoleFilters;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
  recentUsers: User[];
  usersThisMonth: number;
  usersThisWeek: number;
}

export interface RoleStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  usersByRole: Array<{
    role: UserRole;
    count: number;
  }>;
}

export interface UserCreate {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: string;
  bio?: string;
  avatar?: string;
  settings?: Partial<UserSettings>;
  metadata?: Partial<UserMetadata>;
  sendWelcomeEmail?: boolean;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  bio?: string;
  avatar?: string;
  status?: UserStatus;
  emailVerified?: boolean;
  settings?: Partial<UserSettings>;
  metadata?: Partial<UserMetadata>;
}

export interface RoleCreate {
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
  color?: string;
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
  isDefault?: boolean;
  color?: string;
}

export interface InviteCreate {
  email: string;
  roleId: string;
  message?: string;
  expiresAt?: string;
}

// Built-in permissions
export const BUILTIN_PERMISSIONS: Permission[] = [
  // Content permissions
  { id: 'posts.read', name: 'Read Posts', description: 'View posts', resource: 'posts', action: 'read' },
  { id: 'posts.create', name: 'Create Posts', description: 'Create new posts', resource: 'posts', action: 'create' },
  { id: 'posts.edit', name: 'Edit Posts', description: 'Edit existing posts', resource: 'posts', action: 'edit' },
  { id: 'posts.delete', name: 'Delete Posts', description: 'Delete posts', resource: 'posts', action: 'delete' },
  { id: 'posts.publish', name: 'Publish Posts', description: 'Publish posts', resource: 'posts', action: 'publish' },

  { id: 'pages.read', name: 'Read Pages', description: 'View pages', resource: 'pages', action: 'read' },
  { id: 'pages.create', name: 'Create Pages', description: 'Create new pages', resource: 'pages', action: 'create' },
  { id: 'pages.edit', name: 'Edit Pages', description: 'Edit existing pages', resource: 'pages', action: 'edit' },
  { id: 'pages.delete', name: 'Delete Pages', description: 'Delete pages', resource: 'pages', action: 'delete' },

  { id: 'media.read', name: 'Read Media', description: 'View media library', resource: 'media', action: 'read' },
  { id: 'media.upload', name: 'Upload Media', description: 'Upload media files', resource: 'media', action: 'upload' },
  { id: 'media.edit', name: 'Edit Media', description: 'Edit media files', resource: 'media', action: 'edit' },
  { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', resource: 'media', action: 'delete' },

  { id: 'categories.read', name: 'Read Categories', description: 'View categories', resource: 'categories', action: 'read' },
  { id: 'categories.create', name: 'Create Categories', description: 'Create new categories', resource: 'categories', action: 'create' },
  { id: 'categories.edit', name: 'Edit Categories', description: 'Edit existing categories', resource: 'categories', action: 'edit' },
  { id: 'categories.delete', name: 'Delete Categories', description: 'Delete categories', resource: 'categories', action: 'delete' },

  { id: 'tags.read', name: 'Read Tags', description: 'View tags', resource: 'tags', action: 'read' },
  { id: 'tags.create', name: 'Create Tags', description: 'Create new tags', resource: 'tags', action: 'create' },
  { id: 'tags.edit', name: 'Edit Tags', description: 'Edit existing tags', resource: 'tags', action: 'edit' },
  { id: 'tags.delete', name: 'Delete Tags', description: 'Delete tags', resource: 'tags', action: 'delete' },

  // User management permissions
  { id: 'users.read', name: 'Read Users', description: 'View users', resource: 'users', action: 'read' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit existing users', resource: 'users', action: 'edit' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete' },
  { id: 'users.invite', name: 'Invite Users', description: 'Invite new users', resource: 'users', action: 'invite' },

  { id: 'roles.read', name: 'Read Roles', description: 'View roles', resource: 'roles', action: 'read' },
  { id: 'roles.create', name: 'Create Roles', description: 'Create new roles', resource: 'roles', action: 'create' },
  { id: 'roles.edit', name: 'Edit Roles', description: 'Edit existing roles', resource: 'roles', action: 'edit' },
  { id: 'roles.delete', name: 'Delete Roles', description: 'Delete roles', resource: 'roles', action: 'delete' },

  // Admin permissions
  { id: 'admin.settings', name: 'Admin Settings', description: 'Access admin settings', resource: 'admin', action: 'settings' },
  { id: 'admin.analytics', name: 'Admin Analytics', description: 'View analytics', resource: 'admin', action: 'analytics' },
  { id: 'admin.backup', name: 'Admin Backup', description: 'Create and restore backups', resource: 'admin', action: 'backup' },
  { id: 'admin.maintenance', name: 'Admin Maintenance', description: 'Perform maintenance tasks', resource: 'admin', action: 'maintenance' },
];

// Built-in roles
export const BUILTIN_ROLES: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Full system access with all permissions',
    permissions: BUILTIN_PERMISSIONS,
    isSystemRole: true,
    isDefault: false,
    level: 100,
    color: '#dc2626',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Administrative access with most permissions',
    permissions: BUILTIN_PERMISSIONS.filter(p => !p.id.includes('super')),
    isSystemRole: true,
    isDefault: false,
    level: 90,
    color: '#ea580c',
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Can create and edit all content',
    permissions: BUILTIN_PERMISSIONS.filter(p =>
      p.resource === 'posts' ||
      p.resource === 'pages' ||
      p.resource === 'media' ||
      p.resource === 'categories' ||
      p.resource === 'tags'
    ),
    isSystemRole: true,
    isDefault: false,
    level: 70,
    color: '#2563eb',
  },
  {
    name: 'Author',
    slug: 'author',
    description: 'Can create and edit own posts',
    permissions: BUILTIN_PERMISSIONS.filter(p =>
      (p.resource === 'posts' && p.action !== 'delete') ||
      p.resource === 'media' ||
      p.resource === 'tags'
    ),
    isSystemRole: true,
    isDefault: false,
    level: 50,
    color: '#16a34a',
  },
  {
    name: 'Contributor',
    slug: 'contributor',
    description: 'Can create posts but not publish',
    permissions: BUILTIN_PERMISSIONS.filter(p =>
      (p.resource === 'posts' && (p.action === 'read' || p.action === 'create')) ||
      p.resource === 'tags'
    ),
    isSystemRole: true,
    isDefault: false,
    level: 30,
    color: '#ca8a04',
  },
  {
    name: 'Subscriber',
    slug: 'subscriber',
    description: 'Can read content and manage profile',
    permissions: BUILTIN_PERMISSIONS.filter(p =>
      p.resource === 'posts' && p.action === 'read'
    ),
    isSystemRole: true,
    isDefault: true,
    level: 10,
    color: '#6b7280',
  },
];

// Utility functions
export function generateUserSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateRoleSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }
  return { isValid: true };
}

export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || username.length === 0) {
    return { isValid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }

  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
}

export function validateRoleName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Role name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Role name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Role name must be less than 50 characters' };
  }

  return { isValid: true };
}

export function getUserDisplayName(user: User): string {
  return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
}

export function hasPermission(user: User, permissionId: string): boolean {
  return user.role.permissions.some(p => p.id === permissionId);
}

export function hasAnyPermission(user: User, permissionIds: string[]): boolean {
  return permissionIds.some(id => hasPermission(user, id));
}

export function hasAllPermissions(user: User, permissionIds: string[]): boolean {
  return permissionIds.every(id => hasPermission(user, id));
}

export function canAccessResource(user: User, resource: string, action: string): boolean {
  return user.role.permissions.some(p => p.resource === resource && p.action === action);
}