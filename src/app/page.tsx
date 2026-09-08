import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { resolveAppHomePath } from "@/lib/app-home";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { getLocale } from "@/lib/i18n/locale";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(await resolveAppHomePath());
  }

  const locale = await getLocale();
  const en = locale === "en";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-lg rounded-3xl bg-card p-8 shadow-sm sm:p-10">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm tracking-[0.2em] text-accent uppercase">Puffi</p>
          <LocaleSwitcher locale={locale} />
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {en ? "Your routine, without mixing too much" : "Tu rutina, sin mezclar de más"}
        </h1>
        <p className="mt-3 text-base leading-7 text-foreground/80">
          {en
            ? "Add the products you already have (or want to buy). Puffi sets morning and night order and warns if two actives don’t mix well."
            : "Cargá los productos que ya tenés (o los que querés comprar). Puffi arma el orden de mañana y noche y avisa si dos activos no combinan bien."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup" className="btn-primary flex-1">
            {en ? "Create account" : "Crear cuenta"}
          </Link>
          <Link href="/login" className="btn-secondary flex-1">
            {en ? "Log in" : "Entrar"}
          </Link>
        </div>
        <p className="mt-6 text-center text-[11px] leading-5 text-foreground/45">
          {en
            ? "Puffi does not replace medical advice. Data comes from public sources and from what you add."
            : "Puffi no reemplaza consejo médico. Los datos salen de fuentes públicas y de lo que cargás."}{" "}
          <Link href="/legal" className="underline">
            {en ? "Legal notice" : "Aviso legal"}
          </Link>
        </p>
      </main>
    </div>
  );
}
