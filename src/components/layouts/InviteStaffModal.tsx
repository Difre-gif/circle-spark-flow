import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useInviteStaff } from '@/hooks/useSupabaseData';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteStaffModal({ isOpen, onClose }: InviteStaffModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'ACCOUNTANT'>('MANAGER');
  
  const inviteStaff = useInviteStaff();

  const handleInvite = async () => {
    if (!email) return;
    
    await inviteStaff.mutateAsync(
      { email, role },
      {
        onSuccess: () => {
          setEmail('');
          onClose();
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('legacy.inviteTeamMember')}</DialogTitle>
          <DialogDescription>
            {t('legacy.sendAnInvitationToANewStaffMemberToJoinYourOrganisation')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('legacy.emailAddress')} <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteStaff.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t('legacy.systemRole')} <span className="text-red-500">*</span></Label>
            <Select
              value={role}
              onValueChange={(val: any) => setRole(val)}
              disabled={inviteStaff.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">{t('legacy.manager')}</SelectItem>
                <SelectItem value="ACCOUNTANT">{t('legacy.accountant')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {t('legacy.managersHaveOperationalAccessAccountantsHaveViewOnlyPropertyAccessButF')}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={inviteStaff.isPending}>
            {t('legacy.cancel')}
          </Button>
          <Button onClick={handleInvite} className="bg-bizrent-navy hover:bg-bizrent-navy/90" disabled={!email || inviteStaff.isPending}>
            {inviteStaff.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
