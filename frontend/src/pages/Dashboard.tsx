import { useState } from "react";
import Navbar from "@/components/Navbar";
import EmotionInput from "@/components/EmotionInput";
import { getReflectionByEmotion, saveReflectionToQuran, type Reflection as VerseData } from "@/lib/quran";
import { saveHistory } from "@/lib/storage";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [userNote, setUserNote] = useState("");
  const [emotion, setEmotion] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const handleSubmit = async (text: string) => {
    setLoading(true);
    setEmotion(text);
    try {
      const result = await getReflectionByEmotion(text);
      setVerseData(result);
    } catch (err) {
      toast.error("Failed to get verse. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnother = () => {
    setVerseData(null);
    setUserNote("");
    setEmotion("");
  };

  const handleSaveNote = async () => {
    if (!userNote.trim() || !verseData) return;

    if (userNote.trim().length < 6) {
      toast.error("Note must be at least 6 characters");
      return;
    }

    setSavingNote(true);
    try {
      const result = await saveReflectionToQuran(userNote, verseData.verse_key);
      saveHistory({
        id: crypto.randomUUID(),
        emotion,
        ayah: {
          reference: verseData.verse_key,
          arabic: verseData.arabic,
          translation: verseData.translation,
          tafsir: verseData.tafsir,
          surah: `Chapter ${verseData.chapter}`,
        },
        reflection: userNote,
        date: new Date().toISOString(),
      });
      
      if (result.isNewDay) {
        toast.success(`Note saved! 🔥 ${result.streak} day streak!`, {
          description: "Keep it up!",
        });
      } else {
        toast.success("Note saved to your Quran account");
      }
      setUserNote("");
    } catch (err) {
      saveHistory({
        id: crypto.randomUUID(),
        emotion,
        ayah: {
          reference: verseData.verse_key,
          arabic: verseData.arabic,
          translation: verseData.translation,
          tafsir: verseData.tafsir,
          surah: `Chapter ${verseData.chapter}`,
        },
        reflection: userNote,
        date: new Date().toISOString(),
      });
      toast.success("Note saved to your notes (offline)");
      setUserNote("");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar showStreak />

      <main className="container py-12 sm:py-20">
        {!verseData && !loading && <EmotionInput onSubmit={handleSubmit} loading={loading} />}

        {loading && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="bg-gradient-card border border-border/60 rounded-3xl p-12 shadow-card text-center">
              <Loader2 className="w-8 h-8 text-primary mx-auto mb-5 animate-spin" />
              <p className="font-display text-xl text-foreground/90 mb-2">Searching the Quran for you</p>
              <p className="text-sm text-muted-foreground italic">A verse is being chosen for this moment...</p>
            </div>
          </div>
        )}

        {verseData && !loading && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-gradient-card border border-border/60 rounded-3xl p-8 sm:p-12 shadow-card">
              <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-2">For when you feel</p>
                <p className="font-display text-2xl text-gradient-gold italic">{emotion}</p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="text-center">
                  <p className="font-arabic text-3xl sm:text-4xl leading-[2] mb-4">{verseData.arabic}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {verseData.chapter}:{verseData.verse_number}
                  </p>
                </div>

                <div className="border-t border-border/40 pt-6">
                  <p className="text-sm uppercase tracking-[0.1em] text-primary/60 mb-2">Translation</p>
                  <div 
                    className="text-foreground/90 leading-relaxed quran-html-content"
                    dangerouslySetInnerHTML={{ __html: verseData.translation }}
                  />
                </div>

                <div className="border-t border-border/40 pt-6">
                  <p className="text-sm uppercase tracking-[0.1em] text-primary/60 mb-2">Tafsir</p>
                  <div 
                    className="text-muted-foreground leading-relaxed text-sm quran-html-content max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                    dangerouslySetInnerHTML={{ __html: verseData.tafsir }}
                  />
                </div>
              </div>

              <div className="border-t border-border/40 pt-6 space-y-4">
                <p className="text-sm uppercase tracking-[0.1em] text-primary/60">Your Note</p>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="Write your note for this verse..."
                  className="w-full h-32 bg-background/50 border border-border/60 rounded-2xl p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAnother}
                    className="flex-1 h-12 rounded-2xl border border-border/60 text-foreground hover:bg-secondary transition-smooth"
                  >
                    Get Another
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={!userNote.trim() || savingNote}
                    className="flex-1 h-12 rounded-2xl bg-gradient-gold text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingNote ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                      </span>
                    ) : (
                      "Save to Quran"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
