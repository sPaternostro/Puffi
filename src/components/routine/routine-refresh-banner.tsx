import { GenerateRoutineButton } from "@/components/routine/generate-routine-button";

export function RoutineRefreshBanner() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium">La estantería cambió</p>
        <p className="mt-1 text-sm leading-5 text-foreground/65">
          Hay productos nuevos o que quitaste. Actualizá el orden de mañana y noche.
        </p>
      </div>
      <GenerateRoutineButton label="Actualizar rutina" redirectTo="/rutina" />
    </div>
  );
}
