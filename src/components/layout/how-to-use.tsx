import { GUIDE_STEPS } from "@/lib/guide";

export function HowToUseCard() {
  return (
    <section className="rounded-2xl border border-line bg-card p-6 sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight">Cómo se usa</h2>
      <p className="mt-1 text-sm leading-6 text-foreground/65">
        Cargá productos, generá la rutina y tildá el día. Nada más.
      </p>
      <ol className="mt-5 space-y-4">
        {GUIDE_STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
              {index + 1}
            </span>
            <span>
              <span className="block text-sm font-medium">{step.title}</span>
              <span className="mt-0.5 block text-sm leading-6 text-foreground/70">{step.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
