import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createRoute, getNotExistingUUID } from '../../helpers';
import { ROUTES, TABLES } from '../../constants';
import { fillDataBaseWithMockData, removeMockDataFromDataBase, getItems } from '../../mock-data';
import { many, none } from '../../db';
import _ from 'lodash';
import { getSelectInstancesByIdsQuery, getInsertInstancesQuery } from '../../sql-helpers';

const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;
chai.use(chaiHttp);

const testName = 'Items DELETE API';

describe(testName, () => {
    let data;
    const numberOfInstances = 2;

    const table = TABLES.ITEMS;

    let itemsForAdding = [];
    const uniquePrefix = 'unique';

    before(async function () {
        this.timeout(20000);
        console.log('Items DELETE before');

        data = await fillDataBaseWithMockData();
        itemsForAdding = getItems(numberOfInstances, uniquePrefix);
    });

    after(async () => {
        await removeMockDataFromDataBase(data);
    });

    describe('DELETE /items/:itemId', () => {
        it('should delete all previously added items one by one by id', async() => {
            const insertedItems = await many(getInsertInstancesQuery(table.NAME, itemsForAdding));
            let responses;

            try {
                responses = await Promise.all(insertedItems
                    .map(item => chai.request(app)
                        .delete(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.DELETE, {[ROUTES.ITEMS.ID]: item.id}))
                    )
                );
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            let deletedItems = [];

            responses.forEach((response) => {
                response.body.should.have.property('success');
                response.body.success.should.equal(true);
                deletedItems.push(response.body.data.item);
            });

            expect(insertedItems).to.deep.equal(deletedItems);

            const insertedItemsAfterRemove = await none(getSelectInstancesByIdsQuery(table.NAME,
                insertedItems.map(item => item.id)));
            should.equal(insertedItemsAfterRemove, null);
        });
        //bad data tests
        it('should return bad request status if item id does not match uuid pattern', async() => {
            const itemId = _.keys(data.items)[0].slice(1);

            try {
                await chai.request(app)
                    .delete(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.DELETE, {[ROUTES.ITEMS.ID]: itemId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal(`Bad ${ROUTES.ITEMS.ID} passed`);
                response.body.data.should.deep.equal({ itemId });
                response.status.should.equal(400);
            }
        });
        it('should return bad request status if item with passed id does not exist', async() => {
            const itemId = getNotExistingUUID(_.keys(data.items));

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.DELETE, { [ROUTES.ITEMS.ID]: itemId }));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Item with passed id does not exist.');
                response.body.data.should.deep.equal({ itemId });
                response.status.should.equal(400);
            }
        });
    });
});