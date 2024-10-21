import { writable } from "svelte/store";

// double sale values
export const bunBlasted = writable<boolean>(false);

// cool down period after reviving bun
export const isReviving = writable<boolean>(false);

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
    rate: 2000,
    enabled: false,
    purchased: false,
    level: 0,
}

export const autoSeller = writable<AutoSeller>(myAutoSeller);
export const totalFruitsSold = writable<number>(0);

