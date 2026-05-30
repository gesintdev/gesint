"use client";

import { ADMISSION_TABLE_COLUMNS } from "@/modules/person/collaborators/admission/config/admission-process.table-columns";
import type { AdmissionProcess } from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import { admissionprocessKeys } from "@/modules/person/collaborators/admission/admission.query";
import { admissionprocessService } from "@/modules/person/collaborators/admission/services/admission-process.service";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

export function AdmissionHistoryListClient() {
  return (
    <QueryTablePanel<AdmissionProcess>
      queryKey={[...admissionprocessKeys.all, "history"]}
      request={async () => {
        const all = await admissionprocessService.getAll();
        return all.filter((row) => row.admissionStatus === "COMPLETED");
      }}
      columns={ADMISSION_TABLE_COLUMNS}
      rowKey="id"
      rowActivateOn="click"
      emptyMessage="Nenhuma admissão concluída ainda."
    />
  );
}
