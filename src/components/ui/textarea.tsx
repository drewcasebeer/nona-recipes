// components/ui/textarea.tsx
"use client";

import React, { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className={`flex flex-col space-y-1 ${className}`}>
                {label && (
                    <label className="text-sm font-medium text-gray-700" htmlFor={props.id}>
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`min-h-[80px] resize-y rounded-md border border-gray-300 px-3 py-2
            text-sm placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : ""}
          `}
                    {...props}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
