import { useEffect, useState, useCallback } from 'react';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import TipPostABI from '../abi/TipPost.json';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // Sepolia chain ID in hex

export function useContract() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSepoliaNetwork, setIsSepoliaNetwork] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize contract when signer changes
  useEffect(() => {
    if (signer && import.meta.env.VITE_CONTRACT_ADDRESS) {
      try {
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
        const newContract = new Contract(contractAddress, TipPostABI, signer);
        setContract(newContract);
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError('Failed to initialize contract');
      }
    }
  }, [signer]);

  // Check network
  const checkNetwork = useCallback(async (provider: BrowserProvider) => {
    try {
      const network = await provider.getNetwork();
      const isSepolia = network.chainId === BigInt(11155111);
      setIsSepoliaNetwork(isSepolia);
      return isSepolia;
    } catch (err) {
      console.error('Error checking network:', err);
      return false;
    }
  }, []);

  // Check if wallet is already connected on mount
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
          console.error('Error checking connection:', err);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
          setIsConnected(false);
          setSigner(null);
          setContract(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [checkNetwork]);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected!');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          setError('Failed to add Sepolia network');
        }
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected! Please install MetaMask.');
      return;
    }

    try {
      setError('');
      const provider = new BrowserProvider(window.ethereum);

      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      setProvider(provider);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Check network
      const isSepolia = await checkNetwork(provider);
      if (!isSepolia) {
        setError('Please switch to Sepolia network');
        await switchToSepolia();
      }

      // Get signer
      const signer = await provider.getSigner();
      setSigner(signer);

      console.log('Connected to wallet:', accounts[0]);
    } catch (err: any) {
      console.error('Failed to connect wallet:', err);

      if (err.code === -32002) {
        setError('MetaMask request already pending');
      } else if (err.message?.includes('user rejected')) {
        setError('User rejected wallet connection');
      } else {
        setError(err.message || 'Failed to connect wallet');
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