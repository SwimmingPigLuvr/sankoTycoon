// lib/stores/abilities.ts
import { writable } from "svelte/store";
import { wallet, type Bun, type Item } from "./wallet";
import { addMessage } from "./gameState";
import { restartHungerInterval } from "./hungerState";

export const showDashboard = writable<boolean>(false);
export const showAbout = writable<boolean>(true);

// double sale values
export const bunBlasted = writable<boolean>(false);

// cool down period after reviving bun
export const isReviving = writable<boolean>(false);

export interface AutoHarvest {
    purchased: boolean;
    enabled: boolean;
    level: number;
}

const myAutoHarvest: AutoHarvest = {
    purchased: false,
    enabled: false,
    level: 0,
}
export const autoHarvest = writable<AutoHarvest>(myAutoHarvest);
export const totalFruitHarvested = writable<number>(0);

export interface Click2plant {
    purchased: boolean;
    enabled: boolean;
    level: number;
}

const myClick2plant: Click2plant = {
    purchased: false,
    enabled: false,
    level: 0,
}

export const click2plant = writable<Click2plant>(myClick2plant);
export const totalTreesPlanted = writable<number>(0);

// auto feed your buns
export interface AutoFeeder {
    enabled: boolean;
    purchased: boolean;
}
const myAutoFeeder: AutoFeeder = {
    enabled: false,
    purchased: false,
}

export const autoFeeder = writable<AutoFeeder>(myAutoFeeder);
export const totalFruitsEaten = writable<number>(0);


// auto sell those fruits
export interface AutoBuyer {
    rate: number;
    enabled: boolean;
    purchased: boolean;
    level: number;
}

const myAutoBuyer: AutoBuyer = {
    rate: 0.5,
    enabled: false,
    purchased: false,
    level: 0,
}

export const autoBuyer = writable<AutoBuyer>(myAutoBuyer);
export const totalSeedsBought = writable<number>(0);

// auto sell those fruits
export interface AutoSeller {
    rate: number;
    enabled: boolean;
    purchased: boolean;
    level: number;
}

const myAutoSeller: AutoSeller = {
    rate: 0.5,
    enabled: false,
    purchased: false,
    level: 0,
}

export const autoSeller = writable<AutoSeller>(myAutoSeller);
export const totalFruitsSold = writable<number>(0);

export interface Farmtek {
    purchased: boolean;
    enabled: boolean;
}

const farmtekDisc: Farmtek = {
    purchased: false,
    enabled: false,
}
export const farmtek = writable<Farmtek>(farmtekDisc);

export let currentAbility = writable<string | undefined>(undefined);

export function activateBunBlaster(bun: Bun) {
    // find bun blaster in inventory
    const blaster = bun.wallet.items.find((item: Item) => item.name === 'Bun Blaster');
    if (blaster && blaster.quantity > 0) {
        // clear currentAbility message
        currentAbility.set(undefined);
        // decrement blaster by 1
        blaster.quantity -= 1;

        // check gold
        let startingGold = bun.wallet.gold;
        // activate bun blaster state
        bunBlasted.set(true);
        addMessage(`${bun.name} inhales an extremely deep breath of nitrous from the Bun Blaster.`);

        // lasts 10s
        setTimeout(() => {
            bunBlasted.set(false);
            addMessage('The effects from the Bun Blaster have worn off.');
            let endingGold = bun.wallet.gold;
            let profit = endingGold - startingGold;
            addMessage(`Total Gold earned while blasted: ${profit}`);
        }, 10000);
    } else {
        addMessage('No Bun Blaster detected. Consider buying one from the shop.');
    }
}

export function narcanBun(bun: Bun) {
    if (!bun.isHibernating) {
        addMessage('Cannot use bunzempic on bun that is not in hibernation.');
        return;
    }
    // clear currentAbility message
    currentAbility.set(undefined);

    // find bunzempic
    const bunzempicBottle = bun.wallet.items.find((item: Item) => item.name === 'Bunzempic');
    if (bunzempicBottle && bunzempicBottle.quantity > 0) {
        // decrement
        bunzempicBottle.quantity -= 1;

        // reset hunger level
        bun.hungerLevel = 0;
        // wake up bun
        bun.isHibernating = false;
        // start cool down period
        bun.isCoolingDown = true;
        addMessage(`${bun.name} is reviving...`);
        const COOLDOWN_DURATION = 5000;

        setTimeout(() => {
            // reset hunger
            restartHungerInterval(bun);
            // update wallet
            wallet.update((currentWallet) => {
                const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
                if (bunIndex === -1) {
                    return currentWallet;
                }
                const bunNft = currentWallet.nfts[bunIndex];
                bunNft.isCoolingDown = false;
                addMessage(`${bunNft.name} has been revived.`);
                return currentWallet;
            });
        }, COOLDOWN_DURATION);
    } else {
        addMessage('No Bunzempic left to use. Buy some from the shop');
    }
}

