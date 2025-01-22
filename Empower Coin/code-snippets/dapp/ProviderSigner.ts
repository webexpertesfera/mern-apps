import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { useUser } from '@/lib/auth';
import { loadProvider } from '@/store/interactions';
import { useDispatch } from 'react-redux';

const useWagmi = () => {
  const { isDisconnected, address, isReconnecting, isConnected } = useAccount();
  // const { data } = useUser();
  const { data: walletClientData } = useWalletClient();
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // const [isReady, setIsReady] = useState(false);

  const dispatch = useDispatch();

  const {data: user} = useUser();

  console.log(user);

  useEffect(() => {
    const getProviderAndSigner = async () => {
      try {
        setIsLoading(true);
        if (walletClientData && isConnected && !isDisconnected && user) {
          const network = {
            chainId: walletClientData.chain.id,
            name: walletClientData.chain.name,
            ensAddress: walletClientData.chain.contracts?.ensRegistry?.address,
          };
          console.log({walletclient:network});

          const provider: any = new ethers.BrowserProvider(walletClientData.transport, network);
          const signer = await provider.getSigner(walletClientData.account.address);
          setProvider(provider);
          setSigner(signer);
          await loadProvider(dispatch, provider);

        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (user && !isDisconnected) {
      getProviderAndSigner();
    }
  }, [walletClientData, isConnected]);

  console.log("provider found in useWagmi is : ", provider);

  return { provider, signer, isLoading };
};

export default useWagmi;
