import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  name: string;
  phone: string;
  email: string;
  image: File | null;
}

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreviewUrl(URL.createObjectURL(file));
        setStep(2);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
      }
    }
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
      // Upload image to Supabase Storage
      const fileExt = formData.image.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('ghibli_artworks')
        .upload(filePath, formData.image);

      if (uploadError) throw uploadError;

      // Save order details to database
      const { error: dbError } = await supabase
        .from('print_orders')
        .insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          image_path: filePath,
        });

      if (dbError) throw dbError;

      toast({
        title: "Order received!",
        description: "We'll contact you soon about your Ghibli art print.",
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        image: null
      });
      setPreviewUrl(null);
      setStep(1);
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
    <Card className="w-full max-w-md p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-sen font-bold text-foreground">Merqry Prints</h1>
        <p className="text-muted-foreground">Transform your Ghibli art into beautiful prints</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted p-8 rounded-lg">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <Label htmlFor="image" className="cursor-pointer">
                <span className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  <Upload className="w-4 h-4" />
                  <span>Choose Artwork</span>
                </span>
              </Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-sm text-muted-foreground mt-2">Upload your Ghibli artwork (A4 size recommended)</p>
            </div>
          </div>
        ) : (
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Your email"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
};

export default GhibliUploadForm;
