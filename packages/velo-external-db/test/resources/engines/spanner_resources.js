const { Spanner } = require('@google-cloud/spanner')
const { init } = require('external-db-spanner')
const { runImage, stopImage } = require('./docker_support')

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
    const {schemaProvider, cleanup} = init(['test-project', 'test-instance', 'test-database'])
    const res = await schemaProvider.list()
    const tables = res.map(t => t.id)

    for (const t of tables) {
        await schemaProvider.drop(t)
    }

    await cleanup();
}

const initEnv = async () => {
    setEmulatorOn()

    await runImage('spanner')
}

const setEmulatorOn = () => process.env.SPANNER_EMULATOR_HOST = 'localhost:9010'

const setActive = () => {
    setEmulatorOn()
    process.env.TYPE = 'spanner'
    process.env.PROJECT_ID = 'test-project'
    process.env.INSTANCE_ID = 'test-instance'
    process.env.DATABASE_ID = 'test-database'
}

const shutdownEnv = async () => {
    await stopImage('spanner')
}

module.exports = { initEnv, shutdownEnv, setActive, connection, cleanup }