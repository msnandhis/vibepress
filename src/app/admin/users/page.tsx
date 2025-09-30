'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usersService } from '@/lib/users-service';
import { User, UserFilters, UserStatus, UserListResponse, UserStats } from '@/types/users';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Search,
  Download,
  Mail,
  Shield,
  Calendar,
  MoreVertical,
  Grid,
  List,
  Eye,
  UserCheck,
  UserX,
  Clock,
  Filter,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<UserListResponse['pagination'] | null>(null);
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, roleFilter, statusFilter, verifiedFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setShowBulkActions(selectedUsers.size > 0);
  }, [selectedUsers]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersResponse, stats, rolesResponse] = await Promise.all([
        usersService.getUsers({
          search: searchTerm,
          role: roleFilter === 'all' ? undefined : roleFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          emailVerified: verifiedFilter === 'all' ? undefined : verifiedFilter === 'verified',
          sortBy,
          sortOrder,
        }, page, 20),
        usersService.getUserStats(),
        usersService.getRoles({}, 1, 100),
      ]);

      setUsers(usersResponse.users);
      setPagination(usersResponse.pagination);
      setUserStats(stats);
      setAvailableRoles(rolesResponse.roles);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(u => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'suspend' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const selectedArray = Array.from(selectedUsers);

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedArray.length} user(s)?`)) {
        return;
      }
    }

    try {
      switch (action) {
        case 'activate':
          await usersService.bulkUpdateUsers(selectedArray, { status: 'active' });
          toast.success(`${selectedArray.length} users activated`);
          break;
        case 'deactivate':
          await usersService.bulkUpdateUsers(selectedArray, { status: 'inactive' });
          toast.success(`${selectedArray.length} users deactivated`);
          break;
        case 'suspend':
          await usersService.bulkUpdateUsers(selectedArray, { status: 'suspended' });
          toast.success(`${selectedArray.length} users suspended`);
          break;
        case 'delete':
          await usersService.bulkDeleteUsers(selectedArray);
          toast.success(`${selectedArray.length} users deleted`);
          break;
      }

      setSelectedUsers(new Set());
      loadData();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to perform action');
    }
  };

  const handleExport = () => {
    const data = users.map(user => ({
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email,
      email: user.email,
      username: user.username || '',
      role: user.role.name,
      status: user.status,
      verified: user.emailVerified ? 'Yes' : 'No',
      'posts published': user.statistics?.postsPublished || 0,
      'posts draft': user.statistics?.postsDraft || 0,
      'pages created': user.statistics?.pagesCreated || 0,
      'media uploaded': user.statistics?.mediaUploaded || 0,
      'last login': user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never',
      created: new Date(user.createdAt).toLocaleDateString(),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersService.deleteUser(userId);
      toast.success('User deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const getStatusIcon = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'inactive':
        return <UserX className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'suspended':
        return <Shield className="h-4 w-4" />;
      case 'banned':
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
        <div className="skeleton h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/admin/users/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{userStats?.activeUsers || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{userStats?.usersThisMonth || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{userStats?.pendingUsers || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Users ({pagination?.total || 0})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: UserStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verifiedFilter} onValueChange={(value: typeof verifiedFilter) => setVerifiedFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="lastLoginAt">Last Login</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-dashed">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedUsers.size} user(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bulk Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Activate Users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                        <UserX className="h-4 w-4 mr-2" />
                        Deactivate Users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('suspend')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Suspend Users
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('delete')}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Users
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUsers(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Get started by inviting your first user to the platform'}
              </p>
              {!searchTerm && (
                <Link href="/admin/users/new">
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="relative hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            />
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={getUserDisplayName(user)}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <Users className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="status-badge">
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border">
                                {getStatusIcon(user.status)}
                                <span className="ml-1 capitalize">{user.status}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1 truncate">
                          {getUserDisplayName(user)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 truncate">{user.email}</p>
                        <Badge
                          variant="outline"
                          className="text-xs mb-3"
                          style={{ borderColor: user.role.color, color: user.role.color }}
                        >
                          {user.role.name}
                        </Badge>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                          <div>Posts: {user.statistics?.postsPublished || 0}</div>
                          <div>Pages: {user.statistics?.pagesCreated || 0}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.size === users.length && users.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {user.avatar ? (
                                  <img
                                    src={user.avatar}
                                    alt={getUserDisplayName(user)}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <Users className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">
                                  {getUserDisplayName(user)}
                                </div>
                                {user.username && (
                                  <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                              {!user.emailVerified && (
                                <Badge variant="destructive" className="text-xs">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: user.role.color, color: user.role.color }}
                            >
                              {user.role.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="status-badge">
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border">
                                {getStatusIcon(user.status)}
                                <span className="ml-1 capitalize">{user.status}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit User
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * (pagination.limit || 20)) + 1} to {Math.min(page * (pagination.limit || 20), pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, page - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}