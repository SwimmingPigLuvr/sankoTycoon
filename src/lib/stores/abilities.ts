import { writable } from "svelte/store";

export const showDashboard = writable<boolean>(false);

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
export interface AutoSeller {
    rate: number;
    enabled: boolean;
    purchased: boolean;
    level: number;
}

const myAutoSeller: AutoSeller = {
    rate: 0.25,
    enabled: false,
    purchased: false,
    level: 0,
}

export const autoSeller = writable<AutoSeller>(myAutoSeller);
export const totalFruitsSold = writable<number>(0);

// auto sell those fruits
export interface AutoBuyer {
    rate: number;
    enabled: boolean;
    purchased: boolean;
    level: number;
}

const myAutoBuyer: AutoBuyer = {
    rate: 2000,
    enabled: false,
    purchased: false,
    level: 0,
}

export const autoBuyer = writable<AutoBuyer>(myAutoBuyer);
export const totalFruitsBought = writable<number>(0);

export interface Farmtek {
    purchased: boolean;
    enabled: boolean;
}

const farmtekDisc: Farmtek = {
    purchased: false,
    enabled: false,
}
export const farmtek = writable<Farmtek>(farmtekDisc);

