import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerOutline';

const variantClass: Record<Variant, string> = {
  primary: 'vb-btn vb-btn--primary',
  secondary: 'vb-btn vb-btn--secondary',
  ghost: 'vb-btn vb-btn--ghost',
  danger: 'vb-btn vb-btn--danger',
  dangerOutline: 'vb-btn vb-btn--danger-outline',
};

export type ButtonProps = {
  variant?: Variant;
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  const sz = size === 'sm' ? 'vb-btn--sm' : '';
  return (
    <button type={type} className={`${variantClass[variant]} ${sz} ${className}`.trim()} {...rest}>
      {leftIcon ? <span className="vb-btn__icon">{leftIcon}</span> : null}
      {children}
    </button>
  );
}
