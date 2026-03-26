import * as React from "react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        // Base — sin borde, fondo container-lowest, transición suave
        "block w-full bg-surface-container-lowest border-none rounded-xl",
        "px-4 py-4 font-body text-on-surface placeholder:text-outline/50",
        "transition-all duration-200",
        // Focus — outer glow 2px primary-fixed-dim, sin outline nativo
        "focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface",
        // Estados
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Variant con icono izquierdo: el padre añade pl-12
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
