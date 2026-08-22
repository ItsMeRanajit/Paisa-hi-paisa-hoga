import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefixSymbol?: string;
  suffixSymbol?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  prefixSymbol,
  suffixSymbol,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}

      <div className="relative flex items-center rounded-xl bg-[#0b0d11] border border-[#222731] focus-within:border-zinc-500 transition-all">
        {prefixSymbol && (
          <span className="pl-3.5 pr-1 text-sm font-medium text-zinc-400 select-none">
            {prefixSymbol}
          </span>
        )}

        <input
          id={inputId}
          className={clsx(
            'w-full bg-transparent px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            prefixSymbol && 'pl-1.5',
            suffixSymbol && 'pr-1.5',
            className
          )}
          {...props}
        />

        {suffixSymbol && (
          <span className="pr-3.5 pl-1 text-xs font-medium text-zinc-400 select-none">
            {suffixSymbol}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-zinc-400">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}

      <div className="relative rounded-xl bg-[#0b0d11] border border-[#222731] focus-within:border-zinc-500 transition-all">
        <select
          id={selectId}
          className={clsx(
            'w-full appearance-none bg-transparent px-3.5 py-2 text-sm text-zinc-100 focus:outline-none cursor-pointer',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#13161c] text-zinc-200">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
};
