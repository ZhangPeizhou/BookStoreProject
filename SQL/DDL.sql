-- Peizhou Zhang
-- DDL
--------------------------------------------
-- Table: public.Author
CREATE TABLE IF NOT EXISTS public."Author"
(
    author_id integer NOT NULL,
    author_name text COLLATE pg_catalog."default" NOT NULL,
    author_phone_num integer,
    CONSTRAINT "Author_pkey" PRIMARY KEY (author_id)
)

TABLESPACE pg_default;

ALTER TABLE public."Author"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Basket
CREATE TABLE IF NOT EXISTS public."Basket"
(
    basket_id integer NOT NULL,
    customer_id integer NOT NULL,
    books integer[],
    price integer DEFAULT 0,
    book_list text[] COLLATE pg_catalog."default",
    CONSTRAINT "Basket_pkey" PRIMARY KEY (basket_id),
    CONSTRAINT customer_id FOREIGN KEY (customer_id)
        REFERENCES public."Customer" (customer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public."Basket"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Book
CREATE TABLE IF NOT EXISTS public."Book"
(
    book_id integer NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    num_page integer,
    price integer NOT NULL,
    num_tot_bought integer NOT NULL,
    num_remain integer NOT NULL,
    author_id integer NOT NULL,
    publisher_id integer NOT NULL,
    genre text COLLATE pg_catalog."default" NOT NULL,
    transfer_rate integer,
    expense integer NOT NULL,
    CONSTRAINT "Book_pkey" PRIMARY KEY (book_id),
    CONSTRAINT author_id FOREIGN KEY (author_id)
        REFERENCES public."Author" (author_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT publisher_id FOREIGN KEY (publisher_id)
        REFERENCES public."Publisher" (publisher_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE public."Book"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Customer
CREATE TABLE IF NOT EXISTS public."Customer"
(
    customer_id integer NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY (customer_id)
)

TABLESPACE pg_default;

ALTER TABLE public."Customer"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Order
CREATE TABLE IF NOT EXISTS public."Order"
(
    order_id integer NOT NULL,
    details text COLLATE pg_catalog."default" NOT NULL,
    tot_price integer NOT NULL,
    customer_id integer NOT NULL,
    cur_location text COLLATE pg_catalog."default" NOT NULL DEFAULT 'at warehouse, wating for postman to collect'::text,
    CONSTRAINT "Order_pkey" PRIMARY KEY (order_id),
    CONSTRAINT customer_id FOREIGN KEY (customer_id)
        REFERENCES public."Customer" (customer_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public."Order"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Owner
CREATE TABLE IF NOT EXISTS public."Owner"
(
    owner_id integer NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    phone_num integer,
    password text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Owner_pkey" PRIMARY KEY (owner_id)
)

TABLESPACE pg_default;

ALTER TABLE public."Owner"
    OWNER to postgres;

--------------------------------------------
-- Table: public.Publisher
CREATE TABLE IF NOT EXISTS public."Publisher"
(
    publisher_id integer NOT NULL,
    publisher_name text COLLATE pg_catalog."default",
    publisher_email text COLLATE pg_catalog."default",
    publisher_address text COLLATE pg_catalog."default",
    publisher_phone_num integer,
    bank_account text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Publisher_pkey" PRIMARY KEY (publisher_id)
)

TABLESPACE pg_default;

ALTER TABLE public."Publisher"
    OWNER to postgres;

--------------------------------------------