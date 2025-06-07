
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useHistory } from '../contexts/HistoryContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { GeneratedImage } from '../types';
import Button from '../components/Button';
import { MIME_TYPE_JPEG } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface HistoryScreenProps {
  setLatestGeneratedImage: (image: GeneratedImage | null) => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ setLatestGeneratedImage }) => {
  const { history, deleteImageFromHistory, clearHistory, isLoading: isLoadingHistory } = useHistory();
  const { currentUser, isLoadingAuth, login } = useAuth(); // Get auth state
  const navigate = useNavigate();

  const handleViewImage = (image: GeneratedImage) => {
    setLatestGeneratedImage(image);
    navigate('/result');
  };

  if (isLoadingAuth || isLoadingHistory) {
    return <LoadingSpinner text="Loading your gallery of magic..." />;
  }

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto text-center py-10 sm:py-16 bg-frosted/70 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-candy mb-4 font-heading">Access Your Magical History</h1>
        <p className="text-plum/80 mb-6 text-lg">
          Please log in to view your previously generated cosplay images.
        </p>
        <Button onClick={login} variant="primary-gradient" size="lg" className="rounded-full px-8 py-3">
          Login with Google (Mock)
        </Button>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10 gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-candy font-heading leading-heading text-center sm:text-left tracking-wide">Magical History</h1>
        {history.length > 0 && (
          <Button onClick={() => {
            if (window.confirm("Are you sure you want to clear all history? This enchanting action cannot be undone!")) {
              clearHistory();
            }
          }} 
          variant="danger" 
          size="sm"
          aria-label="Clear all generation history"
          >
            Clear All History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 sm:py-16 bg-frosted/70 rounded-xl shadow-lg">
          <svg className="mx-auto h-16 w-16 text-mochi/60 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c-.784-.784-2.047-.784-2.831 0L3.322 14.763c-.784.784-.784 2.047 0 2.831l3.084 3.084c.784.784 2.047.784 2.831 0L20.677 9.237c.784-.784.784-2.047 0-2.831L17.593 3.322zM10.5 6a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zm0 10a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zm4.5-4.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5zM6 10.5a.5.5 0 00-.5.5v2a.5.5 0 001 0v-2a.5.5 0 00-.5-.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
          <p className="text-xl text-candy font-heading mb-2">Your spellbook is empty!</p>
          <p className="text-plum/70 font-body">Start creating your amazing cosplay images to fill it up.</p>
          <Button onClick={() => navigate('/')} variant="primary-gradient" className="mt-6 rounded-full px-6 py-2.5">
            ✨ Create New Magic ✨
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {history.map((item) => (
            <div key={item.id} className="bg-frosted rounded-xl shadow-lg overflow-hidden group flex flex-col border border-mochi/20 hover:shadow-candy/20 hover:border-candy/30 transition-all duration-300">
              <div 
                className="aspect-square w-full bg-pearl/50 cursor-pointer relative overflow-hidden"
                onClick={() => handleViewImage(item)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleViewImage(item);}}
                aria-label={`View generated image: ${item.prompt || 'untitled'}`}
              >
                <img
                  src={`data:${MIME_TYPE_JPEG};base64,${item.base64Data}`}
                  alt={item.prompt || 'Generated cosplay image'}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-in-out"
                  loading="lazy"
                />
                 <div className="absolute inset-0 bg-plum bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300 pointer-events-none">
                    <span className="text-pearl text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-heading">View</span>
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col justify-between bg-frosted/30">
                <div>
                    <p className="text-sm text-plum truncate font-body" title={item.prompt}>
                        {item.prompt || 'Untitled Creation'}
                    </p>
                    <p className="text-xs text-plum/60 font-body">
                        Conjured: {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); 
                     if (window.confirm(`Banish this image from your history? Prompt: ${item.prompt || 'Untitled Creation'}`)) {
                        deleteImageFromHistory(item.id);
                     }
                  }}
                  variant="danger"
                  size="sm"
                  className="w-full mt-3 text-xs py-1"
                  aria-label={`Delete image: ${item.prompt || 'untitled'}`}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
