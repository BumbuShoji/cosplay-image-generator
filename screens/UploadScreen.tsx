
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { UploadedImageFile, GeneratedImage } from '../types';
import { generateCosplayImage } from '../services/geminiService';
import { useQuota } from '../contexts/QuotaContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { GEMINI_IMAGE_MODEL } from '../constants';
import SubscriptionModal from '../components/SubscriptionModal'; // Import SubscriptionModal

interface UploadScreenProps {
  setLatestGeneratedImage: (image: GeneratedImage | null) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ setLatestGeneratedImage }) => {
  const [personImage, setPersonImage] = useState<UploadedImageFile | null>(null);
  const [characterImage, setCharacterImage] = useState<UploadedImageFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { quota, canGenerate, incrementUsage, isLoadingQuota } = useQuota();
  const { addImageToHistory } = useHistory();
  const { currentUser, isLoadingAuth, login } = useAuth();

  const handleGenerate = useCallback(async () => {
    if (!currentUser) {
      setError("Please log in to generate images.");
      return;
    }
    if (!personImage || !characterImage) {
      setError("Please upload both your photo and a character image.");
      return;
    }
    if (!canGenerate()) {
      setError(quota.isSubscribed ? "You've reached your monthly generation limit." : "You've used all your free generations.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { base64ImageData, finalPrompt } = await generateCosplayImage({
        personImageFile: personImage.file,
        characterImageFile: characterImage.file
      });
      
      const newGeneratedImage: GeneratedImage = {
        id: `gen_${Date.now()}`,
        prompt: finalPrompt, 
        base64Data: base64ImageData,
        createdAt: Date.now(),
      };

      addImageToHistory(newGeneratedImage);
      incrementUsage();
      setLatestGeneratedImage(newGeneratedImage);
      navigate('/result');

    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "An unknown error occurred during image generation.");
    } finally {
      setIsLoading(false);
    }
  }, [personImage, characterImage, currentUser, canGenerate, incrementUsage, addImageToHistory, navigate, setLatestGeneratedImage, quota.isSubscribed]);

  if (isLoadingAuth || isLoadingQuota) {
    return <LoadingSpinner text="Loading your creative space..." />;
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto text-center py-10 sm:py-16 bg-frosted/70 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-candy mb-4 font-heading">Welcome, Magical Creator!</h1>
        <p className="text-plum/80 mb-6 text-lg">
          Please log in with your Google account to start generating amazing cosplay images.
        </p>
        <Button onClick={login} variant="primary-gradient" size="lg" className="rounded-full px-8 py-3">
          Login with Google (Mock)
        </Button>
      </div>
    );
  }

  const generationsLeft = quota.limit - quota.used;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 sm:mb-8 text-candy tracking-wide font-heading leading-heading">Make Your Cosplay Magic Bloom!</h1>
        <p className="text-center text-plum/80 mb-8 sm:mb-10 text-lg font-body">
          Upload your photo and a character image for inspiration. Our AI will then generate a unique cosplay image for you!
          You have <span className="font-bold text-candy">{generationsLeft < 0 ? 0 : generationsLeft}</span> {quota.isSubscribed ? 'Pro' : 'free'} generation(s) remaining.
        </p>
        
        {error && (
          <div className="bg-cherry-red/10 border border-cherry-red/30 text-cherry-red px-4 py-3 rounded-lg relative mb-6 font-body" role="alert">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!canGenerate() && quota.used >= quota.limit && (
           <div className="bg-butter-yellow/20 border border-butter-yellow/50 text-plum px-4 py-3 rounded-lg relative mb-6 text-center font-body" role="alert">
            <strong className="font-bold">Quota Reached! </strong>
            <span className="block sm:inline">You have used all your {quota.isSubscribed ? 'Pro' : 'free'} generations ({quota.used}/{quota.limit}).</span>
            {!quota.isSubscribed && (
              <Button onClick={() => setIsSubscriptionModalOpen(true)} variant="warning" size="sm" className="mt-2">
                ✨ Go Pro for More!
              </Button>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8 sm:mb-10">
          <ImageUploader id="person-image" label="Your Photo (Person A)" onImageUpload={setPersonImage} uploadedImage={personImage} />
          <ImageUploader id="character-image" label="Character / Style Reference (Image B)" onImageUpload={setCharacterImage} uploadedImage={characterImage} />
        </div>

        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={!personImage || !characterImage || isLoading || !canGenerate() || !currentUser}
            isLoading={isLoading}
            size="lg"
            variant="primary-gradient"
            className="w-full sm:w-auto px-10 py-3 text-lg rounded-full"
          >
            {isLoading ? 'Generating...' : '✨ Generate Cosplay Image ✨'}
          </Button>
        </div>
         <div className="mt-10 sm:mt-12 p-6 bg-frosted/70 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-candy mb-3 font-heading leading-heading">How it works:</h3>
          <ul className="list-disc list-inside text-plum/90 space-y-2 text-sm sm:text-base font-body leading-body">
              <li>Upload a clear photo of yourself.</li>
              <li>Upload an image of a character or style you like for inspiration.</li>
              <li>Our AI first generates a detailed textual description (prompt) based on your uploaded images and a guiding instruction.</li>
              <li>This AI-generated prompt is then used with the <span className="font-semibold text-candy">{`${GEMINI_IMAGE_MODEL}`}</span> model to create your unique cosplay image.</li>
              <li>The generated image is unique and not a direct merge or face swap of the uploaded images.</li>
          </ul>
        </div>
      </div>
      <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
    </>
  );
};

export default UploadScreen;
