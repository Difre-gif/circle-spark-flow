import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
  feature: string;
  currentCount: number;
  maxCount: number;
  requiredTier?: string;
}

export function UpgradePrompt({ feature, currentCount, maxCount, requiredTier }: UpgradePromptProps) {
  const navigate = useNavigate();
  return (
    <Alert className="border-bizrent-amber/50 bg-bizrent-amber/10">
      <AlertTriangle className="h-4 w-4 text-bizrent-amber" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          You've reached your plan limit of <strong>{maxCount} {feature}</strong> ({currentCount}/{maxCount} used).
          {requiredTier && <> Upgrade to <strong>{requiredTier}</strong> to add more.</>}
        </span>
        <Button size="sm" variant="outline" onClick={() => navigate('/landlord/settings#billing')}>
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
