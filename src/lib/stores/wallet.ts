// lib/stores/wallet.ts
import { writable } from "svelte/store";

// Define interfaces for various types used in the wallet objects
export interface Token {
    name: string;
    balance: number;
}

export interface Plot {
    state: 'empty' | 'planted';
    type?: string;
    maturity?: number;
    fruitRemaining?: number;
    plantedAt?: number;
    fruitsReady?: number;
    isWithered: boolean;
}

export interface Item  {
    type: 'fruit' | 'seed' | 'witheredSeed' | 'consumable' | 'wearable' | 'tool';
    name: string;
    quantity: number;
    imgPath: string;
    fruitType?: 'star' | 'heart' | 'round' | 'lumpy' | 'square' | 'slop';
    buyPrice?: number;
    sellPrice?: number;
    ability?: string;
    description?: string;
}

export interface BunWallet {
    bunId: number;
    gold: number;
    items: Item[];
}

export type BunRarity = 'Common' | 'Uncommon' | 'Rare' | 'Rotten' | 'SuperRare' | 'Moldy';

export type BunType = 'Egg' | 'Bun';

export type BunVariety =
    | 'Strawbie'
    | 'Orange'
    | 'Lemuh'
    | 'Lime'
    | 'Buns'
    | 'Blue'
    | 'Choi'
    | 'Turni'
    | 'Driftwood'
    | 'Turtly'
    | 'Purple'
    | 'Tomat'
    | 'Bomber'
    | 'Peppermint'
    | 'Glass'
    | 'Crystal'
    | 'Green'
    | 'Cloudy'
    | 'Wood'
    | 'Earthy'
    | 'Confetti'
    | 'Cream'
    | 'Fire'
    | 'Geeny'
    | 'Yeti'
    | 'Galxy'
    | 'Lava'
    | 'Gorli'
    | 'Bunzilian'
    | 'Bricks'
    | 'Purr'
    | 'Nebula'
    | 'Tux'
    | 'Pup'
    | 'Detec'
    | 'SuperBun'
    | 'Cowboy'
    | 'Silver'
    | 'Chikki'
    | 'Mini'
    | 'Leathy'
    | 'Sproto'
    | 'Hippy'
    | 'Snake'
    | 'Ket'
    | 'Joker'
    | 'Kev'
    | 'Pipe'
    | 'RaceCar'
    | 'Dev'
    | 'Goldie'
    | 'Angel'
    | 'Spirit';


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
    thumbUrl: string;
    farm: Plot[];
    hungerLevel: number;
    isHibernating: boolean;
    isCoolingDown: boolean;
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
        {
            name: 'GOLD',
            balance: 20,
        },
    ],
    nfts: [], // No NFTs
};

export const wallet = writable<Wallet>(starterWallet);

export const addItemToWallet = (bunIndex: number, newItem: Item) => {
    wallet.update((wallet) => {
        const bun = wallet.nfts[bunIndex];
        if (!bun || !bun.wallet) {
            console.error('you stupid idiot');
            return wallet;
        }
        const existingItem = bun.wallet.items.find((item) => item.name === newItem.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            bun.wallet.items.push({ ...newItem });
        }
        console.log(`Added ${newItem.name} to Bun ${bun.id}. New quantity: ${newItem.quantity}`);
        return wallet;
    });
};

export const subtractItemFromWallet = (bunIndex: number, itemToSubtract: Item) => {
    wallet.update((wallet) => {
        const bun = wallet.nfts[bunIndex];
        if (!bun || !bun.wallet) {
            console.error('you smart genius');
            return wallet;
        }
        const existingItem = bun.wallet.items.find((item) => item.name === itemToSubtract.name);
        if (existingItem && existingItem.quantity > 0) {
            existingItem.quantity -= 1;
        }
        console.log(`${bun.name} used ${itemToSubtract.name}. New quantity: ${itemToSubtract.quantity}`);
        return wallet;
    });
};


export const updateGold = (bunIndex: number, amount: number) => {
    wallet.update((wallet) => {
        wallet.nfts[bunIndex].wallet.gold += amount;
        if (amount > 0) {
            console.log(`added ${amount} gold to ${wallet.nfts[bunIndex].name}'s wallet`);
        }
        if (amount < 0) {
            console.log(`subtracted ${amount} gold from ${wallet.nfts[bunIndex].name}'s wallet`);
        }
        return wallet;
    })
}
