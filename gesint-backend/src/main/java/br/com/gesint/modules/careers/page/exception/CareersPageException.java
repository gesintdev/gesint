package br.com.gesint.modules.careers.page.exception;

import org.springframework.http.HttpStatus;

import br.com.gesint.core.exception.BusinessException;

public final class CareersPageException {
    private CareersPageException() {}

    public static BusinessException notSaved() {
        return badRequest(CareersPageExceptions.NOT_SAVED_CODE, CareersPageExceptions.NOT_SAVED_MSG);
    }

    public static BusinessException nothingPublished() {
        return badRequest(CareersPageExceptions.NOTHING_PUBLISHED_CODE, CareersPageExceptions.NOTHING_PUBLISHED_MSG);
    }

    public static BusinessException tooManyBlocks(int max) {
        return badRequest(
                CareersPageExceptions.TOO_MANY_BLOCKS_CODE,
                CareersPageExceptions.TOO_MANY_BLOCKS_MSG.formatted(max));
    }

    public static BusinessException systemBlockRequired() {
        return badRequest(
                CareersPageExceptions.SYSTEM_BLOCK_REQUIRED_CODE, CareersPageExceptions.SYSTEM_BLOCK_REQUIRED_MSG);
    }

    public static BusinessException duplicateSystemBlock() {
        return badRequest(
                CareersPageExceptions.DUPLICATE_SYSTEM_BLOCK_CODE, CareersPageExceptions.DUPLICATE_SYSTEM_BLOCK_MSG);
    }

    public static BusinessException vacanciesBlockHidden() {
        return badRequest(
                CareersPageExceptions.VACANCIES_BLOCK_HIDDEN_CODE, CareersPageExceptions.VACANCIES_BLOCK_HIDDEN_MSG);
    }

    public static BusinessException blockTooLarge() {
        return badRequest(CareersPageExceptions.BLOCK_TOO_LARGE_CODE, CareersPageExceptions.BLOCK_TOO_LARGE_MSG);
    }

    public static BusinessException imageConsentRequired() {
        return badRequest(
                CareersPageExceptions.IMAGE_CONSENT_REQUIRED_CODE, CareersPageExceptions.IMAGE_CONSENT_REQUIRED_MSG);
    }

    public static BusinessException invalidSocialLink() {
        return badRequest(
                CareersPageExceptions.INVALID_SOCIAL_LINK_CODE, CareersPageExceptions.INVALID_SOCIAL_LINK_MSG);
    }

    public static BusinessException assetInvalidType() {
        return badRequest(CareersPageExceptions.ASSET_INVALID_TYPE_CODE, CareersPageExceptions.ASSET_INVALID_TYPE_MSG);
    }

    public static BusinessException assetTooLarge() {
        return badRequest(CareersPageExceptions.ASSET_TOO_LARGE_CODE, CareersPageExceptions.ASSET_TOO_LARGE_MSG);
    }

    public static BusinessException assetNotFound() {
        return new BusinessException(
                CareersPageExceptions.ASSET_NOT_FOUND_CODE,
                CareersPageExceptions.ASSET_NOT_FOUND_MSG,
                HttpStatus.NOT_FOUND);
    }

    private static BusinessException badRequest(String code, String message) {
        return new BusinessException(code, message, HttpStatus.BAD_REQUEST);
    }
}
