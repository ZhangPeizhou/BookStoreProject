//PeizhouZhang  101110707
const {Client} = require('pg');
const client = new Client({
    user: "postgres",
    password: "ZhangPeizhou",
    host: "localhost",
    port: 5432,
    database: "BookStore"
})
const express=require('express');
const app=express();
const pug=require('pug');
app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const fs = require('fs');
const path = require('path');
const session=require('express-session');
app.use(session({ 
    secret: 'some secret key here',
    resave: true, 
    saveUninitialized: false, 
    cookie: {} 
}));
/*
app.use(function(req, res, next){
    console.log(req.session);
    next();
})
*/
//Helper Function
app.use(function(req, res, next){
    if(req.session) res.locals.session=req.session;
    next();
});
//Helper Function
app.use(function(req, res, next){
    console.log(`${req.method} for ${req.url}`);
    next();
})
//Connect to database. If successful, then create server.
client.connect()
.then(()=>console.log("*************** Connected Sucessfully ***************"))
.then(()=>{
    //HomePage
    app.get("/",(req, res)=>{
        req.session.customer_id='';
        req.session.login=false;
        res.locals.session=req.session;
        res.statusCode=200;
	    res.setHeader("Content-Type","text/html");
	    res.send(pug.renderFile("views/HomePage.pug"));
    })
    //Send functions.js
    app.get("/functions.js",(req, res)=>{
        fs.readFile("functions.js", (err, data)=>{
            if(err){
                res.statusCode=500;
                res.write("Server Error");
                res.end();
            }
            res.statusCode=200;
            res.setHeader("Content-Type","application/javascript");
            res.write(data);
            res.end();
        })
    })
    //////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// Customer ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////
    //Customer Log In
    app.get("/customerLogIn",(req, res)=>{
        res.statusCode=200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile("views/CustomerLogIn.pug"));
    })
    app.post(`/CLogIn`,(req, res)=>{
        req.session.username=req.body.username;
        req.session.password=req.body.password;
        res.locals.session=req.session;
        client.query(`select count(*) from "Customer" where name = '${req.session.username}' and password = '${req.session.password}'`)
        .then(result=>{
            req.session.check = parseInt(result.rows[0].count);
            if(req.session.check==1){
                client.query(`select customer_id from "Customer" where name = '${req.session.username}' and password = '${req.session.password}'`)
                .then(result=>{
                    req.session.customer_id=result.rows[0].customer_id;
                    req.session.login=true;
                    res.locals.session=req.session;
                    res.status(200).send();
                })
            }
        })
    })
    app.get('/CLogInFinalStep', (req, res)=>{
        if(req.session.check==0){
            res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile('views/NotRegistered.pug'))
        }else{
            let all;
            client.query(`select * from "Author" natural join "Book" natural join "Publisher"`)
            .then(results=>{all=results.rows;})
            .then(()=>{
                client.query(`select * from "Customer" natural join "Basket" where customer_id = ${req.session.customer_id}`)
                .then(result=>{
                    req.session.basket=parseInt(result.rows[0].basket_id);
                    res.locals.session=req.session;
                    res.statusCode=200;
                    res.setHeader("Content-Type", "text/html");
                    res.send(pug.renderFile("views/Customer.pug", {data: all, user: req.session.username}));
                })
            })
        }
    })
    //Customer Page
    app.get('/customer', (req, res)=>{
        if(req.session.customer_id=='UsernameAlreadyExist'){
            res.status(200).send(pug.renderFile('views/UsernameToken.pug'))
        }else{
            if(req.session.login){
                let all;
                client.query(`select * from "Author" natural join "Book" natural join "Publisher"`)
                .then(results=>{all=results.rows;})
                .then(()=>{
                    res.statusCode=200;
                    res.setHeader("Content-Type", "text/html");
                    res.send(pug.renderFile("views/Customer.pug", {data: all, user: req.session.username}));
                })
            }else{res.status(403).send()}
        }
    })
    //Search Book
    app.post("/searchBook", (req, res)=>{
        if(req.session.login){
            req.session.bookResult=[];
            let request=req.body;
            let type=request.type;
            let value=request.value;
            client.query(`select * from "Author" natural join "Book" natural join "Publisher" where ${type}=${value};`)
            .then(results=>{
                req.session.bookResult=results.rows;
                res.status(200).send();
            })
        }else{res.status(403).send()}
    })
    //Search Result for Customer
    app.get('/CustomerBookResults',(req, res)=>{
        if(req.session.login){
            res.statusCode=200;
            res.setHeader("Content-Type","text/html");
            res.send(pug.renderFile("views/CustomerBookResult.pug", {data: req.session.bookResult}));
        }else{res.status(403).send()}
        
    })
    //Add Book to Basket
    app.post(`/addToBasket`, (req, res)=>{
        if(req.session.login){
            let book_id=parseInt(req.body.book_id);
            client.query(`update "Basket" set books=array_append(books, ${book_id}) where basket_id = ${req.session.basket}`)
            .then(()=>{
                client.query(`select price from "Book" where book_id = ${book_id}`)
                .then(result=>{
                    let price=result.rows[0].price;
                    client.query(`select price from "Basket" where basket_id = ${req.session.basket}`)
                    .then(result=>{
                        let sub_total=result.rows[0].price;
                        client.query(`update "Basket" set price=${sub_total}+${price} where basket_id = ${req.session.basket}`)
                        .then(()=>{
                            client.query(`select book_id, title, price, author_name from "Book" natural join "Author" where book_id = ${book_id}`)
                            .then(result=>{
                                let isbn=result.rows[0].book_id;
                                let title=result.rows[0].title;
                                let price=result.rows[0].price;
                                let author=result.rows[0].author_name;
                                let format=`--- ISBN: ${isbn} - Title: ${title} - Price: ${price} - Author: ${author}`
                                client.query(`update "Basket" set book_list=array_append(book_list, '${format}') where basket_id=${req.session.basket}`)
                                .then(()=>{res.status(200).send();})
                            })
                        })
                    })
                })
            })
        }else{res.status(403).send()}    
    })
    //Basket Page
    app.get('/basket', (req, res)=>{
        if(req.session.login){
            client.query(`select * from "Basket" where basket_id = ${req.session.basket}`)
            .then(result=>{
                let results = result.rows[0];
                res.statusCode=200;
                res.setHeader("Content-Type", "text/html");
                res.send(pug.renderFile("views/Basket.pug", {data: results}));
            })
        }else{res.status(403).send()}
    })
    //Input Shiping Information
    app.get('/shiping', (req, res)=>{
        if(req.session.login){
            res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile("views/ShipingInfo.pug"));
        }else{res.status(403).send()}

    })
    //Place Order
    app.post(`/placeOrder`, (req, res)=>{
        if(req.session.login){
            let Saddress=req.body.Sa;
            let Baddress=req.body.Ba;
            let phone=req.body.Ph;
            let card=req.body.Ca;
            client.query(`select count(*) from "Order"`)
            .then(result=>{
                let order_id=parseInt(result.rows[0].count)+1;
                client.query(`select book_list, price from "Basket" where basket_id = ${req.session.basket}`)
                .then(results=>{
                    let book_list=results.rows[0].book_list;
                    let price=results.rows[0].price;
                    let format=`Shipping Address: ${Saddress} --- Billing Address: ${Baddress} --- Phone Number: ${phone} --- Bank Card Number: ${card} --- Book List: ${book_list}`;
                    client.query(`insert into "Order" (order_id, details, tot_price, customer_id, cur_location) values (${order_id}, '${format}', ${price}, ${parseInt(req.session.customer_id)}, 'at warehouse, waiting for postman to collect')`)
                    .then(()=>{
                        client.query(`select books from "Basket" where basket_id = ${req.session.basket}`)
                        .then(results=>{
                            let books=results.rows[0].books;
                            let array={};
                            let exist;
                            books.forEach(id=>{
                                exist=0;
                                if(array=={}){
                                    array[id]=1;
                                    exist=1;
                                }else{
                                    Object.keys(array).forEach(key=>{
                                        if(id==key){
                                            array[key]+=1;
                                            exist=1;
                                        }
                                    })
                                }
                                if(exist==0){array[id]=1}
                            })
                            Object.keys(array).forEach(key=>{
                                client.query(`select num_remain from "Book" where book_id = ${parseInt(key)}`)
                                .then(result=>{
                                    let remain=result.rows[0].num_remain;
                                    client.query(`update "Book" set num_remain=${parseInt(remain-array[key])} where book_id = ${parseInt(key)}`)
                                    .then(()=>{res.status(200).send();})
                                })
                            })
                        })
                        client.query(`update "Basket" set books=null, book_list=null, price=0 where basket_id=${req.session.basket}`)
                    })
                })
            })
        }else{res.status(403).send()}  
    })
    //See Previous Order
    app.get('/previousOrder', (req, res)=>{
        if(req.session.login){
            client.query(`select * from "Order" where customer_id=${req.session.customer_id}`)
            .then(results=>{
                let result=results.rows;
                res.statusCode=200;
                res.setHeader("Content-Type", "text/html");
                res.send(pug.renderFile('views/PreviousOrder.pug', {data: result}))
            })
        }else{res.status(403).send()}   
    })
    //Search Order By Order ID
    app.get('/searchOrder', (req, res)=>{
        if(req.session.login){res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile('views/SearchOrder.pug'))
        }else{res.status(403).send()}
        
    })
    app.post('/searchOrder', (req, res)=>{
        if(req.session.login){let id=req.body.id;
            client.query(`select * from "Order" where order_id=${id} and customer_id=${req.session.customer_id}`)
            .then(results=>{
                req.session.Orderresult=results.rows;
                res.locals.session=req.session;
                res.status(200).send();
            })
        }else{res.status(403).send()}    
    })
    app.get('/orderResult',(req, res)=>{
        if(req.session.login){
            res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile('views/OrderResult.pug', {data: req.session.Orderresult}))
        }else{res.status(403).send()}    
    })
//Register as new customer
app.get('/Cregister',(req, res)=>{
    res.status(200).send(pug.renderFile('views/CustomerRegistration.pug'))
})
app.post('/Cregister',(req, res)=>{
    let name=req.body.username;
    let password=req.body.password;
    client.query(`SELECT count(*) from "Customer" where name='${name}'`)
    .then(result=>{
        if(result.rows[0].count!=0){
            req.session.customer_id='UsernameAlreadyExist';
            res.locals.session=req.session;
            res.status(200).send();
        }else if(result.rows[0].count==0){
            client.query('SELECT count(*) from "Customer"')
            .then(result=>{
                let customer_id=parseInt(result.rows[0].count)+1;
                client.query(`INSERT into "Customer" (customer_id, name, password) values (${customer_id}, '${name}', '${password}')`)
                .then((resu, err)=>{
                    if(err) throw err
                    client.query('SELECT count(*) from "Basket"')
                    .then(results=>{
                        let basket_id=parseInt(results.rows[0].count)+1;
                        client.query(`INSERT into "Basket" (basket_id, customer_id, price) values (${basket_id}, ${customer_id}, 0)`)
                        .then(()=>{
                            req.session.username=name;
                            req.session.customer_id=customer_id;
                            req.session.login=true;
                            req.session.basket=basket_id;
                            res.locals.session=req.session;
                            res.status(200).send()
                        })
                    })
                })
            })
        }
    })
})







    ///////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////// Owner ////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    //Owner Log In
    app.get('/ownerLogIn', (req, res)=>{
        res.statusCode=200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile("views/OwnerLogIn.pug"));
    })
    app.post(`/ownerLogIn`, (req, res)=>{
        client.query(`SELECT count(*) from "Owner" where name='${req.body.name}' and password='${req.body.password}'`)
        .then(result=>{
            if(result.rows[0].count==1){
                req.session.login=true;
                res.locals.session=req.session;
                res.status(200).send();
            }
        })
    })
    //Owner Page
    app.get('/owner', (req, res)=>{
        if(req.session.customer_id=='UsernameAlreadyExist'){
            res.status(200).send(pug.renderFile('views/UsernameToken.pug'))
        }else{
            if(req.session.login){
                req.session.customer_id=null;
                req.session.login=true;
                res.locals.session=req.session;
                let allBook;
                client.query(`select * from "Author" natural join "Book" natural join "Publisher"`)
                .then(results=>{allBook=results.rows;})
                .then(()=>{
                    client.query(`select * from "Author" natural join "Book" natural join "Publisher" where num_remain<=10`)
                    .then(results=>{
                        let warning = results.rows;
                        res.statusCode=200;
                        res.setHeader("Content-Type", "text/html");
                        res.send(pug.renderFile("views/Owner.pug", {data: allBook, warning: warning}));
                    })
                })
            }else{res.status(403).send()}
        }
    })
    //Search Book
    app.post("/searchBook", (req, res)=>{
        if(req.session.login){
            req.session.bookResult=[];
            let request=req.body;
            let type=request.type;
            let value=request.value;
            client.query(`select * from "Author" natural join "Book" natural join "Publisher" where ${type}=${value};`)
            .then(results=>{
                req.session.bookResult=results.rows;
                res.status(200).send();
            })
        }else{res.status(403).send()} 
    })
    //Search Result for Owner
    app.get('/OwnerBookResults',(req, res)=>{
        if(req.session.login){
            res.statusCode=200;
            res.setHeader("Content-Type","text/html");
            res.send(pug.renderFile("views/OwnerBookResult.pug", {data: req.session.bookResult}))
        }else{res.status(403).send()}    
    })
    //Add book
    app.get('/addBook', (req, res)=>{
        if(req.session.login){
            let bookid;
            let authors;
            let publishers;
            client.query(`select * from "Author"`)
            .then(results=>authors=results.rows)
            .then(()=>{
                client.query(`select * from "Publisher"`)
                .then(results=>publishers=results.rows)
                .then(()=>{
                    client.query(`SELECT count(*) AS exact_count FROM "Book"`)
                    .then(result=>bookid=parseInt(result.rows[0].exact_count))
                    .then(()=>{
                        bookid+=1;
                        res.statusCode=200;
                        res.setHeader("Content-Type", "text/html");
                        res.send(pug.renderFile("views/AddBook.pug", {data: bookid, authors: authors, publishers: publishers}))
                    })
                })
            })
        }else{res.status(403).send()}    
    })
    app.post(`/addToStore`, (req, res)=>{
        if(req.session.login){
            let format=req.body;
            let book_id=format.book_id;
            book_id=parseInt(book_id);
            let title=format.title;
            let price=format.price;
            let author_id=format.author;
            let genre=format.genre;
            let publisher_id=format.publisher;
            let expense=format.expense;
            let num_tot_bought=format.num_tot_bought;
            let num_page=format.num_page;
            let transfer=parseInt(format.transfer);
            client.query(`INSERT INTO "Book" (book_id, title, num_page, price, num_tot_bought, num_remain, author_id, publisher_id, genre, expense, transfer_rate) 
            VALUES (${book_id}, '${title}', ${num_page}, ${price}, ${parseInt(num_tot_bought)}, ${parseInt(num_tot_bought)}, ${author_id}, ${publisher_id}, '${genre}', ${parseInt(expense)}, ${transfer})`)
            .then(()=>{res.status(200).send();})
        }else{res.status(403).send()}
    })
    //Remove book
    app.post(`/removeBook`, (req, res)=>{
        if(req.session.login){
            let target = parseInt(req.body.book_id);
            client.query(`delete from "Book" where book_id = ${target}`)
            .then(()=> client.query('select * from "Book"')
            .then(results=>{
                res.status(200).send();
            }))
        }else{res.status(403).send()}
    })
    //Total sales and expense or Sales and expense per author/genre
    app.get('/seereport', (req, res)=>{
        if(req.session.login){
            res.statusCode=200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile('views/SeeReport.pug'));
        }else{res.status(403).send()}
    })
    app.post('/report', (req, res)=>{
        if(req.session.login){
            let type=req.body.ReportType;
            req.session.report=type;
            res.locals.session=req.session;
            res.status(200).send();
        }else{res.status(403).send()}
    })
    app.get('/report', (req, res)=>{
        if(req.session.login){
            let type=req.session.report;
            if(type=='author'){
                client.query('select author_name, author_id, sum (price*(num_tot_bought-num_remain)) from "Book" natural join "Author" group by author_id, author_name')
                .then(results=>{
                    let sales=results.rows;
                    client.query('select author_name, author_id, sum (expense*num_tot_bought) from "Book" natural join "Author" group by author_id, author_name')
                    .then(result=>{
                        let expenses=result.rows;
                        res.status(200).send(pug.renderFile('views/Report.pug', {type: type, sale: sales, expense: expenses}))
                    })
                })
            }else if(type=='genre'){
                client.query('select genre, sum (price*(num_tot_bought-num_remain)) from "Book" group by genre')
                .then(results=>{
                    let sales=results.rows;
                    client.query('select genre, sum (expense*num_tot_bought) from "Book" group by genre')
                    .then(result=>{
                        let expenses=result.rows;
                        res.status(200).send(pug.renderFile('views/Report.pug', {type: type, sale: sales, expense: expenses}))
                    })
                })
            }else if(type=='book'){
                client.query('select book_id, title, sum (price*(num_tot_bought-num_remain)) from "Book" group by book_id, title')
                .then(results=>{
                    let sales=results.rows;
                    client.query('select book_id, title, sum (expense*num_tot_bought) from "Book" group by book_id, title')
                    .then(result=>{
                        let expenses=result.rows;
                        res.status(200).send(pug.renderFile('views/Report.pug', {type: type, sale: sales, expense: expenses}))
                    })
                })
            }else if(type=='total'){
                client.query('select sum (price*(num_tot_bought-num_remain))from "Book"')
                .then(results=>{
                    let sale=results.rows[0];
                    client.query('select sum (expense*num_tot_bought) from "Book"')
                    .then(result=>{
                        let expense=result.rows[0];
                        res.status(200).send(pug.renderFile('views/Report.pug', {type: type, sale: sale, expense: expense}))
                    })
                })
            }
        }else{res.status(403).send()}
    })
    //See author share details
    app.get('/authorshare', (req, res)=>{
        if(req.session.login){
            client.query('select author_id, author_name, publisher_id, bank_account,sum((transfer_rate*0.01)*(num_tot_bought-num_remain)*price) from "Book" natural join "Author" natural join "Publisher" group by author_id, author_name, publisher_id, bank_account')
            .then(results=>{
                res.status(200).send(pug.renderFile('views/AuthorShare.pug', {data: results.rows}))
            })
        }else{res.status(403).send()} 
    })
    //Register as new customer
    app.get('/Oregister',(req, res)=>{
        res.status(200).send(pug.renderFile('views/OwnerRegistration.pug'))
    })
    app.post('/Oregister',(req, res)=>{
        let name=req.body.username;
        let password=req.body.password;
        let phone=req.body.phone;
        client.query(`SELECT count(*) from "Owner" where name='${name}'`)
        .then(result=>{
            if(parseInt(result.rows[0].count)!=0){
                req.session.customer_id='UsernameAlreadyExist';
                res.locals.session=req.session;
                res.status(200).send();
            }else if(parseInt(result.rows[0].count)==0){
                req.session.customer_id='yes';
                res.locals.session=req.session;
                client.query('SELECT count(*) from "Owner"')
                .then(result=>{
                    let id=parseInt(result.rows[0].count)+1;
                    client.query(`Insert into "Owner" (owner_id, name, password, phone_num) values (${parseInt(id)}, '${name}', '${password}', ${phone})`)
                    .then(()=>{
                        req.session.login=true;
                        res.locals.session=req.session;
                        res.status(200).send()
                    })
            })
            }
        })
    })
    //
    app.get('/allorder', (req, res)=>{
        client.query('SELECT * from "Order"')
        .then(results=>{
            res.status(200).send(pug.renderFile('views/AllOrders.pug', {data: results.rows}))
        })
    })
    //
    app.get('/addauthor', (req, res)=>{
        if(req.session.login){
            res.status(200).send(pug.renderFile('views/AddAuthor.pug'));
        }else{res.status(403).send()}
    })
    app.post('/addauthor', (req, res)=>{
        let name=req.body.name;
        let phone=req.body.phone;
        client.query('SELECT count(*) from "Author"')
        .then(result=>{
            let id=parseInt(result.rows[0].count)+1;
            if(phone!=null){phone=parseInt(phone)}
            client.query(`INSERT into "Author" (author_id, author_name, author_phone_num) values (${id}, '${name}', ${phone})`)
            .then(()=>res.status(200).send())
        })
    })
    //
    app.get('/addpublisher', (req, res)=>{
        if(req.session.login){
            res.status(200).send(pug.renderFile('views/AddPublisher.pug'));
        }else{res.status(403).send()}
    })
    app.post('/addpublisher', (req, res)=>{
        let name=req.body.name;
        let phone=req.body.phone;
        let address=req.body.address;
        let email=req.body.email;
        let bank=req.body.bank;
        client.query('SELECT count(*) from "Publisher"')
        .then(result=>{
            let id=parseInt(result.rows[0].count)+1;
            if(phone!=null){phone=parseInt(phone)}
            client.query(`INSERT into "Publisher" (publisher_id, publisher_name, publisher_email, publisher_address, publisher_phone_num, bank_account) values (${id},'${name}','${email}','${address}',${phone},'${bank}')`)
            .then(()=>res.status(200).send())
        })
    })


    





    //Listen to server
    app.listen(3000);
    console.log("***** Server listening at http://localhost:3000 *****");
    
})
.catch(err=>console.log(err))