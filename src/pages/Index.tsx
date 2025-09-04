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
    <div className="bg-background py-8">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-hero bg-clip-text text-transparent">Maintenance Note Generator</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Paste any raw carrier maintenance email and instantly get a clean, client-ready note using the exact required template.</p>
        </div>

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

        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl">Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{note}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
