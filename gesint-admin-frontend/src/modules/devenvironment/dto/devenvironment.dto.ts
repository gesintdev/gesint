export type DevEnvironmentSettings = {
    enabled: boolean;
    username: string;
    fullName: string;
    email: string;
    publicAppUserMirrored: boolean;
};

export type DevEnvironmentUserUpdateDto = {
    fullName: string;
    email: string;
    newPassword?: string;
};
