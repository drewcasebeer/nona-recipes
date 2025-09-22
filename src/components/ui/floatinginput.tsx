import React from "react";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function FloatingInput({ label, id, className = "", ...props }: FloatingInputProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="relative z-0 w-full group peer">
            <input
                id={inputId}
                placeholder=" "
                className={`peer block w-full appearance-none border-0 border-b-2 border-neutral-300 dark:border-neutral-700 bg-transparent px-0 py-2 text-sm dark:text-neutral-100 focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 ${className}`}
                {...props}
            />
            <label
                htmlFor={inputId}
                className="absolute left-0 -top-3.5 text-neutral-500 dark:text-neutral-400 text-sm transition-all
                   peer-placeholder-shown:top-2 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-placeholder-shown:text-base
                   peer-focus:-top-3.5 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:text-sm"
            >
                {label}
            </label>
        </div>
    );
}
