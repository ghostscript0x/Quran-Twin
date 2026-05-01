import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Heart, Sparkles, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authLoading) setReady(true);
  }, [authLoading]);

  useEffect(() => {
    if (ready && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [ready, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
        </div>

        <div className="container relative pt-20 pb-24 sm:pt-32 sm:pb-32 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-primary/80 mb-6 animate-fade-in">
            ✦ Your spiritual companion ✦
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6 animate-fade-in">
            A Quran that
            <br />
            <span className="text-gradient-gold italic">understands you</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in">
            Stay connected to the Quran beyond Ramadan. Turn how you feel into verses,
            notes, and quiet daily moments with Allah.
          </p>
          <div className="flex items-center justify-center gap-3 animate-fade-in">
            <Link
              to="/login"
              className="h-12 px-7 rounded-full bg-gradient-gold text-primary-foreground font-medium flex items-center gap-2 shadow-glow hover:scale-[1.03] transition-smooth"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how" className="h-12 px-6 rounded-full border border-border/60 hover:bg-secondary transition-smooth flex items-center text-sm">
              How it works
            </a>
          </div>

          <p className="font-arabic text-2xl sm:text-3xl text-primary/40 mt-20 animate-fade-in-slow">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">The quiet struggle</p>
          <h2 className="font-display text-3xl sm:text-5xl mb-6 leading-tight">
            Many reconnect during Ramadan,
            <br />
            <span className="text-muted-foreground italic">and slowly drift after.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The light fades. The routine breaks. The Quran starts to feel distant —
            not because we don't love it, but because life rushes back in.
          </p>
        </div>
      </section>

      <section id="how" className="container py-20 sm:py-28">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-4">The way back</p>
          <h2 className="font-display text-3xl sm:text-5xl">
            Personalized ayah, <span className="text-gradient-gold italic">every day</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Heart, title: "Share how you feel", desc: "Stressed, grateful, or seeking — just type what's on your heart." },
            { icon: BookOpen, title: "Receive a verse", desc: "An ayah chosen for your moment, with translation and tafsir." },
            { icon: Sparkles, title: "Save your note", desc: "Your note saved to your Quran account, a quiet habit that lasts." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gradient-card border border-border/60 rounded-3xl p-7 shadow-card">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center mb-5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-primary/80 mb-3">A glimpse</p>
            <h2 className="font-display text-3xl sm:text-4xl">When you say "I feel lost"</h2>
          </div>

          <div className="bg-gradient-card border border-border/60 rounded-3xl p-8 shadow-card relative overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-primary/90 text-center mb-6">
                Ash-Sharh · 94:5-6
              </p>
              <p className="font-arabic text-3xl sm:text-4xl text-center leading-[2] mb-6">
                فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
              </p>
              <p className="font-display italic text-center text-foreground/80">
                "So indeed, with hardship comes ease."
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center bg-gradient-card border border-border/60 rounded-3xl p-12 sm:p-16 shadow-card">
          <h2 className="font-display text-3xl sm:text-5xl mb-5 leading-tight">
            Begin your <span className="text-gradient-gold italic">return</span>.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            One verse. One note. One day at a time.
          </p>
          <Link
            to="/login"
            className="inline-flex h-12 px-7 rounded-full bg-gradient-gold text-primary-foreground font-medium items-center gap-2 shadow-glow hover:scale-[1.03] transition-smooth"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-10">
          Built with intention · Quran Twin ✦
        </p>
      </section>
    </div>
  );
};

export default Index;