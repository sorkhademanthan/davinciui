import { cn } from "@/lib/utils";

const LIGHT_SRC = "/images/logo/logo-light-64.png";
const DARK_SRC = "/images/logo/logo-dark-64.png";

/**
 * Theme-aware DavinciUI mark. Light tile on light theme, dark tile on
 * dark theme (the `dark` class is set pre-paint, so first paint is correct).
 */
export function DavinciUILogo({ className }: { className?: string }) {
  return (
    <>
      <img
        src={LIGHT_SRC}
        alt="DavinciUI"
        width={64}
        height={64}
        loading="eager"
        className={cn(className, "dark:hidden")}
      />
      <img
        src={DARK_SRC}
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        loading="eager"
        className={cn("hidden", className, "dark:block")}
      />
    </>
  );
}
