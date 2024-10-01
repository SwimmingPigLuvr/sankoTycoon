// lib/stores/gameState.ts
import { writable } from 'svelte/store';

enum StepID {
    Bridge,
    Mint,
    Hatch,
    Farm,
    Stake,
    Stream,
    MiniGames,
    Airdrop,
}

interface Step {
    id: stepID;
    name: string;
    description: string;
    completed: boolean;
    onCompletion: string;
}

interface GameState {
    currentStep: StepID;
    steps: Step[];
    messages: string[];
}

const steps: Step[] = [
    {
        id: StepID.Bridge,
        name: 'Bridge $DMT to Sanko Chain',
        description: 'Bridge to Sanko',
        completed: false,
        onCompletion: '',
    },
    {
        id: 2,
        name: 'Mint a SankoPets egg',
        description: '',
        completed: false,
        onCompletion: 'Mint a SankoPets egg',
    },
    {
        id: 3,
        name: 'Hatch your SankoPets Bun',
        description: '',
        completed: false,
        onCompletion: 'Hatch your SankoPets Bun',
    },
];

const initialState: GameState = {
    currentStep: StepID.Bridge,
    steps: steps,
    messages: [steps[0].description],
};

const gameState = writable<GameState>(initialState);

function progressStep() {
    gameState.update(state => {
        const stepIndex = state.steps.findIndex(step => step.id === state.currentStep);
        if (stepIndex !== -1 && !state.steps[stepIndex].completed) {
            state.steps[stepIndex].completed = true;
            const nextStep = state.steps[stepIndex + 1];
            if (nextStep) {
                state.currentStep = nextStep.id;
                // add new message to terminal
                // execute action based on on complete
            }
        }
        return state;
    });
}

export { gameState, progressStep };
