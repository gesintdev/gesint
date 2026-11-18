"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { FormSection } from "@/shared/components/ui/FormSection";
import { InputCEP, InputSelectAutocomplete, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { AppException } from "@/shared/exceptions/app.exception";
import { addressService } from "@/shared/services/address.service";

export type AddressFormValue = {
    zipCode?: string;
    stateId?: string;
    cityId?: string;
    street?: string;
    number?: string;
    district?: string;
    complement?: string;
};

type AddressLabels = {
    stateLabel: string;
    cityLabel: string;
};

type AddressFormSectionProps = {
    id?: string;
    title?: string;
    description?: string;
    value: AddressFormValue;
    stateLabel?: string;
    cityLabel?: string;
    disabled?: boolean;
    onChange: (_value: AddressFormValue, _labels: AddressLabels) => void;
};

const LOOKUP_FAILED = "Não foi possível buscar o endereço pelo CEP. Informe os dados manualmente.";
const NOT_FOUND_CODE = "ADDRESS_POSTAL_CODE_NOT_FOUND";

function isPostalCodeNotFound(error: unknown): boolean {
    return error instanceof AppException && (error.code === NOT_FOUND_CODE || error.status === 404);
}

function addressWithoutLookup(zipCode: string): AddressFormValue {
    return {
        zipCode,
        stateId: "",
        cityId: "",
        street: "",
        number: "",
        district: "",
        complement: "",
    };
}

export function AddressFormSection({
    id = "endereco",
    title = "Endereço",
    description = "O CEP preenche logradouro, bairro, cidade e UF. Se o CEP não for encontrado, os campos continuam livres para preenchimento manual.",
    value,
    stateLabel = "",
    cityLabel = "",
    disabled = false,
    onChange,
}: AddressFormSectionProps) {
    const lookedUpZipRef = useRef("");
    const retryLookupRef = useRef<(_zip: string) => void>(() => undefined);
    const valueRef = useRef(value);
    const labelsRef = useRef<AddressLabels>({ stateLabel, cityLabel });

    useEffect(() => {
        valueRef.current = value;
        labelsRef.current = { stateLabel, cityLabel };
    }, [cityLabel, stateLabel, value]);

    const lookup = useMutation({
        mutationFn: (postalCode: string) => addressService.findByPostalCode(postalCode),
        onSuccess: (address, requestedZip) => {
            const currentZip = valueRef.current.zipCode ?? "";
            if (currentZip !== requestedZip) return;
            lookedUpZipRef.current = requestedZip;
            const current = valueRef.current;
            onChange(
                {
                    ...current,
                    zipCode: address.zipCode || current.zipCode,
                    street: address.street || current.street,
                    complement: address.complement || current.complement,
                    district: address.district || current.district,
                    stateId: address.stateId,
                    cityId: address.cityId,
                },
                {
                    stateLabel: address.stateCode || labelsRef.current.stateLabel,
                    cityLabel: address.cityName || labelsRef.current.cityLabel,
                },
            );
        },
        onError: (err: unknown, requestedZip) => {
            const currentZip = valueRef.current.zipCode ?? "";
            if (currentZip === requestedZip && isPostalCodeNotFound(err)) {
                lookedUpZipRef.current = requestedZip;
                const cleared = addressWithoutLookup(requestedZip);
                const labels = { stateLabel: "", cityLabel: "" };
                valueRef.current = cleared;
                labelsRef.current = labels;
                onChange(cleared, labels);
            } else if (currentZip === requestedZip) {
                lookedUpZipRef.current = "";
            }
            ExceptionCapture.handle(err, { fallbackMessage: LOOKUP_FAILED });
        },
        onSettled: (_address, _error, requestedZip) => {
            const zip = valueRef.current.zipCode ?? "";
            if (zip.length === 8 && zip !== requestedZip && zip !== lookedUpZipRef.current) {
                retryLookupRef.current(zip);
            }
        },
    });

    useEffect(() => {
        retryLookupRef.current = (zip) => {
            if (!lookup.isPending) lookup.mutate(zip);
        };
    }, [lookup]);

    const emit = (next: AddressFormValue, labels: AddressLabels = labelsRef.current) => {
        valueRef.current = next;
        labelsRef.current = labels;
        onChange(next, labels);
    };

    const lookupIfReady = (zip: string) => {
        if (disabled || lookup.isPending) return;
        if (zip.length === 8 && zip !== lookedUpZipRef.current) {
            lookup.mutate(zip);
        }
    };

    const pending = lookup.isPending || disabled;

    return (
        <FormSection id={id} title={title} description={description} bodyClassName="sm:!grid-cols-12">
            <InputCEP
                label="CEP"
                value={value.zipCode ?? ""}
                onValueChange={(zip) => {
                    if (zip !== (value.zipCode ?? "")) lookedUpZipRef.current = "";
                    emit({ ...value, zipCode: zip });
                    lookupIfReady(zip);
                }}
                loading={lookup.isPending}
                disabled={disabled}
                onBlur={() => lookupIfReady(value.zipCode ?? "")}
                onKeyDown={(event) => {
                    if (event.key !== "Tab" || event.shiftKey) return;
                    const zip = value.zipCode ?? "";
                    if (zip.length !== 8 || zip === lookedUpZipRef.current) return;
                    event.preventDefault();
                    lookupIfReady(zip);
                }}
                wrapperClassName="sm:col-span-3"
            />
            <InputSelectAutocomplete
                label="UF"
                value={value.stateId ?? ""}
                selectedLabel={stateLabel}
                onSearch={(query, page) => addressService.searchStates(query, page)}
                onValueChange={(next, item) => {
                    const stateChanged = next !== (value.stateId ?? "");
                    emit(
                        {
                            ...value,
                            stateId: next,
                            cityId: stateChanged ? "" : value.cityId,
                        },
                        {
                            stateLabel: item?.label ?? "",
                            cityLabel: stateChanged ? "" : cityLabel,
                        },
                    );
                }}
                remoteMinChars={0}
                disabled={pending}
                wrapperClassName="sm:col-span-3"
            />
            <InputSelectAutocomplete
                label="Cidade"
                value={value.cityId ?? ""}
                selectedLabel={cityLabel}
                onSearch={(query, page) => addressService.searchCities(value.stateId ?? "", query, page)}
                onValueChange={(next, item) => {
                    emit(
                        { ...value, cityId: next },
                        { stateLabel, cityLabel: item?.label ?? "" },
                    );
                }}
                remoteMinChars={0}
                disabled={pending || !value.stateId}
                wrapperClassName="sm:col-span-6"
            />
            <InputString
                label="Logradouro"
                value={value.street ?? ""}
                onValueChange={(street) => emit({ ...value, street })}
                disabled={disabled}
                wrapperClassName="sm:col-span-8"
            />
            <InputString
                label="Número"
                value={value.number ?? ""}
                onValueChange={(number) => emit({ ...value, number })}
                disabled={disabled}
                wrapperClassName="sm:col-span-4"
            />
            <InputString
                label="Bairro"
                value={value.district ?? ""}
                onValueChange={(district) => emit({ ...value, district })}
                disabled={disabled}
                wrapperClassName="sm:col-span-6"
            />
            <InputString
                label="Complemento"
                value={value.complement ?? ""}
                onValueChange={(complement) => emit({ ...value, complement })}
                disabled={disabled}
                wrapperClassName="sm:col-span-6"
            />
        </FormSection>
    );
}
