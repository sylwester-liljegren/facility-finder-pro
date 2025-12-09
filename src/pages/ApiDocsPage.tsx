import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const BASE_URL = "https://yqmxjfsdeouyhdjnfgpd.supabase.co/functions/v1";

interface EndpointProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  params?: { name: string; type: string; description: string; required?: boolean }[];
  body?: string;
  response?: string;
  requiresAuth?: boolean;
}

function CodeBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-600 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <Badge variant="outline" className={`font-mono ${colors[method] || ""}`}>
      {method}
    </Badge>
  );
}

function Endpoint({ method, path, description, params, body, response, requiresAuth }: EndpointProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <MethodBadge method={method} />
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{path}</code>
          {requiresAuth && (
            <Badge variant="secondary" className="text-xs">
              Requires Auth
            </Badge>
          )}
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {params && params.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Parameters</h4>
            <div className="bg-muted rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((param) => (
                    <tr key={param.name} className="border-b border-border last:border-0">
                      <td className="p-3">
                        <code className="text-xs">{param.name}</code>
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </td>
                      <td className="p-3 text-muted-foreground">{param.type}</td>
                      <td className="p-3 text-muted-foreground">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {body && (
          <div>
            <h4 className="text-sm font-medium mb-2">Request Body</h4>
            <CodeBlock code={body} />
          </div>
        )}
        {response && (
          <div>
            <h4 className="text-sm font-medium mb-2">Response Example</h4>
            <CodeBlock code={response} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground">
              Complete reference for the Facility Registry REST API endpoints.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Base URL</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={BASE_URL} language="text" />
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                All requests require an <code className="bg-muted px-1 py-0.5 rounded">apikey</code> header. 
                Admin API endpoints additionally require a JWT token in the <code className="bg-muted px-1 py-0.5 rounded">Authorization</code> header.
              </p>
              <CodeBlock
                code={`// Headers for Public API
{
  "apikey": "your-anon-key"
}

// Headers for Admin API
{
  "apikey": "your-anon-key",
  "Authorization": "Bearer your-jwt-token",
  "Content-Type": "application/json"
}`}
              />
            </CardContent>
          </Card>

          <Tabs defaultValue="public" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="public">Public API</TabsTrigger>
              <TabsTrigger value="admin">Admin API</TabsTrigger>
            </TabsList>

            <TabsContent value="public">
              <ScrollArea className="h-auto">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold mb-4">Public API Endpoints</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Read-only endpoints accessible without user authentication. Only the API key is required.
                  </p>

                  <Endpoint
                    method="GET"
                    path="/public-api?action=facilities"
                    description="Retrieve all facilities with related data including municipality, facility type, geometry, and attributes."
                    params={[
                      { name: "action", type: "string", description: "Set to 'facilities'", required: true },
                      { name: "id", type: "number", description: "Filter by facility ID" },
                      { name: "kommun_id", type: "number", description: "Filter by municipality ID" },
                      { name: "facility_type_id", type: "number", description: "Filter by facility type ID" },
                    ]}
                    response={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Eriksdalsbadet",
      "address": "Hammarby Slussväg 20",
      "city": "Stockholm",
      "postal_code": "118 60",
      "kommun": { "id": 1, "kommun_namn": "Stockholm" },
      "facility_type": { "id": 1, "label": "Simhall" },
      "facility_geometry": { "latitude": 59.3056, "longitude": 18.0741 }
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="GET"
                    path="/public-api?action=facilities-map"
                    description="Retrieve facilities optimized for map display. Only returns facilities with valid coordinates."
                    params={[
                      { name: "action", type: "string", description: "Set to 'facilities-map'", required: true },
                    ]}
                    response={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Eriksdalsbadet",
      "facility_type": { "label": "Simhall" },
      "facility_geometry": { "latitude": 59.3056, "longitude": 18.0741 }
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="GET"
                    path="/public-api?action=municipalities"
                    description="Retrieve all municipalities."
                    params={[
                      { name: "action", type: "string", description: "Set to 'municipalities'", required: true },
                    ]}
                    response={`{
  "success": true,
  "data": [
    { "id": 1, "kommun_namn": "Stockholm", "kommun_kod": "0180" },
    { "id": 2, "kommun_namn": "Göteborg", "kommun_kod": "1480" }
  ],
  "count": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="GET"
                    path="/public-api?action=facility-types"
                    description="Retrieve all facility types."
                    params={[
                      { name: "action", type: "string", description: "Set to 'facility-types'", required: true },
                    ]}
                    response={`{
  "success": true,
  "data": [
    { "id": 1, "code": "POOL", "label": "Simhall", "description": "Swimming facility" },
    { "id": 2, "code": "GYM", "label": "Gym", "description": "Fitness center" }
  ],
  "count": 2,
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="admin">
              <ScrollArea className="h-auto">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold mb-4">Admin API Endpoints</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Protected endpoints for facility management. Requires JWT authentication.
                  </p>

                  <Endpoint
                    method="GET"
                    path="/admin-api?action=facilities"
                    description="Retrieve facilities (admin view). Can filter by ID or municipality."
                    requiresAuth
                    params={[
                      { name: "action", type: "string", description: "Set to 'facilities'", required: true },
                      { name: "id", type: "number", description: "Filter by facility ID" },
                      { name: "kommun_id", type: "number", description: "Filter by municipality ID" },
                    ]}
                    response={`{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Eriksdalsbadet",
      "address": "Hammarby Slussväg 20",
      "kommun_id": 1,
      "facility_type_id": 1
    }
  ],
  "count": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="POST"
                    path="/admin-api?action=create-facility"
                    description="Create a new facility with optional geometry."
                    requiresAuth
                    params={[
                      { name: "action", type: "string", description: "Set to 'create-facility'", required: true },
                    ]}
                    body={`{
  "name": "New Sports Facility",
  "address": "Example Street 123",
  "city": "Stockholm",
  "postal_code": "12345",
  "kommun_id": 1,
  "facility_type_id": 1,
  "external_id": "EXT-001",
  "latitude": 59.3293,
  "longitude": 18.0686
}`}
                    response={`{
  "success": true,
  "data": {
    "id": 5,
    "name": "New Sports Facility",
    "address": "Example Street 123",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="PUT"
                    path="/admin-api?action=update-facility"
                    description="Update an existing facility. Include the facility ID in the request body."
                    requiresAuth
                    params={[
                      { name: "action", type: "string", description: "Set to 'update-facility'", required: true },
                    ]}
                    body={`{
  "id": 1,
  "name": "Updated Facility Name",
  "address": "New Address 456",
  "city": "Gothenburg",
  "postal_code": "54321",
  "kommun_id": 1,
  "facility_type_id": 2,
  "latitude": 57.7089,
  "longitude": 11.9746
}`}
                    response={`{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Facility Name",
    "updated_at": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />

                  <Endpoint
                    method="DELETE"
                    path="/admin-api?action=delete-facility&id=1"
                    description="Delete a facility by ID."
                    requiresAuth
                    params={[
                      { name: "action", type: "string", description: "Set to 'delete-facility'", required: true },
                      { name: "id", type: "number", description: "Facility ID to delete", required: true },
                    ]}
                    response={`{
  "success": true,
  "message": "Facility deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}`}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
