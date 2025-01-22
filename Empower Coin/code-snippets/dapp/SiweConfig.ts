import { getUser } from '@/features/auth';
import { axios } from '@/lib/axios';
import { DEFAULT_CHAIN_ID } from '@/lib/config';
import storage from '@/lib/storage';
import { useDisconnect } from '@web3modal/ethers/react';
import { createSIWEConfig, formatMessage, SIWESession } from '@web3modal/siwe'; 
import { arbitrum, arbitrumSepolia } from 'viem/chains';

async function getAddressFromToken() {
  try {
    const response = await getUser();
    return response.data.walletAddress;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw new Error('Unable to decode token');
  }
}

async function getNonce(address: string | undefined) {
  try {
    const token = storage.getToken();
    const response = await axios.post('auth/nonce', { address, token });
    return response.data;
  } catch (error) {
    console.error('Error fetching nonce:', error);
    throw new Error('Unable to fetch nonce');
  }
}

async function getSession(): Promise<SIWESession | null> {
  try {
    const { disconnect } = useDisconnect(); 
    console.log("checking session...")
    const token = storage.getToken();
    if (token) {
      const account = await getAddressFromToken(); 
      await getUser();
      console.log({address: account,chainId: parseInt(DEFAULT_CHAIN_ID)} )
      return { address: account!, chainId: parseInt(DEFAULT_CHAIN_ID) }
    }else{
      await disconnect();
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

async function verifyMessage({ message, signature }: { message: string; signature: string; }) {
  const { disconnect } = useDisconnect(); 
  try {
    const response: any = await axios.post('auth/verify-signature', { message, signature });
    if (response.tokens?.access?.token) {
      storage.clearToken();
      storage.setToken(response.tokens.access.token);
      return true;
    }
    await disconnect();
    return false;
  } catch (error) {
    console.error('Error verifying message:', error);
    await disconnect();
    return false;
  }
}

async function signOut() {
  try {
    storage.clearToken();
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

export const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : '',
    uri: typeof window !== 'undefined' ? window.location.origin : '',
    chains: [ arbitrum.id],
    statement: 'One time Login to EmpowerCoins',
  }),
  createMessage: ({ address, ...args }) => formatMessage(args, address),
  getNonce,
  getSession,
  verifyMessage,
  signOut,
});
