import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
}

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground border-b border-border pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
