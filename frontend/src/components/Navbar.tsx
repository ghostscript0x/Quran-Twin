import { Link, useLocation } from "react-router-dom";
import { Moon, User, LogOut } from "lucide-react";
import StreakBadge from "./StreakBadge";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = ({ showStreak = false }: { showStreak?: boolean }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const onApp = pathname !== "/" && pathname !== "/login";

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : user?.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        <Link to={onApp ? "/dashboard" : "/"} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-gold grid place-items-center shadow-glow">
            <Moon className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl tracking-wide">
            Quran <span className="text-gradient-gold">Twin</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {onApp && (
            <>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Today</Link>
              <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">History</Link>
              <Link to="/notes" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">Notes</Link>
              {showStreak && <StreakBadge />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-gold grid place-items-center hover:scale-105 transition-smooth" aria-label="Profile">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.username || "Profile"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium text-primary-foreground">{initials}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.username || user?.firstName || "User"}</span>
                      {user?.email && <span className="text-xs text-muted-foreground font-normal">{user.email}</span>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!onApp && (
            <Link to="/login" className="text-sm px-4 py-2 rounded-full bg-secondary hover:bg-accent transition-smooth">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;