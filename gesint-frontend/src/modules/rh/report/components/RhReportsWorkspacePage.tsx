"use client";

import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { ReportsWorkspacePage } from "@/modules/shared/reports/components/ReportsWorkspacePage";

export function RhReportsWorkspacePage() {
    return <ReportsWorkspacePage system={SystemEnum.RH} />;
}

export default RhReportsWorkspacePage;
