import React, { ReactNode } from 'react';
import { User } from '../../types';

type SlackMessageProps = {
  user: User;
  timestamp: string;
  children: ReactNode;
};

export const SlackMessage: React.FC<SlackMessageProps> = ({ user, timestamp, children }) => {
  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex items-start">
        <img 
          src={user.avatar} 
          alt={`${user.name}'s avatar`}
          className="w-10 h-10 rounded mr-3"
        />
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className={`font-bold ${user.isBot ? 'flex items-center' : ''}`}>
              {user.name}
              {user.isBot && (
                <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-1 py-0.5 rounded">
                  App
                </span>
              )}
            </span>
            <span className="ml-2 text-xs text-gray-500">{timestamp}</span>
          </div>
          <div className="mt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};