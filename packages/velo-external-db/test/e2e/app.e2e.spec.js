const { auth } = require('../drivers/auth-test-support')
const each = require('jest-each').default
const { mysqlTestEnvInit, dbTeardown, postgresTestEnvInit, initApp, teardownApp} = require("../resources/e2e_resources")

const axios = require('axios').create({
    baseURL: 'http://localhost:8080'
});

afterAll(async () => {
    await teardownApp()
}, 20000);

describe('Velo External DB',  () => {
    each([
        ['MySql', mysqlTestEnvInit],
        ['Postgres', postgresTestEnvInit],
    ]).describe('%s', (name, setup, teardown) => {
        beforeAll(async () => {
            await setup()

            initApp()
        }, 20000);

        afterAll(async () => {
            await dbTeardown()
        }, 20000);


        test('answer default page with a welcoming response', async () => {
            expect((await axios.get(`/`)).data).toContain('<!doctype html>');
        })

        test('answer provision with stub response', async () => {
            expect((await axios.post(`/provision`, {}, auth)).data).toEqual({});
        })
    })

})
