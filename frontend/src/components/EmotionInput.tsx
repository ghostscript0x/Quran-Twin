import { useState } from "react";
import { Sparkles } from "lucide-react";

type Props = {
  onSubmit: (emotion: string) => void;
  loading?: boolean;
};

const QUICK = ["Calm", "Anxious", "Grateful", "Hope", "Sadness", "Peace of heart"];

const EmotionInput = ({ onSubmit, loading }: Props) => {
  const [value, setValue] = useState("");

  const submit = (text: string) => {
    const v = text.trim();
    if (!v || loading) return;
    onSubmit(v);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-card border border-border/60 rounded-3xl p-8 sm:p-12 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80">How do you feel?</p>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(value)}
          placeholder="Share what's on your heart..."
          className="w-full bg-transparent text-2xl sm:text-3xl font-display placeholder:text-foreground/20 focus:outline-none mb-6"
          disabled={loading}
        />

        <div className="flex flex-wrap gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={loading}
              className="px-4 py-2 rounded-full border border-border/60 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-smooth disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionInput;
