import { useEffect, useState } from "react";
import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const themeOptions = [
  {
    value: "light",
    label: "Light",
    description: "Bright mode for daytime use.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-light mode for better focus.",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device preference.",
    icon: Laptop2,
  },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? theme ?? "system" : "system";

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-slate-100">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-orange-100 bg-orange-50/95 p-8 shadow-[0_30px_70px_-40px_rgba(251,146,60,0.55)] dark:border-slate-700 dark:bg-slate-950/80 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.75)]">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-700 dark:text-orange-300">
          Settings
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-orange-950 dark:text-white">
          Appearance settings
        </h1>
        <p className="max-w-2xl text-base leading-7 text-orange-700 dark:text-slate-400">
          Choose the theme that fits your environment and let the interface adapt for a smoother experience.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-6xl overflow-hidden border border-slate-200 bg-orange-50/95 shadow-lg dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="bg-orange-50/95 dark:bg-slate-900/95">
          <div className="space-y-1">
            <CardTitle>Theme mode</CardTitle>
            <CardDescription>
              Pick Light, Dark, or System to control your dashboard appearance.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 px-6 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {themeOptions.map(({ value, label, description, icon: Icon }) => {
              const isSelected = currentTheme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={cn(
                    "group flex w-full flex-col justify-between overflow-hidden rounded-[1.75rem] border p-6 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:focus-visible:ring-orange-300",
                    isSelected
                      ? "border-orange-300 bg-orange-50 shadow-[0_20px_60px_-40px_rgba(251,146,60,0.45)] dark:border-orange-500/40 dark:bg-orange-500/10"
                      : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500/20 dark:hover:bg-slate-950/80",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-orange-100 text-orange-700 dark:bg-slate-800 dark:text-orange-200">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xl font-semibold text-slate-950 dark:text-white">{label}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center justify-between gap-3">
                    <span className={cn(
                      "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]",
                      isSelected
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                    )}>
                      {isSelected ? "Active" : "Select"}
                    </span>
                    {isSelected && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Current
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!mounted && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading theme settings...
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-200 bg-orange-50/95 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Current setting</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mounted ? currentTheme : "Detecting current theme..."}
            </p>
          </div>
          <Button variant="ghost" onClick={() => setTheme("system")}>
            Reset to System
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
