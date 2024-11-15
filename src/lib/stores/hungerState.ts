import { wallet, type bun } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';
import { writable, type Writable } from 'svelte/store';

export const HUNGER_INTERVAL = 10000;
export const MAX_HUNGER_LEVEL = 6;
export const bunStatus = ['Bloated', 'Full', 'Fine', 'Hungry', 'Famished', 'Starving', 'Hibernating'];

export const hibernationTimers: Writable<Record<number, number>> = writable({});
// export const hibernationTimers = writable<Record<number, number>>({});

function updateHungerState(bun: Bun) {
    wallet.update((currentWallet) => {
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) return currentWallet;

        const bunNft = currentWallet.nfts[bunIndex];
        if (bunNft.isHibernating) return currentWallet;

        bunNft.hungerLevel += 1;

        if (bunNft.hungerLevel >= MAX_HUNGER_LEVEL) {
            bunNft.hungerLevel = MAX_HUNGER_LEVEL;
            bunNft.isHibernating = true;
            clearInterval(bunNft.hungerIntervalId);
            bunNft.hungerIntervalId = undefined;
            addMessage(`${bunNft.name} has entered into a state of hibernation...`);

            hibernationTimers.update(timers => {
                delete timers[bunNft.id];
                return timers;
            });
        } else {
            const timeUntilHibernation = (MAX_HUNGER_LEVEL - bunNft.hungerLevel) * HUNGER_INTERVAL;
            hibernationTimers.update(timers => ({
                ...timers,
                [bunNft.id]: Date.now() + timeUntilHibernation
            }));
        }

        return currentWallet;
    });
}

export function startHungerInterval(bun: Bun) {
    // clear existing interval
    if (bun.hungerIntervalId) {
        clearInterval(bun.hungerIntervalId);
    }

    const timeUntilHibernation = (MAX_HUNGER_LEVEL - bun.hungerLevel) * HUNGER_INTERVAL;
    hibernationTimers.update(timers => ({
        ...timers,
        [bun.id]: Date.now() + timeUntilHibernation
    }));

    const intervalId = setInterval(() => updateHungerState(bun), HUNGER_INTERVAL);
    bun.hungerIntervalId = intervalId
}

export function restartHungerInterval(bun: Bun) {
    // clear interval
    if (bun.hungerIntervalId) {
        clearInterval(bun.hungerIntervalId);
        bun.hungerIntervalId = undefined;
    }

    // reset hungerlevel in wallet
    wallet.update((currentWallet) => {
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) return currentWallet;

        const bunNft: Bun = currentWallet.nfts[bunIndex];
        // reset hunger level to 0
        bunNft.hungerLevel = 0;
        bunNft.isHibernating = false;
        return currentWallet

    })

    // restart interval
    startHungerInterval(bun);
}

export function getTimeUntilHibernation(bunId: number): number {
    let remainingTime = 0;
    hibernationTimers.subscribe(timers => {
        const hibernationTimer = timers[bunId];
        if (hibernationTime) {
            remainingTime = Math.max(0, hibernationTime - Date.now());
        }

    })();
    return remainingTime;
}

