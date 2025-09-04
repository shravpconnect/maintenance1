import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Clock, Zap } from "lucide-react";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to using the Maintenance Note Generator safely and effectively
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Client-Side Processing</h4>
                <p className="text-sm text-muted-foreground">
                  All email parsing happens directly in your browser. No data is sent to external servers.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">No Data Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Your emails are not stored anywhere. They exist only in your browser's memory while you're using the tool.
                </p>
              </div>
              <Alert>
                <AlertDescription>
                  <strong>100% Safe for Organizational Use:</strong> No sensitive information leaves your computer.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Intelligent Parsing</h4>
                <p className="text-sm text-muted-foreground">
                  Uses pattern recognition to extract key information from maintenance emails.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Smart Timezone Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically detects timezones based on US state abbreviations in addresses.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Circuit ID Recognition</h4>
                <p className="text-sm text-muted-foreground">
                  Identifies various circuit ID formats with intelligent fallbacks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Badge variant="secondary">Step 1</Badge>
                <h4 className="font-semibold">Paste Email</h4>
                <p className="text-sm text-muted-foreground">
                  Copy and paste the raw maintenance email into the input field.
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Step 2</Badge>
                <h4 className="font-semibold">Review Output</h4>
                <p className="text-sm text-muted-foreground">
                  The tool automatically generates a client-ready note in the standard format.
                </p>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">Step 3</Badge>
                <h4 className="font-semibold">Copy & Send</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Copy Note" and paste into your communication platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Supported Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold">Extracted Fields</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Carrier/Provider name</li>
                  <li>• Service address/location</li>
                  <li>• Circuit ID/Reference number</li>
                  <li>• Maintenance duration</li>
                  <li>• Start and end times</li>
                  <li>• Reason for maintenance</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Timezone Support</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• EST/EDT (Eastern)</li>
                  <li>• CST/CDT (Central)</li>
                  <li>• MST/MDT (Mountain)</li>
                  <li>• PST/PDT (Pacific)</li>
                  <li>• Auto-detection from state codes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Format</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`Hello Team,
Please be advised, [CARRIER] will be performing scheduled/emergency maintenance that will impact your service at location [ADDRESS].

Your vCom provided circuit [REFERENCE ID] will be subject to an outage lasting [TIME LENGTH] during this maintenance window (Please note this is an estimate and no guarantee of actual impact). This maintenance is for [REASON]

Start time: [START TIME]
End time: [END TIME]

If you experience service issues after that window, you may need to reboot your equipment. If you continue to have any problems, call our toll-free Technical Support number 800-804-8266 opt 3, and refer to this ticket for further assistance.

Thank you.`}
            </pre>
          </CardContent>
        </Card>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> If any field cannot be automatically detected, it will be marked with brackets (e.g., "[Circuit ID]") for manual review and completion.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Documentation;