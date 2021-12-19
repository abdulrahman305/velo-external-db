const { EMPTY_SORT } = require('velo-external-db-commons')
const { when } = require('jest-when')

const escapeIdentifier  = i => i

const filterParser = {
    transform: jest.fn(),
    parseFilter: jest.fn(),
    orderBy: jest.fn(),
    parseAggregation: jest.fn(),
}

const stubEmptyFilterAndSortFor = (filter, sort) => {
    stubEmptyFilterFor(filter)
    stubEmptyOrderByFor(sort)
}

const stubEmptyFilterFor = (filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: '', parameters: [], offset: 1 })
}

const stubEmptyOrderByFor = (sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue(EMPTY_SORT)
}

const givenOrderByFor = (column, sort) => {
    when(filterParser.orderBy).calledWith(sort)
                              .mockReturnValue({ sortExpr: `ORDER BY ${escapeIdentifier(column)} ASC`, sortColumns: [] })
}


const givenFilterByIdWith = (id, filter) => {
    when(filterParser.transform).calledWith(filter)
                                .mockReturnValue({ filterExpr: `WHERE ${escapeIdentifier('_id')} = ?`, parameters: [id], offset: 2 })
}

const givenAggregateQueryWith = (having, numericColumns, columnAliases, groupByColumns, filter, offest) => {
    when(filterParser.parseAggregation).calledWith(having, filter)
                                       .mockReturnValue({
                                           fieldsStatement: `${groupByColumns.map( escapeIdentifier ).join(', ')}, MAX(${escapeIdentifier(numericColumns[0].name)}) AS ${escapeIdentifier(columnAliases[0])}, SUM(${escapeIdentifier(numericColumns[1].name)}) AS ${escapeIdentifier(columnAliases[1])}`,
                                           groupByColumns: groupByColumns,
                                           offset: offest,
                                           havingFilter: '',
                                           parameters: [],
                                       })
}



const reset = () => {
    filterParser.transform.mockClear()
    filterParser.orderBy.mockClear()
    filterParser.parseAggregation.mockClear()
    filterParser.parseFilter.mockClear()
}

module.exports = { stubEmptyFilterAndSortFor, givenOrderByFor, stubEmptyOrderByFor,
                   stubEmptyFilterFor, givenFilterByIdWith, givenAggregateQueryWith,
                   filterParser, reset
}