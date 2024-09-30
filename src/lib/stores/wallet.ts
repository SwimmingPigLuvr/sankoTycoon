// lib/stores/wallet.ts
import { writable } from "svelte/store";

// Define interfaces for various types used in the wallet objects
interface Token {
    name: string;
    contractAddress: string;
    balance: number;
}

interface Fruit {
    round: number;
    lumpy: number;
    heart: number;
    star: number;
    square: number;
}

interface Seeds {
    round: number;
    lumpy: number;
    heart: number;
    star: number;
    square: number;
}

interface Wallet {
    gold: number;
    fruit: Fruit;
    seeds: Seeds;
    items: string[];
}

enum BunRarity {

}

interface NFT {
    id: string;
    name: string;
    baseIndustry: number;
    baseLuck: number;
    baseSpeed: number;
    baseStamina: number;
    baseStrength: number;
    birthDay: number;
    rarity: string;
    type: string;
    variety: string;
    wallet: Wallet;
}

interface WalletObject {
    walletAddress: string;
    tokens: Token[];
    nfts: NFT[];
}

// Define the exampleWallet object with the specified fields
const exampleWallet: WalletObject = {
    walletAddress: '0xYourWalletAddressHere', // Replace with actual wallet address
    tokens: [
        {
            name: '$GOLD',
            contractAddress: '0x6F5e2d3b8c5C5c5F9bcB4adCF40b13308e688D4D',
            balance: 10,
        },
        {
            name: '$DMT',
            contractAddress: '0x0B7f0e51Cd1739D6C96982D55aD8fA634dd43A9C',
            balance: 10,
        },
    ],
    nfts: [
        {
            id: '#1975',
            name: 'SankoPets: Buns',
            baseIndustry: 9,
            baseLuck: 19,
            baseSpeed: 12,
            baseStamina: 4,
            baseStrength: 12,
            birthDay: Date.now(), // date hatched
            rarity: 'Rare',
            type: 'Bun',
            variety: 'Mini',
            wallet: {
                gold: 10,
                fruit: {
                    round: 0,
                    lumpy: 0,
                    heart: 0,
                    star: 5,
                    square: 5,
                },
                seeds: {
                    round: 0,
                    lumpy: 0,
                    heart: 0,
                    star: 0,
                    square: 0,
                },
                items: [
                    'Albanian Boxing Gloves',
                    'Matrix Bucket Hat',
                    'Npc Mask',
                    'Bun Blaster',
                ]
            }
        },
    ],
};

// Define the starterWallet object with only 3 $DMT
const starterWallet: WalletObject = {
    walletAddress: '', // No wallet address
    tokens: [
        {
            name: '$DMT',
            contractAddress: '0x0B7f0e51Cd1739D6C96982D55aD8fA634dd43A9C',
            balance: 3,
        },
    ],
    nfts: [], // No NFTs
};

// Export the writable stores initialized with the respective wallet objects
export const wallet = writable<WalletObject>(starterWallet);
export const example = writable<WalletObject>(exampleWallet);
