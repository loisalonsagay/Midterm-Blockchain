import { useState } from 'react';
import { useContract } from './hooks/useContract';
import { CreatePost } from './components/CreatePost';
import { PostFeed } from './components/PostFeed';
import './App.css';

function App() {
  const { contract, account, isConnected, isSepoliaNetwork, error, connectWallet, switchToSepolia } = useContract();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header>
        <h1>💬 TipPost</h1>
        <div className="header-controls">
          {isConnected && !isSepoliaNetwork && (
            <button onClick={switchToSepolia} className="network-btn">
              ⚠️ Switch to Sepolia
            </button>
          )}
          <button onClick={connectWallet} className="connect-btn">
            {isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main>
        {isConnected && isSepoliaNetwork ? (
          <>
            <CreatePost contract={contract} onPostCreated={handlePostCreated} />
            <PostFeed contract={contract} account={account || ''} refreshTrigger={refreshTrigger} />
          </>
        ) : (
          <div className="welcome">
            <h2>Welcome to TipPost</h2>
            <p>A pay-to-like social platform on Sepolia testnet</p>
            {!isConnected ? (
              <>
                <p className="subtitle">Connect your MetaMask wallet to get started</p>
                <button onClick={connectWallet} className="big-btn">
                  🦊 Connect Wallet
                </button>
              </>
            ) : !isSepoliaNetwork ? (
              <>
                <p className="subtitle">Please switch to Sepolia testnet</p>
                <button onClick={switchToSepolia} className="big-btn">
                  Switch to Sepolia
                </button>
              </>
            ) : null}
          </div>
        )}
      </main>

      <footer>
        <p>TipPost © 2024 | Send tips on Sepolia testnet</p>
      </footer>
    </div>
  );
}

export default App;