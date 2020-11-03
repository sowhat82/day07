//load libaries
const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise')

//SQL. Never use concat for sql statements
const SQL_FIND_BY_NAME = 'select * from apps where name like ? limit ? offset ?'
const SQL_GET_APP_CATEGORIES = 'select distinct(category) from apps'
//                          = 'select count(*) as qcount where name like ?
const SQL_GET_APP_ID = 'select app_id from apps where app_id = ?'

//configure the PORT to take in user input port, defined port, or default 3000
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// create the database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', 
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'playstore',
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 4,
    timezone: '+08:00'
    });
    
// create an instance of express
const app = express()

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

// load/mount static resources to be used in the html files
app.use(
    express.static(__dirname + '/static'), //can have multiple resource directories
    express.static(__dirname + '/views') //can have multiple resource directories
)

// load main page
app.get('/', 
        (req,resp) => {
        //status 200
        const cart = []
        resp.status(200)
        resp.type('text/html')
        resp.render('index')
    }
)

app.get('/search',
    express.urlencoded({extended: true }),
    async (req,resp) => {

        const conn = await pool.getConnection();
        var recs = []
        try {
            // acquire a connection from the connection pool
            // const SQL_FIND_BY_NAME = 'select * from apps where name like ? limit ?'
            const result = await conn.query(SQL_GET_APP_ID, [])
            // result contains an array of 2 elements, of which the first element is an array of 10 items.
            recs = result[0]
            if (recs.length <=0){
                resp.send('data not found')
            }
//            console.info(recs)
    
        } catch (e){
            console.error('Cannot ping database: ', e)
        } finally {
            // release connection. finally always gets executed from a try/catch block
            conn.release()
        }

        var hascontent
        resp.status(200)
        resp.type('text/html')
        resp.render('searchresults', {searchterm, recs, hascontent: !!recs.length, pagenum: pagenum + 1})

    }
)

// start the server
pool.getConnection()
    .then(conn => {
        console.info('Pinging database...')
        const p0 = Promise.resolve(conn)
        const p1 = conn.ping()
        return Promise.all([p0, p1])
    })
    .then (results => {
        const conn = results[0]
        // release the connection
        conn.release
        
        //start the server
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })
    .catch (e=>{
        console.error('Cannot start server', e)
    })
