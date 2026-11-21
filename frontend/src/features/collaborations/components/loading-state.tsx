interface LoadingStateProps {
  label: string;
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <p role="status" className="py-6 text-center text-sm text-slate-600">
      {label}
    </p>
  );
}