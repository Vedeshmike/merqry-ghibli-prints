
import { ImageIcon, Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
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
  );
};

export default ImageUpload;
