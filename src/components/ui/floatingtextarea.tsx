import React from "react";

interface FloatingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  rows?: number;
}

export function FloatingTextarea({ label, id, className = "", rows = 4, ...props }: FloatingTextareaProps) {
  const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="relative z-0 w-full group">
      <textarea
        id={textareaId}
        placeholder=" "
        rows={rows}
        className={`
          peer block w-full appearance-none rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent
          px-3 pt-7 pb-2 resize-none text-sm dark:placeholder-transparent
          focus:border-blue-600 dark:focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-400
          ${className}
        `}
        {...props}
      />
      <label
        htmlFor={textareaId}
        className="
          absolute left-3 top-2 text-sm dark:text-neutral-400 text-sm transition-all
          peer-placeholder-shown:top-5 peer-placeholder-shown:text-neutral-400 dark:peer-placeholder-shown:text-neutral-500 peer-placeholder-shown:text-base
          peer-focus:top-2 peer-focus:text-blue-600 dark:peer-focus:text-blue-400 peer-focus:text-sm
          pointer-events-none
        "
      >
        {label}
      </label>
    </div>
  );
}
