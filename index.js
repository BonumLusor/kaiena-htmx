import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

const API_PORT = process.env.API_PORT;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

(async () => {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    // static
    app.get('/', async (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });

    app.get('/calendar/:id', (req, res) => {
        res.sendFile(__dirname + '/public/calendar.html');
    });

    app.get('/register', (req, res) => {
        res.sendFile(__dirname + '/public/register.html');
    });

    // css
    app.get('/styles/main.css', async (req, res) => {
        res.sendFile(__dirname + '/public/styles/main.css');
    });
    app.get('/styles/home.css', async (req, res) => {
        res.sendFile(__dirname + '/public/styles/home.css');
    });
    app.get('/styles/calendar.css', async (req, res) => {
        res.sendFile(__dirname + '/public/styles/calendar.css');
    });
    app.get('/styles/register.css', async (req, res) => {
        res.sendFile(__dirname + '/public/styles/register.css');
    });

    // components
    app.get('/monthYear', (req, res) => {
        const m = parseInt(req.query.date);
        if (m > 12) m -= 12;
        const monthNumber = parseInt(new Date().getMonth()) + 1;
        const year = 2023 + parseInt(req.query.year);

        const monthName = {
            1: 'Janeiro',
            2: 'Fevereiro',
            3: 'Março',
            4: 'Abril',
            5: 'Maio',
            6: 'Junho',
            7: 'Julho',
            8: 'Agosto',
            9: 'Setembro',
            10: 'Outubro',
            11: 'Novembro',
            12: 'Dezembro'
        };

        const currentMonth = monthName[m];

        res.send(currentMonth + '/' + year);
    });

    app.post('/calendar', async (req, res) => {
        const m = parseInt(req.body.date);
        const y = new Date().getFullYear();
        if (m > 12) m -= 12;
        const lastDay = new Date(y, m, 0).getDate();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = y + parseInt(req.body.year);
        const currentDay = new Date().getDate();
        let response = '<tr>';
        let alocatedDays = [];
        let posts = [];

        try {

            const query =
                'SELECT calendar.day, calendar.category, posts.id, posts.name, type_post.type, posts.link_curadoria, posts.subtitle FROM calendar INNER JOIN posts, type_post WHERE calendar.post = posts.id AND posts.cod_type = type_post.id AND calendar.client = 2 AND calendar.month = 4 AND calendar.year = 2023 ORDER BY day;';
            const [rows] = await connection.query(query, [2, 4, 2023]);

            posts = rows;
            alocatedDays = rows.map((e) => e.day);

        } catch (error) {
            console.error(error);
        } finally {

            function matchDay(day) {
                for (let i = 0; i < posts.length; i++) {
                    if (posts[i].day === day) {
                        return posts[i];
                    }
                }
            }

            function encryptPost(post) {
                const encoder = new TextEncoder();
                const data = encoder.encode(JSON.stringify(post));
                return btoa(String.fromCharCode(...new Uint8Array(data)))
            }

            for (let i = 1; i <= lastDay; i++) {
                const weekDay = new Date(currentYear, m - 1, i).toLocaleDateString(
                    'en-US',
                    { weekday: 'long' }
                );

                if (i === 1 && weekDay !== 'Monday') {
                    switch (weekDay) {
                        case 'Tuesday':
                            response += "<td><div class='filler'></div></td>";
                            break;
                        case 'Wednesday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Thursday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Friday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Saturday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                    }
                }
    
                if (i === lastDay) {
                    switch (weekDay) {
                        case 'Monday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Tuesday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Wednesday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Thursday':
                            response +=
                                "<td><div class='filler'></div></td><td><div class='filler'></div></td>";
                            break;
                        case 'Friday':
                            response += "<td><div class='filler'></div></td>";
                            break;
                    }
                }
    
                if (weekDay !== 'Sunday') {
                    if (
                        alocatedDays.includes(i) &&
                        i === currentDay &&
                        m === currentMonth &&
                        y === currentYear
                    ) {
                        response += `<td><div class='day-wrapper' onclick="openModal()"><div class='day current-day'>${i}</div><div class='post'>${matchDay(i).name}</div></div></td>`;
                    } else if ( matchDay(i) ) {
                        response += `<td><div class='day-wrapper' onclick='openModal("${encryptPost(matchDay(i))}")'><div class='day'>${i}</div><div class='post'>${matchDay(i).name}</div></div></td>`;
                    } else {
                        response += `<td><div class='day-wrapper' onclick="openModal()"><div class='day'>${i}</div></div></td>`;
                    }
                }
    
                if (weekDay === 'Saturday') {
                    response += '</tr><tr>';
                }
                
            }
    
            res.send(response + '</tr>');

        }
    });


    app.get('/add-color', (req, res) => {
        res.send("<input type='color' id='color' name='color' value='#000'>");
    });

    // database
    app.route('/clients')
        .get(async (req, res) => {
            let status = 200;
            let retVal = {};

            try {
                const query =
                    'SELECT * FROM clients WHERE active="1" ORDER BY name;';
                const [rows] = await connection.query(query);
                retVal.data = rows;
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        })
        .post(async (req, res) => {
            let data = req.body;
            let status = 200;
            let retVal = {};

            try {
                const query = `INSERT INTO clients (name, cod_categories_client, color, city, week_days) VALUES ("${data.name}", ${data.cod_categories_client}, "${data.color}", "${data.city}", "${data.week_days}")`;
                await connection.query(query);
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        })
        .put(async (req, res) => {
            let data = req.body;
            let status = 200;
            let retVal = {};

            try {
                const query = `UPDATE clients SET city="${data.city}", color="${data.color}" WHERE id=${data.id}`;
                await connection.query(query);
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        });

    // Show Tabela Clients_categories

    app.get('/category_client', async (req, res) => {
        let status = 200;
        let retVal = {};

        try {
            const query = 'SELECT * FROM category_client';
            const [rows] = await connection.query(query);
            retVal.data = rows;
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        } finally {
            res.status(status).json(retVal);
        }
    });

    // show Tabela clients_relational

    app.route('/clients_relational')
        .get(async (req, res) => {
            let status = 200;
            let retVal = {};

            try {
                const query = 'SELECT * FROM clients_relational';
                const [rows] = await connection.query(query);
                retVal.data = rows;
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        })
        .post(async (req, res) => {
            let data = req.body;
            let status = 200;
            let retVal = {};

            try {
                const query = `INSERT INTO clients_relational (cod_radiologist, cod_clinic, related_day) VALUES (${data.cod_radiologist}, ${data.cod_clinic}, "${data.related_day}")`;
                await connection.query(query);
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        });

    // Show Tabela categorie_post

    app.get('/category_post', async (req, res) => {
        let status = 200;
        let retVal = {};

        try {
            const query = 'SELECT * FROM category_post';
            const [rows] = await connection.query(query);
            retVal.data = rows;
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        } finally {
            res.status(status).json(retVal);
        }
    });

    app.get('/clients/:id', async (req, res) => {
        let status = 200;
        let retVal = {};

        const { id } = req.params;
        if (isNaN(Number(id))) {
            status = 400;
            retVal.message =
                'Invalid request. Please make sure the id you are searching for is a number';
            return res.status(status).json(retVal);
        }

        try {
            const query = 'SELECT * FROM clients WHERE clients.id=?';
            const [rows] = await connection.query(query, [id]);

            retVal.data = rows[0];
            if (!retVal.data) {
                status = 404;
                retVal.message = `Couldn't find a character with id ${id}`;
            }
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        } finally {
            res.status(status).json(retVal);
        }
    });

    app.route('/posts')
        .get(async (req, res) => {
            let status = 200;
            let retVal = {};
    
            try {
                const query =
                    'SELECT posts.id, posts.name, posts.subtitle, posts.link_curadoria, category_post.category, type_post.type FROM posts INNER JOIN type_post ON type_post.id=posts.cod_type INNER JOIN category_post ON category_post.id=posts.cod_categories;';
                const [rows] = await connection.query(query);
                retVal.data = rows;
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        })

        .post(async (req, res) => {
            let data = req.body;
            let status = 200;
            let retVal = {};

            try {
                const query = `INSERT INTO posts (name, cod_categories, cod_type, subtitle, cod_client, link_curadoria) VALUES ("${data.name}", "${data.cod_categories}", "${data.cod_type}", "${data.subtitle}", "${data.cod_client}", "${data.link_curadoria}")`;
                await connection.query(query);
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        })

        .get(async (req, res) => {
            let status = 200;
            let retVal = {};

            try {
                const query = 'SELECT * FROM posts ;';
                const [rows] = await connection.query(query);
                retVal.data = rows;
            } catch (error) {
                console.error(error);
                retVal.error = error;
                status = 500;
            } finally {
                res.status(status).json(retVal);
            }
        });

    app.get('/type_post', async (req, res) => {
        let status = 200;
        let retVal = {};

        try {
            const query =
                'SELECT type_post.id, type_post.type, frequency_post.frequency FROM type_post JOIN frequency_post ON type_post.cod_frequency = frequency_post.id;';
            const [rows] = await connection.query(query);
            retVal.data = rows;
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        } finally {
            res.status(status).json(retVal);
        }
    });

    app.get('/frequency_post', async (req, res) => {
        let status = 200;
        let retVal = {};

        try {
            const query = 'SELECT * FROM frequency_post;';
            const [rows] = await connection.query(query);
            retVal.data = rows;
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        } finally {
            res.status(status).json(retVal);
        }
    });

    app.get('/calendar/:client/:month/:year/', async (req, res) => {
        let status = 200;
        let retVal = {};

        const { client, month, year } = req.params;
        if (isNaN(Number(month)) || isNaN(Number(year))) {
            status = 400;
            retVal.message =
                'Invalid request. Please make sure the month and year are numbers';
            return res.status(status).json(retVal);
        }

        try {
            // Ajuste a consulta de acordo com a estrutura do seu banco de dados
            const query =
                'SELECT * FROM calendar WHERE client = ? AND month = ? AND year = ? ORDER BY day';
            const [rows] = await connection.query(query, [client, month, year]);

            if (rows.length === 0) {
                status = 404;
                retVal.message = 'No data found for the specified parameters';
            } else {
                retVal.data = rows;
            }
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        }

        res.status(status).json(retVal);
    });

    app.get('/calendar/:client/:type', async (req, res) => {
        let status = 200;
        let retVal = {};

        const { client, type } = req.params;
        if (isNaN(Number(client)) || isNaN(Number(type))) {
            status = 400;
            retVal.message =
                'Invalid request. Please make sure the month and year are numbers';
            return res.status(status).json(retVal);
        }

        try {
            // Ajuste a consulta de acordo com a estrutura do seu banco de dados
            const query =
                'SELECT calendar.day, calendar.month+1 AS month, calendar.year, posts.name, type_post.type FROM posts JOIN calendar ON posts.id=calendar.post JOIN type_post ON type_post.id=posts.cod_type WHERE calendar.client = ? AND type_post.id = ? ORDER BY year DESC, month DESC, day DESC LIMIT 1;';
            const [rows] = await connection.query(query, [client, type]);

            if (rows.length === 0) {
                status = 404;
                retVal.message = 'No data found for the specified parameters';
            } else {
                retVal.data = rows;
            }
        } catch (error) {
            console.error(error);
            retVal.error = error;
            status = 500;
        }

        res.status(status).json(retVal);
    });

    app.listen(API_PORT, () => {
        console.log(`App is listening on port ${API_PORT}`);
    });
})();
