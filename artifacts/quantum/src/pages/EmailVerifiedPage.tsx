import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function EmailVerifiedPage() {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/home");
    }, 2500);
    return () => clearTimeout(timer);
  }, [setLocation]);

  useEffect(() => {
    if (isLoggedIn) {
      setTimeout(() => setLocation("/home"), 2000);
    }
  }, [isLoggedIn, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="font-display font-black text-3xl text-primary mb-2"
        >
          Quantum
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-2xl font-bold text-foreground mb-3"
        >
          E-Posta Doğrulandı! ✓
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-muted-foreground text-sm"
        >
          Uygulamaya yönlendiriliyorsunuz...
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 2, ease: "linear" }}
          className="mt-6 h-1 bg-primary rounded-full origin-left max-w-[200px] mx-auto"
        />
      </motion.div>
    </div>
  );
}
