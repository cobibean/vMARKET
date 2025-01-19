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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Market Info</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-sm text-foreground">
          <p>{marketRules}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};