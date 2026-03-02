import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  className,
  ...props
}: AccordionPrimitive.AccordionItemProps) => (
  <AccordionPrimitive.Item
    className={cn('border-b last:border-b-0', className)}
    {...props}
  />
);
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = ({
  className,
  children,
  ...props
}: AccordionPrimitive.AccordionTriggerProps) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        'flex flex-1 items-center justify-between py-2 text-left text-sm font-medium transition-all',
        'hover:underline focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = ({
  className,
  children,
  ...props
}: AccordionPrimitive.AccordionContentProps) => (
  <AccordionPrimitive.Content
    className={cn(
      'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm',
      className,
    )}
    {...props}
  >
    <div className="pb-4 pt-1">{children}</div>
  </AccordionPrimitive.Content>
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
