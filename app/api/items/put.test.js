import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createRoute, getNotExistingUUID } from '../../helpers';
import { ROUTES, TABLES } from '../../constants';
import { removeMockDataFromDataBase, fillDataBaseWithMockData } from '../../mock-data';
import { one } from '../../db';
import _ from 'lodash';
import { getSelectInstanceByIdQuery, getUpdateInstanceByIdQuery } from '../../sql-helpers';

chai.use(chaiHttp);
const should = chai.should();
const assert = chai.assert;

const testName = 'Items PUT API';

describe(testName, () => {
    let data;

    const table = TABLES.ITEMS;
    const cols = table.COLUMNS;

    before(async function () {
        this.timeout(20000);
        console.log('Items PUT before');
        data = await fillDataBaseWithMockData();
    });

    after(async () => {
        await removeMockDataFromDataBase(data);
    });

    describe('PUT /items/:itemId', () => {
        it(`should update ${cols.NAME} of an existing item`, async() => {
            const id = _.keys(data.items)[0];

            const prop = cols.NAME;
            const item = {
                [prop]: 'updatedItemName',
            };

            let response;
            try {
                response = await chai.request(app)
                    .put(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.UPDATE, {[ROUTES.ITEMS.ID]: id}))
                    .send({item});
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            response.body.should.have.property('success');
            response.body.success.should.equal(true);

            const itemAfterUpdate = await one(getSelectInstanceByIdQuery(table.NAME, id));
            should.equal(item[prop], itemAfterUpdate[prop]);

            await one(getUpdateInstanceByIdQuery(table.NAME, id, {[prop]: data.items[id][prop]}));

            const itemAfterClear = await one(getSelectInstanceByIdQuery(table.NAME, id));
            should.equal(data.items[id][prop], itemAfterClear[prop]);
        });
        //bad data tests
        it(`should return bad request status if passed ${cols.NAME} is not a string`, async() => {
            const id = _.keys(data.items)[0];

            const prop = cols.NAME;
            const item = {
                [prop]: 111,
            };

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.UPDATE, {[ROUTES.ITEMS.ID]: id}))
                    .send({item});

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemUpdateValidationInfo');
                response.body.data.itemUpdateValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`,
                });
                response.status.should.equal(400);
            }
        });
        it(`should return bad request status if passed ${cols.NAME} is an empty string`, async() => {
            const itemId = _.keys(data.items)[0];

            const prop = cols.NAME;
            const item = {
                [prop]: '',
            };

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.UPDATE, {[ROUTES.ITEMS.ID]: itemId}))
                    .send({item});

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemUpdateValidationInfo');
                response.body.data.itemUpdateValidationInfo.should.deep.equal({
                    [prop]: `${prop} cannot be empty`,
                });
                response.status.should.equal(400);
            }
        });
        it('should return bad request status and values not passed if item does not contain any expected fields', async() => {
            const itemId = _.keys(data.items)[0];

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.UPDATE, {[ROUTES.ITEMS.ID]: itemId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.itemUpdateValidationInfo.should.deep.equal({
                    error: 'Item update data is not passed',
                });
                response.status.should.equal(400);
            }
        });
        it('should return user not found if item id is not presented in DB', async() => {
            const itemId = getNotExistingUUID(_.keys(data.items));

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.UPDATE, {[ROUTES.ITEMS.ID]: itemId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ itemId });
                response.body.message.should.equal('Item with passed id does not exist.');
                response.status.should.equal(400);
            }
        });
    });
});