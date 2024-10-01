// lib/stores/wallet.ts
import { writable } from "svelte/store";

// Define interfaces for various types used in the wallet objects
export interface Token {
    name: string;
    balance: number;
}

export interface Fruit {
    round: number;
    lumpy: number;
    heart: number;
    star: number;
    square: number;
}

export interface Seeds {
    round: number;
    lumpy: number;
    heart: number;
    star: number;
    square: number;
}

export interface BunWallet {
    bunId: string;
    gold: number;
    fruit: Fruit;
    seeds: Seeds;
    items: string[];
}

enum BunRarity {
    Common = 'Common',
    Uncommon = 'Uncommon',
    Rare = 'Rare',
    Rotten = 'Rotten',
    SuperRare = 'Super Rare',
    Moldy = 'Moldy',
}

enum BunType {
    Egg = 'Egg',
    Bun = 'Bun',
}

// Define the BunVariety enum based on the parsed span elements
enum BunVariety {
    Spirit = 'Spirit',
    Pipe = 'Pipe',
    Angel = 'Angel',
    Goldie = 'Goldie',
    Dev = 'Dev',
    RedStar = 'Red Star',
    Moldy = 'Moldy',
    Qualk = 'Qualk',
    Gold = 'Gold',
    RaceCar = 'RaceCar',
    Joker = 'Joker',
    Ket = 'Ket',
    Mini = 'Mini',
    Kev = 'Kev',
    Pup = 'Pup',
    Tux = 'Tux',
    Sanko = 'Sanko',
    Snake = 'Snake',
    BlueStar = 'Blue Star',
    Rotten = 'Rotten',
    Chikki = 'Chikki',
    Silver = 'Silver',
    Cowboy = 'Cowboy',
    Nebula = 'Nebula',
    Purr = 'Purr',
    Bricks = 'Bricks',
    Hippy = 'Hippy',
    Confetti = 'Confetti',
    Bunzilian = 'Bunzilian',
    Cream = 'Cream',
    Wood = 'Wood',
    SuperBun = 'SuperBun',
    Gorli = 'Gorli',
    Earthy = 'Earthy',
    Cloudy = 'Cloudy',
    Yeti = 'Yeti',
    Lava = 'Lava',
    Sproto = 'Sproto',
    Crystal = 'Crystal',
    Leathy = 'Leathy',
    Detec = 'Detec',
    Geeny = 'Geeny',
    Galxy = 'Galxy',
    Fire = 'Fire',
    Peppermint = 'Peppermint',
    Glass = 'Glass',
    Bomber = 'Bomber',
    Tomat = 'Tomat',
    Natural = 'Natural',
    Turtly = 'Turtly',
    Driftwood = 'Driftwood',
    Choi = 'Choi',
    Turni = 'Turni',
    Lemuh = 'Lemuh',
    Strawbie = 'Strawbie',
    Buns = 'Buns',
    Red = 'Red',
    Lime = 'Lime',
    Orange = 'Orange',
    Purple = 'Purple',
    Green = 'Green',
    Blue = 'Blue',
}

export interface Bun {
    id: string;
    name: string;
    industry: number;
    luck: number;
    apeed: number;
    stamina: number;
    strength: number;
    birthday: Date;
    rarity: BunRarity;
    type: BunType;
    variety: BunVariety;
    wallet: BunWallet;
}

export interface Wallet {
    network: 'Arbitrum' | 'Sanko';
    walletAddress: string;
    tokens: Token[];
    nfts: Bun[];
}

// Define the exampleWallet object with the specified fields
const exampleWallet: Wallet = {
    walletAddress: '0xYourWalletAddressHere', // Replace with actual wallet address
    tokens: [
        {
            name: '$GOLD',
            balance: 10,
        },
        {
            name: '$DMT',
            balance: 10,
        },
    ],
    nfts: [
        {
            id: '#1975',
            name: 'SankoPets: Buns',
            industry: 9,
            luck: 19,
            speed: 12,
            stamina: 4,
            strength: 12,
            birthDay: Date.now(), // date hatched
            rarity: BunRarity.Rare,
            type: BunType.Bun,
            variety: BunVariety.Mini,
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
const starterWallet: Wallet = {
    walletAddress: '', // generate random address for them, let them use a .DMT address in the future
    network: 'Arbitrum',
    tokens: [
        {
            name: 'DMT',
            balance: 3,
        },
    ],
    nfts: [], // No NFTs
};

// Export the writable stores initialized with the respective wallet objects
export const wallet = writable<WalletObject>(starterWallet);
export const example = writable<WalletObject>(exampleWallet);
