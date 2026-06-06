import clsx from "clsx";

type Props = {
    title: string;
    entitledDays: number;
    className?: string;
}

export function VacationBalanceDaysInfo({title, entitledDays, className}: Props) {
    return (
        <div className={'flex items-center gap-1'}>
            <dt className="text-base-content/55">{title}:</dt>
            <dd className={clsx('font-semibold tabular-nums', className)}>{entitledDays}</dd>
        </div>
    )
}