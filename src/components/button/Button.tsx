import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import cn from "classnames";

import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button className={cn("btn", className)} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

export default Button;
