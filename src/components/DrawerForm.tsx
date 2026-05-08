"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function DrawerForm({ isOpen, onClose, title, children }: DrawerFormProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-[100] animate-in fade-in duration-300" />
        <Dialog.Content className="fixed top-0 right-0 h-screen w-full max-w-[480px] bg-card border-l border-border z-[101] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="flex items-center justify-between p-8 border-b border-border">
            <Dialog.Title className="text-sm font-mono tracking-[0.3em] font-bold uppercase">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
          
          <div className="p-8 border-t border-border flex gap-4">
            <button className="btn-primary flex-1" type="submit" form="drawer-form">
              SAVE CHANGES
            </button>
            <button 
              className="px-6 py-2 font-mono text-[10px] tracking-widest border border-border hover:bg-white/5 transition-colors"
              onClick={onClose}
            >
              CANCEL
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
