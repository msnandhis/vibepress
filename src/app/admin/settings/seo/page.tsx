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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  BarChart3,
  FileText,
  Save,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Eye,
  Globe,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEOAnalyticsSettings } from '@/types/settings';

const twitterCardTypes = [
  { value: 'summary', label: 'Summary Card' },
  { value: 'summary_large_image', label: 'Summary Card with Large Image' },
  { value: 'app', label: 'App Card' },
  { value: 'player', label: 'Player Card' },
];

export default function SEOAnalyticsSettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<SEOAnalyticsSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading) {
      const seoSettings = getCategorySettings<SEOAnalyticsSettings>('seoAnalytics');
      setFormData(seoSettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<SEOAnalyticsSettings>('seoAnalytics');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof SEOAnalyticsSettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section: keyof SEOAnalyticsSettings, nestedField: string, field: string, value: any) => {
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

  const handleArrayToggle = (section: keyof SEOAnalyticsSettings, field: string, item: string, checked: boolean) => {
    if (!formData) return;

    const currentArray = formData[section][field as keyof typeof formData[typeof section]] as string[];
    const newArray = checked
      ? [...currentArray, item]
      : currentArray.filter(i => i !== item);

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: newArray,
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('seoAnalytics', formData);
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
    const originalSettings = getCategorySettings<SEOAnalyticsSettings>('seoAnalytics');
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
            <Search className="h-6 w-6" />
            SEO & Analytics
          </h2>
          <p className="text-muted-foreground">
            Configure search engine optimization and analytics tracking
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

      {/* SEO Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Defaults
          </CardTitle>
          <CardDescription>
            Default SEO settings applied across your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="metaTitleTemplate">Global Meta Title Template</Label>
              <Input
                id="metaTitleTemplate"
                value={formData.seoDefaults.globalMetaTitleTemplate}
                onChange={(e) => handleInputChange('seoDefaults', 'globalMetaTitleTemplate', e.target.value)}
                placeholder="{title} | {sitename}"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{title}'} for page title and {'{sitename}'} for site name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescriptionTemplate">Global Meta Description Template</Label>
              <Input
                id="metaDescriptionTemplate"
                value={formData.seoDefaults.globalMetaDescriptionTemplate}
                onChange={(e) => handleInputChange('seoDefaults', 'globalMetaDescriptionTemplate', e.target.value)}
                placeholder="{excerpt}"
              />
              <p className="text-xs text-muted-foreground">
                Use {'{excerpt}'} for auto-generated excerpt
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="defaultOgImage">Default Open Graph Image</Label>
              <Input
                id="defaultOgImage"
                value={formData.seoDefaults.defaultOpenGraphImage}
                onChange={(e) => handleInputChange('seoDefaults', 'defaultOpenGraphImage', e.target.value)}
                placeholder="/og-default.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Fallback image for social media sharing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitterCardType">Twitter Card Type</Label>
              <Select
                value={formData.seoDefaults.twitterCardType}
                onValueChange={(value) => handleInputChange('seoDefaults', 'twitterCardType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {twitterCardTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How content appears when shared on Twitter
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="googleVerification">Google Site Verification</Label>
              <Input
                id="googleVerification"
                value={formData.seoDefaults.googleSiteVerification}
                onChange={(e) => handleInputChange('seoDefaults', 'googleSiteVerification', e.target.value)}
                placeholder="google-site-verification meta tag content"
              />
              <p className="text-xs text-muted-foreground">
                Verification code from Google Search Console
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bingVerification">Bing Site Verification</Label>
              <Input
                id="bingVerification"
                value={formData.seoDefaults.bingSiteVerification}
                onChange={(e) => handleInputChange('seoDefaults', 'bingSiteVerification', e.target.value)}
                placeholder="msvalidate.01 meta tag content"
              />
              <p className="text-xs text-muted-foreground">
                Verification code from Bing Webmaster Tools
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Tracking
          </CardTitle>
          <CardDescription>
            Configure analytics and tracking services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={formData.analyticsTracking.googleAnalyticsId}
                onChange={(e) => handleInputChange('analyticsTracking', 'googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                GA4 measurement ID from Google Analytics
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gtmId">Google Tag Manager ID</Label>
              <Input
                id="gtmId"
                value={formData.analyticsTracking.googleTagManagerId}
                onChange={(e) => handleInputChange('analyticsTracking', 'googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
              <p className="text-xs text-muted-foreground">
                Container ID from Google Tag Manager
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input
              id="facebookPixelId"
              value={formData.analyticsTracking.facebookPixelId}
              onChange={(e) => handleInputChange('analyticsTracking', 'facebookPixelId', e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              Pixel ID from Facebook Business Manager
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headerScripts">Custom Header Scripts</Label>
              <Textarea
                id="headerScripts"
                value={formData.analyticsTracking.customTrackingScripts.header}
                onChange={(e) => handleNestedInputChange('analyticsTracking', 'customTrackingScripts', 'header', e.target.value)}
                placeholder="<!-- Custom scripts for <head> section -->"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Custom tracking scripts injected into the head section
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerScripts">Custom Footer Scripts</Label>
              <Textarea
                id="footerScripts"
                value={formData.analyticsTracking.customTrackingScripts.footer}
                onChange={(e) => handleNestedInputChange('analyticsTracking', 'customTrackingScripts', 'footer', e.target.value)}
                placeholder="<!-- Custom scripts before </body> -->"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Custom tracking scripts injected before the closing body tag
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="cookieConsent">Cookie Consent Banner</Label>
              <p className="text-xs text-muted-foreground">
                Show GDPR-compliant cookie consent banner
              </p>
            </div>
            <Switch
              id="cookieConsent"
              checked={formData.analyticsTracking.cookieConsent}
              onCheckedChange={(checked) => handleInputChange('analyticsTracking', 'cookieConsent', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* XML Sitemap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            XML Sitemap
          </CardTitle>
          <CardDescription>
            Configure what content to include in your XML sitemap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePosts"
                checked={formData.xmlSitemap.includePosts}
                onCheckedChange={(checked) => handleInputChange('xmlSitemap', 'includePosts', checked)}
              />
              <Label htmlFor="includePosts" className="text-sm font-normal">
                Include Posts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includePages"
                checked={formData.xmlSitemap.includePages}
                onCheckedChange={(checked) => handleInputChange('xmlSitemap', 'includePages', checked)}
              />
              <Label htmlFor="includePages" className="text-sm font-normal">
                Include Pages
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCategories"
                checked={formData.xmlSitemap.includeCategories}
                onCheckedChange={(checked) => handleInputChange('xmlSitemap', 'includeCategories', checked)}
              />
              <Label htmlFor="includeCategories" className="text-sm font-normal">
                Include Categories
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeTags"
                checked={formData.xmlSitemap.includeTags}
                onCheckedChange={(checked) => handleInputChange('xmlSitemap', 'includeTags', checked)}
              />
              <Label htmlFor="includeTags" className="text-sm font-normal">
                Include Tags
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Exclude Specific Content</Label>
            <div className="text-xs text-muted-foreground mb-2">
              Content IDs to exclude from sitemap (comma-separated)
            </div>
            <Textarea
              value={formData.xmlSitemap.excludeSpecificContent.join(', ')}
              onChange={(e) => handleInputChange('xmlSitemap', 'excludeSpecificContent', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="post-123, page-456, category-789"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview Sitemap
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Submit to Search Console
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO Preview
          </CardTitle>
          <CardDescription>
            Preview how your site appears in search results and social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Search Preview */}
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Google Search Result</h4>
            <div className="space-y-1">
              <div className="text-blue-600 text-lg underline cursor-pointer">
                {formData.seoDefaults.globalMetaTitleTemplate.replace('{title}', 'Sample Page').replace('{sitename}', 'Your Site')}
              </div>
              <div className="text-green-700 text-sm">https://your-site.com/sample-page</div>
              <div className="text-sm text-gray-600">
                {formData.seoDefaults.globalMetaDescriptionTemplate.replace('{excerpt}', 'This is a sample page description that would appear in search results...')}
              </div>
            </div>
          </div>

          {/* Social Media Preview */}
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Social Media Preview</h4>
            <div className="border rounded-md overflow-hidden max-w-md">
              <div className="h-32 bg-muted flex items-center justify-center">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="p-3 space-y-1">
                <div className="font-medium text-sm">Sample Page | Your Site</div>
                <div className="text-xs text-muted-foreground">
                  This is how your content appears when shared on social media...
                </div>
                <div className="text-xs text-muted-foreground">your-site.com</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}