import LMSGuides from "@/components/LMSGuides";
import { useEditMode } from "@/contexts/EditModeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlobalLearningGuides from "@/components/UECampusGuides";

export default function Guides() {
  const { isAdmin } = useEditMode();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Learning Guides
        </h1>
        <p className="text-muted-foreground mt-1">
          LMS tutorials and Global Learning video guides
        </p>
      </div>

      <Tabs defaultValue="lms-guides" className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="lms-guides">LMS Guides</TabsTrigger>
          <TabsTrigger value="global-learning-guides">Global Learning Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="lms-guides" className="mt-6">
          <LMSGuides isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="global-learning-guides" className="mt-6">
          <GlobalLearningGuides isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
