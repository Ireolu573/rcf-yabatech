import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errorHandler";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const hasSignedIn = useRef(false);

  const { signIn, isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!hasSignedIn.current) return;
    if (authLoading) return;

    if (user && isAdmin) {
      navigate("/admin", { replace: true });
    } else if (user && !isAdmin) {
      setSigningIn(false);
      hasSignedIn.current = false;
      toast({
        title: "Access denied",
        description: "This account does not have admin privileges.",
        variant: "destructive",
      });
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    hasSignedIn.current = true;

    const { error } = await signIn(email, password);
    if (error) {
      setSigningIn(false);
      hasSignedIn.current = false;
      toast({
        title: "Login failed",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-card rounded-2xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary-foreground" size={24} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-sm mt-1">RCF YABATECH Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@rcfyabatech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={signingIn}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-semibold"
            >
              {signingIn ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
