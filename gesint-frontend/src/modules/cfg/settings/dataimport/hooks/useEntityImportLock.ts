"use client";

import {useQuery, useQueryClient} from "@tanstack/react-query";
import {useEffect, useRef} from "react";

import {dataImportKeys} from "@/modules/cfg/settings/dataimport/data-import.query";
import type {DataImportEntityType} from "@/modules/cfg/settings/dataimport/dto/data-import.dto";
import {dataImportService} from "@/modules/cfg/settings/dataimport/services/data-import.service";
import {departmentKeys} from "@/modules/dp/organization/department/department.query";
import {jobpositionKeys} from "@/modules/dp/organization/jobposition/jobposition.query";
import {admissionprocessKeys} from "@/modules/rh/person/collaborators/admission/admission.query";

function invalidateEntityList(entityType: DataImportEntityType, queryClient: ReturnType<typeof useQueryClient>) {
    if (entityType === "DEPARTMENT") {
        void queryClient.invalidateQueries({queryKey: departmentKeys.all});
    } else if (entityType === "JOB_POSITION") {
        void queryClient.invalidateQueries({queryKey: jobpositionKeys.all});
    } else {
        void queryClient.invalidateQueries({queryKey: admissionprocessKeys.all});
    }
}

export function useEntityImportLock(entityType: DataImportEntityType) {
    const queryClient = useQueryClient();
    const wasLockedRef = useRef(false);

    const query = useQuery({
        queryKey: dataImportKeys.locks,
        queryFn: () => dataImportService.getActiveLocks(),
        refetchInterval: (current) => {
            const locks = current.state.data ?? [];
            return locks.some((lock) => lock.entityType === entityType) ? 800 : 4000;
        },
    });

    const lock = (query.data ?? []).find((item) => item.entityType === entityType) ?? null;
    const locked = lock != null;

    useEffect(() => {
        if (wasLockedRef.current && !locked) {
            invalidateEntityList(entityType, queryClient);
            void queryClient.invalidateQueries({queryKey: dataImportKeys.active});
        }
        wasLockedRef.current = locked;
    }, [entityType, locked, queryClient]);

    return {
        locked,
        lock,
        isLoading: query.isLoading,
    };
}
