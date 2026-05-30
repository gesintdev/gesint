import { AppException } from "@/shared/exceptions/app.exception";
import { COLLABORATOR_CLIENT_MESSAGES } from "@/modules/person/collaborators/people/exceptions/collaborator.messages";

/** Exceções exclusivas do frontend — módulo Collaborator */
export class CollaboratorClientException {
  private constructor() {}

  static loadFailed(): AppException {
    return AppException.client(
      "COLLABORATOR_LOAD_FAILED",
      COLLABORATOR_CLIENT_MESSAGES.COLLABORATOR_LOAD_FAILED,
    );
  }

  static saveFailed(): AppException {
    return AppException.client(
      "COLLABORATOR_SAVE_FAILED",
      COLLABORATOR_CLIENT_MESSAGES.COLLABORATOR_SAVE_FAILED,
    );
  }
}
