import type { Candidate, CandidateCreateDto } from "@/modules/rh/person/candidate/dto/candidate.dto";
import { BaseService } from "@/modules/root/services/base.service";

class CandidateService extends BaseService<Candidate, CandidateCreateDto, CandidateCreateDto> {
    constructor() {
        super("/api/v1/candidates");
    }
}

export const candidateService = new CandidateService();
