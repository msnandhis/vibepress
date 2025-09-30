'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserManagementSettings } from '@/types/settings';

const registrationOptions = [
  { value: 'open', label: 'Open Registration', description: 'Anyone can register' },
  { value: 'invite-only', label: 'Invite Only', description: 'Registration by invitation only' },
  { value: 'disabled', label: 'Disabled', description: 'No new registrations allowed' },
];

const userRoles = [
  { value: 'subscriber', label: 'Subscriber' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'author', label: 'Author' },
  { value: 'editor', label: 'Editor' },
  { value: 'administrator', label: 'Administrator' },
];

export default function UserManagementSettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<UserManagementSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading) {
      const userSettings = getCategorySettings<UserManagementSettings>('userManagement');
      setFormData(userSettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<UserManagementSettings>('userManagement');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof UserManagementSettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section: keyof UserManagementSettings, nestedField: string, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [nestedField]: {
          ...prev![section][nestedField as keyof typeof prev[typeof section]],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('userManagement', formData);
      if (success) {
        setHasChanges(false);
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const originalSettings = getCategorySettings<UserManagementSettings>('userManagement');
    setFormData(originalSettings);
    setHasChanges(false);
  };

  if (loading || !formData) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-8 w-48" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Configure user registration, profiles, and session management
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Registration Settings
          </CardTitle>
          <CardDescription>
            Control how new users can register and what permissions they have
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userRegistration">User Registration</Label>
              <Select
                value={formData.registration.userRegistration}
                onValueChange={(value) => handleInputChange('registration', 'userRegistration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {registrationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultUserRole">Default User Role</Label>
              <Select
                value={formData.registration.defaultUserRole}
                onValueChange={(value) => handleInputChange('registration', 'defaultUserRole', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default role assigned to new users
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emailVerification">Email Verification Required</Label>
                <p className="text-xs text-muted-foreground">
                  Require users to verify their email address before accessing the site
                </p>
              </div>
              <Switch
                id="emailVerification"
                checked={formData.registration.emailVerificationRequired}
                onCheckedChange={(checked) => handleInputChange('registration', 'emailVerificationRequired', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="adminApproval">Admin Approval Required</Label>
                <p className="text-xs text-muted-foreground">
                  Require admin approval before new users can access the site
                </p>
              </div>
              <Switch
                id="adminApproval"
                checked={formData.registration.adminApprovalRequired}
                onCheckedChange={(checked) => handleInputChange('registration', 'adminApprovalRequired', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Password Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  min="6"
                  max="32"
                  value={formData.registration.passwordRequirements.minLength}
                  onChange={(e) => handleNestedInputChange('registration', 'passwordRequirements', 'minLength', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireUppercase" className="text-sm">Require Uppercase</Label>
                  <Switch
                    id="requireUppercase"
                    checked={formData.registration.passwordRequirements.requireUppercase}
                    onCheckedChange={(checked) => handleNestedInputChange('registration', 'passwordRequirements', 'requireUppercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireLowercase" className="text-sm">Require Lowercase</Label>
                  <Switch
                    id="requireLowercase"
                    checked={formData.registration.passwordRequirements.requireLowercase}
                    onCheckedChange={(checked) => handleNestedInputChange('registration', 'passwordRequirements', 'requireLowercase', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireNumbers" className="text-sm">Require Numbers</Label>
                  <Switch
                    id="requireNumbers"
                    checked={formData.registration.passwordRequirements.requireNumbers}
                    onCheckedChange={(checked) => handleNestedInputChange('registration', 'passwordRequirements', 'requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireSpecialChars" className="text-sm">Require Special Characters</Label>
                  <Switch
                    id="requireSpecialChars"
                    checked={formData.registration.passwordRequirements.requireSpecialChars}
                    onCheckedChange={(checked) => handleNestedInputChange('registration', 'passwordRequirements', 'requireSpecialChars', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Profiles
          </CardTitle>
          <CardDescription>
            Configure user profile settings and public visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allowProfilePictures">Allow Profile Pictures</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to upload profile pictures
                </p>
              </div>
              <Switch
                id="allowProfilePictures"
                checked={formData.userProfiles.allowProfilePictures}
                onCheckedChange={(checked) => handleInputChange('userProfiles', 'allowProfilePictures', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="publicProfilePages">Public Profile Pages</Label>
                <p className="text-xs text-muted-foreground">
                  Show user profiles on the frontend
                </p>
              </div>
              <Switch
                id="publicProfilePages"
                checked={formData.userProfiles.publicProfilePages}
                onCheckedChange={(checked) => handleInputChange('userProfiles', 'publicProfilePages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="userDirectory">User Directory</Label>
                <p className="text-xs text-muted-foreground">
                  Enable a user listing page
                </p>
              </div>
              <Switch
                id="userDirectory"
                checked={formData.userProfiles.userDirectory}
                onCheckedChange={(checked) => handleInputChange('userProfiles', 'userDirectory', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Configure user sessions and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="15"
                max="10080"
                value={formData.sessionManagement.sessionTimeout}
                onChange={(e) => handleInputChange('sessionManagement', 'sessionTimeout', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                How long users stay logged in (1 day = 1440 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordResetExpiry">Password Reset Expiry (hours)</Label>
              <Input
                id="passwordResetExpiry"
                type="number"
                min="1"
                max="168"
                value={formData.sessionManagement.passwordResetExpiry}
                onChange={(e) => handleInputChange('sessionManagement', 'passwordResetExpiry', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                How long password reset links remain valid
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="concurrentSessions">Allow Concurrent Sessions</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to be logged in from multiple devices
                </p>
              </div>
              <Switch
                id="concurrentSessions"
                checked={formData.sessionManagement.concurrentSessions}
                onCheckedChange={(checked) => handleInputChange('sessionManagement', 'concurrentSessions', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">
                  Enable 2FA for enhanced security
                </p>
              </div>
              <Switch
                id="twoFactorAuth"
                checked={formData.sessionManagement.twoFactorAuthentication}
                onCheckedChange={(checked) => handleInputChange('sessionManagement', 'twoFactorAuthentication', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}