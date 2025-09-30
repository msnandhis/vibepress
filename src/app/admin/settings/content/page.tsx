'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Image as ImageIcon,
  Folder,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { ContentPublishingSettings } from '@/types/settings';

const commonFileTypes = [
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx', 'txt', 'zip'
];

export default function ContentPublishingSettingsPage() {
  const { getCategorySettings, updateCategorySettings, loading } = useSettings();
  const [formData, setFormData] = useState<ContentPublishingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading) {
      const contentSettings = getCategorySettings<ContentPublishingSettings>('contentPublishing');
      setFormData(contentSettings);
    }
  }, [loading, getCategorySettings]);

  useEffect(() => {
    if (formData) {
      const originalSettings = getCategorySettings<ContentPublishingSettings>('contentPublishing');
      setHasChanges(JSON.stringify(formData) !== JSON.stringify(originalSettings));
    }
  }, [formData, getCategorySettings]);

  const handleInputChange = (section: keyof ContentPublishingSettings, field: string, value: any) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        [field]: value,
      },
    }));
  };

  const handleFileTypeToggle = (fileType: string, checked: boolean) => {
    if (!formData) return;

    const currentTypes = formData.mediaUploads.allowedFileTypes;
    const newTypes = checked
      ? [...currentTypes, fileType]
      : currentTypes.filter(type => type !== fileType);

    setFormData(prev => ({
      ...prev!,
      mediaUploads: {
        ...prev!.mediaUploads,
        allowedFileTypes: newTypes,
      },
    }));
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    try {
      const success = await updateCategorySettings('contentPublishing', formData);
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
    const originalSettings = getCategorySettings<ContentPublishingSettings>('contentPublishing');
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
            <FileText className="h-6 w-6" />
            Content & Publishing
          </h2>
          <p className="text-muted-foreground">
            Configure editor settings, media uploads, and content organization
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

      {/* Editor Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Editor Settings
          </CardTitle>
          <CardDescription>
            Configure the content editor behavior and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="autoSaveInterval">Auto-save Interval (seconds)</Label>
              <Input
                id="autoSaveInterval"
                type="number"
                min="10"
                max="300"
                value={formData.editor.autoSaveInterval}
                onChange={(e) => handleInputChange('editor', 'autoSaveInterval', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                How often content is automatically saved while editing
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revisionHistory">Revision History</Label>
              <Input
                id="revisionHistory"
                type="number"
                min="1"
                max="50"
                value={formData.editor.revisionHistory}
                onChange={(e) => handleInputChange('editor', 'revisionHistory', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Number of revisions to keep for each post
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="wordCountDisplay">Word Count Display</Label>
              <p className="text-xs text-muted-foreground">
                Show word count in the editor
              </p>
            </div>
            <Switch
              id="wordCountDisplay"
              checked={formData.editor.wordCountDisplay}
              onCheckedChange={(checked) => handleInputChange('editor', 'wordCountDisplay', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media & Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Media & Uploads
          </CardTitle>
          <CardDescription>
            Configure file upload settings and media handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
              <Input
                id="maxUploadSize"
                type="number"
                min="1"
                max="100"
                value={formData.mediaUploads.maxUploadSize}
                onChange={(e) => handleInputChange('mediaUploads', 'maxUploadSize', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum file size for uploads
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageQuality">Image Quality (%)</Label>
              <Input
                id="imageQuality"
                type="number"
                min="1"
                max="100"
                value={formData.mediaUploads.imageQuality}
                onChange={(e) => handleInputChange('mediaUploads', 'imageQuality', parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                JPEG compression quality (higher = better quality, larger files)
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="autoGenerateThumbnails">Auto-generate Thumbnails</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically create thumbnail versions of uploaded images
                </p>
              </div>
              <Switch
                id="autoGenerateThumbnails"
                checked={formData.mediaUploads.autoGenerateThumbnails}
                onCheckedChange={(checked) => handleInputChange('mediaUploads', 'autoGenerateThumbnails', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="imageAltTextRequired">Require Alt Text</Label>
                <p className="text-xs text-muted-foreground">
                  Require alt text for images for better accessibility
                </p>
              </div>
              <Switch
                id="imageAltTextRequired"
                checked={formData.mediaUploads.imageAltTextRequired}
                onCheckedChange={(checked) => handleInputChange('mediaUploads', 'imageAltTextRequired', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label>Allowed File Types</Label>
            <p className="text-xs text-muted-foreground mb-4">
              Select which file types users can upload
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {commonFileTypes.map((fileType) => (
                <div key={fileType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`filetype-${fileType}`}
                    checked={formData.mediaUploads.allowedFileTypes.includes(fileType)}
                    onChange={(e) => handleFileTypeToggle(fileType, e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor={`filetype-${fileType}`} className="text-sm font-normal">
                    .{fileType}
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label htmlFor="customFileTypes">Custom File Types</Label>
              <Input
                id="customFileTypes"
                placeholder="csv,xml,json (comma-separated)"
                value={formData.mediaUploads.allowedFileTypes.filter(type => !commonFileTypes.includes(type)).join(', ')}
                onChange={(e) => {
                  const customTypes = e.target.value.split(',').map(type => type.trim()).filter(Boolean);
                  const allTypes = [...commonFileTypes.filter(type => formData.mediaUploads.allowedFileTypes.includes(type)), ...customTypes];
                  handleInputChange('mediaUploads', 'allowedFileTypes', allTypes);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Add additional file extensions (without the dot)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Content Organization
          </CardTitle>
          <CardDescription>
            Configure content organization and templates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="contentTemplates">Content Templates</Label>
              <p className="text-xs text-muted-foreground">
                Enable pre-defined post and page templates for consistent formatting
              </p>
            </div>
            <Switch
              id="contentTemplates"
              checked={formData.contentOrganization.contentTemplates}
              onCheckedChange={(checked) => handleInputChange('contentOrganization', 'contentTemplates', checked)}
            />
          </div>

          {formData.contentOrganization.contentTemplates && (
            <div className="p-4 bg-muted/30 rounded-lg border border-muted">
              <h4 className="font-medium text-foreground mb-2">Template Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Pre-designed layouts for different content types</li>
                <li>• Consistent formatting across posts and pages</li>
                <li>• Custom fields for specific template types</li>
                <li>• SEO-optimized structure templates</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Impact</CardTitle>
          <CardDescription>
            How your current settings affect site performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Auto-save Interval</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.editor.autoSaveInterval}s - {formData.editor.autoSaveInterval > 60 ? 'Good' : 'Frequent'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${formData.mediaUploads.imageQuality > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium">Image Quality</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.mediaUploads.imageQuality}% - {formData.mediaUploads.imageQuality > 80 ? 'High Quality' : 'Optimized'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">Max Upload Size</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.mediaUploads.maxUploadSize}MB - Reasonable
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}