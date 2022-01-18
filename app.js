const axios = require('axios');
const request = {
    "operationName": "transactions",
    "variables": {
    },
    "query": "query transactions {\n  transactions(first: 100, orderBy: timestamp, orderDirection: desc) {\n    mints(orderBy: timestamp, orderDirection: desc) {\n      transaction {\n        id\n        timestamp\n        __typename\n      }\n      pair {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      to\n      liquidity\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    burns(orderBy: timestamp, orderDirection: desc) {\n      transaction {\n        id\n        timestamp\n        __typename\n      }\n      pair {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      sender\n      liquidity\n      amount0\n      amount1\n      amountUSD\n      __typename\n    }\n    swaps(orderBy: timestamp, orderDirection: desc) {\n      transaction {\n        id\n        timestamp\n        __typename\n      }\n      pair {\n        token0 {\n          id\n          symbol\n          __typename\n        }\n        token1 {\n          id\n          symbol\n          __typename\n        }\n        __typename\n      }\n      amount0In\n      amount0Out\n      amount1In\n      amount1Out\n      amountUSD\n      to\n      __typename\n    }\n    __typename\n  }\n}\n"
};

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/tokens.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.run('CREATE TABLE IF NOT EXISTS tokens(name varchar, UNIQUE(name))');

function insertToken(name) {
    db.run(`INSERT OR IGNORE INTO tokens(name) VALUES(?)`, [name], function (err) {
        if (err) {
            return console.error(err.message);
        }
    });
}

function perform() {
    axios
        .post('https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap', request)
        .then(res => {
            res.data.data.transactions.map((t) => {
                t.swaps.map(s => {
                    insertToken(s.pair.token0.symbol);
                    insertToken(s.pair.token1.symbol);
                });
            });
        })
        .catch(error => {
            console.error(error)
        })
        .finally(() => {
            setTimeout(() => perform(), 1000);
        });
}

perform();
