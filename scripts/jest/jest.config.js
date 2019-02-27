module.exports = {
    'rootDir': '../../',
    'coverageDirectory': '<rootDir>/@coverage',
    'globals': {
        'ts-jest': {
            'tsConfig': 'tsconfig.test.json'
        }
    },
    'moduleFileExtensions': ['js', 'ts'],
    'testRegex': '/__test__/.+\\.(test|spec)\\.ts$',
    'transform': { '^.+\\.ts$': 'ts-jest' },
    'verbose': true
};
