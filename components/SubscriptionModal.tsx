
import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { useQuota } from '../contexts/QuotaContext';
import { PREMIUM_GENERATIONS_LIMIT } from '../constants';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPremium, quota } = useQuota();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    // Simulate API call to Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    upgradeToPremium();
    setIsSubscribing(false);
    setSubscribed(true);
    // Keep modal open for a bit to show success, then close
    setTimeout(() => {
        onClose();
        setSubscribed(false); // Reset for next time modal opens
    }, 2000);
  };

  if (quota.isSubscribed && !subscribed) { // If already subscribed, don't show normal content
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="You're Already a Pro!">
            <div className="text-center py-4">
                <CheckCircleIcon className="w-16 h-16 text-mint-foam mx-auto mb-4" />
                <p className="text-lg text-plum font-semibold">You already have an active Pro subscription.</p>
                <p className="text-plum/80">Enjoy your {PREMIUM_GENERATIONS_LIMIT} monthly generations!</p>
            </div>
        </Modal>
    );
  }


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subscribed ? "Subscription Activated!" : "✨ Go Pro & Unleash More Magic!"}>
      {subscribed ? (
        <div className="text-center py-8">
          <CheckCircleIcon className="w-20 h-20 text-mint-foam mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-candy mb-2">Welcome to the Pro Tier!</h3>
          <p className="text-lg text-plum">Your account has been upgraded. You now have {PREMIUM_GENERATIONS_LIMIT} generations per month.</p>
          <p className="text-sm text-plum/70 mt-1">Happy creating!</p>
        </div>
      ) : (
        <div>
          <p className="text-lg text-plum/90 mb-6 text-center">
            Supercharge your creativity with our Pro plan for just <span className="font-bold text-candy">$3.99/month</span>!
          </p>
          
          <ul className="space-y-3 mb-8 text-plum">
            <li className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-mint-foam mr-3 flex-shrink-0 mt-0.5" />
              <span>Get <span className="font-semibold text-candy">{PREMIUM_GENERATIONS_LIMIT} image generations</span> every month (instead of {quota.limit}).</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-mint-foam mr-3 flex-shrink-0 mt-0.5" />
              <span>Priority access to new features and styles (coming soon!).</span>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-mint-foam mr-3 flex-shrink-0 mt-0.5" />
              <span>Support the development of Cosplay Image Generator.</span>
            </li>
          </ul>

          <div className="mt-6 text-center">
            <Button 
              onClick={handleSubscribe} 
              isLoading={isSubscribing} 
              disabled={isSubscribing}
              variant="primary-gradient" 
              size="lg"
              className="w-full sm:w-auto px-10 py-3 text-lg rounded-full"
            >
              {isSubscribing ? 'Processing...' : 'Subscribe with Stripe (Mock)'}
            </Button>
            <p className="text-xs text-plum/60 mt-3">
              This is a mock subscription. No real payment will be processed.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SubscriptionModal;
