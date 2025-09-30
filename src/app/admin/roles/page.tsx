"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
import { UserRole, RoleFilters, RoleListResponse, RoleStats } from '@/types/users';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Search,
  Download,
  Crown,
  Settings,
  MoreVertical,
  Users,
  Lock,
  AlertCircle,
  Star
} from 'lucide-react';

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [systemRoleFilter, setSystemRoleFilter] = useState<'all' | 'system' | 'custom'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'createdAt'>('level');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<RoleListResponse['pagination'] | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, systemRoleFilter, sortBy, sortOrder]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      loadData();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setShowBulkActions(selectedRoles.size > 0);
  }, [selectedRoles]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [rolesResponse, stats] = await Promise.all([
        usersService.getRoles({
          search: searchTerm,
          isSystemRole: systemRoleFilter === 'all' ? undefined : systemRoleFilter === 'system',
          sortBy,
          sortOrder,
        }, page, 20),
        usersService.getRoleStats(),
      ]);

      setRoles(rolesResponse.roles);
      setPagination(rolesResponse.pagination);
      setRoleStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load roles data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select custom roles (not system roles)
      const customRoles = roles.filter(r => !r.isSystemRole);
      setSelectedRoles(new Set(customRoles.map(r => r.id)));
    } else {
      setSelectedRoles(new Set());
    }
  };

  const handleSelectRole = (roleId: string, checked: boolean) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.size === 0) return;

    const selectedArray = Array.from(selectedRoles);

    if (!confirm(`Are you sure you want to delete ${selectedArray.length} role(s)?`)) {
      return;
    }

    try {
      await usersService.bulkDeleteRoles(selectedArray);
      toast.success(`${selectedArray.length} roles deleted`);
      setSelectedRoles(new Set());
      loadData();
    } catch (error) {
      console.error('Error deleting roles:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete roles');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      await usersService.deleteRole(roleId);
      toast.success('Role deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  const handleExport = () => {
    const data = roles.map(role => ({
      name: role.name,
      description: role.description || '',
      level: role.level,
      'is system': role.isSystemRole ? 'Yes' : 'No',
      'is default': role.isDefault ? 'Yes' : 'No',
      'user count': role.userCount || 0,
      permissions: role.permissions.map(p => p.name).join('; '),
      created: new Date(role.createdAt).toLocaleDateString(),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roles-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Roles exported successfully');
  };

  const getRoleIcon = (role: UserRole) => {
    if (role.level >= 90) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (role.level >= 70) return <Star className="h-4 w-4 text-blue-500" />;
    if (role.level >= 50) return <Edit className="h-4 w-4 text-green-500" />;
    if (role.level >= 30) return <Settings className="h-4 w-4 text-orange-500" />;
    return <Users className="h-4 w-4 text-gray-500" />;
  };

  const customRolesCount = roles.filter(r => !r.isSystemRole).length;

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
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
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
          <Link href="/admin/roles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
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
                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                <p className="text-2xl font-bold">{roleStats?.totalRoles || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                <p className="text-2xl font-bold">{roleStats?.systemRoles || 0}</p>
              </div>
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Custom Roles</p>
                <p className="text-2xl font-bold">{roleStats?.customRoles || 0}</p>
              </div>
              <Settings className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned Users</p>
                <p className="text-2xl font-bold">
                  {roleStats?.usersByRole.reduce((sum, item) => sum + item.count, 0) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-warning" />
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
                <Shield className="h-5 w-5" />
                Roles ({pagination?.total || 0})
              </CardTitle>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={systemRoleFilter} onValueChange={(value: any) => setSystemRoleFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Role Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="system">System Roles</SelectItem>
                  <SelectItem value="custom">Custom Roles</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-dashed">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {selectedRoles.size} role(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRoles(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No roles found' : 'No roles yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Get started by creating your first custom role'}
              </p>
              {!searchTerm && (
                <Link href="/admin/roles/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedRoles.size === customRolesCount && customRolesCount > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRoles.has(role.id)}
                            onCheckedChange={(checked) => handleSelectRole(role.id, checked as boolean)}
                            disabled={role.isSystemRole}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getRoleIcon(role)}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {role.name}
                                {role.isDefault && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              {role.description && (
                                <div className="text-sm text-muted-foreground">
                                  {role.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{ borderColor: role.color, color: role.color }}
                          >
                            Level {role.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {role.userCount || 0} user{(role.userCount || 0) !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={role.isSystemRole ? "secondary" : "default"}>
                            {role.isSystemRole ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(role.createdAt).toLocaleDateString()}
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
                                <Link href={`/admin/roles/${role.id}`}>
                                  <Shield className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {!role.isSystemRole && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin/roles/${role.id}/edit`}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Role
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteRole(role.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Role
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * (pagination.limit || 20)) + 1} to {Math.min(page * (pagination.limit || 20), pagination.total)} of {pagination.total} roles
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