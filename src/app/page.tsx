"use client";

import PriceView from "./components/price";
import QuoteView from "./components/quote";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import Navbar from "./components/navbar";
import type { PriceResponse } from "./utils/types";

function Page() {
  const { address } = useAccount();
  const chainId = useChainId() || 1;
  console.log("chainId: ", chainId);

  const [finalize, setFinalize] = useState(false);
  const [price, setPrice] = useState<PriceResponse | undefined>();
  const [quote, setQuote] = useState();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="absolute inset-0 bg-slate-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-transparent to-slate-100/50"></div>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 backdrop-blur-sm overflow-hidden">
              <div className="bg-slate-900 px-6 py-6 sm:px-8">
                <div className="text-center">
                  <h1 className="text-2xl font-semibold text-white">
                  𝙲𝚘𝚒𝚗 𝙴𝚡𝚌𝚑𝚊𝚗𝚐𝚎
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Secure and efficient token exchange
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8">
                {finalize && price ? (
                  <QuoteView
                    taker={address}
                    price={price}
                    quote={quote}
                    setQuote={setQuote}
                    chainId={chainId}
                  />
                ) : (
                  <PriceView
                    taker={address}
                    price={price}
                    setPrice={setPrice}
                    setFinalize={setFinalize}
                    chainId={chainId}
                  />
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                Connected to{" "}
                <span className="font-medium text-slate-700">
                  {chainId === 1 ? "Ethereum Mainnet" : 
                   chainId === 137 ? "Polygon" :
                   chainId === 56 ? "BSC" :
                   `Chain ${chainId}`}
                </span>
              </p>
              {address && (
                <p className="text-slate-400 text-xs mt-1">
                  Wallet: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
      </div>
    </>
  );
}

export default Page;