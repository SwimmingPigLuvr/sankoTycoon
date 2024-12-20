import type { Item } from '$lib/stores/wallet';
import { writable } from 'svelte/store';

// daily shop items
export let dailyItems = writable<Item[]>([]);

// consumables
export const slop: Item = {
    type: 'consumable',
    name: 'Slop',
    quantity: 0,
    imgPath: '/images/items/Slop.png',
    buyPrice: 0.5,
    description: "Slop just hardly satiates your Bun.",
    ability: "Slop just hardly satiates your Bun.",
};

// consumables
export const bunzempic: Item = {
    type: 'consumable',
    name: 'Bunzempic',
    quantity: 1,
    imgPath: '/images/items/Bunzempic.png',
    buyPrice: 2,
    description: "Dead Bun? Bunzempic should fix him right up...",
    ability: "Dead Bun? Bunzempic should fix him right up...",
};

// wearables
// hats
export const twoThousandElevenHat: Item = {
    type: 'wearable',
    name: '2011 Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/2011Hat.png',
};

export const alienHat: Item = {
    type: 'wearable',
    name: 'Alien Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/AlienHat.png',
};

export const alpinistHat: Item = {
    type: 'wearable',
    name: 'Alpinist Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/AlpinistHat.png',
};

export const birthdayHat: Item = {
    type: 'wearable',
    name: 'Birthday Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BirthdayHat.png',
};

export const blackPompadour: Item = {
    type: 'wearable',
    name: 'Black Pompadour',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BlackPompadour.png',
};

export const blondePompadour: Item = {
    type: 'wearable',
    name: 'Blonde Pompadour',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BlondePompadour.png',
};

export const blueDurag: Item = {
    type: 'wearable',
    name: 'Blue Durag',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BlueDurag.png',
};

export const bunDutchTruckerCap: Item = {
    type: 'wearable',
    name: 'Bun Dutch Trucker Cap',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BunDutchTruckerCap.png',
};

export const bunnyEars: Item = {
    type: 'wearable',
    name: 'Bunny Ears',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/BunnyEars.png',
};

export const chefHat: Item = {
    type: 'wearable',
    name: 'Chef Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/ChefHat.png',
};

export const chromeDurag: Item = {
    type: 'wearable',
    name: 'Chrome Durag',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/ChromeDurag.png',
    buyPrice: 25,
    description: 'Chrome Durags? Chaight Playa.'
};

export const devoHat: Item = {
    type: 'wearable',
    name: 'DEVO Hat',
    quantity: 0,
    buyPrice: 5,
    imgPath: 'images/items/wearables/hats/DEVO.png',
};

export const elfHat: Item = {
    type: 'wearable',
    name: 'Elf Hat',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/ElfHat.png',
    buyPrice: 5,
};

export const fbiHat: Item = {
    type: 'wearable',
    name: 'FBI Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/FBIHat.png',
};

export const fruitHat: Item = {
    type: 'wearable',
    name: 'Fruit Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/FruitHat.png',
};

export const hamburgerHat: Item = {
    type: 'wearable',
    name: 'Hamburger Hat',
    quantity: 0,
    buyPrice: 5,
    imgPath: 'images/items/wearables/hats/HamburgerHat.png',
};

export const hardHat: Item = {
    type: 'wearable',
    name: 'Hard Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/HardHat.png',
};

export const harlequinHat: Item = {
    type: 'wearable',
    buyPrice: 5,
    name: 'Harlequin Hat',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/HarlequinHat.png',
};

export const mabaCap: Item = {
    buyPrice: 5,
    type: 'wearable',
    name: 'MABA Cap',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/MABACap.png',
};

export const matrixBucketHat: Item = {
    type: 'wearable',
    name: 'Matrix Bucket Hat',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/MatrixBucketHat.png',
    buyPrice: 30,
    description: "I got a Matrix Bucket Hat on me."
};

export const newsBoyHat: Item = {
    type: 'wearable',
    name: 'News Boy Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/NewsBoyHat.png',
};

export const niqab: Item = {
    type: 'wearable',
    name: 'Niqab',
    quantity: 0,
    imgPath: 'images/items/wearables/hats/Niqab.png',
    buyPrice: 100,
};

export const nycCap: Item = {
    type: 'wearable',
    name: 'NYC Cap',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/NYCCap.png',
};

export const paperHat: Item = {
    type: 'wearable',
    name: 'Paper Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/PaperHat.png',
};

export const pirateHat: Item = {
    type: 'wearable',
    name: 'Pirate Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/PirateHat.png',
};

export const redDurag: Item = {
    type: 'wearable',
    name: 'Red Durag',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/RedDurag.png',
};

export const sombrero: Item = {
    type: 'wearable',
    name: 'Sombrero',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/Sombrero.png',
};

export const sunVisor: Item = {
    type: 'wearable',
    name: 'Sun Visor',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/SunVisor.png',
};

export const tenGallonHat: Item = {
    type: 'wearable',
    name: 'Ten Gallon Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/TenGallonHat.png',
};

export const uncleSamHat: Item = {
    type: 'wearable',
    name: 'Uncle Sam Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/UncleSamHat.png',
};

export const wizardHat: Item = {
    type: 'wearable',
    name: 'Wizard Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/WizardHat.png',
};

export const yellowHat: Item = {
    type: 'wearable',
    name: 'Yellow Hat',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hats/YellowHat.png',
    description: 'This is a happy yellow hat.'
};

// glasses
export const seventiesGlasses: Item = {
    type: 'wearable',
    name: "70s Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/70sGlasses.png',
};

export const bearMask: Item = {
    type: 'wearable',
    name: "Bear Mask",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/BearMask.png',
};

export const cateyeGlasses: Item = {
    type: 'wearable',
    name: "Cateye Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/CateyeGlasses.png',
};

export const disguiseMask: Item = {
    type: 'wearable',
    name: "Disguise Mask",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/DisguiseMask.png',
};

export const funkyGlasses: Item = {
    type: 'wearable',
    name: "Funky Glasses",
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/FunkyGlasses.png',
    buyPrice: 8,
    description: "Free you mind and you Bun will follow.",
    ability: "View realtime insights on your grow operations.",
};

export const greenStarGlasses: Item = {
    type: 'wearable',
    name: "Green Star Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/GreenStarGlasses.png',
};

export const masqueradeMask: Item = {
    type: 'wearable',
    name: "Masquerade Mask",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/MasqueradeMask.png',
};

export const mogGlasses: Item = {
    type: 'wearable',
    name: "Mog Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/MogGlasses.png',
};

export const npcMask: Item = {
    type: 'wearable',
    name: "NPC Mask",
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/NPCMask.png',
    buyPrice: 20,
    description: "I am an Independent Thinker."
};

export const pineappleGlasses: Item = {
    type: 'wearable',
    name: "Pineapple Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/PineappleGlasses.png',
};

export const screamMask: Item = {
    type: 'wearable',
    name: "Scream Mask",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/ScreamMask.png',
};

export const strongmanMoggles: Item = {
    type: 'wearable',
    name: "Strongman Moggles",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/StrongmanMoggles.png',
};

export const yokoGlasses: Item = {
    type: 'wearable',
    name: "Yoko Glasses",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/YokoGlasses.png',
};

export const zappers: Item = {
    type: 'wearable',
    name: "Zappers",
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/glasses/Zappers.png',
};

// hands
export const ak47: Item = {
    type: 'wearable',
    name: 'AK47',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/AK47.png',
    buyPrice: 20,
}

export const albanianBoxingGloves: Item = {
    type: 'wearable',
    name: 'Albanian Boxing Gloves',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/AlbanianBoxingGloves.png',
    buyPrice: 18,
    description: "Only trust your fists: police will never help you.",
    ability: "Beat the shit outta the little troll who spins the wheel. 1 time use. Removes all 'X' values from the wheel."
}

export const baguette: Item = {
    type: 'wearable',
    name: 'Baguette',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Baguette.png',
    buyPrice: 8,
}

export const boombox: Item = {
    type: 'wearable',
    name: 'Boombox',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Boombox.png',
    buyPrice: 8,
}

export const bunOil: Item = {
    type: 'wearable',
    name: 'Bun Oil',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/BunOil.png',
    buyPrice: 6,
    description: 'Stock Up Before B Diddy Comes Thru.'
}

export const bunPlush: Item = {
    type: 'wearable',
    name: 'Bun Plush',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/BunPlush.png',
}

export const buntell: Item = {
    type: 'wearable',
    name: 'Buntell',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Buntell.png',
}

export const camcorder: Item = {
    type: 'wearable',
    name: 'Camcorder',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Camcorder.png',
}

export const cola: Item = {
    type: 'wearable',
    name: 'Cola',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Cola.png',
}

export const doubleChunkChocolateCookie: Item = {
    type: 'wearable',
    name: 'Double Chunk Chocolate Cookie',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/DoubleChunkChocolateCookie.png',
    buyPrice: 8,
}

export const doubleCup: Item = {
    type: 'wearable',
    name: 'Double Cup',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/DoubleCup.png',
    buyPrice: 8,
}

export const juiceNeedle: Item = {
    type: 'wearable',
    name: 'Juice Needle',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/JuiceNeedle.png',
    buyPrice: 8,
}

export const paintBrush: Item = {
    type: 'wearable',
    name: 'Paint Brush',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/PaintBrush.png',
    buyPrice: 8,
}

export const paperBag: Item = {
    type: 'wearable',
    name: 'Paper Bag',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/PaperBag.png',
    buyPrice: 8,
}

export const paperPlane: Item = {
    type: 'wearable',
    name: 'Paper Plane',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/PaperPlane.png',
    buyPrice: 8,
}

export const pimpCup: Item = {
    type: 'wearable',
    name: 'Pimp Cup',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/PimpCup.png',
}

export const pinkAk47: Item = {
    type: 'wearable',
    name: 'Pink AK47',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/PinkAK47.png',
}

export const shovel: Item = {
    type: 'wearable',
    name: 'Shovel',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/Shovel.png',
}

export const sprayCan: Item = {
    type: 'wearable',
    name: 'Spray Can',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/SprayCan.png',
}

export const woodSword: Item = {
    type: 'wearable',
    name: 'Wood Sword',
    buyPrice: 5,
    quantity: 0,
    imgPath: 'images/items/wearables/hands/WoodSword.png',
}

export const bunBlaster: Item = {
    type: 'wearable',
    name: 'Bun Blaster',
    quantity: 0,
    imgPath: 'images/items/wearables/hands/BunBlaster.png',
    buyPrice: 12,
    ability: "Double the gold you get from selling any item for the next 10 seconds.",
    description: "Bun Blaster is strictly intended to enhance delightful whipped creams and infusions.",
}

// fruit
export const starFruit: Item = {
    type: 'fruit',
    name: 'Star Fruit',
    quantity: 0,
    imgPath: '/images/fruit/star.png',
    fruitType: 'star',
    buyPrice: 3,
    sellPrice: 1,
    description: "Star Fruits nourish your Bun as well as increase their Luck by 1.",
    ability: "Star Fruits nourish your Bun as well as increase their Luck by 1.",
};

export const lumpyFruit: Item = {
    type: 'fruit',
    name: 'Lumpy Fruit',
    quantity: 0,
    imgPath: '/images/fruit/lumpy.png',
    fruitType: 'lumpy',
    buyPrice: 3,
    sellPrice: 1,
    description: "Lumpy Fruits nourish your Bun as well as increase their Stamina by 1.",
    ability: "Lumpy Fruits nourish your Bun as well as increase their Stamina by 1.",
};

export const heartFruit: Item = {
    type: 'fruit',
    name: 'Heart Fruit',
    quantity: 0,
    imgPath: '/images/fruit/heart.png',
    fruitType: 'heart',
    buyPrice: 3,
    sellPrice: 1,
    description: "Heart Fruits nourish your Bun as well as increase their Strength by 1.",
    ability: "Heart Fruits nourish your Bun as well as increase their Strength by 1.",
};

export const roundFruit: Item = {
    type: 'fruit',
    name: 'Round Fruit',
    quantity: 0,
    imgPath: '/images/fruit/round.png',
    fruitType: 'round',
    buyPrice: 3,
    sellPrice: 1,
    description: "Round Fruits nourish your Bun as well as increase their Speed by 1.",
    ability: "Round Fruits nourish your Bun as well as increase their Speed by 1.",
};

export const squareFruit: Item = {
    type: 'fruit',
    name: 'Square Fruit',
    quantity: 0,
    imgPath: '/images/fruit/square.png',
    fruitType: 'square',
    buyPrice: 3,
    sellPrice: 1,
    description: "Square Fruits nourish your Bun as well as increase their Industry by 1.",
    ability: "Square Fruits nourish your Bun as well as increase their Industry by 1.",
};


// seeds
export const heartSeed: item = {
    type: 'seed',
    name: 'Heart Seed',
    quantity: 1,
    imgPath: '/images/seeds/HeartSeed.png',
    fruitType: 'heart',
    buyPrice: 4,
    description: "Grows into a tree that bears Heart Fruit."
};

export const starSeed: item = {
    type: 'seed',
    name: 'Star Seed',
    quantity: 0,
    imgPath: '/images/seeds/StarSeed.png',
    fruitType: 'star',
    buyPrice: 4,
    description: "Grows into a tree that bears Star Fruit."
};

export const lumpySeed: item = {
    type: 'seed',
    name: 'Lumpy Seed',
    quantity: 0,
    imgPath: '/images/seeds/LumpySeed.png',
    fruitType: 'lumpy',
    buyPrice: 4,
    description: "Grows into a tree that bears Lumpy Fruit."
};

export const roundSeed: item = {
    type: 'seed',
    name: 'Round Seed',
    quantity: 0,
    imgPath: '/images/seeds/RoundSeed.png',
    fruitType: 'round',
    buyPrice: 4,
    description: "Grows into a tree that bears Round Fruit."
};

export const squareSeed: item = {
    type: 'seed',
    name: 'Square Seed',
    quantity: 0,
    imgPath: '/images/seeds/SquareSeed.png',
    fruitType: 'square',
    buyPrice: 4,
    description: "Grows into a tree that bears Square Fruit."
};

// Withered seeds
export const witheredHeartSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Heart Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredHeartSeed.png',
    fruitType: 'heart'
};

export const witheredLumpySeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Lumpy Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredLumpySeed.png',
    fruitType: 'lumpy'
};

export const witheredRoundSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Round Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredRoundSeed.png',
    fruitType: 'round'
};

export const witheredSquareSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Square Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredSquareSeed.png',
    fruitType: 'square'
};

export const witheredStarSeed: Item = {
    type: 'witheredSeed',
    name: 'Withered Star Seed',
    quantity: 0,
    imgPath: '/images/seeds/WitheredStarSeed.png',
    fruitType: 'star'
};

