interface ErrorMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorMessage({ title = "Something went wrong", message, actionLabel, onAction }: ErrorMessageProps) {
  return (
    <div className="state-panel state-panel-error" role="alert">
      <div className="state-icon state-icon-error">!</div>
      <div className="state-title">{title}</div>
      <p>{message}</p>
      {actionLabel && onAction ? (
        <button className="button button-secondary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
