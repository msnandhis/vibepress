'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  AlertTriangle,
  Save,
  RotateCcw,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SecurityPrivacySettings } from '@/types/settings';

export default function SecurityPrivacySettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<SecurityPrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [newWhitelistIP, setNewWhitelistIP] = useState('');
  const [newBlacklistIP, setNewBlacklistIP] = useState('');

  useEffect(() => {
    if (!loading) {
      const securitySettings = getCategorySettings<SecurityPrivacySettings>('securityPrivacy');
      setFormData(securitySettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<SecurityPrivacySettings>('securityPrivacy');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof SecurityPrivacySettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section: keyof SecurityPrivacySettings, nestedField: string, field: string, value: any) => {
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

  const addIPToList = (listType: 'whitelist' | 'blacklist', ip: string) => {
    if (!formData || !ip.trim()) return;

    // Basic IP validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipRegex.test(ip.trim())) {
      toast.error('Invalid IP address format');
      return;
    }

    const fieldName = listType === 'whitelist' ? 'ipWhitelist' : 'ipBlacklist';
    const currentList = formData.securityHardening[fieldName];

    if (currentList.includes(ip.trim())) {
      toast.error('IP address already in list');
      return;
    }

    setFormData(prev => ({
      ...prev!,
      securityHardening: {
        ...prev!.securityHardening,
        [fieldName]: [...currentList, ip.trim()],
      },
    }));

    if (listType === 'whitelist') {
      setNewWhitelistIP('');
    } else {
      setNewBlacklistIP('');
    }
  };

  const removeIPFromList = (listType: 'whitelist' | 'blacklist', ip: string) => {
    if (!formData) return;

    const fieldName = listType === 'whitelist' ? 'ipWhitelist' : 'ipBlacklist';
    const currentList = formData.securityHardening[fieldName];

    setFormData(prev => ({
      ...prev!,
      securityHardening: {
        ...prev!.securityHardening,
        [fieldName]: currentList.filter(existingIP => existingIP !== ip),
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('securityPrivacy', formData);
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
    const originalSettings = getCategorySettings<SecurityPrivacySettings>('securityPrivacy');
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
            <Shield className="h-6 w-6" />
            Security & Privacy
          </h2>
          <p className="text-muted-foreground">
            Configure security hardening and privacy protection settings
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

      {/* Security Hardening */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Hardening
          </CardTitle>
          <CardDescription>
            Enhance your site's security with these protection measures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="hideAdmin">Hide Admin Panel</Label>
                <p className="text-xs text-muted-foreground">
                  Use a custom URL slug instead of '/admin' for better security
                </p>
              </div>
              <Switch
                id="hideAdmin"
                checked={formData.securityHardening.hideAdmin}
                onCheckedChange={(checked) => handleInputChange('securityHardening', 'hideAdmin', checked)}
              />
            </div>

            {formData.securityHardening.hideAdmin && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="customAdminSlug">Custom Admin URL Slug</Label>
                <Input
                  id="customAdminSlug"
                  value={formData.securityHardening.customAdminSlug}
                  onChange={(e) => handleInputChange('securityHardening', 'customAdminSlug', e.target.value)}
                  placeholder="my-admin-panel"
                />
                <p className="text-xs text-muted-foreground">
                  Your admin panel will be accessible at: /{formData.securityHardening.customAdminSlug}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="limitLoginAttempts">Limit Login Attempts</Label>
                <p className="text-xs text-muted-foreground">
                  Protect against brute force attacks by limiting login attempts
                </p>
              </div>
              <Switch
                id="limitLoginAttempts"
                checked={formData.securityHardening.limitLoginAttempts.enabled}
                onCheckedChange={(checked) => handleNestedInputChange('securityHardening', 'limitLoginAttempts', 'enabled', checked)}
              />
            </div>

            {formData.securityHardening.limitLoginAttempts.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="3"
                    max="20"
                    value={formData.securityHardening.limitLoginAttempts.maxAttempts}
                    onChange={(e) => handleNestedInputChange('securityHardening', 'limitLoginAttempts', 'maxAttempts', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of failed attempts before lockout
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    min="5"
                    max="1440"
                    value={formData.securityHardening.limitLoginAttempts.lockoutDuration}
                    onChange={(e) => handleNestedInputChange('securityHardening', 'limitLoginAttempts', 'lockoutDuration', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    How long to lock out after max attempts
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* IP Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            IP Access Control
          </CardTitle>
          <CardDescription>
            Control which IP addresses can access your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* IP Whitelist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Whitelist</Label>
                <p className="text-xs text-muted-foreground">
                  Only these IP addresses will be allowed to access the admin panel
                </p>
              </div>
              <Badge variant="outline">
                {formData.securityHardening.ipWhitelist.length} IPs
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="192.168.1.1 or 2001:db8::1"
                value={newWhitelistIP}
                onChange={(e) => setNewWhitelistIP(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addIPToList('whitelist', newWhitelistIP);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => addIPToList('whitelist', newWhitelistIP)}
                disabled={!newWhitelistIP.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {formData.securityHardening.ipWhitelist.length > 0 && (
              <div className="space-y-2">
                {formData.securityHardening.ipWhitelist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <code className="text-sm">{ip}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIPFromList('whitelist', ip)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* IP Blacklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>IP Blacklist</Label>
                <p className="text-xs text-muted-foreground">
                  These IP addresses will be blocked from accessing your site
                </p>
              </div>
              <Badge variant="outline">
                {formData.securityHardening.ipBlacklist.length} IPs
              </Badge>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="192.168.1.100 or 2001:db8::100"
                value={newBlacklistIP}
                onChange={(e) => setNewBlacklistIP(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addIPToList('blacklist', newBlacklistIP);
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => addIPToList('blacklist', newBlacklistIP)}
                disabled={!newBlacklistIP.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {formData.securityHardening.ipBlacklist.length > 0 && (
              <div className="space-y-2">
                {formData.securityHardening.ipBlacklist.map((ip, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                    <code className="text-sm">{ip}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIPFromList('blacklist', ip)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>
            Current security configuration overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.securityHardening.hideAdmin ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">Admin Panel</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.securityHardening.hideAdmin ? 'Hidden' : 'Standard URL'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.securityHardening.limitLoginAttempts.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">Login Protection</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.securityHardening.limitLoginAttempts.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.securityHardening.ipWhitelist.length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium">IP Whitelist</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.securityHardening.ipWhitelist.length} addresses
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.securityHardening.ipBlacklist.length > 0 ? 'bg-yellow-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium">IP Blacklist</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.securityHardening.ipBlacklist.length} blocked
              </span>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Security Recommendations</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enable login attempt limiting to prevent brute force attacks</li>
              <li>• Use a custom admin URL slug to reduce automated attacks</li>
              <li>• Regularly update your IP whitelist with trusted addresses</li>
              <li>• Monitor your site logs for suspicious activity</li>
              <li>• Keep your CMS and plugins updated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}