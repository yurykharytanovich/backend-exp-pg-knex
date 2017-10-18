import chai from 'chai';
import {
    fillDataBaseWithMockData,
    removeMockDataFromDataBase,
    checkDataWasRemoved,
    dataAmounts,
} from './index';

const should = chai.should();
const assert = chai.assert;

let data;
describe('fillAndClearDataBaseWithMockData', () => {
    it('should add all mock data to database', async function () {
        let lastKey = null;
        try {
            this.timeout(20000);
            data = await fillDataBaseWithMockData();
            Object.keys(data).forEach(key => {
                lastKey = key;
                should.equal(Object.keys(data[key]).length, dataAmounts[key]);
            });
        } catch (error) {
            console.dir(dataAmounts);
            console.dir(error);
            console.dir(lastKey);
            assert.fail('Add all mock data to database failed.');

        }
    });
    it('should remove all mock data from database', async function () {
        try {
            this.timeout(20000);
            await removeMockDataFromDataBase(data);

            should.equal(true, await checkDataWasRemoved(data));
        } catch (error) {
            console.dir(error);
            assert.fail('Remove all mock data from database failed.');
        }
    });
});
