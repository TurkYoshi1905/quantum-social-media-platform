import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AtSign, Lock, User, Mail } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

type AuthMode = "login" | "register-email" | "register-google";

function FieldError({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.18 }}
          className="text-destructive text-xs pl-1"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  testId,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  testId: string;
  hasError?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        data-testid={testId}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-muted/50 border rounded-xl px-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${
          hasError
            ? "border-destructive focus:ring-destructive/30"
            : "border-input focus:ring-primary/40 focus:border-primary/50"
        }`}
      />
      <button
        type="button"
        data-testid={`${testId}-toggle`}
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const usernameRegex = /^[a-z0-9._-]+$/;

export default function AuthPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({ username: "", password: "" });

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });

  const handleUsernameChange = (v: string) => {
    setUsername(v);
    if (v && !usernameRegex.test(v)) {
      setRegisterErrors((e) => ({
        ...e,
        username: "Sadece küçük harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz.",
      }));
    } else {
      setRegisterErrors((e) => ({ ...e, username: "" }));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { username: "", password: "" };
    if (!loginUsername.trim()) errs.username = "Kullanıcı adı boş bırakılamaz.";
    if (!loginPassword) errs.password = "Şifre boş bırakılamaz.";
    setLoginErrors(errs);
    if (errs.username || errs.password) return;

    login({ username: loginUsername.trim(), displayName: loginUsername.trim() });
    setLocation("/home");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { displayName: "", username: "", email: "", password: "" };
    if (!displayName.trim()) errs.displayName = "Görünen ad boş bırakılamaz.";
    if (!username.trim()) errs.username = "Kullanıcı adı boş bırakılamaz.";
    else if (!usernameRegex.test(username))
      errs.username = "Sadece küçük harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz.";
    if (!email.trim()) errs.email = "E-posta boş bırakılamaz.";
    if (!password) errs.password = "Şifre boş bırakılamaz.";
    else if (password.length < 6) errs.password = "Şifre en az 6 karakter olmalıdır.";
    setRegisterErrors(errs);
    if (errs.displayName || errs.username || errs.email || errs.password) return;

    login({
      displayName: displayName.trim(),
      username: username.trim(),
      email: email.trim(),
      avatar: "",
    });
    setLocation("/home");
  };

  const handleGoogleLogin = () => {
    login({ displayName: "Google Kullanıcısı", username: "google_user", email: "user@gmail.com", avatar: "" });
    setLocation("/home");
  };

  const handleGoogleRegister = () => {
    setEmail("user@gmail.com");
    setMode("register-google");
  };

  const registerTitle = mode === "register-google" ? "Google ile Hesap Oluştur" : "E-Posta ile Hesap Oluştur";
  const isRegister = mode === "register-email" || mode === "register-google";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/4 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="font-display font-black text-5xl text-primary tracking-tight" data-testid="logo-auth">
            Quantum
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {isRegister ? "Hesabınızı oluşturun" : "Tekrar hoş geldiniz"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-card border border-card-border rounded-2xl p-6 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onSubmit={handleRegister}
                className="space-y-3"
              >
                <div className="text-center mb-2">
                  <h2 className="text-base font-semibold text-foreground">{registerTitle}</h2>
                </div>

                {mode === "register-email" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      data-testid="button-register-email"
                      className="py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold transition-opacity"
                    >
                      E-Posta ile
                    </button>
                    <button
                      type="button"
                      data-testid="button-register-google"
                      onClick={handleGoogleRegister}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                    >
                      <SiGoogle className="w-3.5 h-3.5" />
                      Google ile
                    </button>
                  </div>
                )}

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-display-name"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (e.target.value.trim()) setRegisterErrors((er) => ({ ...er, displayName: "" }));
                      }}
                      placeholder="Görünen Ad"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${
                        registerErrors.displayName
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-input focus:ring-primary/40 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <FieldError message={registerErrors.displayName} />
                </div>

                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-username"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Kullanıcı Adı"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${
                        registerErrors.username
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-input focus:ring-primary/40 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <FieldError message={registerErrors.username} />
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value.trim()) setRegisterErrors((er) => ({ ...er, email: "" }));
                      }}
                      placeholder="E-Posta"
                      readOnly={mode === "register-google"}
                      className={`w-full bg-muted/50 border border-input rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition ${
                        mode === "register-google"
                          ? "opacity-60 cursor-not-allowed"
                          : registerErrors.email
                          ? "border-destructive focus:ring-2 focus:ring-destructive/30"
                          : "focus:ring-2 focus:ring-primary/40 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <FieldError message={registerErrors.email} />
                </div>

                <div>
                  <PasswordInput
                    value={password}
                    onChange={(v) => {
                      setPassword(v);
                      if (v) setRegisterErrors((er) => ({ ...er, password: "" }));
                    }}
                    placeholder="Şifre (en az 6 karakter)"
                    testId="input-password-register"
                    hasError={!!registerErrors.password}
                  />
                  <FieldError message={registerErrors.password} />
                </div>

                <motion.button
                  type="submit"
                  data-testid="button-create-account"
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-1"
                >
                  Hesap Oluştur
                </motion.button>

                <p className="text-center text-xs text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <button
                    type="button"
                    data-testid="link-to-login"
                    onClick={() => setMode("login")}
                    className="text-primary font-medium hover:underline"
                  >
                    Giriş Yap
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                onSubmit={handleLogin}
                className="space-y-3"
              >
                <div className="text-center mb-2">
                  <h2 className="text-base font-semibold text-foreground">Giriş Yap</h2>
                </div>

                <div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-login-username"
                      value={loginUsername}
                      onChange={(e) => {
                        setLoginUsername(e.target.value);
                        if (e.target.value.trim()) setLoginErrors((er) => ({ ...er, username: "" }));
                      }}
                      placeholder="Kullanıcı Adı"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${
                        loginErrors.username
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-input focus:ring-primary/40 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <FieldError message={loginErrors.username} />
                </div>

                <div>
                  <PasswordInput
                    value={loginPassword}
                    onChange={(v) => {
                      setLoginPassword(v);
                      if (v) setLoginErrors((er) => ({ ...er, password: "" }));
                    }}
                    placeholder="Şifre"
                    testId="input-password-login"
                    hasError={!!loginErrors.password}
                  />
                  <FieldError message={loginErrors.password} />
                </div>

                <motion.button
                  type="submit"
                  data-testid="button-login"
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-1"
                >
                  Giriş Yap
                </motion.button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">veya</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <motion.button
                  type="button"
                  data-testid="button-google-login"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <SiGoogle className="w-4 h-4" />
                  Google ile Giriş Yap
                </motion.button>

                <p className="text-center text-xs text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <button
                    type="button"
                    data-testid="link-to-register"
                    onClick={() => setMode("register-email")}
                    className="text-primary font-medium hover:underline"
                  >
                    Kayıt Ol
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
