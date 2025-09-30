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
  TrendingUp,
  ExternalLink,
  Link as LinkIcon,
  Save,
  RotateCcw,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { MarketingSEOSettings } from '@/types/settings';

export default function MarketingSEOSettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<MarketingSEOSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showNewRedirect, setShowNewRedirect] = useState(false);
  const [newRedirect, setNewRedirect] = useState({
    source: '',
    destination: '',
    type: '301' as '301' | '302' | '307',
  });

  useEffect(() => {
    if (!loading) {
      const marketingSettings = getCategorySettings<MarketingSEOSettings>('marketingSEO');
      setFormData(marketingSettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<MarketingSEOSettings>('marketingSEO');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof MarketingSEOSettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const addRedirect = () => {
    if (!formData || !newRedirect.source.trim() || !newRedirect.destination.trim()) {
      toast.error('Please fill in both source and destination URLs');
      return;
    }

    // Basic URL validation
    if (!newRedirect.source.startsWith('/')) {
      toast.error('Source URL must start with /');
      return;
    }

    try {
      new URL(newRedirect.destination.startsWith('http') ? newRedirect.destination : `https://example.com${newRedirect.destination}`);
    } catch {
      toast.error('Invalid destination URL format');
      return;
    }

    const redirect = {
      id: `redirect_${Date.now()}`,
      source: newRedirect.source,
      destination: newRedirect.destination,
      type: newRedirect.type,
      enabled: true,
    };

    setFormData(prev => ({
      ...prev!,
      redirectManagement: {
        ...prev!.redirectManagement,
        redirects: [...prev!.redirectManagement.redirects, redirect],
      },
    }));

    setNewRedirect({ source: '', destination: '', type: '301' });
    setShowNewRedirect(false);
    toast.success('Redirect added successfully');
  };

  const removeRedirect = (id: string) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      redirectManagement: {
        ...prev!.redirectManagement,
        redirects: prev!.redirectManagement.redirects.filter(redirect => redirect.id !== id),
      },
    }));

    toast.success('Redirect removed');
  };

  const toggleRedirect = (id: string, enabled: boolean) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      redirectManagement: {
        ...prev!.redirectManagement,
        redirects: prev!.redirectManagement.redirects.map(redirect =>
          redirect.id === id ? { ...redirect, enabled } : redirect
        ),
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('marketingSEO', formData);
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
    const originalSettings = getCategorySettings<MarketingSEOSettings>('marketingSEO');
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
            <TrendingUp className="h-6 w-6" />
            Marketing & SEO Tools
          </h2>
          <p className="text-muted-foreground">
            Configure redirects, 404 monitoring, and SEO tools
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

      {/* Redirect Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Redirect Management
          </CardTitle>
          <CardDescription>
            Manage 301, 302, and 307 redirects for SEO and user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {formData.redirectManagement.redirects.length} redirects
              </Badge>
              <Badge variant="outline">
                {formData.redirectManagement.redirects.filter(r => r.enabled).length} active
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowNewRedirect(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Redirect
            </Button>
          </div>

          {/* New Redirect Form */}
          {showNewRedirect && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSource">Source URL</Label>
                      <Input
                        id="newSource"
                        placeholder="/old-page"
                        value={newRedirect.source}
                        onChange={(e) => setNewRedirect(prev => ({ ...prev, source: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        The URL to redirect from (must start with /)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newDestination">Destination URL</Label>
                      <Input
                        id="newDestination"
                        placeholder="/new-page or https://example.com"
                        value={newRedirect.destination}
                        onChange={(e) => setNewRedirect(prev => ({ ...prev, destination: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        The URL to redirect to (relative or absolute)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Label htmlFor="redirectType">Redirect Type</Label>
                      <Select
                        value={newRedirect.type}
                        onValueChange={(value: '301' | '302' | '307') => setNewRedirect(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="301">301 (Permanent)</SelectItem>
                          <SelectItem value="302">302 (Temporary)</SelectItem>
                          <SelectItem value="307">307 (Temporary)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowNewRedirect(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addRedirect}>
                        Add Redirect
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Redirects */}
          {formData.redirectManagement.redirects.length > 0 ? (
            <div className="space-y-3">
              {formData.redirectManagement.redirects.map((redirect) => (
                <Card key={redirect.id} className={redirect.enabled ? '' : 'opacity-60'}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <Switch
                          checked={redirect.enabled}
                          onCheckedChange={(checked) => toggleRedirect(redirect.id, checked)}
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {redirect.source}
                          </code>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {redirect.destination}
                          </code>
                        </div>
                        <Badge variant={redirect.type === '301' ? 'default' : 'secondary'}>
                          {redirect.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // In a real implementation, this would open an edit dialog
                            toast.info('Edit functionality coming soon');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRedirect(redirect.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No redirects configured</h3>
              <p className="text-muted-foreground mb-4">
                Add redirects to improve SEO and user experience when URLs change
              </p>
              <Button onClick={() => setShowNewRedirect(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Redirect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 404 Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            404 Monitoring
          </CardTitle>
          <CardDescription>
            Track and monitor 404 errors to improve user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="track404Errors">Track 404 Errors</Label>
              <p className="text-xs text-muted-foreground">
                Monitor and log all 404 (page not found) errors
              </p>
            </div>
            <Switch
              id="track404Errors"
              checked={formData.monitoring.track404Errors}
              onCheckedChange={(checked) => handleInputChange('monitoring', 'track404Errors', checked)}
            />
          </div>

          {formData.monitoring.track404Errors && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={formData.monitoring.notificationEmail}
                  onChange={(e) => handleInputChange('monitoring', 'notificationEmail', e.target.value)}
                  placeholder="admin@yoursite.com"
                />
                <p className="text-xs text-muted-foreground">
                  Email address to receive 404 error notifications (optional)
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">404 Monitoring Features</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Track all 404 errors with timestamps and referrers</li>
                  <li>• Identify broken internal links</li>
                  <li>• Monitor external sites linking to non-existent pages</li>
                  <li>• Export 404 reports for analysis</li>
                  <li>• Suggest redirect opportunities</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Tools Summary */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Tools Summary</CardTitle>
          <CardDescription>
            Overview of your current SEO and marketing configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.redirectManagement.redirects.length > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium">Redirects</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.redirectManagement.redirects.filter(r => r.enabled).length} active
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.monitoring.track404Errors ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-sm font-medium">404 Monitoring</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.monitoring.track404Errors ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.monitoring.notificationEmail ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium">Email Notifications</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.monitoring.notificationEmail ? 'Configured' : 'Not set'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">SEO Health</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Good
              </span>
            </div>
          </div>

          {/* SEO Recommendations */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">SEO Recommendations</h4>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Set up redirects for any URLs that have changed</li>
              <li>• Enable 404 monitoring to catch broken links</li>
              <li>• Configure email notifications for critical issues</li>
              <li>• Regularly review and clean up unnecessary redirects</li>
              <li>• Monitor redirect performance and update as needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}