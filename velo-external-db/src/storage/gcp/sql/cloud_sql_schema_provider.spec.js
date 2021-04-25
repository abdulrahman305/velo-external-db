const {expect} = require('chai')
const {SchemaProvider, SystemFields} = require('./cloud_sql_schema_provider')
const { Uninitialized } = require('../../../../test/commons/test-commons');
const mysql = require('../../../../test/resources/mysql_resources');
const gen = require('../../../../test/drivers/gen');
const chance = new require('chance')();

describe('Cloud SQL Service', () => {

    describe('Schema API', () => {
        it('list of empty db will result with an empty array', async () => {
            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([])
        })

        it('create collection with default columns', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.list()
            expect(db).to.be.deep.eql([{ id: ctx.collectionName,
                fields: [{name: '_id', type: 'text', isPrimary: true},
                         {name: '_createdDate', type: 'datetime', isPrimary: false},
                         {name: '_updatedDate', type: 'datetime', isPrimary: false},
                         {name: '_owner', type: 'text', isPrimary: false},
                         // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            }])
        })

        it('retrieve collection data by collection name', async () => {
            await env.schemaProvider.create(ctx.collectionName)

            const db = await env.schemaProvider.describeCollection(ctx.collectionName)
            expect(db).to.be.deep.eql({ id: ctx.collectionName,
                fields: [{name: '_id', type: 'text', isPrimary: true},
                         {name: '_createdDate', type: 'datetime', isPrimary: false},
                         {name: '_updatedDate', type: 'datetime', isPrimary: false},
                         {name: '_owner', type: 'text', isPrimary: false},
                         // {name: 'title', type: 'varchar(20)', isPrimary: false},
                ]
            })
        })

        it('create collection twice will do nothing', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.create(ctx.collectionName, [])
        })

        it('add column on a non existing collection will fail', async () => {
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
        })

        it('add column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})

            expect((await env.schemaProvider.describeCollection(ctx.collectionName))
                                            .fields.find(e => e.name === ctx.columnName)).to.be.deep.eql({name: ctx.columnName, type: 'datetime', isPrimary: false})
        })

        it('add duplicate column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})
        })

        it('add system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                        .map(async f => {
                            await env.schemaProvider.addColumn(ctx.collectionName, {name: f, type: 'timestamp'})
                        })
        })

        it('drop column on a an existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])
            await env.schemaProvider.addColumn(ctx.collectionName, {name: ctx.columnName, type: 'timestamp'})

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)

            expect((await env.schemaProvider.list()).find(e => e.id === ctx.collectionName)
                                            .fields.find(e => e.name === ctx.columnName)).to.be.an('undefined')
        })

        it('drop column on a a non existing collection', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            await env.schemaProvider.removeColumn(ctx.collectionName, ctx.columnName)
        })

        it('drop system column will fail', async () => {
            await env.schemaProvider.create(ctx.collectionName, [])

            SystemFields.map(f => f.name)
                .map(async f => {
                    await env.schemaProvider.removeColumn(ctx.collectionName, f)
                })
        })
    })

    const ctx = {
        collectionName: Uninitialized,
        columnName: Uninitialized,
    };

    const env = {
        schemaProvider: Uninitialized,
        connectionPool: Uninitialized,
    };

    beforeEach(() => {
        ctx.collectionName = gen.randomCollectionName();
        ctx.columnName = chance.word();
    });

    before(async function() {
        this.timeout(20000)
        env.connectionPool = await mysql.initMySqlEnv()
        env.schemaProvider = new SchemaProvider(env.connectionPool)
    });

    after(async () => {
        await mysql.shutdownMySqlEnv();
    });
})
