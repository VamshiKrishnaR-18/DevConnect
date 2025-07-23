import * as React from "react";
import { cn } from "./utils";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    outline: "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
