import app from '../../app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { TABLES, ROUTES } from '../../constants';
import { fillDataBaseWithMockData, removeMockDataFromDataBase } from '../../mock-data';
import { createRoute, getNotExistingUUID } from '../../helpers';
import { getSelectInstanceByIdQuery, getUpdateInstanceByIdQuery, getSelectInstancesQuery } from '../../sql-helpers';
import { one, manyOrNone } from '../../db';
import _ from 'lodash';

chai.use(chaiHttp);
const should = chai.should();
const assert = chai.assert;

const testName = 'Users PUT API';

describe(testName, () => {
    let data;

    const table = TABLES.USERS;
    const cols = table.COLUMNS;

    before(async function () {
        this.timeout(20000);
        console.log('Users PUT before');
        data = await fillDataBaseWithMockData();
    });

    after(async() => {
        await removeMockDataFromDataBase(data);
    });

    describe('PUT /users/:userId', () => {
        it(`should update ${cols.NAME} of the existing user by id`, async() => {
            const userId = _.keys(data.users)[0];
            const prop = cols.NAME;
            const user = {
                [prop]: 'testUpdateFirstName',
            };

            let response;
            try {
                response = await chai.request(app)
                    .put(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.UPDATE, {[ROUTES.USERS.ID]: userId}))
                    .send({user});
            } catch (error) {
                console.dir(error);
                assert.fail('Request should not be failed.');
            }
            response.body.should.have.property('success');
            response.body.success.should.equal(true);

            const userAfterUpdate = await one(getSelectInstanceByIdQuery(table.NAME, userId));

            should.equal(userAfterUpdate[prop], user[prop]);

            await one(getUpdateInstanceByIdQuery(table.NAME, userId, { [prop]: data.users[userId][prop] }));

            const userAfterClear = await one(getSelectInstanceByIdQuery(table.NAME, userId));

            should.equal(userAfterClear[prop], data.users[userId][prop]);
        });
        //bad data tests
        it(`should return bad request status and bad ${cols.NAME} if user's name is not a string`, async() => {
            const userId = _.keys(data.users)[0];
            const prop = cols.NAME;
            const user = {
                [prop]: 100,
            };

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.UPDATE, {[ROUTES.USERS.ID]: userId}))
                    .send({user});

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal('Invalid user data passed.');
                response.body.data.userUpdateValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`,
                });
                response.status.should.equal(400);
            }

        });
        it(`should return bad request status and bad ${cols.NAME} if user's name is an empty string`, async() => {
            const userId = _.keys(data.users)[0];
            const prop = cols.NAME;
            const user = {
                [prop]: '',
            };

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.UPDATE, {[ROUTES.USERS.ID]: userId}))
                    .send({user});

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal('Invalid user data passed.');
                response.body.data.userUpdateValidationInfo.should.deep.equal({
                    [prop]: `${prop} cannot be empty`,
                });
                response.status.should.equal(400);
            }
        });
        it('should return bad request status and values not passed if user does not contain any expected fields', async() => {
            const userId = _.keys(data.users)[0];

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.UPDATE, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.message.should.equal('Invalid user data passed.');
                response.body.data.userUpdateValidationInfo.should.deep.equals({
                    error: 'User update data is not passed',
                });
                response.status.should.equal(400);
            }
        });
        it('should return user not found if user id is not presented in DB', async() => {
            const users = await manyOrNone(getSelectInstancesQuery(table.NAME));
            const userId = getNotExistingUUID(users.map(u => u.id));

            try {
                await chai.request(app)
                    .put(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.UPDATE, {[ROUTES.USERS.ID]: userId}));

                assert.fail('Request should be failed.');
            } catch (error) {
                const response = error.response;

                response.body.should.have.property('success');
                response.body.success.should.equal(false);
                response.body.should.have.property('message');
                response.body.should.have.property('data');
                response.body.data.should.deep.equal({ userId });
                response.body.message.should.equal('User with passed id does not exist.');
                response.status.should.equal(400);
            }
        });
    });
});