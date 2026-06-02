import clsx from "clsx";
import {digitsOnly} from "@/shared/lib/input/digits";
import {InputString} from "@/shared/components/ui/input/InputString";

export type RgIdentityFieldsProps = {
    rg: string;
    rgIssuer?: string;
    rgStateCode?: string;
    onRgChange: (rg: string) => void;
    onRgIssuerChange: (issuer: string) => void;
    onRgStateCodeChange: (stateCode: string) => void;
    wrapperClassName?: string;
};

export function RgIdentityFields({
                                     rg,
                                     rgIssuer = "",
                                     rgStateCode = "",
                                     onRgChange,
                                     onRgIssuerChange,
                                     onRgStateCodeChange,
                                     wrapperClassName,
                                 }: RgIdentityFieldsProps) {
    return (
        <div
            className={clsx(
                "grid min-w-0 grid-cols-[1fr_1fr_minmax(0,4.75rem)] items-end gap-2",
                wrapperClassName,
            )}
        >
            <InputString
                label="RG"
                value={rg}
                onValueChange={(v) => onRgChange(digitsOnly(v).slice(0, 7))}
                maxLength={7}
                wrapperClassName="min-w-0"
            />
            <InputString
                label={"\u00d3rg\u00e3o emissor"}
                value={rgIssuer}
                onValueChange={onRgIssuerChange}
                maxLength={4}
                wrapperClassName="min-w-0"
            />
            <InputString
                label={"UF emiss\u00e3o"}
                value={rgStateCode}
                onValueChange={(v) =>
                    onRgStateCodeChange(v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2))
                }
                maxLength={2}
                wrapperClassName="min-w-0"
            />
        </div>
    );
}
