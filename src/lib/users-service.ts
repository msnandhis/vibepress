import {
  User,
  UserRole,
  UserFilters,
  RoleFilters,
  UserCreate,
  UserUpdate,
  RoleCreate,
  RoleUpdate,
  UserListResponse,
  RoleListResponse,
  UserStats,
  RoleStats,
  UserSession,
  UserInvite,
  InviteCreate,
  BUILTIN_PERMISSIONS,
  BUILTIN_ROLES,
  generateUserSlug,
  generateRoleSlug,
  validateEmail,
  validateUsername,
  validateRoleName,
  getUserDisplayName,
  hasPermission
} from '@/types/users';
import { indexedDB } from './storage';
import { generateSlug } from './slug-utils';

class UsersService {
  private readonly usersStoreName = 'users';
  private readonly rolesStoreName = 'roles';
  private readonly sessionsStoreName = 'user_sessions';
  private readonly invitesStoreName = 'user_invites';

  constructor() {
    this.initializeBuiltInRoles();
  }

  private async initializeBuiltInRoles(): Promise<void> {
    try {
      const existingRoles = await indexedDB.getAll(this.rolesStoreName) as UserRole[];
      if (existingRoles.length === 0) {
        const now = new Date().toISOString();
        const builtInRoles = BUILTIN_ROLES.map((role, index) => ({
          ...role,
          id: `role_${role.slug}_${index}`,
          createdAt: now,
          updatedAt: now,
        }));

        for (const role of builtInRoles) {
          await indexedDB.set(this.rolesStoreName, role);
        }
      }
    } catch (error) {
      console.error('Error initializing built-in roles:', error);
    }
  }

  // User Management
  async getUsers(filters: UserFilters = {}, page = 1, limit = 20): Promise<UserListResponse> {
    try {
      const allUsers = await indexedDB.getAll(this.usersStoreName) as User[];

      let filteredUsers = allUsers;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.email.toLowerCase().includes(searchLower) ||
          user.username?.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          user.displayName?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.role) {
        filteredUsers = filteredUsers.filter(user => user.role.id === filters.role);
      }

      if (filters.status) {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }

      if (filters.emailVerified !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.emailVerified === filters.emailVerified);
      }

      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filteredUsers = filteredUsers.filter(user =>
          new Date(user.createdAt) >= fromDate
        );
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        filteredUsers = filteredUsers.filter(user =>
          new Date(user.createdAt) <= toDate
        );
      }

      const sortBy = filters.sortBy || 'createdAt';
      const sortOrder = filters.sortOrder || 'desc';

      filteredUsers.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'lastLoginAt') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      const total = filteredUsers.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      const enrichedUsers = await Promise.all(
        paginatedUsers.map(async (user) => {
          const statistics = await this.getUserStatistics(user.id);
          return {
            ...user,
            statistics,
          };
        })
      );

      return {
        users: enrichedUsers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const user = await indexedDB.get(this.usersStoreName, id) as User;
      if (!user) return null;

      const statistics = await this.getUserStatistics(id);
      return {
        ...user,
        statistics,
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const allUsers = await indexedDB.getAll(this.usersStoreName) as User[];
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) return null;

      const statistics = await this.getUserStatistics(user.id);
      return {
        ...user,
        statistics,
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async createUser(userData: UserCreate): Promise<User> {
    try {
      const emailValidation = validateEmail(userData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }

      if (userData.username) {
        const usernameValidation = validateUsername(userData.username);
        if (!usernameValidation.isValid) {
          throw new Error(usernameValidation.error);
        }
      }

      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      const role = await this.getRole(userData.role);
      if (!role) {
        throw new Error('Invalid role specified');
      }

      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const user: User = {
        id,
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username,
        bio: userData.bio,
        avatar: userData.avatar,
        role,
        status: 'pending',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        settings: userData.settings,
        metadata: userData.metadata,
      };

      await indexedDB.set(this.usersStoreName, user);

      // Create default user statistics
      await this.updateUserStatistics(id, {
        postsPublished: 0,
        postsDraft: 0,
        pagesCreated: 0,
        mediaUploaded: 0,
        commentsMade: 0,
      });

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: UserUpdate): Promise<User> {
    try {
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      if (updates.email && updates.email !== existingUser.email) {
        const emailValidation = validateEmail(updates.email);
        if (!emailValidation.isValid) {
          throw new Error(emailValidation.error);
        }

        const existingWithEmail = await this.getUserByEmail(updates.email);
        if (existingWithEmail && existingWithEmail.id !== id) {
          throw new Error('A user with this email already exists');
        }
      }

      if (updates.username && updates.username !== existingUser.username) {
        const usernameValidation = validateUsername(updates.username);
        if (!usernameValidation.isValid) {
          throw new Error(usernameValidation.error);
        }
      }

      if (updates.role) {
        const role = await this.getRole(updates.role);
        if (!role) {
          throw new Error('Invalid role specified');
        }
        updates.role = role;
      }

      const updatedUser: User = {
        ...existingUser,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.usersStoreName, updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.getUser(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Prevent deletion of last super admin
      if (user.role.slug === 'super-admin') {
        const superAdmins = await this.getUsers({ role: user.role.id });
        if (superAdmins.pagination.total <= 1) {
          throw new Error('Cannot delete the last super admin');
        }
      }

      await indexedDB.remove(this.usersStoreName, id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Role Management
  async getRoles(filters: RoleFilters = {}, page = 1, limit = 20): Promise<RoleListResponse> {
    try {
      const allRoles = await indexedDB.getAll(this.rolesStoreName) as UserRole[];

      let filteredRoles = allRoles;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredRoles = filteredRoles.filter(role =>
          role.name.toLowerCase().includes(searchLower) ||
          role.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters.isSystemRole !== undefined) {
        filteredRoles = filteredRoles.filter(role => role.isSystemRole === filters.isSystemRole);
      }

      const sortBy = filters.sortBy || 'level';
      const sortOrder = filters.sortOrder || 'desc';

      filteredRoles.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });

      const total = filteredRoles.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRoles = filteredRoles.slice(startIndex, endIndex);

      const enrichedRoles = await Promise.all(
        paginatedRoles.map(async (role) => {
          const userCount = await this.getUserCountByRole(role.id);
          return {
            ...role,
            userCount,
          };
        })
      );

      return {
        roles: enrichedRoles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        filters,
      };
    } catch (error) {
      console.error('Error getting roles:', error);
      throw new Error('Failed to fetch roles');
    }
  }

  async getRole(id: string): Promise<UserRole | null> {
    try {
      const role = await indexedDB.get(this.rolesStoreName, id) as UserRole;
      return role || null;
    } catch (error) {
      console.error('Error getting role:', error);
      throw new Error('Failed to fetch role');
    }
  }

  async getRoleBySlug(slug: string): Promise<UserRole | null> {
    try {
      const allRoles = await indexedDB.getAll(this.rolesStoreName) as UserRole[];
      const role = allRoles.find(r => r.slug === slug);
      return role || null;
    } catch (error) {
      console.error('Error getting role by slug:', error);
      throw new Error('Failed to fetch role');
    }
  }

  async createRole(roleData: RoleCreate): Promise<UserRole> {
    try {
      const validation = validateRoleName(roleData.name);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const slug = generateRoleSlug(roleData.name);
      const existingRole = await this.getRoleBySlug(slug);
      if (existingRole) {
        throw new Error('A role with this name already exists');
      }

      const permissions = BUILTIN_PERMISSIONS.filter(p => roleData.permissions.includes(p.id));
      if (permissions.length !== roleData.permissions.length) {
        throw new Error('Invalid permissions specified');
      }

      const id = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const maxLevel = Math.max(...BUILTIN_ROLES.map(r => r.level), 0);
      const role: UserRole = {
        id,
        name: roleData.name,
        slug,
        description: roleData.description,
        permissions,
        isSystemRole: false,
        isDefault: roleData.isDefault || false,
        level: maxLevel + 1,
        color: roleData.color,
        createdAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.rolesStoreName, role);
      return role;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, updates: RoleUpdate): Promise<UserRole> {
    try {
      const existingRole = await this.getRole(id);
      if (!existingRole) {
        throw new Error('Role not found');
      }

      if (existingRole.isSystemRole && updates.permissions) {
        throw new Error('Cannot modify permissions of system roles');
      }

      if (updates.name && updates.name !== existingRole.name) {
        const validation = validateRoleName(updates.name);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        const newSlug = generateRoleSlug(updates.name);
        const existingWithSlug = await this.getRoleBySlug(newSlug);
        if (existingWithSlug && existingWithSlug.id !== id) {
          throw new Error('A role with this name already exists');
        }

        updates.slug = newSlug;
      }

      if (updates.permissions) {
        const permissions = BUILTIN_PERMISSIONS.filter(p => updates.permissions!.includes(p.id));
        if (permissions.length !== updates.permissions.length) {
          throw new Error('Invalid permissions specified');
        }
        updates.permissions = permissions;
      }

      const updatedRole: UserRole = {
        ...existingRole,
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      await indexedDB.set(this.rolesStoreName, updatedRole);
      return updatedRole;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const role = await this.getRole(id);
      if (!role) {
        throw new Error('Role not found');
      }

      if (role.isSystemRole) {
        throw new Error('Cannot delete system roles');
      }

      const userCount = await this.getUserCountByRole(id);
      if (userCount > 0) {
        throw new Error('Cannot delete role that has users assigned');
      }

      await indexedDB.remove(this.rolesStoreName, id);
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Statistics
  async getUserStats(): Promise<UserStats> {
    try {
      const allUsers = await indexedDB.getAll(this.usersStoreName) as User[];
      const allRoles = await indexedDB.getAll(this.rolesStoreName) as UserRole[];
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const stats: UserStats = {
        totalUsers: allUsers.length,
        activeUsers: allUsers.filter(u => u.status === 'active').length,
        inactiveUsers: allUsers.filter(u => u.status === 'inactive').length,
        pendingUsers: allUsers.filter(u => u.status === 'pending').length,
        suspendedUsers: allUsers.filter(u => u.status === 'suspended').length,
        bannedUsers: allUsers.filter(u => u.status === 'banned').length,
        verifiedUsers: allUsers.filter(u => u.emailVerified).length,
        unverifiedUsers: allUsers.filter(u => !u.emailVerified).length,
        usersByRole: [],
        recentUsers: allUsers
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
        usersThisMonth: allUsers.filter(u => new Date(u.createdAt) >= thisMonth).length,
        usersThisWeek: allUsers.filter(u => new Date(u.createdAt) >= thisWeek).length,
      };

      for (const role of allRoles) {
        const count = allUsers.filter(u => u.role.id === role.id).length;
        stats.usersByRole.push({ role, count });
      }

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  async getRoleStats(): Promise<RoleStats> {
    try {
      const allRoles = await indexedDB.getAll(this.rolesStoreName) as UserRole[];
      const allUsers = await indexedDB.getAll(this.usersStoreName) as User[];

      const stats: RoleStats = {
        totalRoles: allRoles.length,
        systemRoles: allRoles.filter(r => r.isSystemRole).length,
        customRoles: allRoles.filter(r => !r.isSystemRole).length,
        usersByRole: [],
      };

      for (const role of allRoles) {
        const count = allUsers.filter(u => u.role.id === role.id).length;
        stats.usersByRole.push({ role, count });
      }

      return stats;
    } catch (error) {
      console.error('Error getting role stats:', error);
      throw new Error('Failed to fetch role statistics');
    }
  }

  // User Invites
  async createInvite(inviteData: InviteCreate): Promise<UserInvite> {
    try {
      const emailValidation = validateEmail(inviteData.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }

      const existingUser = await this.getUserByEmail(inviteData.email);
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      const existingInvite = await this.getInviteByEmail(inviteData.email);
      if (existingInvite && existingInvite.status === 'pending') {
        throw new Error('An invite for this email already exists');
      }

      const role = await this.getRole(inviteData.roleId);
      if (!role) {
        throw new Error('Invalid role specified');
      }

      const id = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      const expiresAt = inviteData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const invite: UserInvite = {
        id,
        email: inviteData.email,
        roleId: inviteData.roleId,
        role,
        invitedBy: 'current_user_id', // This should come from auth context
        invitedByUser: await this.getUser('current_user_id'),
        message: inviteData.message,
        expiresAt,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      await indexedDB.set(this.invitesStoreName, invite);
      return invite;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  }

  async getInvite(id: string): Promise<UserInvite | null> {
    try {
      const invite = await indexedDB.get(this.invitesStoreName, id) as UserInvite;
      if (!invite) return null;

      const role = await this.getRole(invite.roleId);
      const invitedByUser = await this.getUser(invite.invitedBy);

      return {
        ...invite,
        role,
        invitedByUser,
      };
    } catch (error) {
      console.error('Error getting invite:', error);
      throw new Error('Failed to fetch invite');
    }
  }

  async getInviteByEmail(email: string): Promise<UserInvite | null> {
    try {
      const allInvites = await indexedDB.getAll(this.invitesStoreName) as UserInvite[];
      const invite = allInvites.find(i => i.email.toLowerCase() === email.toLowerCase() && i.status === 'pending');
      if (!invite) return null;

      const role = await this.getRole(invite.roleId);
      const invitedByUser = await this.getUser(invite.invitedBy);

      return {
        ...invite,
        role,
        invitedByUser,
      };
    } catch (error) {
      console.error('Error getting invite by email:', error);
      throw new Error('Failed to fetch invite');
    }
  }

  async acceptInvite(id: string, userData: Omit<UserCreate, 'role'>): Promise<User> {
    try {
      const invite = await this.getInvite(id);
      if (!invite) {
        throw new Error('Invite not found');
      }

      if (invite.status !== 'pending') {
        throw new Error('Invite is no longer valid');
      }

      if (new Date(invite.expiresAt) < new Date()) {
        throw new Error('Invite has expired');
      }

      const user = await this.createUser({
        ...userData,
        role: invite.roleId,
      });

      await this.updateInviteStatus(id, 'accepted');

      return user;
    } catch (error) {
      console.error('Error accepting invite:', error);
      throw error;
    }
  }

  async revokeInvite(id: string): Promise<void> {
    try {
      await this.updateInviteStatus(id, 'revoked');
    } catch (error) {
      console.error('Error revoking invite:', error);
      throw new Error('Failed to revoke invite');
    }
  }

  // Helper Methods
  private async getUserStatistics(userId: string) {
    try {
      const allPosts = await indexedDB.getAll('posts') as any[];
      const allPages = await indexedDB.getAll('pages') as any[];
      const allMedia = await indexedDB.getAll('media') as any[];

      return {
        postsPublished: allPosts.filter(p => p.authorId === userId && p.status === 'published').length,
        postsDraft: allPosts.filter(p => p.authorId === userId && p.status === 'draft').length,
        pagesCreated: allPages.filter(p => p.authorId === userId).length,
        mediaUploaded: allMedia.filter(m => m.authorId === userId).length,
        commentsMade: 0, // To be implemented when comments system is added
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return {
        postsPublished: 0,
        postsDraft: 0,
        pagesCreated: 0,
        mediaUploaded: 0,
        commentsMade: 0,
      };
    }
  }

  private async updateUserStatistics(userId: string, stats: any) {
    try {
      const user = await this.getUser(userId);
      if (user) {
        user.statistics = stats;
        await indexedDB.set(this.usersStoreName, user);
      }
    } catch (error) {
      console.error('Error updating user statistics:', error);
    }
  }

  private async getUserCountByRole(roleId: string): Promise<number> {
    try {
      const allUsers = await indexedDB.getAll(this.usersStoreName) as User[];
      return allUsers.filter(u => u.role.id === roleId).length;
    } catch (error) {
      console.error('Error getting user count by role:', error);
      return 0;
    }
  }

  private async updateInviteStatus(id: string, status: 'accepted' | 'expired' | 'revoked'): Promise<void> {
    try {
      const invite = await indexedDB.get(this.invitesStoreName, id) as UserInvite;
      if (invite) {
        invite.status = status;
        invite.updatedAt = new Date().toISOString();
        if (status === 'accepted') {
          invite.acceptedAt = new Date().toISOString();
        }
        await indexedDB.set(this.invitesStoreName, invite);
      }
    } catch (error) {
      console.error('Error updating invite status:', error);
    }
  }

  // Bulk Operations
  async bulkUpdateUsers(ids: string[], updates: Partial<UserUpdate>): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.updateUser(id, updates))
      );
    } catch (error) {
      console.error('Error in bulk user update:', error);
      throw new Error('Failed to bulk update users');
    }
  }

  async bulkDeleteUsers(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deleteUser(id))
      );
    } catch (error) {
      console.error('Error in bulk user delete:', error);
      throw new Error('Failed to bulk delete users');
    }
  }

  async bulkDeleteRoles(ids: string[]): Promise<void> {
    try {
      await Promise.all(
        ids.map(id => this.deleteRole(id))
      );
    } catch (error) {
      console.error('Error in bulk role delete:', error);
      throw new Error('Failed to bulk delete roles');
    }
  }
}

export const usersService = new UsersService();