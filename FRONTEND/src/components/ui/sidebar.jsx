import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

function SidebarProvider({ children, ...props }) {
  const [open, setOpen] = React.useState(true);

  const toggleSidebar = React.useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      toggleSidebar,
    }),
    [open, setOpen, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex h-screen w-full" {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

function Sidebar({ className, children, ...props }) {
  const { open } = useSidebar();

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 transition-all duration-300",
        !open && "w-16",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarContent({ className, children, ...props }) {
  return (
    <div
      className={cn("flex flex-1 flex-col overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function SidebarGroup({ className, children, ...props }) {
  return (
    <div className={cn("px-3 py-2", className)} {...props}>
      {children}
    </div>
  );
}

function SidebarGroupContent({ className, children, ...props }) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      {children}
    </div>
  );
}

function SidebarMenu({ className, children, ...props }) {
  return (
    <nav className={cn("space-y-1", className)} {...props}>
      {children}
    </nav>
  );
}

function SidebarMenuItem({ className, children, ...props }) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

function SidebarMenuButton({
  className,
  isActive = false,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive && "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function SidebarTrigger({ className, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
