import { WagmiProvider, createConfig, useDisconnect, useWalletClient, useAccountEffect } from 'wagmi';
import { useEffect } from 'react';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { http, useAccount } from 'wagmi';
import logo from '@/assets/logo.png';
import { siweConfig } from './SiweConfig';
import { PROJECT_ID } from '@/lib/config';
import { reconnect, watchAccount } from '@wagmi/core';
import storage from '@/lib/storage';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { useUser } from '@/lib/auth';

function AccountMonitor() {
  const { isConnected, address, chainId } = useAccount();
  const { data: walletClientData } = useWalletClient();
  const { disconnect } = useDisconnect();
  const { refetch } = useUser();

  function createSiweMessage(statement: string, nonce: string) {
    const message = new SiweMessage({
      scheme: window.location.protocol.slice(0, -1),
      domain: window.location.host,
      address,
      statement,
      uri: window.origin,
      nonce,
      version: '1',
      // chainId: arbitrumSepolia.id,
      chainId: arbitrum.id,
    });
    return message.prepareMessage();
  }

  useAccountEffect({
    onDisconnect: () => {
      console.log('Wallet disconnected');
      localStorage.removeItem('userAuthenticated'); // Clear authentication data
      storage.clearToken(); // Clear stored tokens
    },
  });

  async function triggerSIWEFlow() {
    if (!walletClientData || !address || !isConnected) {
      console.error('SIWE flow aborted: Missing wallet data, address, or not connected.');
      return;
    }
    console.log(walletClientData.chain.id);
    if(walletClientData.chain.id != arbitrum.id){
      console.log("Invalid id");
      return;
    }

    try {
      console.log('Triggering SIWE flow...');

      const network = {
        chainId: walletClientData.chain.id,
        name: walletClientData.chain.name || '',
        ensAddress: walletClientData.chain.contracts?.ensRegistry?.address || '',
      };


      const provider: any = new ethers.BrowserProvider(walletClientData.transport, network);
      const signer = await provider.getSigner(walletClientData.account.address);

      const nonce = await siweConfig.getNonce(address);
      const message = createSiweMessage('One time Login to EmpowerCoins', nonce);
      const signature = await signer.signMessage(message);
      const isVerified = await siweConfig.verifyMessage({ message, signature });

      if (isVerified) {
        localStorage.setItem('userAuthenticated', JSON.stringify({ address, authenticated: true }));
        refetch();
        console.log('SIWE verification successful! User authenticated.');
      } else {
        console.error('SIWE verification failed. Disconnecting wallet.');
        localStorage.removeItem('userAuthenticated');
        disconnect();
      }
    } catch (error) {
      console.error('Error during SIWE flow:', error);
      localStorage.removeItem('userAuthenticated');
      disconnect();
    }
  }

  useEffect(() => {
    const userAuthenticated = JSON.parse(localStorage.getItem('userAuthenticated'));

    async function checkSession() {
      if (userAuthenticated?.authenticated && storage.getToken()) {
        try {
          const session = await siweConfig.getSession();
          console.log('Session fetched:', session);
          if (session.address === address && session.chainId === arbitrum.id) {
            reconnect(config); // Reconnect the user if the session is valid
            return;
          }else{
            disconnect();
          }
        } catch (error) {
           disconnect();
          console.error('Error fetching session:', error);
        }
      }

      // Clear any invalid session or authentication
      localStorage.removeItem('userAuthenticated');
      storage.clearToken();
    }

    if (isConnected) {
      console.log('Account connected:', address);
      checkSession();
      if (!storage.getToken()) {
        triggerSIWEFlow();
      }
    } else {
      checkSession();
    }

    const unwatch = watchAccount(config, {
      onChange: (data) => {
        if (address != userAuthenticated?.address) {
          console.log(data);
          disconnect();
        }
      },
    });

    return () => {
      unwatch(); // Clean up the watcher on unmount
    };
  }, [isConnected, address, walletClientData, refetch]);

  return null;
}

const queryClient = new QueryClient();

const metaData = {
  name: 'EmpowerCoin',
  description: 'Earn with us',
  url: window.origin,
  icons: [logo],
};

export const config = createConfig({
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [metaMask(), coinbaseWallet()],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId: PROJECT_ID,
  themeMode: 'dark',
  defaultChain: arbitrum,
  enableOnramp: true,
  themeVariables: {
    '--w3m-font-family': 'Arial, sans-serif',
    '--w3m-color-mix': '#171d40',
    '--w3m-color-mix-strength': 70,
  },
  metadata: metaData,
});

export function WagmiProviderWrapper({ children }: any) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AccountMonitor />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
