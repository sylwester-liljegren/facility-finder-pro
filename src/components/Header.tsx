import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Building2, LogOut, Settings, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { isAuthenticated, signOut, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">Anläggningsregister</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              Anläggningar
            </span>
          </Link>
          <Link
            to="/map"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/map") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Karta
            </span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                Administration
              </span>
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1.5" />
                Logga ut
              </Button>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Logga in</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              Anläggningar
            </Link>
            <Link
              to="/map"
              className="flex items-center gap-2 text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MapPin className="h-4 w-4" />
              Karta
            </Link>
            {isAuthenticated && (
              <Link
                to="/admin"
                className="flex items-center gap-2 text-sm font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Administration
              </Link>
            )}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logga ut
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    Logga in
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}