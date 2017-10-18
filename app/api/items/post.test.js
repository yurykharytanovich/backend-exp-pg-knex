import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createRoute } from '../../helpers';
import { ROUTES, TABLES } from '../../constants';
import { removeMockDataFromDataBase, fillDataBaseWithMockData, getItems } from '../../mock-data';
import { getSelectInstancesByIdsQuery, getDeleteInstancesByIdsQuery } from '../../sql-helpers';
import { manyOrNone, many, none } from '../../db';
import _ from 'lodash';

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

const testName = 'Items POST API';

describe(testName, () => {
    let data;
    const numberOfInstances = 2;

    const table = TABLES.ITEMS;
    const cols = table.COLUMNS;

    let itemsForAdding = [];
    const uniquePrefix = 'unique';

    before(async function () {
        this.timeout(20000);
        console.log('Items POST before');
        data = await fillDataBaseWithMockData();

        itemsForAdding = getItems(numberOfInstances, uniquePrefix);
    });

    after(async () => {
        await removeMockDataFromDataBase(data);
    });

    describe('POST /items', () => {
        it('should add items to database with consistent data', async () => {
            let responses;
            try {
                responses = await Promise.all(itemsForAdding
                    .map(item => chai.request(app)
                        .post(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.ADD))
                        .send({item})
                    )
                );
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            const itemsForComparison = [];
            responses.forEach((response, index) => {
                response.body.should.have.property('success');
                response.body.success.should.equal(true);

                const itemForComparison = _.cloneDeep(itemsForAdding[index]);

                itemForComparison.id = response.body.data.item.id;

                response.body.data.item.should.deep.equal(itemForComparison);
                itemsForComparison.push(itemForComparison);
            });

            const ids = _.map(itemsForComparison, item => item.id);

            const itemsAfterInsert = await many(getSelectInstancesByIdsQuery(table.NAME, ids));
            expect(itemsAfterInsert).to.have.deep.members(itemsForComparison);

            const removedItems = await manyOrNone(getDeleteInstancesByIdsQuery(table.NAME, ids));
            expect(removedItems.length).to.equal(itemsForComparison.length);

            const itemsAfterRemove = await none(getSelectInstancesByIdsQuery(table.NAME, ids));
            should.equal(itemsAfterRemove, null);
        });
        //bad data tests
        it('should return bad request status if passed body does not have item', async () => {
            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.ADD))
                    .send({});

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemValidationInfo');
                response.body.data.itemValidationInfo.should.deep.equal({
                    error: 'Item is not an object',
                });
                response.status.should.equal(400);
            }
        });
        it(`should return bad request status if passed item doesn't have ${cols.NAME}`, async () => {
            const prop = cols.NAME;

            const item = _.cloneDeep(itemsForAdding[0]);
            delete item[prop];

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.ADD))
                    .send({item});
                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemValidationInfo');
                response.body.data.itemValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`,
                });
                response.status.should.equal(400);
            }
        });
        it(`should return bad request status if passed ${cols.NAME} is not a string`, async () => {
            const prop = cols.NAME;

            const item = _.cloneDeep(itemsForAdding[0]);
            item[prop] = 10;

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.ADD))
                    .send({item});
                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemValidationInfo');
                response.body.data.itemValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`,
                });
                response.status.should.equal(400);
            }
        });
        it(`should return bad request status if passed ${cols.NAME} is an empty string`, async () => {
            const prop = cols.NAME;

            const item = _.cloneDeep(itemsForAdding[0]);
            item[prop] = '';

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.ADD))
                    .send({item});
                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Invalid item data passed.');
                response.body.data.should.have.property('itemValidationInfo');
                response.body.data.itemValidationInfo.should.deep.equal({
                    [prop]: `${prop} cannot be empty`,
                });
                response.status.should.equal(400);
            }
        });
    });
});
