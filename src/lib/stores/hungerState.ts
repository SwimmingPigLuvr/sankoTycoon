import { wallet, type Bun } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';

const bunStatus = ['Bloated', 'Full', 'Fine', 'Hungry', 'Famished', 'Starving', 'Hibernating'];

function startHungerInterval(bun: Bun) {
    // clear existing interval
    if (bun.id) {
        clearInterval(bun.id);
    }

    const HUNGER_INTERVAL = 1000 * 10;

    const intervalId = setInterval(() => {
        wallet.update((currentWallet) => {
            const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
            if (bunIndex === -1) {
                console.error('bun not found');
                return currentWallet;
            }
            const bunNft: Bun = currentWallet.nfts[bunIndex];

            // check if hibernating
            if (bunNft.isHibernating) {
                return currentWallet;
            }

            // increase hunger
            bunNft.hungerLevel += 1;
            bunNft.hungerLevel = Math.min(bunNft.hungerLevel, bunStatus.length - 1);

            // hibernation after starvation
            if (bunNft.hungerLevel === bunStatus.length -1) {
                bunNft.isHibernating = true;
                addMessage(`${bunNft.name} has entered into a state of hibernation...`);
            }

            return currentWallet;
        });
    }, HUNGER_INTERVAL);
}

function restartHungerInterval(bun: Bun) {
    // clear interval
    if (bun.id) {
        clearInterval(bun.id);
    }

    // reset hunger
    bun.hungerLevel = 0;

    // restart interval
    startHungerInterval(bun);
}

export { startHungerInterval, restartHungerInterval };
