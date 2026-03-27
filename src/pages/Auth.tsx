import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import logoUrl from  "@/assets/global-logo.png";
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
  const { token, user_id, role, loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const navigatedRef = useRef(false);
  const emailRef = useRef("");

  // Keep emailRef in sync so we can pass it to authLogin after clearing the field
  useEffect(() => { emailRef.current = email; }, [email]);

  useEffect(() => {
    if (token && user_id && role && !navigatedRef.current) {
      navigatedRef.current = true;

      // Bridge Redux auth token into useAuth context (sets localStorage + context user)
      authLogin(token, {
        user: { id: String(user_id), email: emailRef.current },
        roles: [role],
      });

      toast.success("Login successful!");
      setEmail("");
      setPassword("");
      setFormKey((prev) => prev + 1);

      let target = "/dashboard";
      if (role === "teacher") {
        target = "/teacher/dashboard";
      } else if (role === "student") {
        target = "/student/dashboard";
      } else if (role === "admin") {
        target = "/admin/dashboard";
      }
      if (BASENAME) {
        target = `${BASENAME}${target}`;
      }

      navigate(target, { replace: true });
    }
  }, [token, user_id, role]);

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
      <div className="absolute inset-0 bg-gradient-hero opacity-70 pointer-events-none" />
      <div
        className="absolute inset-0 bg-card"
        style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%, 0 100%)" }}
      />
      <div className="hidden lg:flex w-1/2 relative">
        <div className="flex flex-col justify-center px-20 xl:px-28 w-full">
          <div className="flex justify-start">
            <img
              src={logoUrl}
              alt="Global Learning LMS"
              className="h-20 w-auto mb-16"
            />
          </div>
          <div className="space-y-6 text-foreground">
            <div className="h-1 w-14 bg-primary" />
            <h2 className="text-5xl font-bold leading-tight">
              Study anywhere
              <br />
              Achieve everywhere
            </h2>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 py-16 relative z-10">
        <Card className="w-full max-w-lg bg-card border border-border text-foreground shadow-2xl animate-fade-in">
          <CardContent className="pt-8 pb-10 px-8 space-y-6">
            <p className="text-2xl font-semibold">Log in to your account</p>
            <form
              key={formKey}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                    className="h-8 px-2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs text-muted-foreground px-0"
                  onClick={() =>
                    toast.info("Use your administrator to reset your password.")
                  }
                >
                  Forgot your password?
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  window.open("https://www.globallearning.com/enquire-now", "_blank")
                }
              >
                Signup
              </Button>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Need access? Contact your administrator.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
