interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  as?: "input" | "textarea" | "select" | "checkbox";
  rows?: number;
  className?: string;
}

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  disabled,
  options,
  as,
  rows = 4,
  className = "",
}: FormFieldProps) {
  const fieldAs = as ?? (options ? "select" : "input");

  if (fieldAs === "checkbox") {
    return (
      <label className={`flex cursor-pointer items-center gap-3 ${className}`}>
        <input
          type="checkbox"
          id={name}
          name={name}
          className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary-container"
          disabled={disabled}
        />
        <span className="text-body-md">{label}</span>
      </label>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-label-md text-on-surface-variant">
        {label}
      </label>
      {fieldAs === "select" && options ? (
        <select
          id={name}
          name={name}
          className="input-fleet"
          required={required}
          disabled={disabled}
          defaultValue=""
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.value === ""}>
              {o.label}
            </option>
          ))}
        </select>
      ) : fieldAs === "textarea" ? (
        <textarea
          id={name}
          name={name}
          className="input-fleet min-h-[100px] resize-y py-3"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="input-fleet"
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
    </div>
  );
}
