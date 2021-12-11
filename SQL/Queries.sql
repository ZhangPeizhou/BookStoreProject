-- Peizhou Zhang
-- Queries
--See how many customers with specific usernames and passwords exist in the database. The result should be either 1 or 0.
`select count(*) from "Customer" where name = '${req.session.username}' and password = '${req.session.password}'`

--Get the customer_id for the customer with specific username and password.
`select customer_id from "Customer" where name = '${req.session.username}' and password = '${req.session.password}'`

--Get all books as well as their authors and publishers.
`select * from "Author" natural join "Book" natural join "Publisher"`

--Get the basket of the specific customer.
`select * from "Customer" natural join "Basket" where customer_id = ${req.session.customer_id}`

--Search books in the bookstore, return books as well as their authors and publishers. The ${type} is a something like 'title', 'genre', ext. The ${value} is what user input to search.
`select * from "Author" natural join "Book" natural join "Publisher" where ${type}=${value};`

--Add book into specific basket.
`update "Basket" set books=array_append(books, ${book_id}) where basket_id = ${req.session.basket}`

--Get the price of a specific book.
`select price from "Book" where book_id = ${book_id}`

--Get sub-total of a specific basket.
`select price from "Basket" where basket_id = ${req.session.basket}`

--Update the sub-total of a specific basket. Is used when a new book is added to basket.
`update "Basket" set price=${sub_total}+${price} where basket_id = ${req.session.basket}`

--Get the author information of a specific book.
`select book_id, title, price, author_name from "Book" natural join "Author" where book_id = ${book_id}`

--Add book details to basket.
`update "Basket" set book_list=array_append(book_list, '${format}') where basket_id=${req.session.basket}`

--Get all information of a specific basket.
`select * from "Basket" where basket_id = ${req.session.basket}`

--See how many order exist in total.
`select count(*) from "Order"`

--Get the book list and subtotal of a specific basket.
`select book_list, price from "Basket" where basket_id = ${req.session.basket}`

--Add new order to database.
`insert into "Order" (order_id, details, tot_price, customer_id, cur_location) values (${order_id}, '${format}', ${price}, ${parseInt(req.session.customer_id)}, 'at warehouse, waiting for postman to collect')`

--Get all books in a basket.
`select books from "Basket" where basket_id = ${req.session.basket}`

--See how many books remain in the bookstore for a specific book.
`select num_remain from "Book" where book_id = ${parseInt(key)}`

--Update the number of books remain in the bookstore for a specific book.
`update "Book" set num_remain=${parseInt(remain-array[key])} where book_id = ${parseInt(key)}`

--Empty the basket when order is placed.
`update "Basket" set books=null, book_list=null, price=0 where basket_id=${req.session.basket}`

--See previous order of a specific customer.
`select * from "Order" where customer_id=${req.session.customer_id}`

--Customer can search order by order_id (order_id=${id}), but still cannot see other people's order (customer_id=${req.session.customer_id}).
`select * from "Order" where order_id=${id} and customer_id=${req.session.customer_id}`

--See how many customers with specific username exist. Is used to disable duplicate user names.
`SELECT count(*) from "Customer" where name='${name}'`

--See how many customers exist so far.
'SELECT count(*) from "Customer"'

--Add new customer into the database.
`INSERT into "Customer" (customer_id, name, password) values (${customer_id}, '${name}', '${password}')`

--See how many baskets exist so far. Each customer can have and must have only one basket. Is used to create new basket. 
'SELECT count(*) from "Basket"'

--Create new basket for a specific customer.
`INSERT into "Basket" (basket_id, customer_id, price) values (${basket_id}, ${customer_id}, 0)`

--Select all books with less than 10 remaining, as well as their authors and publishers.
`select * from "Author" natural join "Book" natural join "Publisher" where num_remain<=10`

--See all authors' information.
`select * from "Author"`

--See all publishers' information.
`select * from "Publisher"`

--Count the number of unique books in the database.
`SELECT count(*) AS exact_count FROM "Book"`

--Add new book to the database.
`INSERT INTO "Book" (book_id, title, num_page, price, num_tot_bought, num_remain, author_id, publisher_id, genre, expense, transfer_rate) VALUES (${book_id}, '${title}', ${num_page}, ${price}, ${parseInt(num_tot_bought)}, ${parseInt(num_tot_bought)}, ${author_id}, ${publisher_id}, '${genre}', ${parseInt(expense)}, ${transfer})`

--Delete specific book from database.
`delete from "Book" where book_id = ${target}`

--See all books' information.
'select * from "Book"'

--See the income of selling books writen by each author (group by author).
'select author_name, author_id, sum (price*(num_tot_bought-num_remain)) from "Book" natural join "Author" group by author_id, author_name'

--See the expense of buying books writen by each author (group by author).
'select author_name, author_id, sum (expense*num_tot_bought) from "Book" natural join "Author" group by author_id, author_name'

--See the income of selling books of each genre (group by genre).
'select genre, sum (price*(num_tot_bought-num_remain)) from "Book" group by genre'

--See the expense of selling books of each genre (group by genre).
'select genre, sum (expense*num_tot_bought) from "Book" group by genre'

--See the income of selling each book (group by book).
'select book_id, title, sum (price*(num_tot_bought-num_remain)) from "Book" group by book_id, title'

--See the income of buying each book (group by book). 
'select book_id, title, sum (expense*num_tot_bought) from "Book" group by book_id, title'

--See the total income of selling books.
'select sum (price*(num_tot_bought-num_remain))from "Book"'

--See the total expense of buting books.
'select sum (expense*num_tot_bought) from "Book"'

--See the details of author shares. Select authors' and publishers' information, and calculate the amount of money need to pay to each author.
'select author_id, author_name, publisher_id, bank_account,sum((transfer_rate*0.01)*(num_tot_bought-num_remain)*price) from "Book" natural join "Author" natural join "Publisher" group by author_id, author_name, publisher_id, bank_account'

--Count the amount of owners in the database with specific username. Is used to disable duplicate user names.
`SELECT count(*) from "Owner" where name='${name}'`

--See how many owners exist so far in the database.
'SELECT count(*) from "Owner"'

--Create new owner.
`Insert into "Owner" (owner_id, name, password, phone_num) values (${parseInt(id)}, '${name}', '${password}', ${phone})`

--Add new author to database.
`INSERT into "Author" (author_id, author_name, author_phone_num) values (${id}, '${name}', ${phone})`

--Add new publisher to database.
`INSERT into "Publisher" (publisher_id, publisher_name, publisher_email, publisher_address, publisher_phone_num, bank_account) values (${id},'${name}','${email}','${address}',${phone},'${bank}')`
