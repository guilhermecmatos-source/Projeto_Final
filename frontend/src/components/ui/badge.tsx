import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-cyan-500/15 text-cyan-300",
      success: "bg-emerald-500/15 text-emerald-300",
      warning: "bg-amber-500/15 text-amber-300",
      danger: "bg-red-500/15 text-red-300",
      low: "bg-gray-500/15 text-gray-300",
      medium: "bg-amber-500/15 text-amber-300",
      critical: "bg-red-500/15 text-red-300",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
