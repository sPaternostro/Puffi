import type { AppLocale } from "@/types/database";

const es = {
  tagline: "Rutinas de skincare con el orden correcto.",
  continueGoogle: "Continuar con Google",
  orEmail: "o con email",
  email: "Email",
  password: "Contraseña",
  loginTitle: "Entrar",
  loginSubmit: "Entrar",
  loginSwitchHint: "¿No tienes cuenta?",
  loginSwitchLink: "Crear cuenta",
  signupTitle: "Crear cuenta",
  signupSubmit: "Crear cuenta",
  signupSwitchHint: "¿Ya tienes cuenta?",
  signupSwitchLink: "Entrar",
  loggingIn: "Entrando…",
  creatingAccount: "Creando cuenta…",
  acceptLegal:
    "Al entrar aceptás que Puffi no reemplaza consejo médico.",
  oauthFail: "No se pudo completar el acceso con Google.",
  oauthHint: "Volvé a intentar con Google o entrá con email.",
  oauthOpenFail: "No se pudo abrir Google. Usá email y contraseña, o reintentá en un momento.",
  badCredentials: "Email o contraseña no coinciden. Revisalos e intentá de nuevo.",
  passwordHint: "Si olvidaste la contraseña, creá la cuenta de nuevo o usá Google.",
  signupFail: "No pudimos crear la cuenta. Probá con otro email o entrá si ya tenés una.",
  confirmEmail: "Te enviamos un email para confirmar la cuenta. Revisa tu bandeja.",
  confirmEmailHint: "Si no llega, revisá spam. Después podés entrar desde esta misma pantalla.",
};

const en = {
  tagline: "Skincare routines in the right order.",
  continueGoogle: "Continue with Google",
  orEmail: "or with email",
  email: "Email",
  password: "Password",
  loginTitle: "Log in",
  loginSubmit: "Log in",
  loginSwitchHint: "Don’t have an account?",
  loginSwitchLink: "Create account",
  signupTitle: "Create account",
  signupSubmit: "Create account",
  signupSwitchHint: "Already have an account?",
  signupSwitchLink: "Log in",
  loggingIn: "Signing in…",
  creatingAccount: "Creating account…",
  acceptLegal: "By signing in you accept that Puffi does not replace medical advice.",
  oauthFail: "Google sign-in didn’t complete.",
  oauthHint: "Try Google again, or sign in with email.",
  oauthOpenFail: "Couldn’t open Google. Use email and password, or try again in a moment.",
  badCredentials: "Email or password don’t match. Check them and try again.",
  passwordHint: "If you forgot the password, create the account again or use Google.",
  signupFail: "We couldn’t create the account. Try another email, or log in if you already have one.",
  confirmEmail: "We sent an email to confirm your account. Check your inbox.",
  confirmEmailHint: "If it doesn’t arrive, check spam. Then you can log in from this same screen.",
};

export function authCopy(locale: AppLocale) {
  return locale === "en" ? en : es;
}
