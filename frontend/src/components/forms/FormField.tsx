interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required,
  options,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-label-md text-on-surface-variant">
        {label}
      </label>
      {options ? (
        <select id={name} name={name} className="input-fleet" required={required}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="input-fleet"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}
