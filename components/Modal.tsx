
import React, { ReactNode } from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  titleId?: string; // For ARIA
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, titleId = "modal-title" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-plum/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out flex items-center justify-center" aria-labelledby={titleId} role="dialog" aria-modal="true">
      <div className="fixed inset-0" aria-hidden="true" onClick={onClose}></div>
      {/* Modal panel */}
      <div className="inline-block bg-frosted rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:max-w-2xl w-full mx-4 my-8 max-h-[90vh] flex flex-col">
        {title && (
          <div className="px-4 pt-5 sm:px-6 pb-2 border-b border-mochi/30">
            <h3 className="text-xl leading-heading font-bold text-candy font-heading" id={titleId}>
              {title}
            </h3>
          </div>
        )}
        <div className="px-4 py-5 sm:p-6 overflow-y-auto flex-grow text-plum">
          {children}
        </div>
        <div className="bg-frosted/80 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-mochi/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-plum/30 text-plum hover:bg-plum/10 hover:text-plum"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;