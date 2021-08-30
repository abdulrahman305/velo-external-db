const { checkRequiredKeys } = require('../utils/secret_provider_utils')

class CommonConfigReader {
    constructor() { }

    readConfig() {
        const { CLOUD_VENDOR, TYPE } = process.env
        return { vendor: CLOUD_VENDOR , type: TYPE }
    }

    validate() {
        return {
            missingRequiredSecretsKeys: checkRequiredKeys(process.env, ['CLOUD_VENDOR', 'TYPE'])
        }
    }
}

module.exports = CommonConfigReader