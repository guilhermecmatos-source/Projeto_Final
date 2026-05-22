import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary py-2 text-sm",
  secondary: "btn-secondary py-2 text-sm",
  outline:
    "flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-md hover:bg-surface-container-low",
  ghost: "text-label-md font-bold text-primary hover:underline",
  link: "text-label-md font-bold text-primary hover:underline",
};

interface ActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
}

export default function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: ActionLinkProps) {
  const classes = `inline-flex items-center gap-2 ${VARIANT_CLASS[variant]} ${className}`.trim();

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
