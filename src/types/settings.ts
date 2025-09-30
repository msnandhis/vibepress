// Settings Types and Interfaces for VibePress CMS

// General Settings
export interface SiteIdentitySettings {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  siteLogo: string;
  favicon: string;
  adminLogo: string;
}

export interface SiteConfigurationSettings {
  siteUrl: string;
  defaultTimezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface ContentSettings {
  defaultPostStatus: 'draft' | 'published' | 'scheduled';
  postsPerPage: number;
  excerptLength: number;
  commentStatus: boolean;
}

export interface GeneralSettings {
  siteIdentity: SiteIdentitySettings;
  siteConfiguration: SiteConfigurationSettings;
  content: ContentSettings;
}

// SEO & Analytics Settings
export interface SEODefaultsSettings {
  globalMetaTitleTemplate: string;
  globalMetaDescriptionTemplate: string;
  defaultOpenGraphImage: string;
  twitterCardType: 'summary' | 'summary_large_image' | 'app' | 'player';
  googleSiteVerification: string;
  bingSiteVerification: string;
}

export interface AnalyticsTrackingSettings {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customTrackingScripts: {
    header: string;
    footer: string;
  };
  cookieConsent: boolean;
}

export interface XMLSitemapSettings {
  includePosts: boolean;
  includePages: boolean;
  includeCategories: boolean;
  includeTags: boolean;
  excludeSpecificContent: string[];
}

export interface SEOAnalyticsSettings {
  seoDefaults: SEODefaultsSettings;
  analyticsTracking: AnalyticsTrackingSettings;
  xmlSitemap: XMLSitemapSettings;
}

// User Management Settings
export interface RegistrationSettings {
  userRegistration: 'open' | 'invite-only' | 'disabled';
  defaultUserRole: string;
  emailVerificationRequired: boolean;
  adminApprovalRequired: boolean;
  passwordRequirements: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface UserProfileSettings {
  allowProfilePictures: boolean;
  publicProfilePages: boolean;
  userDirectory: boolean;
  socialMediaFields: string[];
  customProfileFields: string[];
}

export interface SessionManagementSettings {
  sessionTimeout: number; // in minutes
  concurrentSessions: boolean;
  twoFactorAuthentication: boolean;
  passwordResetExpiry: number; // in hours
}

export interface UserManagementSettings {
  registration: RegistrationSettings;
  userProfiles: UserProfileSettings;
  sessionManagement: SessionManagementSettings;
}

// Content & Publishing Settings
export interface EditorSettings {
  autoSaveInterval: number; // in seconds
  revisionHistory: number; // number of revisions to keep
  wordCountDisplay: boolean;
}

export interface MediaUploadsSettings {
  maxUploadSize: number; // in MB
  allowedFileTypes: string[];
  imageQuality: number; // 1-100
  autoGenerateThumbnails: boolean;
  imageAltTextRequired: boolean;
}

export interface ContentOrganizationSettings {
  contentTemplates: boolean;
}

export interface ContentPublishingSettings {
  editor: EditorSettings;
  mediaUploads: MediaUploadsSettings;
  contentOrganization: ContentOrganizationSettings;
}

// Security & Privacy Settings
export interface SecurityHardeningSettings {
  hideAdmin: boolean;
  customAdminSlug: string;
  limitLoginAttempts: {
    enabled: boolean;
    maxAttempts: number;
    lockoutDuration: number; // in minutes
  };
  ipWhitelist: string[];
  ipBlacklist: string[];
}

export interface SecurityPrivacySettings {
  securityHardening: SecurityHardeningSettings;
}

// Marketing & SEO Tools Settings
export interface RedirectManagementSettings {
  redirects: Array<{
    id: string;
    source: string;
    destination: string;
    type: '301' | '302' | '307';
    enabled: boolean;
  }>;
}

export interface MonitoringSettings {
  track404Errors: boolean;
  notificationEmail: string;
}

export interface MarketingSEOSettings {
  redirectManagement: RedirectManagementSettings;
  monitoring: MonitoringSettings;
}

// Combined Settings Interface
export interface SiteSettings {
  general: GeneralSettings;
  seoAnalytics: SEOAnalyticsSettings;
  userManagement: UserManagementSettings;
  contentPublishing: ContentPublishingSettings;
  securityPrivacy: SecurityPrivacySettings;
  marketingSEO: MarketingSEOSettings;
}

// Default Settings Values
export const defaultSiteSettings: SiteSettings = {
  general: {
    siteIdentity: {
      siteTitle: 'VibePress',
      siteTagline: 'A Modern Content Management System',
      siteDescription: 'VibePress is a powerful, modern CMS built for creators and businesses.',
      siteLogo: '/vibepress-logo.svg',
      favicon: '/favicon.ico',
      adminLogo: '/vibepress-logo.svg',
    },
    siteConfiguration: {
      siteUrl: 'https://your-site.com',
      defaultTimezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    },
    content: {
      defaultPostStatus: 'draft',
      postsPerPage: 10,
      excerptLength: 160,
      commentStatus: true,
    },
  },
  seoAnalytics: {
    seoDefaults: {
      globalMetaTitleTemplate: '{title} | {sitename}',
      globalMetaDescriptionTemplate: '{excerpt}',
      defaultOpenGraphImage: '/og-default.jpg',
      twitterCardType: 'summary_large_image',
      googleSiteVerification: '',
      bingSiteVerification: '',
    },
    analyticsTracking: {
      googleAnalyticsId: '',
      googleTagManagerId: '',
      facebookPixelId: '',
      customTrackingScripts: {
        header: '',
        footer: '',
      },
      cookieConsent: true,
    },
    xmlSitemap: {
      includePosts: true,
      includePages: true,
      includeCategories: true,
      includeTags: true,
      excludeSpecificContent: [],
    },
  },
  userManagement: {
    registration: {
      userRegistration: 'invite-only',
      defaultUserRole: 'subscriber',
      emailVerificationRequired: true,
      adminApprovalRequired: false,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      },
    },
    userProfiles: {
      allowProfilePictures: true,
      publicProfilePages: false,
      userDirectory: false,
      socialMediaFields: ['twitter', 'linkedin', 'github'],
      customProfileFields: [],
    },
    sessionManagement: {
      sessionTimeout: 1440, // 24 hours
      concurrentSessions: true,
      twoFactorAuthentication: false,
      passwordResetExpiry: 24, // 24 hours
    },
  },
  contentPublishing: {
    editor: {
      autoSaveInterval: 30, // seconds
      revisionHistory: 10,
      wordCountDisplay: true,
    },
    mediaUploads: {
      maxUploadSize: 10, // MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'],
      imageQuality: 85,
      autoGenerateThumbnails: true,
      imageAltTextRequired: false,
    },
    contentOrganization: {
      contentTemplates: true,
    },
  },
  securityPrivacy: {
    securityHardening: {
      hideAdmin: false,
      customAdminSlug: 'admin',
      limitLoginAttempts: {
        enabled: true,
        maxAttempts: 5,
        lockoutDuration: 15, // minutes
      },
      ipWhitelist: [],
      ipBlacklist: [],
    },
  },
  marketingSEO: {
    redirectManagement: {
      redirects: [],
    },
    monitoring: {
      track404Errors: true,
      notificationEmail: '',
    },
  },
};

// Settings Categories for Navigation
export interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  sections: SettingsSection[];
}

export interface SettingsSection {
  id: string;
  title: string;
  description: string;
  fields: SettingsField[];
}

export interface SettingsField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color' | 'image' | 'password' | 'email' | 'url' | 'multiselect' | 'array';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: Array<{ value: string; label: string }>;
  };
  dependsOn?: {
    field: string;
    value: any;
  };
}

// Settings Update Actions
export type SettingsUpdateAction =
  | { type: 'UPDATE_GENERAL'; payload: Partial<GeneralSettings> }
  | { type: 'UPDATE_SEO_ANALYTICS'; payload: Partial<SEOAnalyticsSettings> }
  | { type: 'UPDATE_USER_MANAGEMENT'; payload: Partial<UserManagementSettings> }
  | { type: 'UPDATE_CONTENT_PUBLISHING'; payload: Partial<ContentPublishingSettings> }
  | { type: 'UPDATE_SECURITY_PRIVACY'; payload: Partial<SecurityPrivacySettings> }
  | { type: 'UPDATE_MARKETING_SEO'; payload: Partial<MarketingSEOSettings> }
  | { type: 'RESET_TO_DEFAULTS' }
  | { type: 'IMPORT_SETTINGS'; payload: SiteSettings };

// Settings Validation
export interface SettingsValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

// Settings Import/Export
export interface SettingsExport {
  version: string;
  timestamp: string;
  settings: SiteSettings;
  metadata: {
    siteName: string;
    exportedBy: string;
  };
}

// Utility functions
export function getSettingByPath(settings: SiteSettings, path: string): any {
  return path.split('.').reduce((obj, key) => obj?.[key], settings);
}

export function setSettingByPath(settings: SiteSettings, path: string, value: any): SiteSettings {
  const keys = path.split('.');
  const result = JSON.parse(JSON.stringify(settings));
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

export function validateSettings(settings: SiteSettings): SettingsValidationResult {
  const errors: Record<string, string[]> = {};
  const warnings: Record<string, string[]> = {};

  // Site Title validation
  if (!settings.general.siteIdentity.siteTitle?.trim()) {
    errors['general.siteIdentity.siteTitle'] = ['Site title is required'];
  }

  // URL validation
  if (settings.general.siteConfiguration.siteUrl) {
    try {
      new URL(settings.general.siteConfiguration.siteUrl);
    } catch {
      errors['general.siteConfiguration.siteUrl'] = ['Invalid URL format'];
    }
  }

  // Posts per page validation
  if (settings.general.content.postsPerPage < 1 || settings.general.content.postsPerPage > 100) {
    errors['general.content.postsPerPage'] = ['Posts per page must be between 1 and 100'];
  }

  // Analytics ID validation
  if (settings.seoAnalytics.analyticsTracking.googleAnalyticsId &&
      !/^G-[A-Z0-9]+$/.test(settings.seoAnalytics.analyticsTracking.googleAnalyticsId)) {
    warnings['seoAnalytics.analyticsTracking.googleAnalyticsId'] = ['Invalid Google Analytics ID format'];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}