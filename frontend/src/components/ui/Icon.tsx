interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

export default function Icon({ name, className = "", filled = false }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined not-italic leading-none ${filled ? "material-symbols-filled" : ""} ${className}`}
      aria-hidden
    >
      {name}
    </span>
  );
}
