'use client';

import { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/context/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Search,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SettingsOverviewPage() {
  const { settings, loading, validateSettings, exportSettings, importSettings, resetToDefaults } = useSettings();
  const [validationResult, setValidationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      const result = validateSettings();
      setValidationResult(result);
    }
  }, [loading, validateSettings, settings]);

  const handleExportSettings = async () => {
    try {
      await exportSettings();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importSettings(text);

      if (success) {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  const handleResetToDefaults = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to defaults? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await resetToDefaults();
      } catch (error) {
        toast.error('Failed to reset settings');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const hasErrors = validationResult && Object.keys(validationResult.errors).length > 0;
  const hasWarnings = validationResult && Object.keys(validationResult.warnings).length > 0;

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription>
            Overall health and configuration status of your VibePress installation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Configuration Status */}
            <div className="flex items-center gap-3">
              {hasErrors ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : hasWarnings ? (
                <Info className="h-5 w-5 text-warning" />
              ) : (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              <div>
                <p className="font-medium text-foreground">Configuration</p>
                <p className="text-sm text-muted-foreground">
                  {hasErrors ? 'Issues found' : hasWarnings ? 'Minor warnings' : 'All good'}
                </p>
              </div>
            </div>

            {/* Site Information */}
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Site Title</p>
                <p className="text-sm text-muted-foreground">
                  {settings.general.siteIdentity.siteTitle}
                </p>
              </div>
            </div>

            {/* Last Modified */}
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Last Modified</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* General Settings Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-blue-600" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Site Title</span>
              <span className="text-sm font-medium">{settings.general.siteIdentity.siteTitle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Timezone</span>
              <span className="text-sm font-medium">{settings.general.siteConfiguration.defaultTimezone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posts per Page</span>
              <span className="text-sm font-medium">{settings.general.content.postsPerPage}</span>
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-green-600" />
              SEO & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Google Analytics</span>
              <Badge variant={settings.seoAnalytics.analyticsTracking.googleAnalyticsId ? 'default' : 'secondary'}>
                {settings.seoAnalytics.analyticsTracking.googleAnalyticsId ? 'Configured' : 'Not Set'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">XML Sitemap</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cookie Consent</span>
              <Badge variant={settings.seoAnalytics.analyticsTracking.cookieConsent ? 'default' : 'secondary'}>
                {settings.seoAnalytics.analyticsTracking.cookieConsent ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Management Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-600" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Registration</span>
              <Badge variant={settings.userManagement.registration.userRegistration === 'open' ? 'default' : 'secondary'}>
                {settings.userManagement.registration.userRegistration}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Email Verification</span>
              <Badge variant={settings.userManagement.registration.emailVerificationRequired ? 'default' : 'secondary'}>
                {settings.userManagement.registration.emailVerificationRequired ? 'Required' : 'Optional'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">2FA</span>
              <Badge variant={settings.userManagement.sessionManagement.twoFactorAuthentication ? 'default' : 'secondary'}>
                {settings.userManagement.sessionManagement.twoFactorAuthentication ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Content Settings Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-orange-600" />
              Content & Publishing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Upload Size</span>
              <span className="text-sm font-medium">{settings.contentPublishing.mediaUploads.maxUploadSize}MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Auto-save</span>
              <span className="text-sm font-medium">{settings.contentPublishing.editor.autoSaveInterval}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Image Quality</span>
              <span className="text-sm font-medium">{settings.contentPublishing.mediaUploads.imageQuality}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Security Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-600" />
              Security & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Login Attempts</span>
              <Badge variant={settings.securityPrivacy.securityHardening.limitLoginAttempts.enabled ? 'default' : 'secondary'}>
                {settings.securityPrivacy.securityHardening.limitLoginAttempts.enabled ? 'Limited' : 'Unlimited'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Admin URL</span>
              <Badge variant="outline">
                /{settings.securityPrivacy.securityHardening.customAdminSlug}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">IP Filtering</span>
              <Badge variant={
                settings.securityPrivacy.securityHardening.ipWhitelist.length > 0 ||
                settings.securityPrivacy.securityHardening.ipBlacklist.length > 0 ? 'default' : 'secondary'
              }>
                {settings.securityPrivacy.securityHardening.ipWhitelist.length > 0 ||
                 settings.securityPrivacy.securityHardening.ipBlacklist.length > 0 ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Tools Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Marketing & Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Redirects</span>
              <span className="text-sm font-medium">
                {settings.marketingSEO.redirectManagement.redirects.length} active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">404 Monitoring</span>
              <Badge variant={settings.marketingSEO.monitoring.track404Errors ? 'default' : 'secondary'}>
                {settings.marketingSEO.monitoring.track404Errors ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Notifications</span>
              <Badge variant={settings.marketingSEO.monitoring.notificationEmail ? 'default' : 'secondary'}>
                {settings.marketingSEO.monitoring.notificationEmail ? 'Configured' : 'Not Set'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Issues */}
      {(hasErrors || hasWarnings) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {hasErrors ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Info className="h-5 w-5 text-warning" />
              )}
              Configuration {hasErrors ? 'Errors' : 'Warnings'}
            </CardTitle>
            <CardDescription>
              {hasErrors ? 'These issues should be resolved for optimal operation.' : 'These are suggestions for improving your configuration.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hasErrors && Object.entries(validationResult.errors).map(([field, errors]) => (
                <div key={field} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">{field}</p>
                    {(errors as string[]).map((error, index) => (
                      <p key={index} className="text-sm text-destructive/80">{error}</p>
                    ))}
                  </div>
                </div>
              ))}

              {hasWarnings && Object.entries(validationResult.warnings).map(([field, warnings]) => (
                <div key={field} className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-warning">{field}</p>
                    {(warnings as string[]).map((warning, index) => (
                      <p key={index} className="text-sm text-warning/80">{warning}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings management operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportSettings} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Settings
            </Button>
            <Button onClick={handleImportClick} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Settings
            </Button>
            <Button onClick={handleResetToDefaults} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button variant="outline" disabled>
              Backup Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}