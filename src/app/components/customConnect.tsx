import React from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";

interface CustomConnectButtonProps {
  className?: string;
  label?: string;
}

const CustomConnectButton: React.FC<CustomConnectButtonProps> = ({ 
  className = "", 
  label = "Connect Wallet" 
}) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={`
                      px-6 py-3 
                      bg-slate-900 hover:bg-slate-800
                      text-white 
                      border border-slate-700
                      rounded-lg 
                      font-medium 
                      text-sm 
                      transition-all
                      duration-200 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-slate-500
                      focus:ring-offset-2
                      shadow-sm hover:shadow-md
                      flex items-center gap-2
                      ${className}
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {label}
                  </button>
                );
              }

              if (chain?.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={`
                      px-6 py-3 
                      bg-red-600 hover:bg-red-700
                      text-white 
                      border border-red-500
                      rounded-lg 
                      font-medium 
                      text-sm 
                      transition-all
                      duration-200 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-red-500
                      focus:ring-offset-2
                      shadow-sm hover:shadow-md
                      flex items-center gap-2
                      ${className}
                    `}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={`
                      px-4 py-2 
                      bg-white hover:bg-gray-50
                      text-gray-700 
                      border border-gray-300
                      rounded-lg 
                      font-medium 
                      text-sm 
                      transition-all
                      duration-200 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-gray-500
                      focus:ring-offset-2
                      shadow-sm hover:shadow-md
                      flex items-center gap-2
                    `}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={`
                      px-4 py-2 
                      bg-green-600 hover:bg-green-700
                      text-white 
                      border border-green-500
                      rounded-lg 
                      font-medium 
                      text-sm 
                      transition-all
                      duration-200 
                      focus:outline-none 
                      focus:ring-2 
                      focus:ring-green-500
                      focus:ring-offset-2
                      shadow-sm hover:shadow-md
                      flex items-center gap-2
                      ${className}
                    `}
                  >
                    <div className="w-2 h-2 rounded-full bg-green-300"></div>
                    {account.displayName}
                    {account.displayBalance && (
                      <span className="text-green-100 text-xs">
                        {account.displayBalance}
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default CustomConnectButton;