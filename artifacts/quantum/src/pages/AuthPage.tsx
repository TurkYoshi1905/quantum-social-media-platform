import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AtSign, Lock, User, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
// useAuth not needed on AuthPage — Supabase handles session directly

type AuthMode = "login" | "register" | "verify-email";

function FieldError({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 4 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5 pl-1"
        >
          <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
          <p className="text-destructive text-xs">{message}</p>
        </motion.div>
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
          hasError ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/40 focus:border-primary/50"
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

// E-posta doğrulama bekleme sayfası
function VerifyEmailPage({ email }: { email: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/4 rounded-full blur-3xl" />
      </div>

      {/* Animasyonlu arka plan halkalar */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/10"
            style={{ width: i * 200, height: i * 200 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10 text-center"
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-6"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Mail className="w-10 h-10 text-primary" />
        </motion.div>

        <h1 className="font-display font-black text-3xl text-primary tracking-tight mb-2">
          Quantum
        </h1>

        <h2 className="text-xl font-bold text-foreground mb-3">E-Posta Doğrulaması</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          <span className="text-primary font-medium">{email}</span> adresine bir doğrulama bağlantısı gönderdik.
        </p>
        <p className="text-muted-foreground text-xs mb-8">
          Bağlantıya tıkladıktan sonra otomatik olarak uygulamaya yönlendirileceksiniz.
        </p>

        <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
          {["E-postanı kontrol et", "Spam klasörünü de gözden geçir", "Bağlantıya tıkla ve başla"].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-3 text-left"
            >
              <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-bold">{i + 1}</span>
              </div>
              <span className="text-sm text-foreground">{step}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-xs"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Doğrulama bekleniyor...</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<AuthMode>("login");
  const [verifyEmail, setVerifyEmail] = useState("");

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({ identifier: "", password: "", general: "" });
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerErrors, setRegisterErrors] = useState({
    displayName: "", username: "", email: "", password: "", general: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);

  // Email verification redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("type=signup")) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          // E-posta doğrulandı animasyonu
          setLocation("/auth/verified");
        }
      });
    }
  }, [setLocation]);

  const checkUsername = async (uname: string): Promise<boolean> => {
    if (!uname || !usernameRegex.test(uname)) return false;
    setUsernameChecking(true);
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", uname)
      .maybeSingle();
    setUsernameChecking(false);
    if (data) {
      setRegisterErrors((e) => ({
        ...e,
        username: "Bu Kullanıcı Adı Alınmış. Başka Kullanıcı Adı Girin.",
      }));
      return false;
    }
    return true;
  };

  const handleUsernameChange = (v: string) => {
    setUsername(v);
    if (v && !usernameRegex.test(v)) {
      setRegisterErrors((e) => ({ ...e, username: "Sadece küçük harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz." }));
    } else {
      setRegisterErrors((e) => ({ ...e, username: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { identifier: "", password: "", general: "" };
    if (!loginIdentifier.trim()) errs.identifier = "Kullanıcı adı veya e-posta boş bırakılamaz.";
    if (!loginPassword) errs.password = "Şifre boş bırakılamaz.";
    setLoginErrors(errs);
    if (errs.identifier || errs.password) return;

    setLoginLoading(true);
    // Kullanıcı adıyla giriş desteği: güvenli RPC fonksiyonu ile e-posta bul
    let emailToUse = loginIdentifier.trim();
    if (!emailToUse.includes("@")) {
      const { data: foundEmail, error: rpcError } = await supabase
        .rpc("get_email_by_username", { p_username: emailToUse });
      if (rpcError || !foundEmail) {
        setLoginErrors((e) => ({ ...e, general: "Kullanıcı adı veya şifre hatalı." }));
        setLoginLoading(false);
        return;
      }
      emailToUse = foundEmail as string;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: loginPassword,
    });

    if (error) {
      setLoginErrors((e) => ({ ...e, general: "Kullanıcı adı/e-posta veya şifre hatalı." }));
      setLoginLoading(false);
    } else {
      setLocation("/home");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = { displayName: "", username: "", email: "", password: "", general: "" };
    if (!displayName.trim()) errs.displayName = "Görünen ad boş bırakılamaz.";
    if (!username.trim()) errs.username = "Kullanıcı adı boş bırakılamaz.";
    else if (!usernameRegex.test(username)) errs.username = "Sadece küçük harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz.";
    if (!email.trim()) errs.email = "E-posta boş bırakılamaz.";
    if (!password) errs.password = "Şifre boş bırakılamaz.";
    else if (password.length < 6) errs.password = "Şifre en az 6 karakter olmalıdır.";
    setRegisterErrors(errs);
    if (errs.displayName || errs.username || errs.email || errs.password) return;

    setRegisterLoading(true);
    // Kullanıcı adı benzersizlik kontrolü
    const isAvailable = await checkUsername(username.trim());
    if (!isAvailable) { setRegisterLoading(false); return; }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: username.trim(),
          avatar_url: "",
        },
      },
    });

    if (error) {
      setRegisterErrors((e) => ({ ...e, general: error.message }));
    } else {
      setVerifyEmail(email.trim());
      setMode("verify-email");
    }
    setRegisterLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/home" },
    });
  };

  if (mode === "verify-email") return <VerifyEmailPage email={verifyEmail} />;

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
            {mode === "register" ? "Hesabınızı oluşturun" : "Tekrar hoş geldiniz"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-card border border-card-border rounded-2xl p-6 shadow-lg"
        >
          <AnimatePresence mode="wait">
            {mode === "register" ? (
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
                  <h2 className="text-base font-semibold text-foreground">E-Posta ile Hesap Oluştur</h2>
                </div>

                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-display-name"
                      value={displayName}
                      onChange={(e) => { setDisplayName(e.target.value); if (e.target.value.trim()) setRegisterErrors((er) => ({ ...er, displayName: "" })); }}
                      placeholder="Görünen Ad"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${registerErrors.displayName ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/40 focus:border-primary/50"}`}
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
                      onBlur={() => { if (username && usernameRegex.test(username)) checkUsername(username); }}
                      placeholder="Kullanıcı Adı"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${registerErrors.username ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/40 focus:border-primary/50"}`}
                    />
                    {usernameChecking && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  <AnimatePresence>
                    {registerErrors.username && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                          <p className="text-destructive text-xs font-medium">{registerErrors.username}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      data-testid="input-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (e.target.value.trim()) setRegisterErrors((er) => ({ ...er, email: "" })); }}
                      placeholder="E-Posta"
                      className={`w-full bg-muted/50 border border-input rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition ${registerErrors.email ? "border-destructive focus:ring-2 focus:ring-destructive/30" : "focus:ring-2 focus:ring-primary/40 focus:border-primary/50"}`}
                    />
                  </div>
                  <FieldError message={registerErrors.email} />
                </div>

                <div>
                  <PasswordInput
                    value={password}
                    onChange={(v) => { setPassword(v); if (v) setRegisterErrors((er) => ({ ...er, password: "" })); }}
                    placeholder="Şifre (en az 6 karakter)"
                    testId="input-password-register"
                    hasError={!!registerErrors.password}
                  />
                  <FieldError message={registerErrors.password} />
                </div>

                <FieldError message={registerErrors.general} />

                <motion.button
                  type="submit"
                  data-testid="button-create-account"
                  whileTap={{ scale: 0.97 }}
                  disabled={registerLoading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {registerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Hesap Oluştur
                </motion.button>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-muted-foreground text-xs">veya</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <motion.button
                  type="button"
                  data-testid="button-google-register"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <SiGoogle className="w-4 h-4" />
                  Google ile Kayıt Ol
                </motion.button>

                <p className="text-center text-xs text-muted-foreground">
                  Zaten hesabınız var mı?{" "}
                  <button type="button" data-testid="link-to-login" onClick={() => setMode("login")} className="text-primary font-medium hover:underline">
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
                      value={loginIdentifier}
                      onChange={(e) => { setLoginIdentifier(e.target.value); if (e.target.value.trim()) setLoginErrors((er) => ({ ...er, identifier: "", general: "" })); }}
                      placeholder="Kullanıcı Adı veya E-Posta"
                      className={`w-full bg-muted/50 border rounded-xl pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 transition ${loginErrors.identifier ? "border-destructive focus:ring-destructive/30" : "border-input focus:ring-primary/40 focus:border-primary/50"}`}
                    />
                  </div>
                  <FieldError message={loginErrors.identifier} />
                </div>

                <div>
                  <PasswordInput
                    value={loginPassword}
                    onChange={(v) => { setLoginPassword(v); if (v) setLoginErrors((er) => ({ ...er, password: "", general: "" })); }}
                    placeholder="Şifre"
                    testId="input-password-login"
                    hasError={!!loginErrors.password}
                  />
                  <FieldError message={loginErrors.password} />
                </div>

                <FieldError message={loginErrors.general} />

                <motion.button
                  type="submit"
                  data-testid="button-login"
                  whileTap={{ scale: 0.97 }}
                  disabled={loginLoading}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity mt-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
                  <button type="button" data-testid="link-to-register" onClick={() => setMode("register")} className="text-primary font-medium hover:underline">
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
