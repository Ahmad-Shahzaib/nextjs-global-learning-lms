import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Flame, Star } from "lucide-react";

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    if (user?.full_name) {
      setUserName(user.full_name.split(" ")[0]);
    }

    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome && user) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("hasSeenWelcome", "true");
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border border-orange-500/20 bg-black/40 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl shadow-orange-500/20">

        {/* Softer background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />

        <div className="relative p-10 pb-12">
          <DialogHeader className="space-y-8 text-center">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 flex items-center justify-center shadow-[0_0_60px_-15px] shadow-orange-500/40 animate-pulse">
                  <Sparkles className="h-14 w-14 text-white" />
                </div>

                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-orange-400/20 flex items-center justify-center animate-spin-slow">
                  <Flame className="h-6 w-6 text-orange-300" />
                </div>

                <div className="absolute -bottom-4 -left-5 w-11 h-11 rounded-full bg-white/5 backdrop-blur-md border border-orange-400/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-300" />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <DialogTitle className="text-4xl font-semibold tracking-tight text-white">
                Welcome back,
              </DialogTitle>

              <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent leading-none">
                {userName}!
              </p>

              <p className="text-orange-100/70 text-[16px] mt-4 mx-auto leading-relaxed">
                Ready to continue your learning journey with full energy? 🔥
              </p>
            </div>
          </DialogHeader>

          {/* Bottom badge */}
          <div className="mt-10 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-orange-400/20 text-orange-200 text-sm">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Let's make it awesome
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}