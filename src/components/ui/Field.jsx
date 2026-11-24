import Icon from "./Icon";
import { controlClass, fieldDescribedBy } from "./fieldStyles";

export function FieldLabel({ htmlFor, children, optional }) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-3 font-oswald text-[13px] font-semibold uppercase tracking-[0.14em] text-brand"
    >
      <span>{children}</span>
      {optional && (
        <span className="font-normal normal-case tracking-normal text-white/45" aria-hidden="true">
          optional
        </span>
      )}
    </label>
  );
}

export function FieldError({ id, children }) {
  if (!children) return null;

  return (
    <p id={id} className="flex items-start gap-1.5 font-montserrat text-[13px] text-red-300">
      <Icon name="alert" className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  optional,
  multiline = false,
  className = "",
  ...props
}) {
  const Control = multiline ? "textarea" : "input";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>

      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, { error, hint })}
        className={controlClass(
          error,
          multiline ? "min-h-32 resize-y px-4 py-3 leading-relaxed" : "h-12 px-4",
        )}
        {...props}
      />

      {hint && !error && (
        <p id={`${id}-hint`} className="font-montserrat text-xs text-white/50">
          {hint}
        </p>
      )}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  );
}
