import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Loader2, LogIn, LogOut, Settings } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function Nav() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <nav className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo / Site Name */}
        <Link
          to="/"
          className="font-display text-xl font-semibold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          Notebook
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}

          {isInitializing ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-sm font-sans"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="text-muted-foreground hover:text-foreground gap-1.5 text-sm font-sans"
            >
              {isLoggingIn ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogIn className="h-3.5 w-3.5" />
              )}
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
