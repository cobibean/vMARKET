"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/ui/dialog";
import { Button } from "@/app/ui/button";

interface MarketInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketRules: string; // The rules or info to display
}

export const MarketInfoModal: React.FC<MarketInfoModalProps> = ({
  isOpen,
  onClose,
  marketRules,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose(); // Ensure modal closes properly
      }}
    >
      <DialogPortal>
        {/* Optional overlay for dimming background */}
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Market Info
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
            <p>{marketRules}</p>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={onClose} className="text-sm">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};