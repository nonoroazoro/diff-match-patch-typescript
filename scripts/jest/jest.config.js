module.exports = {
    "rootDir": "../../",
    "coverageDirectory": "<rootDir>/@coverage",
    "moduleFileExtensions": ["js", "ts"],
    "testRegex": "/tests/.+\\.(test|spec)\\.ts$",
    "transform": {
        "^.+\\.ts$": [
            "ts-jest",
            {
                "tsconfig": "tsconfig.test.json"

            }
        ]
    },
    "verbose": true
};
