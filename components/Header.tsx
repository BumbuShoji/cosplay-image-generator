
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuota } from '../contexts/QuotaContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { APP_NAME } from '../constants';
import Button from './Button';
import SubscriptionModal from './SubscriptionModal'; // Import SubscriptionModal

const Header: React.FC = () => {
  const { quota } = useQuota();
  const { currentUser, login, logout, isLoadingAuth } = useAuth();
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const remainingGenerations = quota.limit - quota.used;
  const quotaPercentage = quota.limit > 0 ? Math.max(0, (remainingGenerations / quota.limit) * 100) : 0;

  const navLinkClasses = "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out";
  const activeNavLinkClasses = "bg-candy/10 text-candy font-semibold";
  const inactiveNavLinkClasses = "text-plum hover:bg-candy/5 hover:text-candy/90";

  return (
    <>
      <header className="bg-pearl/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-frosted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 text-2xl font-heading font-bold text-candy hover:opacity-80 transition-opacity">
                {APP_NAME}
              </Link>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {currentUser && (
                <>
                  <NavLink
                    to="/"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                  >
                    Generate
                  </NavLink>
                  <NavLink
                    to="/history"
                    className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                  >
                    History
                  </NavLink>
                </>
              )}
              {currentUser && (
                <div className="flex items-center space-x-2">
                  <div className="text-xs sm:text-sm text-plum/80 font-body">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Quota:</span> 
                      <span>{remainingGenerations < 0 ? 0 : remainingGenerations} / {quota.limit}</span>
                      {quota.isSubscribed && <span className="text-xs px-1.5 py-0.5 rounded-full bg-mint-foam text-plum font-semibold">PRO</span>}
                    </div>
                    <div className="w-20 sm:w-24 h-2 bg-frosted rounded-full mt-0.5 overflow-hidden">
                      <div 
                        className={`h-full ${quota.isSubscribed ? 'bg-mint-foam' : 'bg-butter-yellow'} transition-all duration-300 ease-out`}
                        style={{ width: `${quotaPercentage}%` }}
                        aria-valuenow={quotaPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        role="progressbar"
                        aria-label="Generation quota remaining"
                      ></div>
                    </div>
                  </div>
                  {!quota.isSubscribed && (
                    <Button onClick={() => setIsSubscriptionModalOpen(true)} variant="warning" size="sm" className="hidden sm:inline-flex !px-2 !py-1 text-xs">
                      ✨ Go Pro
                    </Button>
                  )}
                </div>
              )}
            </nav>
            <div className="flex items-center">
              {isLoadingAuth ? (
                <div className="text-sm text-plum/70">Loading...</div>
              ) : currentUser ? (
                <div className="flex items-center space-x-2">
                  {currentUser.avatarUrl && (
                    <img src={currentUser.avatarUrl} alt={currentUser.name || 'User Avatar'} className="w-8 h-8 rounded-full border-2 border-mochi"/>
                  )}
                  <span className="text-sm text-plum font-medium hidden md:inline">{currentUser.name}</span>
                  <Button onClick={logout} variant="outline" size="sm" className="!border-plum/30 !text-plum hover:!bg-plum/10">Logout</Button>
                </div>
              ) : (
                <Button onClick={login} variant="primary" size="sm">Login with Google (Mock)</Button>
              )}
            </div>
          </div>
        </div>
      </header>
      {currentUser && !quota.isSubscribed && (
         <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
      )}
    </>
  );
};

export default Header;
