import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn("w-full max-w-7xl mx-auto px-4 lg:px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
