import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Copy, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { parseMaintenanceEmail, buildNote, type ParsedFields } from "@/utils/maintenanceParser";
import { cn } from "@/lib/utils";

const Index = () => {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => parseMaintenanceEmail(raw), [raw]);
  const note = useMemo(() => buildNote(parsed), [parsed]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      toast.success("Note copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const getConfidenceColor = (confident: boolean) => {
    return confident ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400";
  };

  const getConfidenceIcon = (confident: boolean) => {
    return confident ? CheckCircle : AlertTriangle;
  };

  return (
    <div className="bg-background py-8">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-hero bg-clip-text text-transparent">
            Maintenance Note Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform raw carrier maintenance emails into professional customer notifications. 
            Features intelligent parsing with confidence indicators and timezone detection.
          </p>
        </div>

        <Card className="mx-auto max-w-4xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">📧 Raw Maintenance Email</CardTitle>
            <CardDescription>
              Paste the carrier's maintenance email. Auto-detects carrier, times, circuit IDs, and maintenance type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="raw">Email Content</Label>
              <Textarea 
                id="raw" 
                value={raw} 
                onChange={(e) => setRaw(e.target.value)} 
                placeholder="Dear AT&T IP Services Customer:

AT&T Network Engineers will be performing a maintenance on Phoenix GAR 1. The work will be performed on 09/11/2025, during the maintenance window of 12:00AM-6:00AM, local time.

Our access provider's engineers will be performing a(n) IOS UPGRADE.

Our trouble ticket number is 335981103.

Below are the affected circuit(s) for which you are listed as a contact.
IUEC.639083..ATI
Address: 2398 E CAMELBACK RD PHOENIX, AZ 85016"
                className="min-h-[220px] font-mono text-sm" 
              />
            </div>

            <div className="flex flex-wrap gap-3 justify-between">
              <Button type="button" onClick={() => setRaw("")} variant="outline">
                Clear
              </Button>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  onClick={handleCopy} 
                  disabled={!raw.trim()} 
                  aria-disabled={!raw.trim()}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Note"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parsed Data Confidence Indicators */}
        {raw.trim() && (
          <Card className="mx-auto max-w-4xl">
            <CardHeader>
              <CardTitle className="text-xl">🎯 Field Detection Summary</CardTitle>
              <CardDescription>
                Review auto-detected fields. Yellow indicators suggest manual verification may be needed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Carrier</p>
                    <p className="text-sm text-muted-foreground">{parsed.carrier}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", getConfidenceColor(parsed.confidence.carrier))}>
                    {getConfidenceIcon(parsed.confidence.carrier)({ className: "h-4 w-4" })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-sm text-muted-foreground capitalize">{parsed.maintenanceType}</p>
                  </div>
                  <Badge variant={parsed.maintenanceType === "emergency" ? "destructive" : "secondary"}>
                    {parsed.maintenanceType}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Circuit ID</p>
                    <p className="text-sm text-muted-foreground">{parsed.referenceId}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", getConfidenceColor(parsed.confidence.referenceId))}>
                    {getConfidenceIcon(parsed.confidence.referenceId)({ className: "h-4 w-4" })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{parsed.address}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", getConfidenceColor(parsed.confidence.address))}>
                    {getConfidenceIcon(parsed.confidence.address)({ className: "h-4 w-4" })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Time Window</p>
                    <p className="text-sm text-muted-foreground">{parsed.timeLength}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", getConfidenceColor(parsed.confidence.times))}>
                    {getConfidenceIcon(parsed.confidence.times)({ className: "h-4 w-4" })}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Ticket #</p>
                    <p className="text-sm text-muted-foreground">{parsed.ticketNumber}</p>
                  </div>
                  <div className={cn("flex items-center gap-1", getConfidenceColor(parsed.confidence.ticketNumber))}>
                    {getConfidenceIcon(parsed.confidence.ticketNumber)({ className: "h-4 w-4" })}
                  </div>
                </div>
              </div>

              {/* Show warning if any fields have low confidence */}
              {Object.values(parsed.confidence).some(c => !c) && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Some fields could not be detected with high confidence. Please review the generated note before sending to customers.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mx-auto max-w-4xl">
          <CardHeader>
            <CardTitle className="text-xl">📝 Generated Customer Note</CardTitle>
            <CardDescription>
              Professional customer notification with bold key information, ready to send.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm md:text-base leading-relaxed font-sans">
                {note}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
