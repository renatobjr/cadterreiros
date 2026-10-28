import React from "react";

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function TextInput({
  label,
  error,
  id,
  className,
  ...rest
}: TextInputProps) {
  const reactId = React.useId();
  const inputId = id || reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  const classes = ["input", className].filter(Boolean).join(" ");
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        id={inputId}
        className={classes}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <span id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default TextInput;
