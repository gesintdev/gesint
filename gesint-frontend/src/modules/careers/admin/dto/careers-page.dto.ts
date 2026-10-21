import type {
    CareersBlock,
    CareersCornerStyle,
    CareersFontStyle,
    CareersSocialNetwork,
} from "@/modules/careers/shared/dto/careers.dto";

export type CareersPageTheme = {
    displayName?: string | null;
    logoObjectId?: string | null;
    primaryColor?: string | null;
    accentColor?: string | null;
    fontStyle?: CareersFontStyle | null;
    cornerStyle?: CareersCornerStyle | null;
    showSalary: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    socialLinks: Partial<Record<CareersSocialNetwork, string>>;
    privacyNotice?: string | null;
    talentPoolMonths: number;
};

export type CareersPageDraft = {
    id?: string | null;
    persisted: boolean;
    published: boolean;
    hasUnpublishedChanges: boolean;
    publishedAt?: string | null;
    privacyNoticeVersion: number;
    organizationName: string;
    defaultPrivacyNotice: string;
    theme: CareersPageTheme;
    blocks: CareersBlock[];
};

export type CareersPageRequest = {
    theme: CareersPageTheme;
    blocks: CareersBlock[];
};

export type CareersAsset = {
    objectId: string;
    fileName?: string | null;
    contentType?: string | null;
};
