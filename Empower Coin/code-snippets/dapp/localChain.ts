export const localnet = {
    blockExplorers: {
        default: {
            name: "Etherscan",
            url: "https://etherscan.io",
            apiUrl: "https://api.etherscan.io/api",
        },
    },
    contracts: {
        ensRegistry: {
            address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        },
        ensUniversalResolver: {
            address: "0xce01f8eee7E479C928F8919abD53E553a36CeF67",
            blockCreated: 19258213,
        },
        multicall3: {
            address: "0xca11bde05977b3631167028862be2a173976ca11",
            blockCreated: 14353601,
        },
    },
    id: 31337,
    name: "Internal testnet",
    nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ["http://127.0.0.1:8545"],
        },
    },
    // Optional fields (uncomment and define if needed)
    // sourceId?: number | undefined,
    // testnet?: boolean | undefined,
    // custom?: Record<string, unknown> | undefined,
    // fees?: import("../../index.js").ChainFees<undefined> | undefined,
    // formatters?: undefined,
    // serializers?: import("../../index.js").ChainSerializers<undefined, import("../../index.js").TransactionSerializable> | undefined,
} as const;
