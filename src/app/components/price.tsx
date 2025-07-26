import { useEffect, useState, ChangeEvent } from "react";
import { formatUnits, parseUnits } from "ethers";
import {
  useReadContract,
  useBalance,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi, Address } from "viem";
import {
  MAINNET_TOKENS,
  MAINNET_TOKENS_BY_SYMBOL,
  MAX_ALLOWANCE,
  AFFILIATE_FEE,
  FEE_RECIPIENT,
} from "../constants";
import Image from "next/image";
import qs from "qs";

export const DEFAULT_BUY_TOKEN = (chainId: number) => {
  if (chainId === 1) {
    return "weth";
  }
}

function ApproveOrReviewButton({
  taker,
  onClick,
  sellTokenAddress,
  disabled,
  price,
}: {
  taker: Address;
  onClick: () => void;
  sellTokenAddress: Address;
  disabled?: boolean;
  price: any;
}) {
  // If price.issues.allowance is null, show the Review Trade button
  if (price?.issues.allowance === null) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // fetch data, when finished, show quote view
          onClick();
        }}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
      >
        {disabled ? "Insufficient Balance" : "Review Trade"}
      </button>
    );
  }

  // Determine the spender from price.issues.allowance
  const spender = price?.issues.allowance.spender;

  // 1. Read from erc20, check approval for the determined spender to spend sellToken
  const { data: allowance, refetch } = useReadContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [taker, spender],
  });

  // 2. (only if no allowance): write to erc20, approve token allowance for the determined spender
  const { data } = useSimulateContract({
    address: sellTokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    args: [spender, MAX_ALLOWANCE],
  });

  // Define useWriteContract for the 'approve' operation
  const {
    data: writeContractResult,
    writeContractAsync: writeContract,
    error,
  } = useWriteContract();

  // useWaitForTransactionReceipt to wait for the approval transaction to complete
  const { data: approvalReceiptData, isLoading: isApproving } =
    useWaitForTransactionReceipt({
      hash: writeContractResult,
    });

  // Call `refetch` when the transaction succeeds
  useEffect(() => {
    if (data) {
      refetch();
    }
  }, [data, refetch]);

  if (error) {
    return (
      <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <span className="font-medium">Error:</span> {error.message}
      </div>
    );
  }

  if (allowance === BigInt(0)) {
    return (
      <button
        type="button"
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        onClick={async () => {
          await writeContract({
            abi: erc20Abi,
            address: sellTokenAddress,
            functionName: "approve",
            args: [spender, MAX_ALLOWANCE],
          });
          console.log("approving spender to spend sell token");
          refetch();
        }}
      >
        {isApproving ? "Approving…" : "Approve"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick();
      }}
      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
    >
      {disabled ? "Insufficient Balance" : "Review Trade"}
    </button>
  );
}

export default function PriceView({
  price,
  taker,
  setPrice,
  setFinalize,
  chainId,
}: {
  price: any;
  taker: Address | undefined;
  setPrice: (price: any) => void;
  setFinalize: (finalize: boolean) => void;
  chainId: number;
}) {
  const [sellToken, setSellToken] = useState("weth");
  const [buyToken, setBuyToken] = useState("usdc");
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [tradeDirection, setTradeDirection] = useState("sell");
  const [error, setError] = useState([]);
  const [buyTokenTax, setBuyTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });
  const [sellTokenTax, setSellTokenTax] = useState({
    buyTaxBps: "0",
    sellTaxBps: "0",
  });

  const handleSellTokenChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSellToken(e.target.value);
  };
  
  function handleBuyTokenChange(e: ChangeEvent<HTMLSelectElement>) {
    setBuyToken(e.target.value);
  }

  const tokensByChain = (chainId: number) => {
    if (chainId === 1) {
      return MAINNET_TOKENS_BY_SYMBOL;
    }
    return MAINNET_TOKENS_BY_SYMBOL;
  };

  const sellTokenObject = tokensByChain(chainId)[sellToken];
  const buyTokenObject = tokensByChain(chainId)[buyToken];

  const sellTokenDecimals = sellTokenObject.decimals;
  const buyTokenDecimals = buyTokenObject.decimals;
  const sellTokenAddress = sellTokenObject.address;

  const parsedSellAmount =
    sellAmount && tradeDirection === "sell"
      ? parseUnits(sellAmount, sellTokenDecimals).toString()
      : undefined;

  const parsedBuyAmount =
    buyAmount && tradeDirection === "buy"
      ? parseUnits(buyAmount, buyTokenDecimals).toString()
      : undefined;

  useEffect(() => {
    const params = {
      chainId: chainId,
      sellToken: sellTokenObject.address,
      buyToken: buyTokenObject.address,
      sellAmount: parsedSellAmount,
      buyAmount: parsedBuyAmount,
      taker,
      swapFeeRecipient: FEE_RECIPIENT,
      swapFeeBps: AFFILIATE_FEE,
      swapFeeToken: buyTokenObject.address,
      tradeSurplusRecipient: FEE_RECIPIENT,
    };

    async function main() {
      const response = await fetch(`/api/price?${qs.stringify(params)}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data?.validationErrors?.length > 0) {
        setError(data.validationErrors);
      } else {
        setError([]);
      }
      
      if (data.buyAmount) {
        setBuyAmount(formatUnits(data.buyAmount, buyTokenDecimals));
        setPrice(data);
      }
      
      if (data?.tokenMetadata) {
        setBuyTokenTax(data.tokenMetadata.buyToken);
        setSellTokenTax(data.tokenMetadata.sellToken);
      }
    }

    if (sellAmount !== "") {
      main();
    }
  }, [
    sellTokenObject.address,
    buyTokenObject.address,
    parsedSellAmount,
    parsedBuyAmount,
    chainId,
    sellAmount,
    setPrice,
    FEE_RECIPIENT,
    AFFILIATE_FEE,
  ]);

  const { data, isError, isLoading } = useBalance({
    address: taker,
    token: sellTokenObject.address,
  });

  const inSufficientBalance =
    data && sellAmount
      ? parseUnits(sellAmount, sellTokenDecimals) > data.value
      : true;

  const formatTax = (taxBps: string) => (parseFloat(taxBps) / 100).toFixed(2);

  return (
    <div className="min-h-5 min-w-full bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-slate-900 mb-6">Token Exchange</h1>
            
            <div className="mb-6">
              <label htmlFor="sell" className="block text-sm font-medium text-slate-700 mb-3">
                Sell Token
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 flex-1">
                  <Image
                    alt={sellToken}
                    className="h-8 w-8 rounded-full"
                    src={MAINNET_TOKENS_BY_SYMBOL[sellToken].logoURI}
                    width={32}
                    height={32}
                  />
                  <select
                    value={sellToken}
                    name="sell-token-select"
                    id="sell-token-select"
                    className="flex-1 h-12 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    onChange={handleSellTokenChange}
                  >
                    {MAINNET_TOKENS.map((token) => (
                      <option key={token.address} value={token.symbol.toLowerCase()}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  id="sell-amount"
                  value={sellAmount}
                  className="w-100 h-12 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  type="number"
                  placeholder="0.0"
                  onChange={(e) => {
                    setTradeDirection("sell");
                    setSellAmount(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* FIXED: Swap Arrow/Divider */}
            <div className="flex justify-center mb-6">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* FIXED: Buy Token Section */}
            <div className="mb-6">
              <label htmlFor="buy" className="block text-sm font-medium text-slate-700 mb-3">
                Buy Token
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 flex-1">
                  <Image
                    alt={buyToken}
                    className="h-8 w-8 rounded-full"
                    src={MAINNET_TOKENS_BY_SYMBOL[buyToken].logoURI}
                    width={32}
                    height={32}
                  />
                  <select
                    name="buy-token-select"
                    id="buy-token-select"
                    value={buyToken}
                    className="flex-1 h-12 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    onChange={handleBuyTokenChange}
                  >
                    {MAINNET_TOKENS.map((token) => (
                      <option key={token.address} value={token.symbol.toLowerCase()}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  id="buy-amount"
                  value={buyAmount}
                  className="w-100 h-12 px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                  type="number"
                  placeholder="0.0"
                  disabled
                  onChange={(e) => {
                    setTradeDirection("buy");
                    setBuyAmount(e.target.value);
                  }}
                />
              </div>
            </div>

            {/* FIXED: Fee and Tax Information */}
            <div className="space-y-2 mb-6">
              {price && price.fees.integratorFee.amount && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Affiliate Fee:</span>
                  <span>
                    {Number(
                      formatUnits(
                        BigInt(price.fees.integratorFee.amount),
                        MAINNET_TOKENS_BY_SYMBOL[buyToken].decimals
                      )
                    )} {MAINNET_TOKENS_BY_SYMBOL[buyToken].symbol}
                  </span>
                </div>
              )}
              
              {buyTokenTax.buyTaxBps !== "0" && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{MAINNET_TOKENS_BY_SYMBOL[buyToken].symbol} Buy Tax:</span>
                  <span>{formatTax(buyTokenTax.buyTaxBps)}%</span>
                </div>
              )}
              
              {sellTokenTax.sellTaxBps !== "0" && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{MAINNET_TOKENS_BY_SYMBOL[sellToken].symbol} Sell Tax:</span>
                  <span>{formatTax(sellTokenTax.sellTaxBps)}%</span>
                </div>
              )}
            </div>

            {/* FIXED: Action Button */}
            <div className="mt-6">
              <ApproveOrReviewButton
                taker={taker as Address}
                onClick={() => setFinalize(true)}
                sellTokenAddress={sellTokenAddress as Address}
                disabled={inSufficientBalance}
                price={price}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}