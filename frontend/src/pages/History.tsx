import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { fetchNotes, deleteNote, type Note } from "@/lib/quran";
import { BookOpen, Trash2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const NOTES_CACHE_KEY = "qt_notes_cache";
const CACHE_TTL = 5 * 60 * 1000;

interface CachedNotes {
  data: Note[];
  timestamp: number;
}

const getCachedNotes = (): Note[] | null => {
  try {
    const cached = localStorage.getItem(NOTES_CACHE_KEY);
    if (!cached) return null;
    const parsed: CachedNotes = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const setCachedNotes = (notes: Note[]) => {
  try {
    const cache: CachedNotes = { data: notes, timestamp: Date.now() };
    localStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(cache));
  } catch {}
};

const History = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    
    const cached = getCachedNotes();
    if (cached?.length) {
      setNotes(cached);
      setLoading(false);
    }
    
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      let notesArray: Note[] = [];
      
      if (Array.isArray(data)) {
        notesArray = data;
      } else if (data && typeof data === "object") {
        notesArray = data.data || data.notes || data.items || [];
      }
      
      if (!Array.isArray(notesArray)) notesArray = [];
      
      setNotes(notesArray);
      setCachedNotes(notesArray);
    } catch (err) {
      const cached = getCachedNotes();
      if (cached) setNotes(cached);
      else toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setDeletingId(id);
    try {
      await deleteNote(id);
      const updated = notes.filter(n => n.id !== id);
      setNotes(updated);
      setCachedNotes(updated);
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: unknown) => {
    if (!dateStr) return "Unknown date";
    const str = String(dateStr).trim();
    if (!str) return "Unknown date";
    let d = new Date(str);
    if (isNaN(d.getTime())) {
      d = new Date(str.replace(" ", "T"));
    }
    if (isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen">
      <Navbar showStreak />

      <main className="container py-12 sm:py-16 max-w-2xl">
        <div className="mb-10 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">Your journey</p>
          <h1 className="font-display text-4xl sm:text-5xl mb-2">Notes</h1>
          <p className="text-muted-foreground text-sm">
            Every note you've saved — a record of your heart's conversation with the Quran.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-3">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gradient-card border border-border/60 rounded-3xl p-12 text-center shadow-card animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center mx-auto mb-5">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display text-xl mb-2">No notes yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              Save your first note from the dashboard to begin your journey.
            </p>
            <Link to="/dashboard" className="inline-flex h-11 px-6 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium items-center shadow-glow hover:scale-[1.03] transition-smooth">
              Write a note
            </Link>
          </div>
        ) : (
          <div className="space-y-3 animate-fade-in">
            {notes.map((note) => (
              <div 
                key={note.id}
                className="bg-gradient-card border border-border/60 rounded-2xl p-5 hover:border-primary/40 hover:shadow-glow transition-smooth group"
              >
                <div className="flex items-start justify-between gap-4">
                  <button 
                    className="flex-1 text-left"
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                      {note.ranges?.length > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs uppercase tracking-widest text-primary">{note.ranges[0]}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 line-clamp-3">{note.body}</p>
                  </button>
                  
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingId === note.id}
                    className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive transition-smooth self-center"
                    title="Delete note"
                  >
                    {deletingId === note.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selectedNote?.ranges?.[0] || "Note"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {selectedNote && formatDate(selectedNote.createdAt)}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">{selectedNote?.body}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;