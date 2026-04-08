import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import logoUrl from "@/assets/global-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "@/store/redux/thunks/authThunk";
import { RootState } from "@/store/redux/store";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const rawBase =
  (import.meta.env.VITE_BASENAME as string | undefined) ||
  (import.meta.env.BASE_URL as string | undefined) ||
  "/";
const BASENAME = rawBase === "/" ? "" : `/${rawBase.replace(/^\/+|\/+$/g, "")}`;

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login: authLogin } = useAuth();
  const { token, user_id, role, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const navigatedRef = useRef(false);
  const emailRef = useRef("");

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    if (token && user_id && role && !navigatedRef.current) {
      navigatedRef.current = true;

      authLogin(token, {
        user: { id: String(user_id), email: emailRef.current },
        roles: [role],
      });

      toast.success("Login successful!");
      setEmail("");
      setPassword("");
      setFormKey((prev) => prev + 1);

      let target = "/dashboard";
      if (role === "teacher") target = "/teacher/dashboard";
      else if (role === "student") target = "/student/dashboard";
      else if (role === "admin") target = "/admin/dashboard";

      if (BASENAME) target = `${BASENAME}${target}`;

      navigate(target, { replace: true });
    }
  }, [token, user_id, role, authLogin, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      setFormKey((prev) => prev + 1);
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();
    try {
      const validated = loginSchema.parse({ email, password });
      await dispatch(
        loginThunk({ username: validated.email, password: validated.password }) as any
      );
    } catch (error: any) {
      setFormKey((prev) => prev + 1);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error?.message || "Failed to sign in. Please try again.");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-75 pointer-events-none" />

      {/* Subtle Grid Overlay for Depth */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />

      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="flex flex-col justify-center px-16 xl:px-24 w-full">
          <div className="flex justify-start mb-16">
            <img
              src={logoUrl}
              alt="Global Learning LMS"
              className="h-20 w-auto drop-shadow-xl"
            />
          </div>

          <div className="space-y-8 text-foreground">
            <div className="flex items-center gap-4">
              <div className="h-1.5 w-16 bg-primary rounded-full" />
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <h2 className="text-6xl xl:text-7xl font-bold leading-none tracking-tighter">
              Study anywhere.<br />
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Achieve everywhere.
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-md">
              Join thousands of learners mastering skills with our world-class platform.
            </p>
          </div>
        </div>

        {/* Decorative floating elements */}
        <div className="absolute bottom-20 right-20 w-64 h-64 border border-primary/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-40 right-40 w-32 h-32 border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 py-16 relative z-10">
        <Card
          className="w-full max-w-lg bg-card/80 backdrop-blur-xl border border-border/60 shadow-2xl 
                     transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 
                     animate-fade-in"
        >
          <CardContent className="pt-10 pb-12 px-10 space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-3xl font-semibold tracking-tight">Welcome back</p>
              <p className="text-muted-foreground">Sign in to continue your learning journey</p>
            </div>

            <form
              key={formKey}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email address
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 bg-background/50 border-border/60 focus:border-primary/70 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 bg-background/50 border-border/60 focus:border-primary/70 focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground px-0 hover:text-primary"
                  onClick={() =>
                    toast.info("Use your administrator to reset your password.")
                  }
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full h-12 text-base"
                onClick={() =>
                  window.open("https://www.globallearning.com/enquire-now", "_blank")
                }
              >
                Create new account
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                Need access? Contact your administrator.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}