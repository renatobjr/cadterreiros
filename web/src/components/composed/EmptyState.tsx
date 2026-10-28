import React from "react";

export interface EmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  page?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  page = false,
  className,
  children,
}: EmptyStateProps) {
  const classes = ["empty", page ? "empty--page" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="status">
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      {children}
      {action ? <div className="empty__actions">{action}</div> : null}
    </div>
  );
}

export default EmptyState;