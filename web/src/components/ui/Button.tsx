import React from "react";

export type ButtonVariant =
  | "primary"
  | "ghost"
  | "quiet"
  | "danger"
  | "onDeep"
  | "light";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn--primary",
  ghost: "btn--ghost",
  quiet: "btn--quiet",
  danger: "btn--danger",
  onDeep: "btn--onDeep",
  light: "btn--light",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = ["btn", variantClass[variant], className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
