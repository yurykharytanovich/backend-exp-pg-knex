import app from '../../app'
import chai from 'chai'
import chaiHttp from 'chai-http'
import { createRoute, getNotExistingUUID } from '../../helpers'
import { ROUTES, TABLES } from '../../constants'
import { removeMockDataFromDataBase, fillDataBaseWithMockData, getUsers } from '../../mock-data'
import { manyOrNone, many, none, one } from '../../db'
import _ from 'lodash'
import { getInsertInstancesQuery, getSelectInstancesByIdsQuery, getDeleteInstancesByIdsQuery } from '../../sql-helpers'

chai.use(chaiHttp)
const should = chai.should()
const assert = chai.assert

const isOnly = false
const desc = isOnly ? describe.only : describe

desc('Users DELETE API', () => {
    let data

    const table = TABLES.USERS

    const numberOfInstances = 2
    const uniquePrefix = 'unique'

    before(async function () {
        this.timeout(20000)
        console.log('Users DELETE before')
        data = global.data = global.data || await fillDataBaseWithMockData()
    })

    if (isOnly) {
        after(async () => {
            await removeMockDataFromDataBase(global.data)
        })
    }

    describe('DELETE /users/:userId', () => {
        it('should delete all previously added users', async() => {
            const usersForAdding = getUsers(numberOfInstances, uniquePrefix)

            const usersInserted = await many(getInsertInstancesQuery(table.NAME, usersForAdding))
            usersInserted.length.should.equal(usersForAdding.length)

            const ids = _.map(usersInserted, user => user.id)

            const responses = await Promise.all(ids
                .map(id => chai.request(app)
                    .delete(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE, {[ROUTES.USERS.ID]: id}))
                )
            )

            responses.forEach((response, index) => {
                response.body.should.have.property('success')
                response.body.success.should.equal(true)

                response.body.data.user.should.deep.equal(usersInserted[index])
            })

            const usersAfterRemove = await none(getSelectInstancesByIdsQuery(table.NAME, ids))
            should.equal(usersAfterRemove, null)
        })
        //bad data tests
        it('should return bad request status if user id does not match uuid pattern', async() => {
            const id = _.keys(data.users)[0].slice(1)

            try {
                await chai.request(app)
                    .delete(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE, {[ROUTES.USERS.ID]: id}))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal(`Bad ${[ROUTES.USERS.IDp]} passed`)
                response.body.data.should.deep.equal({ id })
                response.status.should.equal(400)
            }
        })
        it('should return user not found if passed user id is not presented in DB', async() => {
            const id = getNotExistingUUID(_.keys(data.users))

            try {
                await chai.request(app)
                    .delete(createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE, {[ROUTES.USERS.ID]: id}))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('User with passed id does not exist.')
                response.body.data.should.deep.equal({ id })
                response.status.should.equal(400)
            }
        })

    })
    describe('DELETE /users/:userId/items/:itemId', () => {
        const uistable = TABLES.USER_ITEMS
        const uiscols = uistable.COLUMNS
        it('should remove items from user', async () => {
            const numberToDelete = 2

            const usersIds = _.keys(data.users).slice(0, numberToDelete)
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

            const responses = await Promise.all(userItemsIds.map(uiid =>
                chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userItems[uiid][uiscols.USER_ID],
                        [ROUTES.ITEMS.ID]: userItems[uiid][uiscols.ITEM_ID]
                    }))
            ))

            const userItemsRemoved = []
            responses.forEach(response => {
                response.body.should.have.property('success')
                response.body.success.should.equal(true)

                response.body.data.should.have.property('result')
                response.body.data.result.should.deep.equal(userItems[response.body.data.result.id])

                userItemsRemoved.push(response.body.data.result)
            })

            userItemsRemoved.should.have.deep.members(_.values(userItems))

            const userItemsAfterDelete = await none(getSelectInstancesByIdsQuery(uistable.NAME, userItemsIds))
            should.equal(userItemsAfterDelete, null)

            await manyOrNone(getInsertInstancesQuery(uistable.NAME, userItemsRemoved))

            const userItemsAfterInsertion = await manyOrNone(getSelectInstancesByIdsQuery(uistable.NAME, userItemsIds))
            userItemsAfterInsertion.should.have.deep.members(userItemsRemoved)
        })
        //bad data tests
        it('should return bad request status if user id does not match uuid pattern', async() => {
            const userId = _.values(data.userItems)[0][uiscols.USER_ID].slice(1)
            const itemId = _.values(data.userItems)[0][uiscols.ITEM_ID]

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userId,
                        [ROUTES.ITEMS.ID]: itemId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.message.should.equal(`Bad ${[ROUTES.USERS.IDp]} passed`)
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if item id does not match uuid pattern', async() => {
            const userId = _.values(data.userItems)[0][uiscols.USER_ID]
            const itemId = _.values(data.userItems)[0][uiscols.ITEM_ID].slice(1)

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userId,
                        [ROUTES.ITEMS.ID]: itemId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.message.should.equal(`Bad ${[ROUTES.ITEMS.IDp]} passed`)
                response.body.data.should.deep.equal({ itemId })
                response.status.should.equal(400)
            }
        })
        it('should return user not found if passed user id is not presented in DB', async() => {
            const userId = getNotExistingUUID(_.keys(data.users))
            const itemId = _.values(data.userItems)[0][uiscols.ITEM_ID]

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userId,
                        [ROUTES.ITEMS.ID]: itemId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('User with passed id does not exist.')
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
        it('should return user not found if passed item id is not presented in DB', async() => {
            const userId = _.values(data.userItems)[0][uiscols.USER_ID]
            const itemId = getNotExistingUUID(_.keys(data.items))

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userId,
                        [ROUTES.ITEMS.ID]: itemId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('Item with passed id does not exist.')
                response.body.data.should.deep.equal({ itemId })
                response.status.should.equal(400)
            }
        })
        it('should return bad request status if user does not have this item', async() => {
            const userItemId = _.keys(data.userItems)[0]

            const userId = data.userItems[userItemId][uiscols.USER_ID]
            const itemId = data.userItems[userItemId][uiscols.ITEM_ID]

            const userItemRemoved = await one(getDeleteInstancesByIdsQuery(uistable.NAME, [ userItemId ]))
            userItemRemoved.should.deep.equal(data.userItems[userItemId])

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ITEM, {
                        [ROUTES.USERS.ID]: userId,
                        [ROUTES.ITEMS.ID]: itemId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.message.should.equal('Passed item is not set to this user.')
                response.status.should.equal(400)
            }

            const userItemInserted = await one(getInsertInstancesQuery(uistable.NAME, [ userItemRemoved ]))
            userItemInserted.should.deep.equal(data.userItems[userItemId])
        })
    })
    describe('DELETE /users/:userId/items', () => {
        const uitable = TABLES.USER_ITEMS
        it('should remove all items from user', async() => {
            const numberToDelete = 2

            const usersIds = _.keys(data.users).slice(0, numberToDelete)

            const responses = await Promise.all(usersIds.map(userId =>
                chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ALL_ITEMS, {
                        [ROUTES.USERS.ID]: userId
                    }))
            ))

            let userItemsDeleted = []
            responses.forEach(response => {
                response.body.should.have.property('success')
                response.body.success.should.equal(true)

                userItemsDeleted.push(response.body.data.result)
            })

            userItemsDeleted = _.flattenDeep(userItemsDeleted)

            const userItemsAfterDelete = await none(getSelectInstancesByIdsQuery(uitable.NAME, userItemsDeleted.map(ups => ups.id)))
            should.equal(userItemsAfterDelete, null)

            const userItemsInserted = await manyOrNone(getInsertInstancesQuery(uitable.NAME, userItemsDeleted))
            userItemsInserted.length.should.equal(userItemsDeleted.length)
        })
        it('should return bad request status if user id does not match uuid pattern', async() => {
            const userId = _.keys(data.users)[0].slice(1)

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ALL_ITEMS, {
                        [ROUTES.USERS.ID]: userId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal(`Bad ${[ROUTES.USERS.IDp]} passed`)
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
        it('should return user not found if passed user id is not presented in DB', async() => {
            const userId = getNotExistingUUID(_.keys(data.users))

            try {
                await chai.request(app).delete(
                    createRoute(ROUTES.USERS.BASE, ROUTES.USERS.DELETE_ALL_ITEMS, {
                        [ROUTES.USERS.ID]: userId
                    }))

                assert.fail('Request should be failed.')
            } catch (error) {
                const response = error.response

                response.body.should.have.property('success')
                response.body.success.should.equal(false)
                response.body.should.have.property('message')
                response.body.message.should.equal('User with passed id does not exist.')
                response.body.data.should.deep.equal({ userId })
                response.status.should.equal(400)
            }
        })
    })
})