const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/tokens.db', (err) => {
    if (err) {
        return console.error(err.message);
    }

    const express = require('express');

    const app = express();
    const port = 3000;

    app.get('/', (req, res) => {
        if (req.query.clear) {
            db.run('DELETE FROM tokens');
            res.send(`Cleared all tokens`);
            return;
        }

        const blacklist = (req.query.blacklist || '').split(',');

        db.all(`SELECT * FROM tokens WHERE name NOT IN (${new Array(blacklist.length).fill('?').join(',')})`, blacklist, (err, rows) => {
            if (err) {
                console.log('Error', err);
                res.send(`Error: ${err}`);
            }

            res.send(rows.map((row) => `${row.name}`).join("<br>\n"));
        });
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`)
    });
});
