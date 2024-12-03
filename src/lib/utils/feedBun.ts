// feedBun.ts
import type { Bun, Item } from '$lib/stores/wallet';
import { wallet } from '$lib/stores/wallet';
import { writable, get } from 'svelte/store';
import { addMessage, addToast, toasts } from '$lib/stores/gameState';
import { restartHungerInterval } from '$lib/stores/hungerState';
import { activateBunBlaster, narcanBun, totalFruitsEaten } from '$lib/stores/abilities';

// use this to hold the items that are selected for feeding
export let itemsToFeedMyBun = writable<{ bunId: number; food: Item[] }[]>([]);

// get all selected items for a bun
const getSelectedBunConsumableItems = (bunId: number) => {
    const itfmb = get(itemsToFeedMyBun);
    return itfmb.find((i) => i.bunId === bunId)?.food || [];
};

// get quantity of selected bun items
const getSelectedItemQuantity = (bunId: number, itemName: string) => {
    const itfmb = get(itemsToFeedMyBun);
    return (
        itfmb.find((i) => i.bunId === bunId)?.food.find((f) => f.name === itemName)
            ?.quantity || 1
    );
};


export function handleClearAll(bun: Bun) {
    // map through
    itemsToFeedMyBun.update((items) => [
        ...items.map((bunItems) => {
            // if we get to the correct bun
            if (bunItems.bunId === bun.id) {
                return {
                    ...bunItems,
                    // clear the food array
                    food: []
                };
            }
            // else return bunItems as we found it
            return { ...bunItems, food: [...bunItems.food] };
        })
    ]);
}

export function feedBun(bun: Bun) {
    console.log('feeding bun');
    const itemsToEat = get(itemsToFeedMyBun).find((i) => i.bunId === bun.id)?.food || [];
    console.log('items to eat:', itemsToEat);
    itemsToEat.forEach((item) => {
        const itemName = item.name;
        console.log('item: ', itemName);
        switch (itemName) {
            case 'Bun Blaster':
                activateBunBlaster(bun);
                break;
            case 'Bunzempic':
                narcanBun(bun);
                break;
            case 'Heart Fruit':
            case 'Lumpy Fruit':
            case 'Star Fruit':
            case 'Round Fruit':
            case 'Square Fruit':
            case 'Slop':
                eatFruit(bun, itemName, item.quantity);
                break;
            default:
                break;
        }
    })
    handleClearAll(bun);
}

function eatItem(itemName: string) {
    // update wallet
    wallet.update((currentWallet) => {
        // find bun
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) {
            console.error('bun not found');
            return currentWallet;
        }
        const bunNft: Bun = currentWallet.nfts[bunIndex];

        // handle item ability
        switch (itemName) {
            case 'Bun Blaster':
                activateBunBlaster(bunNft);
                break;
            case 'Bunzempic':
                narcanBun(bunNft);
                break;
            case 'Heart Fruit':
            case 'Lumpy Fruit':
            case 'Star Fruit':
            case 'Round Fruit':
            case 'Square Fruit':
            case 'Slop':
                eatFruit(bunNft, itemName);
                break;
            default:
                break;
        }
        return currentWallet;
    });
}

export let playSparkle = writable<boolean>(false);
export let showHungerReduced = writable<boolean>(false);
export let latestStatIncrease = writable<string>('');
export let showStatIncrease = writable<boolean>(false);
export let lastFedBunIndex = writable<number | null>(null);

export function eatFruit(bun: Bun, fruitName: string, quantity: number = 1) {
    console.log('eating fruit');
    // wallet update
    wallet.update((currentWallet) => {
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) {
            console.error('bun not found');
            return currentWallet;
        }
        const bunNft: Bun = currentWallet.nfts[bunIndex];

        if (bunNft.isHibernating) {
            addMessage('Cannot feed bun in hibernation. Use Bunzempic to revive');
            return currentWallet;
        }
        if (bunNft.isCoolingDown) {
            addMessage(
                `Cannot feed ${bun.name}. Wait until cool down period is over to be fully revived`
            );
            return currentWallet;
        }
        const fruitItem = bun.wallet.items.find((item: Item) => item.name === fruitName);

        // check if the fruit exists and that the quantity is > 0
        if (fruitItem && fruitItem.quantity > 0) {
            // decrement
            fruitItem.quantity -= quantity;
            // reset hunger
            bunNft.hungerLevel = 0;
            restartHungerInterval(bunNft);
            playSparkle.set(true);
            showHungerReduced.set(true);
            setTimeout(() => {
                showHungerReduced.set(false);
                showStatIncrease.set(true);
            }, 2500);
            setTimeout(() => {
                showStatIncrease.set(false);
            }, 5000);
            setTimeout(() => {
                playSparkle.set(false);
            }, 5000);

            // handle fruit type
            switch (fruitItem.fruitType) {
                case 'heart':
                    bunNft.strength += quantity;
                    latestStatIncrease.set('Strength');
                    addMessage(`Hunger reduced. Strength +${quantity}.`);
                    break;
                case 'star':
                    bunNft.luck += quantity;
                    latestStatIncrease.set('Luck');
                    addMessage(`Hunger reduced. Luck +${quantity}.`);
                    break;
                case 'lumpy':
                    bunNft.stamina += quantity;
                    latestStatIncrease.set('Stamina');
                    addMessage(`Hunger reduced. Stamina +${quantity}.`);
                    break;
                case 'round':
                    bunNft.speed += quantity;
                    latestStatIncrease.set('Speed');
                    addMessage(`Hunger reduced. Speed +${quantity}.`);
                    break;
                case 'square':
                    bunNft.industry += quantity;
                    latestStatIncrease.set('Industry');
                    addMessage(`Hunger reduced. Industry +${quantity}.`);
                    break;
                case 'slop':
                    addMessage('Hunger reduced.');
                    break;
                default:
                    break;
            }

            // add to total fruits eaten
            totalFruitsEaten.update((total) => (total += quantity));

            lastFedBunIndex.set(bunIndex);

            setTimeout(() => {
                lastFedBunIndex.update((currentIndex) => currentIndex === bunIndex ? null : currentIndex);
            }, 2000);

            return currentWallet;
        } else {
            addMessage(`You do not have any ${fruitName}s.`);
            return currentWallet;
        }
    });
}

