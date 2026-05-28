import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface AvatarModalProps {
  onClose: () => void;
  onSave: (dataUrl: string) => Promise<void>;
}

export function AvatarModal({ onClose, onSave }: AvatarModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    await onSave(preview);
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className="bg-card border border-card-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Profil Resmini Güncelle</h2>
          <motion.button
            data-testid="button-avatar-modal-close"
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="p-6 space-y-5">
          {/* Preview */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {preview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <img
                    src={preview}
                    alt="Önizleme"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-primary/30 shadow-lg"
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPreview(null)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="w-28 h-28 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Drop Zone */}
          <motion.div
            animate={{ borderColor: dragOver ? "hsl(var(--primary))" : "hsl(var(--border))" }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            data-testid="dropzone-avatar"
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 select-none ${
              dragOver ? "bg-primary/5 border-primary" : "bg-muted/30 hover:bg-muted/50 border-border"
            }`}
          >
            <motion.div
              animate={{ y: dragOver ? -4 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Sürükle &amp; Bırak</p>
              <p className="text-xs text-muted-foreground">veya tıkla, dosya seç</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">PNG, JPG, WEBP desteklenir</p>
            </motion.div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-testid="input-avatar-file"
            />
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              data-testid="button-avatar-cancel"
              className="flex-1 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              Vazgeç
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!preview || saving}
              data-testid="button-avatar-save"
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
