const compose = require('docker-compose')
const { Spanner } = require('@google-cloud/spanner')
const { init } = require('external-db-spanner')
const { sleep } = require('test-commons')

const connection = () => {
    const projectId = 'test-project'
    const instanceId = 'test-instance'
    const databaseId = 'test-database'

    const spanner = new Spanner({projectId: projectId})
    const instance = spanner.instance(instanceId);
    const pool = instance.database(databaseId);
    return { pool, cleanup: async () => await pool.close()}
}

const cleanup = async () => {
    const {schemaProvider, cleanup} = init(['test-instance', 'test-project', '', 'test-database'])
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup();
}

const initEnv = async () => {
    process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

    await compose.upOne('spanner', { cwd: __dirname, log: true })
    // await compose.logs('spanner', { cwd: __dirname, log: true });

    await sleep( 5000 )

    await cleanup()
}

const setActive = () => {
    process.env.TYPE = 'spanner'
    process.env.HOST = 'test-instance'
    process.env.USER = 'test-project'
    process.env.PASSWORD = 'ignore'
    process.env.DB = 'test-database'
}

const shutdownEnv = async () => {
    await compose.stopOne('spanner', { cwd: __dirname, log: true })
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }