"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/ui/dialog";
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
      <DialogContent className="relative max-w-lg bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Market Info
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-sm text-gray-800 dark:text-gray-300">
          <p>{marketRules}</p>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="text-sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};