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
    bunId: number;
    gold: number;
    fruit: Fruit;
    seeds: Seeds;
    items: string[];
}

type BunRarity = 'Common' | 'Uncommon' | 'Rare' | 'Rotten' | 'SuperRare' | 'Moldy';

type BunType = 'Egg' | 'Bun';

type BunVariety = 'Spirit' | 'Pipe' | 'Angel' | 'Goldie' | 'Dev' | 'Moldy' | 'Qualk' | 'Gold' | 'RaceCar' | 'Joker' | 'Ket' | 'Mini' | 'Kev' | 'Pup' | 'Tux' | 'Sanko' | 'Snake' | 'Star' | 'Rotten' | 'Chikki' | 'Silver' | 'Cowboy' | 'Nebula' | 'Purr' | 'Bricks' | 'Hippy' | 'Confetti' | 'Bunzilian' | 'Cream' | 'Wood' | 'SuperBun' | 'Gorli' | 'Earthy' | 'Cloudy' | 'Yeti' | 'Lava' | 'Sproto' | 'Crystal' | 'Leathy' | 'Detec' | 'Geeny' | 'Galxy' | 'Fire' | 'Peppermint' | 'Glass' | 'Bomber' | 'Tomat' | 'Natural' | 'Turtly' | 'Driftwood' | 'Choi' | 'Turni' | 'Lemuh' | 'Strawbie' | 'Buns' | 'Red' | 'Lime' | 'Orange' | 'Purple' | 'Green' | 'Blue' | 'Bun';


export interface Bun {
    id: number;
    name: string;
    industry: number;
    luck: number;
    speed: number;
    stamina: number;
    strength: number;
    birthday: Date;
    rarity: BunRarity;
    type: BunType;
    variety: BunVariety;
    wallet: BunWallet;
    imageUrl: string;
}

export interface Wallet {
    network: 'Arbitrum' | 'Sanko';
    walletAddress: string;
    tokens: Token[];
    nfts: Bun[];
}

// Define the starterWallet object with only 3 $DMT
const starterWallet: Wallet = {
    walletAddress: '0x4251b...239B3', // generate random address for them, let them use a .DMT address in the future
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
