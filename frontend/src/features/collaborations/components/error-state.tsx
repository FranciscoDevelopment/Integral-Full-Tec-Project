import { Button } from "@/shared/components/ui";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-red-200 p-4"
    >
      <h2 className="font-semibold text-red-800">{title}</h2>
      <p className="text-sm text-slate-600">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </section>
  );
}