
import React, { useState, useCallback, ChangeEvent } from 'react';
import { UploadedImageFile } from '../types';
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB } from '../constants';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageUpload: (imageFile: UploadedImageFile | null) => void;
  uploadedImage: UploadedImageFile | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageUpload, uploadedImage }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        setError(`File is too large. Max size: ${MAX_UPLOAD_SIZE_MB}MB.`);
        onImageUpload(null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Only JPG, PNG, WEBP are allowed.');
        onImageUpload(null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpload({
          id: `${id}-${Date.now()}`,
          file: file,
          previewUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
        onImageUpload(null);
    }
    event.target.value = '';
  }, [id, onImageUpload]);

  const clearImage = useCallback(() => {
    setError(null);
    onImageUpload(null);
  }, [onImageUpload]);

  return (
    <div className="w-full p-6 border-2 border-dashed border-mochi bg-frosted rounded-2xl hover:border-candy/70 transition-colors duration-200">
      <label htmlFor={id} className="block text-sm font-medium text-plum mb-2 font-body">{label}</label>
      {uploadedImage?.previewUrl ? (
        <div className="mt-2 text-center">
          <img src={uploadedImage.previewUrl} alt={`${label} preview`} className="max-h-60 w-auto mx-auto rounded-lg shadow-lg object-contain border border-mochi/30" />
          <button
            onClick={clearImage}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-semibold rounded-md shadow-sm text-pearl bg-cherry-red hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-frosted focus:ring-cherry-red font-body"
          >
            Clear Image
          </button>
        </div>
      ) : (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-mochi/70" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-plum/80 font-body">
              <label
                htmlFor={id}
                className="relative cursor-pointer bg-pearl/50 rounded-md font-medium text-candy hover:text-opacity-80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-frosted focus-within:ring-candy px-2 py-1"
              >
                <span>Upload a file</span>
                <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg,image/png,image/webp" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-plum/70 font-body">PNG, JPG, WEBP up to {MAX_UPLOAD_SIZE_MB}MB</p>
          </div>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-cherry-red font-body">{error}</p>}
    </div>
  );
};

export default ImageUploader;