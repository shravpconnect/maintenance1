import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Common questions about the Maintenance Note Generator
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="security">
                <AccordionTrigger>Is it safe to use with sensitive maintenance emails?</AccordionTrigger>
                <AccordionContent>
                  Yes, absolutely. All processing happens locally in your browser. No data is transmitted to external servers, stored in databases, or cached anywhere. Your maintenance emails never leave your computer, making it 100% safe for organizational use with sensitive information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-storage">
                <AccordionTrigger>Where is my data stored?</AccordionTrigger>
                <AccordionContent>
                  Your data is not stored anywhere. The tool processes emails in real-time within your browser's memory. When you refresh the page or close the browser, all data is immediately cleared. There are no servers, databases, or persistent storage involved.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="parsing-accuracy">
                <AccordionTrigger>How accurate is the email parsing?</AccordionTrigger>
                <AccordionContent>
                  The parser uses advanced pattern recognition to identify key information with high accuracy. It handles multiple email formats, circuit ID patterns, and automatically detects timezones based on US state codes. When information cannot be confidently extracted, it's marked with brackets (e.g., "[Circuit ID]") for manual review.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="supported-formats">
                <AccordionTrigger>What email formats are supported?</AccordionTrigger>
                <AccordionContent>
                  The tool supports emails from major carriers including AT&T, Verizon, Comcast, CenturyLink, and others. It can parse various date formats (MM/DD/YYYY, Month DD, YYYY), time formats (12h/24h), and multiple circuit ID patterns. If your specific format isn't recognized, the tool will still attempt to extract information using intelligent fallbacks.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timezone-detection">
                <AccordionTrigger>How does timezone detection work?</AccordionTrigger>
                <AccordionContent>
                  The tool first looks for explicit timezone mentions in the email (EST, CST, PST, etc.). If none are found, it examines the service address for US state abbreviations and automatically maps them to the correct timezone. For example, FL addresses default to EST, TX addresses to CST, etc.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="missing-information">
                <AccordionTrigger>What happens if some information is missing from the email?</AccordionTrigger>
                <AccordionContent>
                  When the parser cannot confidently identify required information, it inserts placeholder text in brackets (e.g., "[Carrier Name]", "[Circuit ID]"). This makes it easy to spot what needs manual completion before sending the note to customers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customization">
                <AccordionTrigger>Can I customize the output template?</AccordionTrigger>
                <AccordionContent>
                  Currently, the tool uses a standardized template that follows industry best practices for customer maintenance notifications. This ensures consistency and includes all required information like contact details and disclaimers. The template is optimized for professional customer communications.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="multiple-circuits">
                <AccordionTrigger>Does it handle emails with multiple circuits?</AccordionTrigger>
                <AccordionContent>
                  The current version extracts the first circuit ID it finds. For emails containing multiple circuits, you may need to manually edit the output to include all affected circuits, or process each circuit separately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-requirements">
                <AccordionTrigger>What are the technical requirements?</AccordionTrigger>
                <AccordionContent>
                  The tool works in any modern web browser (Chrome, Firefox, Safari, Edge) and requires no installation, plugins, or special software. It works entirely with HTML5 and JavaScript, making it accessible from any device with internet access.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="offline-usage">
                <AccordionTrigger>Can I use this tool offline?</AccordionTrigger>
                <AccordionContent>
                  Once the page is loaded, the core parsing functionality works offline since it runs entirely in your browser. However, you'll need an internet connection to initially load the application and to copy the output to cloud-based communication platforms.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="error-handling">
                <AccordionTrigger>What if the parser makes a mistake?</AccordionTrigger>
                <AccordionContent>
                  Always review the generated output before sending to customers. The tool provides a preview where you can verify all extracted information. You can manually edit any field that was incorrectly parsed before copying the final note.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="support">
                <AccordionTrigger>How do I report issues or request features?</AccordionTrigger>
                <AccordionContent>
                  If you encounter parsing issues with specific email formats or need additional features, please contact the development team with examples of the problematic emails (with sensitive information redacted). This helps improve the parser's accuracy for future updates.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;