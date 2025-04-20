
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { FormData } from "@/types/form";

interface UserDetailsFormProps {
  formData: FormData;
  previewUrl: string | null;
  isSubmitting: boolean;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserDetailsForm = ({
  formData,
  previewUrl,
  isSubmitting,
  onChange,
  onSubmit
}: UserDetailsFormProps) => {
  return (
    <div className="space-y-4">
      {previewUrl && (
        <div className="relative h-48 rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="Your name"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="Your phone number"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="Your email"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </Button>
    </div>
  );
};

export default UserDetailsForm;
