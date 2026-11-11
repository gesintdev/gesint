"use client";

import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import { ReportsWorkspacePage } from "@/modules/shared/reports/components/ReportsWorkspacePage";

export function DpReportsWorkspacePage() {
    return <ReportsWorkspacePage system={SystemEnum.DP} />;
}

export default DpReportsWorkspacePage;
