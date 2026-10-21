import { redirect } from "next/navigation";
/** CRUD Empresa não exposto no menu; link antigo volta para organização */
export default function CompanyRedirectPage() {
    redirect("/organization/departments");
}
