module.exports = {
    "rootDir": "../../",
    "coverageDirectory": "<rootDir>/@coverage",
    "globals": {
        "ts-jest": {
            "tsconfig": "tsconfig.test.json"
        }
    },
    "moduleFileExtensions": ["js", "ts"],
    "testRegex": "/tests/.+\\.(test|spec)\\.ts$",
    "transform": { "^.+\\.ts$": "ts-jest" },
    "verbose": true
};
