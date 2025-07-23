import * as React from "react";
import { cn } from "./utils";

function Avatar({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarImage({ className, src, alt, ...props }) {
  const [imageError, setImageError] = React.useState(false);

  if (imageError || !src) {
    return null;
  }

  return (
    <img
      className={cn("aspect-square h-full w-full object-cover", className)}
      src={src}
      alt={alt}
      onError={() => setImageError(true)}
      {...props}
    />
  );
}

function AvatarFallback({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
