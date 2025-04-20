
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImageUpload from './upload/ImageUpload';
import UserDetailsForm from './upload/UserDetailsForm';
import type { FormData } from '@/types/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const GhibliUploadForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleImageSelect = (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
    setStep(2);
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast({
        title: "Image required",
        description: "Please upload your Ghibli artwork",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name and phone number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ghibli_artworks')
        .upload(filePath, formData.image);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('print_orders')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          image_path: filePath,
        });

      if (dbError) throw dbError;

      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-sen font-bold text-foreground">Merqry Prints</h1>
          <p className="text-muted-foreground">Transform your Ghibli art into beautiful prints</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <ImageUpload onImageSelect={handleImageSelect} />
          ) : (
            <UserDetailsForm
              formData={formData}
              previewUrl={previewUrl}
              isSubmitting={isSubmitting}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
            />
          )}
        </form>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Submitted Successfully!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p>Thank you for your order. We will follow up with you and get your order delivered as soon as possible.</p>
            <p className="text-muted-foreground">Our team will contact you at the provided phone number: {formData.phone}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GhibliUploadForm;
