import { useEffect, useState } from "react";
import {
    loadNetwork,
    loadEmpowerToken,
    updateEmpowerTokenBalance,
    loadUSDCToken,
    updateUSDCTokenBalance,
    updateWalletStatus,
    loadRewardDistributionContract,
    loadBorrowLendContract,
    loadEscrowContract,
    loadRouterSwapContract,
    loadLoanPaymentContract,
    loadTreasuryContract,
    loadDonationContract,
} from "../../store/interactions";
import { config } from "../../config";
import { useDispatch } from "react-redux";
import useWagmi from "@/utils/dapp/ProviderSigner";
import { useAccount, useWalletClient } from "wagmi";
import { useUser } from "@/lib/auth";

const useLoadContracts = () => {
    const {data} = useUser();
    const {data: walletClientData} = useWalletClient();
    const dispatch = useDispatch();
    const { address, isConnected } = useAccount();
    const { provider, signer } = useWagmi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadContracts = async () => {
        try {
            setLoading(true);
            if (provider && walletClientData && address && isConnected) {
                const { chainId } = await provider?.getNetwork();
                await loadNetwork(dispatch, provider, chainId);
                const empowerToken = await loadEmpowerToken(dispatch, provider, config[Number(chainId)].empowerToken.address);
                await updateEmpowerTokenBalance(dispatch, provider, empowerToken);
                const USDCToken = await loadUSDCToken(dispatch, provider, config[Number(chainId)].usdc.address);
                await updateUSDCTokenBalance(dispatch, provider, USDCToken);
                const borrowLendContract = await loadBorrowLendContract(dispatch, provider, config[Number(chainId)].borrowLend.address);
                const escrowContract = await loadEscrowContract(dispatch, provider, config[Number(chainId)].escrow.address);
                const routerSwap = await loadRouterSwapContract(dispatch, provider, config[Number(chainId)].routerSwap.address);
                const loanPayment = await loadLoanPaymentContract(dispatch,provider,config[Number(chainId)].loanPayment.address);
                const treasuryContract = await loadTreasuryContract(dispatch,provider,config[Number(chainId)].treasury.address);
                const donationContract = await loadDonationContract(dispatch,provider,config[Number(chainId)].donation.address);
                console.log("donationContract",donationContract);
                console.log("loanPaymentContract loaded: ",loanPayment);
                updateWalletStatus(dispatch, false);
            }

            setIsLoaded(true);
        } catch (err: any) {
            console.log(err.message)
            console.error("Error loading blockchain data:", err);
            setError(err.message || "Unknown error occurred while loading contracts.");
        } finally {
            setLoading(false);
        }
    };

    const refetch = async() => {
               await loadContracts();
    };


    useEffect(() => {
        loadContracts();
    }, [provider, walletClientData,isConnected]);

    return { loading, error, isLoaded, refetch };
};

export default useLoadContracts;
