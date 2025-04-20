
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ImageUpload from './upload/ImageUpload';
import UserDetailsForm from './upload/UserDetailsForm';
import type { FormData } from '@/types/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GhibliUploadForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Add effect to redirect when success dialog is closed
  useEffect(() => {
    if (!showSuccessDialog && formData.image && isSubmitting === false && step === 2) {
      // This means we've submitted successfully and closed the dialog
      navigate('/', { replace: true });
    }
  }, [showSuccessDialog, navigate, formData.image, isSubmitting, step]);

  const handleImageSelect = (file: File) => {
    setFormData(prev => ({ ...prev, image: file }));
    setPreviewUrl(URL.createObjectURL(file));
    setStep(2);
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
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

    setShowConfirmDialog(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);
    
    try {
      const fileExt = formData.image!.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ghibli_artworks')
        .upload(filePath, formData.image!);

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

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // The redirect will now be handled by the useEffect
  };

  return (
    <>
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-sen font-bold text-foreground">Merqry Prints</h1>
          <p className="text-muted-foreground">Transform your Ghibli art into beautiful prints</p>
        </div>

        <form onSubmit={handleSubmitAttempt} className="space-y-6">
          {step === 1 ? (
            <ImageUpload onImageSelect={handleImageSelect} />
          ) : (
            <UserDetailsForm
              formData={formData}
              previewUrl={previewUrl}
              isSubmitting={isSubmitting}
              onChange={handleFieldChange}
              onSubmit={handleSubmitAttempt}
            />
          )}
        </form>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Your Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Order Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p>Please confirm that this is the correct image for your order.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessDialogClose}>
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
