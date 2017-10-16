import app from '../../app'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { createRoute, getNotExistingUUID } from '../../helpers'
import { ROUTES, TABLES } from '../../constants'
import { removeMockDataFromDataBase, fillDataBaseWithMockData, getUsers } from '../../mock-data'
import { manyOrNone, none, many } from '../../db'
import _ from 'lodash'
import { getDeleteInstancesByIdsQuery, getSelectInstancesByIdsQuery } from '../../sql-helpers'

chai.use(chaiHttp)
const expect = chai.expect
const assert = chai.assert
const should = chai.should()

const isOnly = false
const desc = isOnly ? describe.only : describe

desc('Users POST API', () => {
    let data

    const table = TABLES.USERS
    const cols = table.COLUMNS

    let usersForAdding = []
    const numberOfInstances = 2
    const uniquePrefix = 'unique'

    before(async function () {
        this.timeout(20000)
        console.log('Users POST before')
        data = global.data = global.data || await fillDataBaseWithMockData()

        usersForAdding = getUsers(numberOfInstances, uniquePrefix)
    })

    if (isOnly) {
        after(async () => {
            await removeMockDataFromDataBase(global.data)
        })
    }

    describe('POST /users', () => {
        it('should add all users to database with consistent data', async () => {
            const responses = await Promise.all(usersForAdding
                .map(user => chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD))
                    .send({ user })
                )
            )

            const usersIds = []
            const usersForComparison = []

            responses.forEach((response, index) => {
                response.body.should.have.property('success')
                response.body.success.should.equal(true)
                const userForComparison = {
                    id: response.body.data.user.id,
                    [cols.NAME]: usersForAdding[index][cols.NAME]
                }

                response.body.data.user.should.deep.equal(userForComparison)

                usersIds.push(response.body.data.user.id)
                usersForComparison.push(userForComparison)
            })

            const usersAfterInsert = await manyOrNone(getSelectInstancesByIdsQuery(table.NAME, usersIds))
            usersAfterInsert.length.should.equal(usersForAdding.length)
            usersAfterInsert.should.have.deep.members(usersForComparison)

            await manyOrNone(getDeleteInstancesByIdsQuery(table.NAME, usersIds))

            const usersAfterRemove = await none(getSelectInstancesByIdsQuery(table.NAME, usersIds))
            should.equal(usersAfterRemove, null)
        })
        //bad data tests
        it(`should return bad request status and bad user data message if user's ${cols.NAME} is not passed`, async () => {
            const prop = cols.NAME

            const user = _.clone(usersForAdding[0])
            delete user[prop]

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD))
                    .send({ user })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.data.should.have.property('userValidationInfo')
                response.body.data.userValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`
                })
                response.status.should.equal(400)
            }
        })
        it(`should return bad request status and bad user data message if passed ${cols.NAME} is not a string`, async () => {
            const prop = cols.NAME

            const user = _.clone(usersForAdding[0])
            user[prop] = 123

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD))
                    .send({user})

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.data.should.have.property('userValidationInfo')
                response.body.data.userValidationInfo.should.deep.equal({
                    [prop]: `${prop} should be a string`
                })
                response.status.should.equal(400)
            }
        })
        it(`should return bad request status and bad user data message if passed ${cols.NAME} is an empty string`, async () => {
            const prop = cols.NAME

            const user = _.clone(usersForAdding[0])
            user[prop] = ''

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD))
                    .send({ user })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.data.should.have.property('userValidationInfo')
                response.body.data.userValidationInfo.should.deep.equal({
                    [prop]: `${prop} cannot be empty`
                })
                response.status.should.equal(400)
            }
        })
        it(`should return bad request status and bad user data message if passed ${cols.NAME} is already in use`, async() => {
            const prop = cols.NAME

            const user = _.clone(usersForAdding[0])
            user[prop] = _.values(data.users)[0][prop]

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD))
                    .send({ user })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.message.should.equal('Name is already in use.')
                response.body.data.should.deep.equal({
                    [prop]: user[prop]
                })
                response.status.should.equal(400)
            }
        })
    })
    describe('POST /users/:userId/items', () => {
        it('should add problem surveys to user', async() => {
            const uistable = TABLES.USER_ITEMS
            const uiscols = uistable.COLUMNS

            const numberToAdd = 2

            const usersIds = _.keys(data.users).slice(0, numberToAdd)
            const userItems = {}
            const userItemsIds = []

            Object
                .keys(data.userItems)
                .forEach(id => {
                    if (usersIds.find(uid => uid === data.userItems[id][uiscols.USER_ID])) {
                        userItems[id] = data.userItems[id]
                        userItemsIds.push(id)
                    }
                })

            await manyOrNone(getDeleteInstancesByIdsQuery(uistable.NAME, userItemsIds))

            const removedUserItems = await none(getSelectInstancesByIdsQuery(uistable.NAME, userItemsIds))
            should.equal(removedUserItems, null)

            const itemsIdsArr = []
            const responses = await Promise.all(usersIds
                .map(id => {
                    const itemsIds = userItemsIds.filter(uiid => userItems[uiid][uiscols.USER_ID] === id)
                        .map(uiid => userItems[uiid][uiscols.ITEM_ID])
                    itemsIdsArr.push(itemsIds)

                    return chai.request(app)
                        .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: id}))
                        .send({ itemsIds })
                })
            )

            const insertedUserItemsIds = []
            responses.forEach((response, index) => {
                response.body.should.have.property('success')
                response.body.success.should.equal(true)

                const userId = usersIds[index]

                const userItemsForComparison = itemsIdsArr[index].map((itemsId, i) => {
                    insertedUserItemsIds.push(response.body.data.userItems[i].id)

                    return {
                        id: response.body.data.userItems[i].id,
                        [uiscols.USER_ID]: userId,
                        [uiscols.ITEM_ID]: itemsId
                    }
                })

                response.body.data.userItems.should.deep.equal(userItemsForComparison)
            })

            const userItemsFromBase = await many(getSelectInstancesByIdsQuery(uistable.NAME, insertedUserItemsIds))

            userItemsIds.forEach(id => {
                const newUserItem = userItemsFromBase
                    .find(item =>
                        item[uiscols.USER_ID] === userItems[id][uiscols.USER_ID] && item[uiscols.ITEM_ID] === userItems[id][uiscols.ITEM_ID]
                    )

                should.exist(newUserItem)
                delete data.userItems[id]
                data.userItems[newUserItem.id] = newUserItem
            })
        })
        it('should add nothing if array of items IDs is empty', async() => {
            const id = _.keys(data.users)[0]
            const itemsIds = []

            const response = await chai.request(app)
                .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: id}))
                .send({ itemsIds })

            response.body.should.have.property('success')
            response.body.success.should.equal(true)
            response.body.should.have.property('message')
            response.body.data.should.have.property('userItems')
            response.body.data.userItems.should.deep.equal([ ])
            response.status.should.equal(200)
        })
        //bad data tests
        it('should return bad request status if passed user id is not valid', async() => {
            const userId = _.keys(data.users)[0].slice(1)
            const itemsIds = _.keys(data.items).slice(0, 2)

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: userId}))
                    .send({ itemsIds })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal(`Bad ${[ROUTES.USERS.IDp]} passed`)
                response.body.should.have.property('data')
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if user with passed id is not presented in DB', async() => {
            const userId = getNotExistingUUID(_.keys(data.users))
            const itemsIds = _.keys(data.items).slice(0, 2)

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: userId}))
                    .send({ itemsIds })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('User with passed id does not exist.')
                response.body.should.have.property('data')
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if some of passed items ids are not valid', async() => {
            const userId = _.keys(data.users)[0]
            const itemsIds = _.keys(data.items).slice(0, 2)

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: userId}))
                    .send({
                        itemsIds: itemsIds.map(id => id.slice(1))
                    })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('Invalid items ids.')
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if some of passed uuids is are not presented in DB', async() => {
            const userId = _.keys(data.users)[0]
            const itemsIds = _.keys(data.items).slice(0, 2)

            const absentId = getNotExistingUUID(_.keys(data.items))
            itemsIds.push(absentId)

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: userId}))
                    .send({ itemsIds })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('Some of items ids are not presented in db.')
                response.body.data.should.have.property('absentIds')
                response.body.data.absentIds.should.deep.equal([ absentId ])
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if some of passed uuids are already added to user', async() => {
            const userId = _.keys(data.users)[0]
            const itemsIds = _.keys(data.items).slice(0, 2)

            try {
                await chai.request(app)
                    .post(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.ADD_ITEMS, {[ROUTES.USERS.ID]: userId}))
                    .send({ itemsIds })

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('Some of items ids are already added to user.')
                response.body.data.should.have.property('addedItemsIds')
                response.body.data.addedItemsIds.should.deep.equal(itemsIds)
                response.status.should.equal(400)
            }
        })
    })
})
