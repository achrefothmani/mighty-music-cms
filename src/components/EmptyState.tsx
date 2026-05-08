import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  ctaText?: string;
  onCtaClick?: () => void;
}

export default function EmptyState({ message, ctaText, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border">
      <p className="text-xl font-mono tracking-[0.5em] text-muted-foreground uppercase mb-8">
        {message}
      </p>
      {ctaText && (
        <button 
          onClick={onCtaClick}
          className="btn-primary"
        >
          {ctaText}
        </button>
      )}
    </div>
  );
}
