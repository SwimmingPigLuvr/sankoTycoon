// lib/stores/gameState.ts
import { writable } from 'svelte/store';

interface Step {
    id: number;
    name: string;
    description: string;
    completed: boolean;
    message: string;
}

interface GameState {
    currentStep: number;
    steps: Step[];
    messages: string[];
}

const steps: Step[] = [
    {
        id: 1,
        name: 'Bridge $DMT to Sanko Chain',
        description: '',
        completed: false,
        message: 'Bridge to Sanko',
    },
    {
        id: 2,
        name: 'Mint a SankoPets egg',
        description: '',
        completed: false,
        message: 'Mint a SankoPets egg',
    },
    {
        id: 3,
        name: 'Hatch your SankoPets Bun',
        description: '',
        completed: false,
        messgae: 'Hatch your SankoPets Bun',
    },
];

const initialState: GameState = {
    currentStep: 0,
    steps: steps,
    messages: [steps[0].message],
};

const gameState = writable<GameState>(initialState);

function progressStep() {
    gameState.update(state => {
        if (state.currentStep < state.steps.length - 1) {
            state.steps[state.currentStep].completed = true;
            state.currentStep += 1;
            state.messages.push(state.steps[state.currentStep].message);
        }
        return state;
    });
}

export { gameState, progressStep };
