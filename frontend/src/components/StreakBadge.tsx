import { Flame } from "lucide-react";
import { getStreak } from "@/lib/streak";
import { useEffect, useState } from "react";

const StreakBadge = () => {
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getStreak()
      .then(data => {
        setStreak(data.currentStreak);
        setLoading(false);
      })
      .catch(() => {
        setStreak(0);
        setLoading(false);
      });
    
    const i = setInterval(() => {
      getStreak()
        .then(data => setStreak(data.currentStreak))
        .catch(() => {});
    }, 30000);
    
    return () => clearInterval(i);
  }, []);

  if (loading || streak === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/60">
        <Flame className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span className="text-xs font-medium tabular-nums">...</span>
      </div>
    );
  }

  if (streak === 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/60">
        <Flame className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium tabular-nums">Start your streak</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/70 border border-border/60">
      <Flame className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-medium tabular-nums">{streak} day streak</span>
    </div>
  );
};

export default StreakBadge;