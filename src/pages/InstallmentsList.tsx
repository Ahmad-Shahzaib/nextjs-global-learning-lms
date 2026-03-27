import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstallmentsList() {
  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="shadow-lg border-border/50 ">
        <CardHeader>
          <CardTitle>Installments List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder page for the Installments List section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
