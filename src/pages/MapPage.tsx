import { Header } from "@/components/Header";
import { FacilityMap } from "@/components/FacilityMap";

const MapPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="container py-4 md:py-8">
          <div className="mb-4 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
              Kartvyn
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Se anläggningar på kartan. Klicka på en markör för att se detaljer.
            </p>
          </div>
        </div>
        
        <div className="flex-1 container pb-4 md:pb-8">
          <FacilityMap />
        </div>
      </main>
    </div>
  );
};

export default MapPage;