export const getRandomArrayElement = (array: any[]) => {
    return array[Math.floor(array.length * Math.random())];
}