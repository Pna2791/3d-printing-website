type QueryErrorProps = {
  title: string;
  message: string;
};

export function QueryError({ title, message }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 opacity-90">{message}</p>
    </div>
  );
}
