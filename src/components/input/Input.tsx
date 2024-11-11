import { forwardRef } from "react";
import cn from "classnames";

import "./Input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input className={cn("inp", className)} ref={ref} {...props} />;
  }
);

export default Input;
