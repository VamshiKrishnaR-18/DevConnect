import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      className={cn("[&_tr]:border-b [&_tr]:border-gray-200 dark:[&_tr]:border-gray-700", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("p-4 align-middle", className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
