import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Building2, LogOut, Settings, MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { VisuallyHidden } from "@/components/VisuallyHidden";

export function Header() {
  const { isAuthenticated, signOut, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      role="banner"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
          aria-label="Anläggningsregister - Startsida"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary" aria-hidden="true">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block">Anläggningsregister</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Huvudnavigering">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1 py-0.5 ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
            aria-current={isActive("/") ? "page" : undefined}
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Anläggningar
            </span>
          </Link>
          <Link
            to="/map"
            className={`text-sm font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1 py-0.5 ${
              isActive("/map") ? "text-primary" : "text-muted-foreground"
            }`}
            aria-current={isActive("/map") ? "page" : undefined}
          >
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Karta
            </span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-1 py-0.5 ${
                isActive("/admin") ? "text-primary" : "text-muted-foreground"
              }`}
              aria-current={isActive("/admin") ? "page" : undefined}
            >
              <span className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" aria-hidden="true" />
                Administration
              </span>
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground" aria-label={`Inloggad som ${user?.email}`}>
                {user?.email}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                aria-label="Logga ut från kontot"
              >
                <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
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
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Stäng menyn" : "Öppna menyn"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav 
          id="mobile-menu"
          className="md:hidden border-t border-border bg-card animate-slide-up"
          aria-label="Mobilnavigering"
        >
          <div className="container py-4 flex flex-col gap-4">
            <Link
              to="/"
              className={`flex items-center gap-2 text-sm font-medium py-2 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive("/") ? "bg-muted" : ""
              }`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/") ? "page" : undefined}
            >
              <Building2 className="h-4 w-4" aria-hidden="true" />
              Anläggningar
            </Link>
            <Link
              to="/map"
              className={`flex items-center gap-2 text-sm font-medium py-2 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive("/map") ? "bg-muted" : ""
              }`}
              onClick={() => setMobileMenuOpen(false)}
              aria-current={isActive("/map") ? "page" : undefined}
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Karta
            </Link>
            {isAuthenticated && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 text-sm font-medium py-2 px-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive("/admin") ? "bg-muted" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive("/admin") ? "page" : undefined}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Administration
              </Link>
            )}
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSignOut}
                  aria-label="Logga ut från kontot"
                >
                  <LogOut className="h-4 w-4 mr-1.5" aria-hidden="true" />
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
          </div>
        </nav>
      )}
    </header>
  );
}