import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Vrind Vatikaa button system (Blueprint §13 / Spec Part 13).
 * Exactly three variants — deliberately no more, to keep the visual
 * language restrained rather than "SaaS component library" sprawling.
 *
 *  - primary:   solid gold bg, dark text, bright-gold hover. The single
 *               highest-priority CTA per section (e.g. "Check Availability").
 *  - secondary: gold outline, transparent bg, subtle gold fill on hover
 *               (e.g. "WhatsApp Us").
 *  - ghost:     transparent, muted text, gold on hover (low-emphasis links).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrind-gold focus-visible:ring-offset-2 focus-visible:ring-offset-vrind-black disabled:pointer-events-none disabled:opacity-50 min-h-12 px-6",
  {
    variants: {
      variant: {
        primary:
          "bg-vrind-gold text-vrind-black hover:bg-vrind-gold-bright",
        secondary:
          "bg-transparent border border-vrind-gold text-vrind-gold hover:bg-vrind-gold/10",
        ghost:
          "bg-transparent text-vrind-text-secondary hover:text-vrind-gold",
      },
      size: {
        default: "min-h-12 px-6 py-3",
        sm: "min-h-10 px-4 py-2 text-sm",
        lg: "min-h-14 px-8 py-4 text-base",
        icon: "size-12",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
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
