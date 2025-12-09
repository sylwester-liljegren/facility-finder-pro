import { Header } from "@/components/Header";
import { FacilityList } from "@/components/FacilityList";
import { Building2, MapPin, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero border-b border-border">
        <div className="container py-12 md:py-20">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Anläggningsregister för kommuner
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Hitta och utforska idrottsanläggningar, simhallar, friidrottsarenor och andra
              kommunala anläggningar i Sverige.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/map">
                  <MapPin className="mr-2 h-5 w-5" />
                  Visa på karta
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">
                  <Shield className="mr-2 h-5 w-5" />
                  Administratör
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Kommuner</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">7</p>
                <p className="text-sm text-muted-foreground">Anläggningstyper</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Öppet</p>
                <p className="text-sm text-muted-foreground">Publikt API</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities List */}
      <main className="container py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Alla anläggningar
          </h2>
          <p className="text-muted-foreground">
            Sök och filtrera bland registrerade anläggningar.
          </p>
        </div>
        <FacilityList />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Anläggningsregister</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ett öppet register för kommunala anläggningar
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;