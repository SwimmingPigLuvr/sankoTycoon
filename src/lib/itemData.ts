export const bunzempic: Item = {
    type: 'consumable',
    name: 'Bunzempic',
    quantity: 1,
    imgPath: '/images/items/Bunzempic.png'
};

export const starSeed: Item = {
    type: 'seed',
    name: 'Star Seed',
    quantity: 1,
    imgPath: '/images/seeds/StarSeed.png',
    fruitType: 'star'
};

export const heartSeed: Item = {
    type: 'seed',
    name: 'Heart Seed',
    quantity: 1,
    imgPath: '/images/seeds/HeartSeed.png',
    fruitType: 'heart'
};

export const lumpySeed: Item = {
    type: 'seed',
    name: 'Lumpy Seed',
    quantity: 1,
    imgPath: '/images/seeds/LumpySeed.png',
    fruitType: 'lumpy'
};

export const roundSeed: Item = {
    type: 'seed',
    name: 'Round Seed',
    quantity: 1,
    imgPath: '/images/seeds/RoundSeed.png',
    fruitType: 'round'
};

export const squareSeed: Item = {
    type: 'seed',
    name: 'Square Seed',
    quantity: 1,
    imgPath: '/images/seeds/SquareSeed.png',
    fruitType: 'square'
};

export const seedData = {
    // create 4 more objects equivalent to heart for these categories:
    // round, star, lumpy, square
    Heart: {
        name: "Heart Seed",
        imgPath: "/images/seeds/HeartSeed.png",
        description: "Plant these to grow a Heart Tree"
    },
    Round: {
        name: "Round Seed",
        imgPath: "/images/seeds/RoundSeed.png",
        description: "Plant these to grow a Round Tree"
    },
    Star: {
        name: "Star Seed",
        imgPath: "/images/seeds/StarSeed.png",
        description: "Plant these to grow a Star Tree"
    },
    Lumpy: {
        name: "Lumpy Seed",
        imgPath: "/images/seeds/LumpySeed.png",
        description: "Plant these to grow a Lumpy Tree"
    },
    Square: {
        name: "Square Seed",
        imgPath: "/images/seeds/SquareSeed.png",
        description: "Plant these to grow a Square Tree"
    }
}

export const fruitData= {
    Heart: {
        name: "Heart Fruit",
        imgPath: "/images/fruit/Heart.png",
        description: "Feed this to your Bun to increase their Strength stat"
    },
    Star: {
        name: "Star Fruit",
        imgPath: "/images/fruit/Star.png",
        description: "Feed this to your Bun to increase their Luck stat"
    },
    Round: {
        name: "Round Fruit",
        imgPath: "/images/fruit/Round.png",
        description: "Feed this to your Bun to increase their Speed stat"
    },
    Lumpy: {
        name: "Lumpy Fruit",
        imgPath: "/images/fruit/Lumpy.png",
        description: "Feed this to your Bun to increase their Stamina stat"
    },
    Square: {
        name: "Square Fruit",
        imgPath: "/images/fruit/Square.png",
        description: "Feed this to your Bun to increase their Industry stat"
    }
}

export const itemData = {
    Bunzempic: {
        name: "Bunzempic",
        imgPath: "/images/items/Bunzempic.png",
        description: "Use this to revive bun from the dead"
    },
}
