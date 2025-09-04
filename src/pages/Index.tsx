import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { parseMaintenanceEmail, buildNote } from "@/utils/maintenanceParser";

const Index = () => {
  const [raw, setRaw] = useState("");
  const parsed = useMemo(() => parseMaintenanceEmail(raw), [raw]);
  const note = useMemo(() => buildNote(parsed), [parsed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      toast.success("Note copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-hero animate-gradient-pan">
        <div className="container mx-auto py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground text-center">Maintenance Note Generator</h1>
          <p className="mt-3 text-primary-foreground/90 text-center max-w-2xl mx-auto">Paste any raw carrier maintenance email and instantly get a clean, client-ready note using the exact required template.</p>
        </div>
      </header>

      <main className="container mx-auto -mt-10 pb-20">
        <Card className="mx-auto max-w-4xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="raw">Raw maintenance email</Label>
              <Textarea id="raw" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Paste the raw email text here..." className="min-h-[220px]" />
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              <Button type="button" onClick={() => setRaw("")}>Clear</Button>
              <div className="flex gap-3">
                <Button type="button" onClick={handleCopy} disabled={!raw.trim()} aria-disabled={!raw.trim()}>Copy Note</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="mx-auto max-w-4xl mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Output</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{note}</pre>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
