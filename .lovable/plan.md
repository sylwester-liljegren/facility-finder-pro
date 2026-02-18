
## Rensa kartvyn till blank page

Målet är att tömma kartvyn helt så att du kan demonstrera för konferensdeltagarna hur man går från noll till en fullt fungerande kartvy med en enda prompt.

### Vad som rensas

Tre filer skrivs om till minimalt innehåll:

**1. `src/pages/MapPage.tsx`**
Behåller rutten och sidhuvudet, men ersätter allt kartinnehåll med en enkel platshållartext:
```
"Kartvyn är tom – bygg den med en prompt"
```

**2. `src/components/FacilityMap.tsx`**
Töms helt – exporterar bara en tom komponent som returnerar `null`.

**3. `src/components/MapLibreMap.tsx`**
Töms helt – exporterar bara en tom komponent som returnerar `null`.

### Vad som bevaras

- Routing (`/map`) fungerar fortfarande
- Header och sidstruktur finns kvar
- Alla typer i `src/types/facility.ts` lämnas orörda
- API-hooks i `useFacilities.ts` lämnas orörda
- `maplibre-gl` paketet lämnas installerat

### Resultat

När du navigerar till `/map` ser du en blank sida med bara en rubrik och platshållartext, redo att byggas upp från grunden med konferensprompten.
