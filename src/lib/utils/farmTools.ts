import type { Bun, Plot, Item } from '$lib/stores/wallet';
import { addMessage } from '$lib/stores/gameState';

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

export function plantBatchSeeds(bun: Bun, seeds: Item[]): PlantingResult {
    let seedsPlanted = 0;
    const bunCopy = structuredClone(bun);
    
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
                // Extract the base type from the seed name (e.g., "Square" from "FarmTek Square Seed")
                const baseType = seed.name.split(' ')[1].toLowerCase();
                
                bunCopy.farm[index] = {
                    state: 'planted',
                    type: baseType,  // Use the extracted type
                    fruitRemaining: seed.name.toLowerCase().includes('withered') ? 3 : 5,
                    fruitsReady: 0,
                    plantedAt: Date.now(),
                    isWithered: seed.name.toLowerCase().includes('withered')
                };
                plantedForThisSeed++;
                seedsPlanted++;
            }
        });

        if (plantedForThisSeed > 0) {
            walletSeed.quantity -= plantedForThisSeed;
            addMessage(`${bun.name} planted ${plantedForThisSeed} ${seed.name}${plantedForThisSeed > 1 ? 's' : ''}`);
        }
    });

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
