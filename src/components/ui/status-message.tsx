type StatusKind = "error" | "success" | "info";

export function StatusMessage({
  kind,
  title,
  children,
}: {
  kind: StatusKind;
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    error: "border-danger/30 bg-danger/10",
    success: "border-success/30 bg-success/10",
    info: "border-line bg-accent/40",
  };

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${tones[kind]}`} role={kind === "error" ? "alert" : "status"}>
      <p className="font-medium">{title}</p>
      {children ? <div className="mt-1 text-foreground/75 leading-6">{children}</div> : null}
    </div>
  );
}
