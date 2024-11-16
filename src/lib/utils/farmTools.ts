import type { Bun, Plot, Item } from '$lib/stores/wallet';
import { wallet } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';
import {
    totalTreesPlanted,
    totalFruitHarvested,
} from '$lib/stores/abilities';
import { get } from 'svelte/store';

interface PlantingResult {
    updatedBun: Bun;
    seedsPlanted: number;
}

export function createSeedObject(type: string, quantity: number): Item {
    const newSeed: Item = {
        type: 'seed',
        name: `FarmTek ${type} Seed`,
        quantity: quantity,
        imgPath: `/images/seeds/${type}.png`,
        fruitType: type,
    };
    return newSeed;
}


// Function to plant a seed in the selected plot
export function plantSeed(bun: Bun, selectedSeed: Item | undefined, selectedPlotIndex: number) {
    if (!selectedSeed || selectedPlotIndex === null || !selectedSeed.fruitType) {
        return false;
    }

    let success = false;

    // update seed quantity & plot
    wallet.update((currentWallet) => {
        const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
        if (bunIndex === -1) {
            return currentWallet;
        }

        const bunNft = currentWallet.nfts[bunIndex];
        let seed = bunNft.wallet.items.find(
            (item: Item) =>
                item.type === selectedSeed?.type && item.fruitType === selectedSeed?.fruitType
        );

        if (seed && seed.quantity > 0) {
            seed.quantity -= 1;

            // update plot
            bunNft.farm[selectedPlotIndex] = {
                state: 'planted',
                type: selectedSeed?.fruitType,
                maturity: 0,
                fruitRemaining: selectedSeed?.type === 'witheredSeed' ? 3 : 5,
                fruitsReady: 0,
                plantedAt: Date.now(),
                isWithered: selectedSeed?.type === 'witheredSeed'
            };
            totalTreesPlanted.update((total) => (total += 1));

            // trigger reactivity
            bunNft.farm = [...bunNft.farm];

            // clear selected seed
            selectedSeed = undefined;

            startPlotGrowthTimer(bunIndex, selectedPlotIndex);
            success = true;
        }
        return currentWallet;
    });
}

export function startPlotGrowthTimer(bunIndex: number, plotIndex: number) {
    const currentBun = get(wallet).nfts[bunIndex];
    if (!currentBun || !currentBun.farm[plotIndex]) return;

    if (!currentBun.plotTimers) {
        currentBun.plotTimers = Array(25).fill(null);
    }

    if (currentBun.plotTimers[plotIndex]) {
        clearInterval(currentBun.plotTimers[plotIndex]);
    }

    currentBun.plotTimers[plotIndex] = setInterval(() => {
        const bunFromStore = get(wallet).nfts[bunIndex];
        let plot = bunFromStore.farm[plotIndex];

        if (plot.state === 'planted' && plot.maturity !== undefined) {
            if (plot.maturity < 100) {
                plot.maturity += 25;
            }

            if (plot.maturity === 100 && plot.fruitsReady < plot.fruitRemaining) {
                plot.fruitsReady += 1;
            }

            if (plot.fruitsReady >= plot.fruitRemaining) {
                clearInterval(currentBun.plotTimers[plotIndex]);
                currentBun.plotTimers[plotIndex] = null;
            }

            wallet.update((currentWallet) => {
                currentWallet.nfts[bunIndex].farm = [...bunFromStore.farm];
                return currentWallet;
            });
        }
    }, 1000);
}

export function harvestFruit(bun: Bun, index: number) {
    let plots = bun?.farm ?? Array(25).fill({ state: 'empty' });
    let plot = plots[index];

    let bunWallet = bun?.wallet ?? { bunId: 777, gold: 0, items: [itemData.hardHat] };

    let availableSeeds = bunWallet?.items.filter((item: Item) => item.type === 'seed' && item.quantity > 0) ?? [];
    let availableWitheredSeeds = bunWallet?.items.filter((item: Item) => item.type === 'witheredSeed' && item.quantity > 0) ??
    [];
    let allAvailableSeeds = [...availableSeeds, ...availableWitheredSeeds];
    if (plot.fruitsReady && plot.fruitsReady > 0) {
        // update bunWallet
        wallet.update((currentWallet) => {
            const bunIndex = currentWallet.nfts.findIndex((nft: Bun) => nft.id === bun.id);
            if (bunIndex === -1) {
                alert('bun not found');
                return currentWallet;
            }
            const bunNft: Bun = currentWallet.nfts[bunIndex];

            // find the fruit type
            let fruit = bunNft.wallet.items.find(
                (item: Item) => item.type === 'fruit' && item.fruitType === plot.type
            );

            // find witheredSeed
            let witheredSeed = bunNft.wallet.items.find(
                (item: Item) => item.type === 'witheredSeed' && item.fruitType === plot.type
            );

            // add fruit to wallet
            if (fruit && plot.fruitsReady) {
                fruit.quantity += plot.fruitsReady;
            }

            // update plot
            if (plot.fruitsReady && plot.fruitRemaining) {
                plot.fruitRemaining -= plot.fruitsReady;
                plot.fruitsReady = 0;
            }

            if (plot.fruitRemaining === 0 && plot.fruitsReady === 0) {
                // add witheredSeeds to bunWallet
                if (!plot.isWithered) {
                    if (witheredSeed) {
                        witheredSeed.quantity += 1;
                    }
                }

                // clear plot
                plot.state = 'empty';
            }

            // reassign farm to trigger reactivity
            bunNft.farm = [...bunNft.farm];

            totalFruitHarvested.update((total) => (total += 1));
            return currentWallet;
        });
    }
    allAvailableSeeds = [...allAvailableSeeds];
}

export function plantBatchSeeds(bun: Bun, seeds: Item[]): PlantingResult {
    let seedsPlanted = 0;
    const bunCopy = structuredClone(bun);
    const plantedPlots: number[] = [];
    
    seeds.forEach(seed => {
        const walletSeed = bunCopy.wallet.items.find((item: Item) => item.name === seed.name);
        if (!walletSeed || walletSeed.quantity === 0) {
            return;
        }

        const plantingQuantity = Math.min(seed.quantity, walletSeed.quantity);
        let plantedForThisSeed = 0;
        
        bunCopy.farm.forEach((plot: Plot, index: number) => {
            if (plantedForThisSeed >= plantingQuantity) return;
            if (plot.state === 'empty') {

                const isWithered = seed.name.toLowerCase().includes('withered');
                const nameParts = seed.name.split(' ');
                const baseType = isWithered
                    ? nameParts[1].toLowerCase()
                    : nameParts[0].toLowerCase();
                
                bunCopy.farm[index] = {
                    state: 'planted',
                    type: baseType,
                    maturity: 0,
                    fruitRemaining: isWithered ? 3 : 5,
                    fruitsReady: 0,
                    plantedAt: Date.now(),
                    isWithered: isWithered
                };
                plantedPlots.push(index);
                plantedForThisSeed++;
                seedsPlanted++;
                totalTreesPlanted.update((total) => total + 1);
            }
        });

        if (plantedForThisSeed > 0) {
            walletSeed.quantity -= plantedForThisSeed;
            addMessage(`${bun.name} planted ${plantedForThisSeed} ${seed.name}${plantedForThisSeed > 1 ? 's' : ''}`);
        }
    });

    const bunIndex = get(wallet).nfts.findIndex((nft: Bun) => nft.id === bun.id);

    if (bunIndex !== -1) {
        plantedPlots.forEach(plotIndex => {
            if (!bunCopy.plotTimers) {
                bunCopy.plotTimers = Array(25).fill(null);

            }
            startPlotGrowthTimer(bunIndex, plotIndex);

        })

    }

    if (seedsPlanted === 0) {
        addMessage('Farm is fully planted. No more plots to plant');
    }

    return {
        updatedBun: bunCopy,
        seedsPlanted
    };
}

// Helper functions
function getFruitTypeFromSeed(seedName: string): string {
    // Map seed names to fruit types
    const seedToFruit: { [key: string]: string } = {
        'FarmTek Heart Seed': 'heart',
        'FarmTek Star Seed': 'star',
        'FarmTek Lumpy Seed': 'lumpy',
        'FarmTek Round Seed': 'round',
        'FarmTek Square Seed': 'square'
    };
    return seedToFruit[seedName] || 'unknown';
}

function getFruitYieldForSeed(seedName: string): number {
    // Define how many fruits each seed type produces
    const seedYields: { [key: string]: number } = {
        'FarmTek Heart Seed': 3,
        'FarmTek Star Seed': 3,
        'FarmTek Lumpy Seed': 3,
        'FarmTek Round Seed': 3,
        'FarmTek Square Seed': 3,
        'FarmTek Withered Heart Seed': 1,
        'FarmTek Withered Star Seed': 1,
        'FarmTek Withered Lumpy Seed': 1,
        'FarmTek Withered Round Seed': 1,
        'FarmTek Withered Square Seed': 1
    };
    return seedYields[seedName] || 0;
}
