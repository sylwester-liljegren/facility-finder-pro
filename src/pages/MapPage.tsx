import { Header } from "@/components/Header";
import { FacilityMap } from "@/components/FacilityMap";

const MapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Kartvyn
          </h1>
          <p className="text-muted-foreground">
            Se anläggningar på kartan. Klicka på en markör för att se detaljer.
          </p>
        </div>
        
        <FacilityMap />
      </main>
    </div>
  );
};

export default MapPage;