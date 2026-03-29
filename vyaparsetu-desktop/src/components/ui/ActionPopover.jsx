import React from 'react';
import * as Popover from '@radix-ui/react-popover';

export default function ActionPopover({ 
  trigger, 
  actions = [], 
  align = "center",
  side = "bottom" 
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild className="outline-none">
        {trigger}
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          className="z-[999] bg-[#007AFF] rounded-2xl p-1.5 shadow-glow-blue border border-white/20 min-w-[200px] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=right]:slide-in-from-left-2 data-[side=left]:slide-in-from-right-2 select-none"
        >
          <div className="flex flex-col">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-[13px] font-bold text-white transition-all active:scale-95 text-left outline-none ${
                    action.destructive 
                      ? 'hover:bg-[#f87171] hover:shadow-inner' 
                      : 'hover:bg-white/20'
                  }`}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  <span className="tracking-wide uppercase tracking-widest">{action.label}</span>
                </button>
              );
            })}
          </div>
          
          <Popover.Arrow className="fill-[#007AFF] w-4 h-2" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}