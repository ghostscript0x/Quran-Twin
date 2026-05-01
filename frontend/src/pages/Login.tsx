import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Moon, Loader2 } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogin = () => {
    setLoading(true);
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold mx-auto mb-6 grid place-items-center shadow-glow">
            <Moon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-4xl mb-3">
            Welcome to <span className="text-gradient-gold italic">Quran Twin</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            A quiet space to return, reflect, and remember.
          </p>
        </div>

        <div className="bg-gradient-card border border-border/60 rounded-3xl p-8 shadow-card">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-gradient-gold text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-glow hover:scale-[1.01] transition-smooth disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
            ) : (
              <>Continue with Quran Account</>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to begin a quiet daily habit with the Quran.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
