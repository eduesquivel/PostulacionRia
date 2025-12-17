import React from "react";

export const Select = ({
    label,
    value,
    options,
    onChange,
    disabled
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-500">{label}</label>
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 disabled:opacity-50"
        >
            {options.map((cur) => (
                <option key={cur} value={cur}>
                    {cur}
                </option>
            ))}
        </select>
    </div>
);

export default Select;
