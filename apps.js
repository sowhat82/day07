// load express

const { Router } = require('express')
const express = require('express')

// create router. sole purpose to define various routes
const router = express.Router()

//SQL. Never use concat for sql statements
const SQL_FIND_BY_NAME = 'select * from apps where name like ? limit ?'
const SQL_GET_APP_CATEGORIES = 'select distinct(category) from apps'
//                          = 'select count(*) as qcount where name like ?
const SQL_GET_NAME = 'select name from apps where name = ?'

const r = function(pool)
{
    router.get('/', 
            (req,resp) => {
            //status 200
            const cart = []
            resp.status(200)
            resp.type('text/html')
            resp.render('index')
        }
    )

    router.get('/search',
        express.urlencoded({extended: true }),
        async (req,resp) => {
            const q = req.query['searchterm'];
            let conn, recs            
            // acquire a connection from the connection pool
            conn = await pool.getConnection();
            try {
                // const SQL_FIND_BY_NAME = 'select * from apps where name like ? limit ?'
                const result = await conn.query(SQL_FIND_BY_NAME, [`"%${q}%`, 20,])
                console.info(result)
                // result contains an array of 2 elements, of which the first element is an array of 10 items.
                recs = result[0]
//                if (recs.length <=0){
  //                  resp.send('data not found')
    //            }
                console.info(recs)
                resp.status(200)
                resp.type('text/html')
                resp.render('searchresults', {recs})

            } catch (e){
                console.error('Cannot ping database: ', e)

            } finally {
                // release connection. finally always gets executed from a try/catch block
                conn.release()
            }
        }
    )

    return (router)
}

module.exports = r