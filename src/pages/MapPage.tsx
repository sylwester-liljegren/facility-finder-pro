import { Header } from "@/components/Header";
import { SkipLink } from "@/components/SkipLink";
import { Helmet } from "react-helmet-async";

const MapPage = () => {
  return (
    <>
      <Helmet>
        <title>Kartvyn - Anläggningsregister</title>
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <SkipLink targetId="map-content">Hoppa till kartan</SkipLink>
        <Header />
        <main id="map-content" className="flex-1 flex items-center justify-center" role="main">
          <p className="text-muted-foreground text-lg">Kartvyn är tom – bygg den med en prompt</p>
        </main>
      </div>
    </>
  );
};

export default MapPage;
