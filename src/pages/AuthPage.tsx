import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Building2, Loader2 } from "lucide-react";
import { z } from "zod";
import { Helmet } from "react-helmet-async";

const emailSchema = z.string().email("Ogiltig e-postadress");
const passwordSchema = z.string().min(6, "Lösenordet måste vara minst 6 tecken");

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const validateInput = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Valideringsfel",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({
        title: "Inloggning misslyckades",
        description: error.message === "Invalid login credentials" 
          ? "Fel e-post eller lösenord" 
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Välkommen!",
        description: "Du är nu inloggad.",
      });
      navigate("/admin");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      toast({
        title: "Registrering misslyckades",
        description: error.message === "User already registered"
          ? "En användare med denna e-postadress finns redan"
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Konto skapat!",
        description: "Du kan nu logga in.",
      });
      navigate("/admin");
    }
  };

  if (authLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-background"
        role="status"
        aria-label="Laddar"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Laddar autentisering...</span>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Logga in - Anläggningsregister</title>
        <meta name="description" content="Logga in för att administrera kommunala anläggningar i registret." />
      </Helmet>
      
      <main 
        className="min-h-screen flex items-center justify-center bg-background p-4"
        role="main"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary"
                aria-hidden="true"
              >
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl" id="auth-title">Anläggningsregister</CardTitle>
            <CardDescription>
              Logga in för att administrera anläggningar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" aria-labelledby="auth-title">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Logga in</TabsTrigger>
                <TabsTrigger value="signup">Registrera</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form 
                  onSubmit={handleSignIn} 
                  className="space-y-4 pt-4"
                  aria-label="Inloggningsformulär"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-post</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="din@email.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      aria-describedby="signin-email-hint"
                    />
                    <span id="signin-email-hint" className="sr-only">
                      Ange din e-postadress för inloggning
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Lösenord</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      aria-describedby="signin-password-hint"
                    />
                    <span id="signin-password-hint" className="sr-only">
                      Ange ditt lösenord
                    </span>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    {loading ? "Loggar in..." : "Logga in"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form 
                  onSubmit={handleSignUp} 
                  className="space-y-4 pt-4"
                  aria-label="Registreringsformulär"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Namn</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Ditt namn"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-post</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="din@email.se"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Lösenord</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Minst 6 tecken"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      aria-describedby="password-requirements"
                    />
                    <span id="password-requirements" className="text-xs text-muted-foreground">
                      Lösenordet måste vara minst 6 tecken
                    </span>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                    {loading ? "Skapar konto..." : "Skapa konto"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default AuthPage;