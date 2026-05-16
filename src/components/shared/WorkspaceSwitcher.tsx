import { Building2, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Workspace {
  id: string;
  name: string;
  role?: string;
}

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeId: string | null;
  onSwitch: (id: string) => void;
  isCollapsed?: boolean;
  /** Label shown above the workspace list in the dropdown */
  dropdownLabel?: string;
}

/**
 * Shared workspace switcher used across all role sidebars.
 * Visual design is identical regardless of role.
 */
export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onSwitch,
  isCollapsed = false,
  dropdownLabel = 'Organizations',
}: WorkspaceSwitcherProps) {
  const active = workspaces.find(w => w.id === activeId) ?? workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "h-12 rounded-2xl border border-white/10 bg-white/5 hover:bg-muted/10 hover:text-white text-white shadow-sm transition-all flex items-center outline-none",
            isCollapsed
              ? "mx-auto w-12 justify-center px-0"
              : "w-full gap-3 px-2"
          )}
          aria-label="Switch workspace"
        >
          <div className="h-8 w-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden flex-1">
              <span className="text-sm font-bold text-white truncate w-full text-left">
                {active?.name ?? 'Select workspace'}
              </span>
              <span className="text-xxs text-white/70 font-medium uppercase tracking-widest">Workspace</span>
            </div>
          )}
          {!isCollapsed && <ChevronsUpDown className="ml-auto h-4 w-4 text-white/50 shrink-0" />}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[212px] rounded-2xl shadow-xl border-border/40 p-1.5" align="start" sideOffset={12}>
        <DropdownMenuLabel className="text-xxs text-muted-foreground uppercase tracking-widest font-extrabold px-2 py-2">
          {dropdownLabel}
        </DropdownMenuLabel>

        {workspaces.map(ws => (
          <DropdownMenuItem
            key={ws.id}
            className={cn(
              'py-2.5 px-2.5 cursor-pointer rounded-xl focus:bg-muted/40 flex items-center gap-2.5 mb-1',
              ws.id === activeId ? 'font-bold text-bizrent-navy dark:text-white bg-muted/50' : 'font-medium text-muted-foreground'
            )}
            onClick={() => ws.id !== activeId && onSwitch(ws.id)}
          >
            <div
              className={cn(
                'h-6 w-6 rounded flex items-center justify-center',
                ws.id === activeId ? 'bg-bizrent-blue/10 text-bizrent-blue' : 'bg-muted text-muted-foreground'
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs">{ws.name}</span>
              {ws.role && ws.role !== 'OWNER' && (
                <span className="text-xxxs uppercase tracking-widest opacity-60 font-extrabold">{ws.role}</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        {workspaces.length === 0 && (
          <DropdownMenuSeparator />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
