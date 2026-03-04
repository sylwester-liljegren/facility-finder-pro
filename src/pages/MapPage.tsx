import { Header } from "@/components/Header";
import { FacilityMap } from "@/components/FacilityMap";
import { SkipLink } from "@/components/SkipLink";
import { Helmet } from "react-helmet-async";

const MapPage = () => {
  return (
    <>
      <Helmet>
        <title>Kartvyn - Anläggningsregister</title>
        <meta name="description" content="Se kommunala anläggningar på en interaktiv karta. Sök och hitta idrottsanläggningar, simhallar och fritidsanläggningar i Sverige." />
      </Helmet>
      
      <div className="min-h-screen bg-background flex flex-col">
        <SkipLink targetId="map-content">Hoppa till kartan</SkipLink>
        
        <Header />
        
        <main id="map-content" className="flex-1 flex flex-col" role="main">
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
    </>
  );
};

export default MapPage;