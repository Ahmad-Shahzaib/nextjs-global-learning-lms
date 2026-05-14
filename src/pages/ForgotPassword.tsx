import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import logoUrl from "../../public/uecampus-logo.png.png";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string }>({});
  const [formKey, setFormKey] = useState(0);
  const [authError, setAuthError] = useState("");
  const emailRef = useRef("");

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    try {
      const validated = forgotPasswordSchema.parse({ email });
      setFormErrors({});
      setAuthError("");
      toast.success(
        "If that email is registered, reset instructions will be sent. Contact your administrator for further help."
      );
      navigate("/auth", { replace: true });
    } catch (error: any) {
      setFormKey((prev) => prev + 1);
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string } = {};
        for (const err of error.errors) {
          if (err.path.includes("email")) fieldErrors.email = err.message;
        }
        setFormErrors(fieldErrors);
        toast.error(fieldErrors.email || "Please enter a valid email address.");
      } else {
        const message =
          error?.message || "Unable to process reset request at this time. Please try again later.";
        setAuthError(message);
        toast.error(message);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-hero opacity-75 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />

      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="flex flex-col justify-center px-16 xl:px-24 w-full">
          <div className="flex justify-start mb-16">
            <img src={logoUrl} alt="Global Learning LMS" className="h-20 w-auto drop-shadow-xl" />
          </div>

          <div className="space-y-8 text-foreground">
            <div className="flex items-center gap-4">
              <div className="h-1.5 w-16 bg-primary rounded-full" />
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
            </div>

            <h2 className="text-6xl xl:text-7xl font-bold leading-none tracking-tighter">
              Reset your password
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                and get back to learning.
              </span>
            </h2>

            <p className="text-xl text-muted-foreground max-w-md">
              Enter the email address for your account. We'll send reset instructions if it is registered.
            </p>
          </div>
        </div>

        <div className="absolute bottom-20 right-20 w-64 h-64 border border-primary/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-40 right-40 w-32 h-32 border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 md:py-8 lg:py-16 relative z-10">
        <Card className="w-full max-w-lg bg-card/80 backdrop-blur-xl border border-border/60 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:-translate-y-1 animate-fade-in">
          <CardContent className="pt-10 pb-12 px-10 space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-3xl font-semibold tracking-tight">Forgot password?</p>
              <p className="text-muted-foreground">We’ll help you recover access to your account.</p>
            </div>

            <form key={formKey} onSubmit={handleSendReset} className="space-y-6">
              {authError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {authError}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email address
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                    setAuthError("");
                  }}
                  required
                  className={`h-12 bg-background/50 border ${formErrors.email ? "border-destructive" : "border-border/60"} focus:border-primary/70 focus:ring-2 focus:ring-primary/30 transition-all`}
                />
                {formErrors.email ? <p className="text-sm text-destructive">{formErrors.email}</p> : null}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Send reset link
              </Button>

              <Button
                type="button"
                variant="secondary"
                className="w-full h-12 text-base"
                onClick={() => navigate("/auth")}
              >
                Back to sign in
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                Can’t access your account? Contact your administrator for help.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
