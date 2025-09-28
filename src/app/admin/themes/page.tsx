"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/theme-provider";
import { Palette, Type, Layout, Save, RotateCcw, Download, Upload } from "lucide-react";
import { toast } from "sonner";

const fontOptions = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "Open Sans, sans-serif", label: "Open Sans" },
  { value: "Poppins, sans-serif", label: "Poppins" },
  { value: "Montserrat, sans-serif", label: "Montserrat" },
  { value: "Lato, sans-serif", label: "Lato" },
  { value: "Nunito, sans-serif", label: "Nunito" },
  { value: "Source Sans Pro, sans-serif", label: "Source Sans Pro" },
];

const displayFontOptions = [
  { value: "Roboto Slab, serif", label: "Roboto Slab" },
  { value: "Playfair Display, serif", label: "Playfair Display" },
  { value: "Merriweather, serif", label: "Merriweather" },
  { value: "Lora, serif", label: "Lora" },
  { value: "Crimson Text, serif", label: "Crimson Text" },
  { value: "Source Serif Pro, serif", label: "Source Serif Pro" },
  { value: "Inter, sans-serif", label: "Inter (Sans)" },
  { value: "Poppins, sans-serif", label: "Poppins (Sans)" },
];

export default function ThemesPage() {
  const { customTheme, updateCustomTheme, resetToDefault, saveTheme, themes, loadTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [themeName, setThemeName] = useState("");

  const handleColorChange = (colorKey: string, value: string) => {
    updateCustomTheme({
      colors: {
        ...customTheme.colors,
        [colorKey]: value,
      },
    });
  };

  const handleTypographyChange = (category: string, key: string, value: string | number) => {
    updateCustomTheme({
      typography: {
        ...customTheme.typography,
        [category]: {
          ...customTheme.typography[category as keyof typeof customTheme.typography],
          [key]: value,
        },
      },
    });
  };

  const handleSpacingChange = (key: string, value: string) => {
    updateCustomTheme({
      spacing: {
        ...customTheme.spacing,
        [key]: value,
      },
    });
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      toast.error("Please enter a theme name");
      return;
    }

    setSaving(true);
    try {
      await saveTheme(themeName);
      toast.success(`Theme "${themeName}" saved successfully!`);
      setThemeName("");
    } catch (error) {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast.success("Theme reset to default");
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(customTheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${customTheme.name || 'custom'}-theme.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success("Theme exported successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Theme Customization</h1>
          <p className="text-muted-foreground">Customize your site's appearance, typography, and layout to match your brand.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={exportTheme}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Theme Customization Panel */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="spacing" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Spacing
              </TabsTrigger>
              <TabsTrigger value="themes" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved Themes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Color Palette</CardTitle>
                  <CardDescription>Customize your site's color scheme</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(customTheme.colors).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="color"
                          id={key}
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="w-16 h-10 p-1 border rounded"
                        />
                        <Input
                          type="text"
                          value={value}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          className="flex-1"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Font Families</CardTitle>
                  <CardDescription>Choose fonts for different text elements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Display Font (Headings)</Label>
                      <Select
                        value={customTheme.typography.fontFamily.display}
                        onValueChange={(value) => handleTypographyChange("fontFamily", "display", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {displayFontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Body Font</Label>
                      <Select
                        value={customTheme.typography.fontFamily.body}
                        onValueChange={(value) => handleTypographyChange("fontFamily", "body", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map((font) => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Font Sizes</CardTitle>
                  <CardDescription>Adjust font sizes for different text elements</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(customTheme.typography.fontSize).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`font-${key}`} className="capitalize">
                        {key === "2xl" ? "2XL" : key === "3xl" ? "3XL" : key === "4xl" ? "4XL" : key === "5xl" ? "5XL" : key}
                      </Label>
                      <Input
                        id={`font-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleTypographyChange("fontSize", key, e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spacing Scale</CardTitle>
                  <CardDescription>Define consistent spacing throughout your site</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(customTheme.spacing).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={`spacing-${key}`} className="uppercase">
                        {key}
                      </Label>
                      <Input
                        id={`spacing-${key}`}
                        type="text"
                        value={value}
                        onChange={(e) => handleSpacingChange(key, e.target.value)}
                        placeholder="1rem"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Save Current Theme</CardTitle>
                  <CardDescription>Save your current customizations as a reusable theme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Theme name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveTheme} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Theme"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Themes</CardTitle>
                  <CardDescription>Load previously saved themes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <h3 className="font-medium">{theme.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {theme.id === "default" ? "System default theme" : "Custom theme"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {theme.id === customTheme.id && (
                            <Badge variant="secondary">Active</Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadTheme(theme.id)}
                            disabled={theme.id === customTheme.id}
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>See your changes in real-time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <h1 className="font-display text-2xl font-bold text-foreground">Sample Heading</h1>
                <p className="text-muted-foreground">
                  This is a sample paragraph to show how your typography choices will look.
                </p>
                <Button className="w-full">Sample Button</Button>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: customTheme.colors.primary }}
                  />
                  <span className="text-sm">Primary Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: customTheme.colors.accent }}
                  />
                  <span className="text-sm">Accent Color</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}