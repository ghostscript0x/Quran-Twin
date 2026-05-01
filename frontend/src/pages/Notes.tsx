import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { fetchNotes, updateNote, deleteNote, type Note } from "@/lib/quran";
import { Loader2, Pencil, Trash2, Calendar, BookOpen, Save, X } from "lucide-react";
import { toast } from "sonner";

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await fetchNotes();
      
      let notesData: Note[] = [];
      
      if (Array.isArray(res)) {
        notesData = res;
      } else if (res && typeof res === 'object') {
        const anyRes = res as any;
        if (Array.isArray(anyRes.data)) {
          notesData = anyRes.data;
        } else if (Array.isArray(anyRes.notes)) {
          notesData = anyRes.notes;
        }
      }

      setNotes(notesData);
    } catch (err) {
      toast.error("Failed to load notes");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditBody(note.body);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditBody("");
  };

  const handleUpdate = async (id: string) => {
    if (!editBody.trim()) return;
    setSaving(true);
    try {
      await updateNote(id, editBody);
      setNotes(notes.map(n => n.id === id ? { ...n, body: editBody } : n));
      setEditingId(null);
      toast.success("Note updated");
    } catch (err) {
      toast.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      toast.success("Note deleted");
    } catch (err) {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar showStreak />

      <main className="container py-12 sm:py-20 max-w-4xl">
        <div className="flex items-center justify-between mb-10 animate-fade-in">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl mb-2">My Notes</h1>
            <p className="text-muted-foreground italic">Your personal journey through the Quran</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground italic">Gathering your reflections...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gradient-card border border-border/60 rounded-3xl p-12 text-center animate-fade-in">
            <BookOpen className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <p className="font-display text-2xl text-foreground/80 mb-2">No notes yet</p>
            <p className="text-muted-foreground mb-8">Start by sharing how you feel on the dashboard.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-gradient-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-card animate-fade-in group hover:border-primary/20 transition-smooth"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-xs text-primary/60 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    {(() => {
                      const val = note.createdAt;
                      if (!val) return "Unknown date";
                      const str = String(val).trim();
                      if (!str) return "Unknown date";
                      let d = new Date(str);
                      if (isNaN(d.getTime())) d = new Date(str.replace(" ", "T"));
                      if (isNaN(d.getTime())) return "Unknown date";
                      return d.toLocaleDateString();
                    })()}
                    {note.ranges && note.ranges.length > 0 && (
                      <span className="flex items-center gap-1.5 ml-2 text-foreground/70">
                        <BookOpen className="w-3.5 h-3.5" />
                        {note.ranges[0]}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    {editingId === note.id ? (
                      <>
                        <button 
                          onClick={() => handleUpdate(note.id)}
                          disabled={saving}
                          className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(note)}
                          className="p-2 rounded-xl bg-secondary hover:bg-accent transition-smooth"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(note.id)}
                          className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === note.id ? (
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="w-full h-32 bg-background/50 border border-border/60 rounded-2xl p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-display text-lg"
                    autoFocus
                  />
                ) : (
                  <p className="text-lg text-foreground/90 leading-relaxed font-display whitespace-pre-wrap">
                    {note.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notes;
