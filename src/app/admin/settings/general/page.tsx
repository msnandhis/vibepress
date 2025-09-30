'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Clock,
  FileText,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { GeneralSettings } from '@/types/settings';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC',
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: '12/31/2024 (MM/DD/YYYY)' },
  { value: 'DD/MM/YYYY', label: '31/12/2024 (DD/MM/YYYY)' },
  { value: 'YYYY-MM-DD', label: '2024-12-31 (YYYY-MM-DD)' },
  { value: 'DD MMM YYYY', label: '31 Dec 2024 (DD MMM YYYY)' },
  { value: 'MMM DD, YYYY', label: 'Dec 31, 2024 (MMM DD, YYYY)' },
];

const postStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
];

export default function GeneralSettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<GeneralSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading) {
      const generalSettings = getCategorySettings<GeneralSettings>('general');
      setFormData(generalSettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<GeneralSettings>('general');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof GeneralSettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('general', formData);
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
    const originalSettings = getCategorySettings<GeneralSettings>('general');
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
            <Globe className="h-6 w-6" />
            General Settings
          </h2>
          <p className="text-muted-foreground">
            Configure basic site information and default content settings
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

      {/* Site Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Identity
          </CardTitle>
          <CardDescription>
            Basic information about your site that appears in branding and SEO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteTitle">Site Title *</Label>
              <Input
                id="siteTitle"
                value={formData.siteIdentity.siteTitle}
                onChange={(e) => handleInputChange('siteIdentity', 'siteTitle', e.target.value)}
                placeholder="Enter your site title"
              />
              <p className="text-xs text-muted-foreground">
                This appears in browser tabs and search results
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteTagline">Site Tagline</Label>
              <Input
                id="siteTagline"
                value={formData.siteIdentity.siteTagline}
                onChange={(e) => handleInputChange('siteIdentity', 'siteTagline', e.target.value)}
                placeholder="A brief description of your site"
              />
              <p className="text-xs text-muted-foreground">
                Short subtitle that describes your site
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={formData.siteIdentity.siteDescription}
              onChange={(e) => handleInputChange('siteIdentity', 'siteDescription', e.target.value)}
              placeholder="Describe what your site is about"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Used as the default meta description for SEO
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteLogo">Site Logo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="siteLogo"
                  value={formData.siteIdentity.siteLogo}
                  onChange={(e) => handleInputChange('siteIdentity', 'siteLogo', e.target.value)}
                  placeholder="/logo.svg"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Logo displayed on your site
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="favicon"
                  value={formData.siteIdentity.favicon}
                  onChange={(e) => handleInputChange('siteIdentity', 'favicon', e.target.value)}
                  placeholder="/favicon.ico"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Small icon for browser tabs
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminLogo">Admin Logo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="adminLogo"
                  value={formData.siteIdentity.adminLogo}
                  onChange={(e) => handleInputChange('siteIdentity', 'adminLogo', e.target.value)}
                  placeholder="/admin-logo.svg"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Logo for admin dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Site Configuration
          </CardTitle>
          <CardDescription>
            General configuration settings for your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                value={formData.siteConfiguration.siteUrl}
                onChange={(e) => handleInputChange('siteConfiguration', 'siteUrl', e.target.value)}
                placeholder="https://your-site.com"
              />
              <p className="text-xs text-muted-foreground">
                The base URL of your website
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select
                value={formData.siteConfiguration.defaultTimezone}
                onValueChange={(value) => handleInputChange('siteConfiguration', 'defaultTimezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default timezone for dates and scheduling
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={formData.siteConfiguration.dateFormat}
                onValueChange={(value) => handleInputChange('siteConfiguration', 'dateFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How dates are displayed on your site
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={formData.siteConfiguration.timeFormat}
                onValueChange={(value) => handleInputChange('siteConfiguration', 'timeFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How times are displayed on your site
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Settings
          </CardTitle>
          <CardDescription>
            Default settings for content creation and display
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultPostStatus">Default Post Status</Label>
              <Select
                value={formData.content.defaultPostStatus}
                onValueChange={(value) => handleInputChange('content', 'defaultPostStatus', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Default status for new posts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postsPerPage">Posts per Page</Label>
              <Input
                id="postsPerPage"
                type="number"
                min="1"
                max="100"
                value={formData.content.postsPerPage}
                onChange={(e) => handleInputChange('content', 'postsPerPage', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of posts shown on listing pages
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerptLength">Excerpt Length</Label>
              <Input
                id="excerptLength"
                type="number"
                min="50"
                max="500"
                value={formData.content.excerptLength}
                onChange={(e) => handleInputChange('content', 'excerptLength', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Word count for auto-generated excerpts
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="commentStatus">Comments</Label>
              <p className="text-xs text-muted-foreground">
                Enable comments on posts by default
              </p>
            </div>
            <Switch
              id="commentStatus"
              checked={formData.content.commentStatus}
              onCheckedChange={(checked) => handleInputChange('content', 'commentStatus', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}