import Animal from "./Animal";

const EXTENDED_TIME_SCALE = 4

export const ANIMALS_DATA: {
    [key: string]: {
        key: string,
        idleEndFrame?: number,
        timeScale?: number,
    }
} = {
    'Chick': {
        key: 'Chick',
        idleEndFrame: 15,
    },
}



export const RAW_ANIMALS = Object.keys(ANIMALS_DATA)

type AnimalData = {
    key: string,
    name: string,
    component: any,
}

const generateAnimalData = (key: string, name: string): AnimalData => {
    return {
        key,
        name,
        component: (props: any) => <Animal animal={name} timeScale={getAnimalTimescale(key)} idleEndFrame={ANIMALS_DATA[key].idleEndFrame ?? 10} {...props}/>
    }
}

export const getAnimalTimescale = (key: string) => {
    if (ANIMALS_DATA[key]) {
        return ANIMALS_DATA[key].timeScale ?? 1
    }
    return 1
}

export const ANIMALS: {
    [key: string]: {
        key: string,
        name: string,
        component: any,
    }
} = {}

RAW_ANIMALS.forEach((animal) => {
    const key = animal
    ANIMALS[key] = generateAnimalData(key, animal)
})
