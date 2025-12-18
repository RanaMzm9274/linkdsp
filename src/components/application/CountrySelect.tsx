import { countries } from '@/lib/countries';
import { Label } from '@/components/ui/label';

interface CountrySelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function CountrySelect({ label, name, value, onChange, required, error }: CountrySelectProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className={error ? 'text-destructive' : ''}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-10 px-3 rounded-md border bg-background text-foreground 
          ${error ? 'border-destructive' : 'border-input'}`}
      >
        <option value="">Select country</option>
        {countries.map((country) => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
