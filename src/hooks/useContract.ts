import { useEffect, useState, useCallback } from "react";
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import TipPostABI from "../abi/TipPost.json";

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export function useContract() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [isSepoliaNetwork, setIsSepoliaNetwork] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (signer && import.meta.env.VITE_CONTRACT_ADDRESS) {
      try {
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
        const newContract = new Contract(contractAddress, TipPostABI, signer);
        setContract(newContract);
      } catch (err) {
        console.error("Failed to initialize contract:", err);
        setError("Failed to initialize contract");
      }
    }
  }, [signer]);

  const checkNetwork = useCallback(async (provider: BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const isSepolia = network.chainId === BigInt(11155111);
      setIsSepoliaNetwork(isSepolia);
      return isSepolia;
    } catch (err) {
      console.error("Error checking network:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            setProvider(provider);
            setAccount(accounts[0].address);
            setIsConnected(true);

            await checkNetwork(provider);
            const signer = await provider.getSigner();
            setSigner(signer);
          }
        } catch (err) {
          console.error("Error checking connection:", err);
        }
      }
    };

    checkConnection();

    const handleAccountsChanged = (accounts: unknown[]) => {
      if (
        Array.isArray(accounts) &&
        accounts.length > 0 &&
        typeof accounts[0] === "string"
      ) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
        setIsConnected(false);
        setSigner(null);
        setContract(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on(
        "accountsChanged",
        handleAccountsChanged as (...args: unknown[]) => void,
      );
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged as (...args: unknown[]) => void,
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [checkNetwork]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected!");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      if (
        typeof switchError === "object" &&
        switchError !== null &&
        "code" in switchError &&
        (switchError as { code?: number }).code === 4902
      ) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Testnet",
                rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
              },
            ],
          });
        } catch {
          setError("Failed to add Sepolia network");
        }
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected! Please install MetaMask.");
      return;
    }

    try {
      setError("");
      const provider = new BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      setProvider(provider);
      setAccount(accounts[0]);
      setIsConnected(true);

      const isSepolia = await checkNetwork(provider);
      if (!isSepolia) {
        setError("Please switch to Sepolia network");
        await switchToSepolia();
      }

      const signer = await provider.getSigner();
      setSigner(signer);

      console.log("Connected to wallet:", accounts[0]);
    } catch (err: unknown) {
      console.error("Failed to connect wallet:", err);

      if (typeof err === "object" && err !== null) {
        const errorObj = err as { code?: number; message?: string };
        if (errorObj.code === -32002) {
          setError("MetaMask request already pending");
        } else if (errorObj.message?.includes("user rejected")) {
          setError("User rejected wallet connection");
        } else {
          setError(errorObj.message || "Failed to connect wallet");
        }
      } else {
        setError("Failed to connect wallet");
      }
    }
  }, [checkNetwork, switchToSepolia]);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    isSepoliaNetwork,
    error,
    connectWallet,
    switchToSepolia,
  };
}
