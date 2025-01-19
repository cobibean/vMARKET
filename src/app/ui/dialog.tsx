"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import React from "react";
import { cn } from "@/app/lib/utils"; // Utility function for conditional classNames

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 z-50" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg focus:outline-none z-50",
        className
      )}
      {...props}
    />
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  children,
  className,
}) => (
  <div className={cn("mb-4 text-lg font-semibold", className)}>{children}</div>
);

export const DialogTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  children,
  className,
}) => (
  <h2 className={cn("text-xl font-bold leading-tight", className)}>{children}</h2>
);

export const DialogFooter: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  children,
  className,
}) => (
  <div className={cn("flex justify-end space-x-2 pt-4", className)}>{children}</div>
);