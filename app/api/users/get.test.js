import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { createRoute, getNotExistingUUID } from '../../helpers';
import { ROUTES, TABLES } from '../../constants';
import { removeMockDataFromDataBase, fillDataBaseWithMockData } from '../../mock-data';
import { getSelectInstancesQuery } from '../../sql-helpers';
import { manyOrNone } from '../../db';
import _ from 'lodash';

chai.use(chaiHttp);
const expect = chai.expect;
const assert = chai.assert;

describe('Users GET API', () => {
    let data;

    const table = TABLES.USERS;

    const numberToGetById = 2;

    before(async function () {
        this.timeout(20000);
        console.log('Users GET before');
        data = await fillDataBaseWithMockData();
    });

    after(async() => {
        await removeMockDataFromDataBase(data);
    });

    describe('GET /users', () => {
        it('should return all added to DB users', async() => {
            let response;
            try {
                response = await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET_ALL));
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            response.body.should.have.property('success');
            response.body.success.should.equal(true);

            expect(response.body.data.users).to.include.deep.members(_.values(data.users));
        });
    });

    describe('GET /users/:userId', () => {
        it('should return all users one by one by id', async() => {
            const userIds = _.keys(data.users).slice(0, numberToGetById);

            let responses;
            try {
                responses = await Promise.all(userIds
                    .map(userId => chai.request(app)
                        .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET, {[ROUTES.USERS.ID]: userId}))
                    )
                );
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            responses.forEach((response, index) => {
                response.body.should.have.property('success');
                response.body.success.should.equal(true);

                expect(data.users[userIds[index]]).to.deep.equal(response.body.data.user);
            });
        });
        //bad data tests
        it(`should return bad request status and bad user id passed if bad ID passed in url`, async() => {
            const userId = _.keys(data.users)[0].slice(1);

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal(`Bad ${ROUTES.USERS.ID} passed`);
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ userId });
                response.status.should.equal(400);
            }
        });
        it(`should return bad request status and unexisting user id passed if unexisting ID passed in url`, async() => {
            const users = await manyOrNone(getSelectInstancesQuery(table.NAME));
            const userId = getNotExistingUUID(users.map(user => user.id));

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.message.should.equal(`User with passed id does not exist.`);
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ userId });
                response.status.should.equal(400);
            }
        });
    });

    describe('GET /users/:userId/items', () => {
        it('should return items of the user', async() => {
            const icols = TABLES.ITEMS.COLUMNS;
            const uiscols = TABLES.USER_ITEMS.COLUMNS;

            const userId = _.values(data.userItems)[0][uiscols.USER_ID];

            const itemsOfUserIds = [];
            _.values(data.userItems).forEach(ui => {
                if (ui[uiscols.USER_ID] === userId) {
                    itemsOfUserIds.push(ui[uiscols.ITEM_ID]);
                }
            });

            let response;
            try {
                response = await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET_ITEMS, {[ROUTES.USERS.ID]: userId}));
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }

            response.body.should.have.property('success');
            response.body.success.should.equal(true);

            const expectedItemsOfUser = itemsOfUserIds.map(itemId => ({
                [uiscols.ITEM_ID]: itemId,
                [`${TABLES.ITEMS.NAME}_${icols.NAME}`]: data.items[itemId][icols.NAME],
            }));

            response.body.data.should.have.property('items');
            response.body.data.items.should.include.deep.members(expectedItemsOfUser);
        });
        //bad data tests
        it('should return bad request status if user id does not match uuid pattern', async() => {
            const userId = _.keys(data.users)[0].slice(1);

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET_ITEMS, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal(`Bad ${ROUTES.USERS.ID} passed`);
                response.body.data.should.deep.equal({ userId });
                response.status.should.equal(400);
            }
        });
        it('should return bad request status if user with passed id is not presented in DB', async() => {
            const userId = getNotExistingUUID(_.keys(data.users));

            try {
                await chai.request(app)
                    .get(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.GET_ITEMS, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal('User with passed id does not exist.');
                response.body.data.should.deep.equal({ userId });
                response.status.should.equal(400);
            }
        });
    });
});