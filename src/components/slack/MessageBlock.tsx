import React, { ReactNode } from 'react';

type MessageBlockProps = {
  children: ReactNode;
};

export const MessageBlock: React.FC<MessageBlockProps> = ({ children }) => {
  return (
    <div className="bg-white border border-gray-300 rounded p-3">
      {children}
    </div>
  );
};