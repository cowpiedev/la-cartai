import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-label-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Botón primario: gradiente terracota
        primary:
          "bg-gradient-to-b from-primary to-[#6B3800] text-white rounded-[0.75rem] shadow-float hover:from-[#9D5500] hover:to-[#7A4000]",
        // Botón secundario: ghost
        secondary:
          "border border-primary/20 text-primary bg-transparent rounded-[0.75rem] hover:bg-primary/5",
        // Destructivo
        destructive:
          "bg-error text-white rounded-[0.75rem] hover:bg-error/90",
        // Ghost (sin fondo)
        ghost:
          "text-on-surface hover:bg-surface-container-low rounded-[0.75rem]",
        // Link
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-body-sm",
        md: "h-11 px-6 text-label-lg",
        lg: "h-13 px-8 text-title-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
