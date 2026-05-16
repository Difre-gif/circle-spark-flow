import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SuperAdminPlaceholder({ title, description }: { title: string, description: string }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground font-medium">{description}</p>
      </div>
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>{t('legacy.comingSoon')}</CardTitle>
          <CardDescription>{t('legacy.thisModuleIsUnderDevelopment')}</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center italic text-muted-foreground">
          {t('legacy.scaffoldingInProgress')}
        </CardContent>
      </Card>
    </div>
  );
}
