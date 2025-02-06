import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import cn from "classnames";

import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "ghost";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", ...props }, ref) => {
    return (
      <button className={cn("btn", className, variant)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

export default Button;
