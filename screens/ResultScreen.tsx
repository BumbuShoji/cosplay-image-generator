
import React, { useState, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { GeneratedImage } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { useQuota } from '../contexts/QuotaContext';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { generateCosplayImage } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import { MIME_TYPE_JPEG } from '../constants';
import SubscriptionModal from '../components/SubscriptionModal'; // Import SubscriptionModal

interface ResultScreenProps {
  generatedImage: GeneratedImage | null;
  setLatestGeneratedImage: (image: GeneratedImage | null) => void;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5L3 12m0 0l4.217 2.343m0 0l9.566 5.314m0 0a2.25 2.25 0 103.932 2.186 2.25 2.25 0 00-3.932-2.186zm0 0l-9.566-5.314m9.566 5.314l-9.566-5.314" />
</svg>
);

const RegenerateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);


const ResultScreen: React.FC<ResultScreenProps> = ({ generatedImage, setLatestGeneratedImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationError, setRegenerationError] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const navigate = useNavigate();
  const { quota, canGenerate, incrementUsage } = useQuota();
  const { addImageToHistory, history } = useHistory();
  const { currentUser } = useAuth(); // Get current user

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = `data:${MIME_TYPE_JPEG};base64,${generatedImage.base64Data}`;
    link.download = `cosplay_magic_${generatedImage.id}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage]);

  const handleShare = useCallback(async () => {
    if (!generatedImage) return;
    const dataUrl = `data:${MIME_TYPE_JPEG};base64,${generatedImage.base64Data}`;
    const shareFilename = `cosplay_magic_${generatedImage.id}.jpeg`;
    const shareTitle = 'My AI Cosplay Magic!';
    const shareText = 'Check out this magical cosplay image I generated!';
    
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], shareFilename, { type: MIME_TYPE_JPEG });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] });
      } else if (navigator.share) {
         await navigator.share({ title: shareTitle, text: shareText });
        alert("Image sharing via direct file might not be supported on this browser/OS. Consider downloading and sharing manually.");
      } else {
        alert('Web Share API is not supported on your browser. Please download the image to share it.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Could not share the image. Please try downloading it.');
    }
  }, [generatedImage]);

  const handleRegenerate = useCallback(async () => {
    if (!currentUser) {
      setRegenerationError("Please log in to regenerate images.");
      return;
    }
    if (!generatedImage || !generatedImage.prompt) {
      setRegenerationError("Cannot regenerate without an initial prompt.");
      return;
    }
    if (!canGenerate()) {
       setRegenerationError(quota.isSubscribed ? "You've reached your monthly regeneration limit." : "You've used all your free generations. Subscribe for more!");
      if (!quota.isSubscribed) {
        setIsSubscriptionModalOpen(true);
      }
      return;
    }
    setIsRegenerating(true);
    setRegenerationError(null);
    try {
      const { base64ImageData, finalPrompt } = await generateCosplayImage({ 
        overridePrompt: generatedImage.prompt 
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
    } catch (err: any) {
      setRegenerationError(err.message || "Failed to regenerate image.");
    } finally {
      setIsRegenerating(false);
    }
  }, [currentUser, canGenerate, incrementUsage, addImageToHistory, setLatestGeneratedImage, generatedImage, quota.isSubscribed]);

  const handleViewInHistory = (image: GeneratedImage) => {
    setLatestGeneratedImage(image);
  };

  if (!currentUser) { // If user logs out while on this screen, redirect
    return <Navigate to="/" replace />;
  }
  if (!generatedImage) {
    return <Navigate to="/" replace />;
  }
  
  const imageSrc = `data:${MIME_TYPE_JPEG};base64,${generatedImage.base64Data}`;
  const iconClasses = "w-5 h-5 stroke-plum/80 group-hover:stroke-candy";

  return (
    <>
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 text-candy tracking-wide font-heading leading-heading">Your Cosplay Magic!</h1>
      <p className="text-center text-plum/80 mb-6 sm:mb-8 font-body">Here's your AI-generated image. Download, share, or conjure another!</p>

      {regenerationError && (
        <div className="bg-cherry-red/10 border border-cherry-red/30 text-cherry-red px-4 py-3 rounded-lg relative mb-6 font-body" role="alert">
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{regenerationError}</span>
          {!quota.isSubscribed && regenerationError.includes("Subscribe for more!") && (
             <Button onClick={() => setIsSubscriptionModalOpen(true)} variant="warning" size="sm" className="mt-2 ml-2">
                ✨ Go Pro
              </Button>
          )}
        </div>
      )}
      
      <div className="bg-frosted/70 p-4 sm:p-6 rounded-2xl shadow-xl mb-8 sm:mb-10">
        <div className="aspect-[1/1] w-full max-w-lg mx-auto bg-pearl/50 rounded-lg overflow-hidden cursor-pointer mb-6 shadow-inner border border-mochi/30" onClick={() => setIsModalOpen(true)}        aria-label="View full resolution image"
        role="button"
        tabIndex={0}
        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && setIsModalOpen(true)}>
          <img 
            src={imageSrc} 
            alt={generatedImage.prompt || "Generated cosplay image"} 
            className="w-full h-full object-contain" 
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 group">
          <Button onClick={handleRegenerate} isLoading={isRegenerating} disabled={isRegenerating || !canGenerate() || !currentUser} variant="secondary" leftIcon={<RegenerateIcon className={iconClasses}/>}>
            Regenerate
          </Button>
          <Button onClick={handleDownload} variant="primary-gradient" className="rounded-full" leftIcon={<DownloadIcon className="w-5 h-5"/>}>
            Download
          </Button>
          <Button onClick={handleShare} variant="outline" leftIcon={<ShareIcon className={iconClasses}/>}>
            Share
          </Button>
        </div>
         <p className="text-xs text-plum/70 mt-4 text-center font-body break-words px-2" title={generatedImage.prompt}>
            <span className="font-semibold">Inspired by:</span> {generatedImage.prompt || 'A magical vision'}
        </p>
      </div>

      {history.length > 1 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-center text-candy font-heading leading-heading">More Magical Moments</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {history.filter(histItem => histItem.id !== generatedImage.id).slice(0, 5).map(histItem => ( 
                <div key={histItem.id} className="bg-frosted rounded-lg overflow-hidden shadow-lg cursor-pointer hover:opacity-90 transition-opacity duration-150 ease-in-out border border-mochi/20 group hover:shadow-candy/10" onClick={() => handleViewInHistory(histItem)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleViewInHistory(histItem)}
                aria-label={`View previously generated image: ${histItem.prompt || 'untitled'}`}>
                  <div className="aspect-square bg-pearl/50">
                  <img 
                    src={`data:${MIME_TYPE_JPEG};base64,${histItem.base64Data}`}
                    alt={histItem.prompt || "Previously generated image"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  </div>
                </div>
            ))}
          </div>
           <div className="text-center mt-6">
            <Button onClick={() => navigate('/history')} variant="outline" size="sm" className="border-mochi/70 text-mochi hover:bg-mochi/20">View All History</Button>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Full Resolution Image">
        <img 
            src={imageSrc} 
            alt={generatedImage.prompt || "Generated cosplay image"} 
            className="w-full h-auto max-h-[75vh] object-contain rounded-md border border-mochi/30" 
        />
      </Modal>
      {isRegenerating && <div className="fixed inset-0 bg-plum/70 backdrop-blur-sm flex items-center justify-center z-[60]">
        <LoadingSpinner text="Conjuring a new image..." size="lg" textColor="text-pearl" />
      </div>}
    </div>
     <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
    </>
  );
};

export default ResultScreen;
