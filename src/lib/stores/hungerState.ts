import { wallet, type Bun } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';

const bunStatus = ['Bloated', 'Full', 'Fine', 'Hungry', 'Famished', 'Starving', 'Hibernating'];

function startHungerInterval(bun: Bun) {
    // clear existing interval
    if (bun.hungerIntervalId) {
        console.log(`clearing hunger interval for ${bun.name} #${bun.id}`);
        clearInterval(bun.hungerIntervalId);
    }

    const HUNGER_INTERVAL = 1000 * 5;

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

            console.log(`${bun.name}'s hunger level increased to ${bun.hungerLevel}`);

            // hibernation after starvation
            if (bunNft.hungerLevel === bunStatus.length -1) {
                bunNft.isHibernating = true;
                addMessage(`${bunNft.name} has entered into a state of hibernation...`);
            }

            return currentWallet;
        });
    }, HUNGER_INTERVAL);

    // store interval in bun object
    bun.hungerIntervalId = intervalId
    console.log('started hunger interval id #:', intervalId);
}

function restartHungerInterval(bun: Bun) {
    // clear interval
    if (bun.hungerIntervalId) {
        console.log('clearing existing hunger interval for', bun.name);
        clearInterval(bun.hungerIntervalId);
        bun.hungerIntervalId = undefined;
    }

    // reset hungerlevel in wallet
    wallet.update((currentWallet) => {
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) {
            console.error('bun not found');
            return currentWallet;
        }
        const bunNft: Bun = currentWallet.nfts[bunIndex];
        // reset hunger level to 0
        bunNft.hungerLevel = 0;
        console.log('reset hunger level for', bun.name);
        return currentWallet

    })

    // restart interval
    startHungerInterval(bun);
}

export { startHungerInterval, restartHungerInterval };
