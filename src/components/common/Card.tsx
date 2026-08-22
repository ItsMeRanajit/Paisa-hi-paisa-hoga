import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  subtle?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  subtle = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-2xl p-4 sm:p-5 transition-all duration-150',
        subtle ? 'bg-[#0f1217] border border-[#1c212b]' : 'bg-[#13161c] border border-[#222731]',
        interactive && 'hover:border-[#2f3645] hover:bg-[#161a22] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
