import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline";

const VARIANT: Record<Variant, string> = {
  primary: "btn-primary py-2 text-sm uppercase",
  secondary: "btn-secondary py-2 text-sm uppercase",
  outline:
    "inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-md uppercase hover:border-primary hover:text-primary",
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export default function ActionButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ActionButtonProps) {
  return (
    <button type="button" className={`inline-flex items-center gap-2 ${VARIANT[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
