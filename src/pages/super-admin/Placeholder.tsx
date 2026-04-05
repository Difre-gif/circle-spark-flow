import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SuperAdminPlaceholder({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500 font-medium">{description}</p>
      </div>
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>This module is under development.</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center italic text-slate-400">
          Scaffolding in progress...
        </CardContent>
      </Card>
    </div>
  );
}
