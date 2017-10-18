import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createRoute, getNotExistingUUID } from '../../helpers';
import { ROUTES } from '../../constants';
import { removeMockDataFromDataBase, fillDataBaseWithMockData } from '../../mock-data';
import _ from 'lodash';

chai.use(chaiHttp);
const expect = chai.expect;
const assert = chai.assert;

const testName = 'Items GET API';

describe(testName, () => {
    let data;

    before(async function () {
        this.timeout(20000);
        console.log('Items GET before');
        data = await fillDataBaseWithMockData();
    });

    after(async () => {
        await removeMockDataFromDataBase(data);
    });

    describe('GET /items', () => {
        it('should return all previously added items', async() => {
            let response;
            try {
                response = await chai.request(app)
                    .get(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.GET_ALL));
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            response.body.should.have.property('success');
            response.body.success.should.equal(true);

            expect(response.body.data.items).to.include.deep.members(_.values(data.items));
        });
    });

    describe('GET /items/:itemId', () => {
        it('should return all items one by one by id', async() => {
            const ids = _.keys(data.items);
            let responses;

            try {
                responses = await Promise.all(ids
                    .map(id => chai.request(app)
                        .get(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.GET, {[ROUTES.ITEMS.ID]: id}))
                    )
                );
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            responses.forEach((response, index) => {
                response.body.should.have.property('success');
                response.body.success.should.equal(true);

                expect(data.items[ids[index]]).to.deep.equal(response.body.data.item);
            });
        });
        //bad data tests
        it('should return bad request status if item id does not match uuid pattern', async() => {
            const itemId = _.keys(data.items)[0].slice(1); //bad uuid

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.GET, { [ROUTES.ITEMS.ID]: itemId }));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal(`Bad ${ROUTES.ITEMS.ID} passed`);
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ itemId });
                response.status.should.equal(400);
            }
        });
        it('should return bad request status if item with passed ID is not presented in DB', async() => {
            const itemId = getNotExistingUUID(_.keys(data.items));

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.ITEMS.BASE, ROUTES.ITEMS.GET, { [ROUTES.ITEMS.ID]: itemId }));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal('Item with passed id does not exist.');
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ itemId });
                response.status.should.equal(400);
            }
        });
    });
});
