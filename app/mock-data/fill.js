import { fillDataBaseWithMockData } from './'

async function fill() {
    try {
        await fillDataBaseWithMockData()
    } catch (error) {
        console.dir(error)
    } finally {
        process.exit(0)
    }
}

fill()
