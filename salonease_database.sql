--
-- PostgreSQL database dump
--

\restrict PrD7rYIwcRax5yz6Z6mSTV9bh5LxTNuJXALvdMHK25MvxpfEiLGavIcBCaTgCSM

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-10-11 11:08:21

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 226 (class 1259 OID 24720)
-- Name: appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment (
    appointment_id integer NOT NULL,
    customer_id integer NOT NULL,
    employee_id integer NOT NULL,
    service_id integer NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying,
    amount numeric(10,2) NOT NULL,
    notes character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointment_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT appointment_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Confirmed'::character varying, 'Completed'::character varying, 'Cancelled'::character varying])::text[])))
);


ALTER TABLE public.appointment OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24719)
-- Name: appointment_appointment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_appointment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_appointment_id_seq OWNER TO postgres;

--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 225
-- Name: appointment_appointment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_appointment_id_seq OWNED BY public.appointment.appointment_id;


--
-- TOC entry 220 (class 1259 OID 24673)
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    customer_id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    phone character varying(20) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 24672)
-- Name: customer_customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_customer_id_seq OWNER TO postgres;

--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 219
-- Name: customer_customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_customer_id_seq OWNED BY public.customer.customer_id;


--
-- TOC entry 222 (class 1259 OID 24690)
-- Name: employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee (
    employee_id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    specialization character varying(100) NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    CONSTRAINT employee_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])))
);


ALTER TABLE public.employee OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 24689)
-- Name: employee_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_employee_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_employee_id_seq OWNER TO postgres;

--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 221
-- Name: employee_employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_employee_id_seq OWNED BY public.employee.employee_id;


--
-- TOC entry 230 (class 1259 OID 24778)
-- Name: feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback (
    feedback_id integer NOT NULL,
    appointment_id integer NOT NULL,
    rating integer NOT NULL,
    comments character varying(1000),
    feedback_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.feedback OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24777)
-- Name: feedback_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedback_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_feedback_id_seq OWNER TO postgres;

--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 229
-- Name: feedback_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feedback_feedback_id_seq OWNED BY public.feedback.feedback_id;


--
-- TOC entry 228 (class 1259 OID 24755)
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    payment_id integer NOT NULL,
    appointment_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_method character varying(30) NOT NULL,
    payment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_status character varying(20) DEFAULT 'Pending'::character varying,
    transaction_id character varying(100),
    CONSTRAINT payment_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT payment_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['Card'::character varying, 'UPI'::character varying, 'Pay at Salon'::character varying])::text[]))),
    CONSTRAINT payment_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['Pending'::character varying, 'Paid'::character varying, 'Failed'::character varying, 'Refunded'::character varying])::text[])))
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 24754)
-- Name: payment_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_payment_id_seq OWNER TO postgres;

--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 227
-- Name: payment_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_payment_id_seq OWNED BY public.payment.payment_id;


--
-- TOC entry 224 (class 1259 OID 24703)
-- Name: service; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service (
    service_id integer NOT NULL,
    service_name character varying(100) NOT NULL,
    description character varying(500),
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying,
    CONSTRAINT service_duration_check CHECK ((duration > 0)),
    CONSTRAINT service_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT service_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])))
);


ALTER TABLE public.service OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 24702)
-- Name: service_service_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_service_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_service_id_seq OWNER TO postgres;

--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 223
-- Name: service_service_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_service_id_seq OWNED BY public.service.service_id;


--
-- TOC entry 4887 (class 2604 OID 24723)
-- Name: appointment appointment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment ALTER COLUMN appointment_id SET DEFAULT nextval('public.appointment_appointment_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 24676)
-- Name: customer customer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer ALTER COLUMN customer_id SET DEFAULT nextval('public.customer_customer_id_seq'::regclass);


--
-- TOC entry 4883 (class 2604 OID 24693)
-- Name: employee employee_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee ALTER COLUMN employee_id SET DEFAULT nextval('public.employee_employee_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 24781)
-- Name: feedback feedback_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback ALTER COLUMN feedback_id SET DEFAULT nextval('public.feedback_feedback_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 24758)
-- Name: payment payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment ALTER COLUMN payment_id SET DEFAULT nextval('public.payment_payment_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 24706)
-- Name: service service_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service ALTER COLUMN service_id SET DEFAULT nextval('public.service_service_id_seq'::regclass);


--
-- TOC entry 5082 (class 0 OID 24720)
-- Dependencies: 226
-- Data for Name: appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment (appointment_id, customer_id, employee_id, service_id, appointment_date, appointment_time, status, amount, notes, created_at) FROM stdin;
1	1	1	2	2026-10-08	16:00:00	Confirmed	900.00	Regular hair spa appointment	2026-10-04 01:31:07.251604
3	3	2	1	2026-10-08	14:00:00	Confirmed	350.00	Classic haircut	2026-10-04 01:31:07.251604
4	4	1	6	2026-10-09	15:00:00	Completed	600.00	Manicure appointment	2026-10-04 01:31:07.251604
6	7	1	1	2026-10-06	13:00:00	Completed	350.00	\N	2026-10-04 16:00:27.405419
2	2	3	4	2026-10-07	11:00:00	Pending	700.00	Facial appointment	2026-10-04 01:31:07.251604
5	7	1	1	2026-10-11	10:00:00	Pending	350.00	Test booking	2026-10-04 13:26:23.473019
8	1	1	1	2026-10-15	12:30:00	Pending	400.00	Admin test appointment	2026-10-08 22:48:09.951129
9	9	4	6	2026-10-16	14:00:00	Confirmed	600.00	\N	2026-10-10 01:26:13.229222
10	8	3	4	2026-10-14	17:00:00	Confirmed	700.00	\N	2026-10-11 10:40:57.586665
\.


--
-- TOC entry 5076 (class 0 OID 24673)
-- Dependencies: 220
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (customer_id, name, email, phone, password, created_at) FROM stdin;
1	Adwaith S	adwaith@example.com	+91 98765 43210	123456	2026-10-04 01:31:07.251604
3	Siddharth Prajoth	siddharth@example.com	+91 98950 54321	123456	2026-10-04 01:31:07.251604
5	Ananya Nair	ananya@example.com	+91 99610 23456	123456	2026-10-04 01:31:07.251604
7	Rajitha VS	Rajithavs@gmail.com	9446078897	$2b$10$Gd8yvtZdHT2oKlGWxIBZHeOAwl50zvIfvSmVIPfo/sbmIMnIeW0KG	2026-10-04 02:37:35.922875
2	Riya R	riya@example.com	+91 98470 12345	123456	2026-10-04 01:31:07.251604
4	Kailas H	kailas@example.com	+91 97460 67890	123456	2026-10-04 01:31:07.251604
8	parvathy	parvathy2007@gmail.com	9446078856	$2b$10$9XHHIS8DTQfg2KX/NlhNa.qgJxrEqmPNfDo9bD/g2spNcYXpaeBn.	2026-10-10 00:27:25.567229
9	Adwaith S	avadwaiths8c@gmail.com	07907554062	$2b$10$umDZucqkNX4im2bcBA5/k.RbhRRW2z84rcNQkFZ57d1JREhbq7oUu	2026-10-10 01:24:36.519377
\.


--
-- TOC entry 5078 (class 0 OID 24690)
-- Dependencies: 222
-- Data for Name: employee; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employee (employee_id, name, phone, specialization, status) FROM stdin;
2	Rahul	+91 98470 22222	Hair Stylist	Active
3	Meera	+91 98950 33333	Skin Specialist	Active
4	Arjun	+91 97460 44444	Grooming Specialist	Active
1	Anjali T	+91 98765 11123	Hair Specialist	Active
6	Neha	+91 98765 12345	Hair Stylist	Active
\.


--
-- TOC entry 5086 (class 0 OID 24778)
-- Dependencies: 230
-- Data for Name: feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback (feedback_id, appointment_id, rating, comments, feedback_date) FROM stdin;
1	4	5	Excellent service and very professional staff.	2026-10-04 01:31:07.251604
2	6	5	Category: staff | good	2026-10-04 19:23:58.178778
\.


--
-- TOC entry 5084 (class 0 OID 24755)
-- Dependencies: 228
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment (payment_id, appointment_id, amount, payment_method, payment_date, payment_status, transaction_id) FROM stdin;
1	1	900.00	Card	2026-10-04 01:31:07.251604	Paid	TXN784512
2	2	700.00	UPI	2026-10-04 01:31:07.251604	Pending	\N
3	3	350.00	Pay at Salon	2026-10-04 01:31:07.251604	Pending	\N
4	6	350.00	Card	2026-10-04 16:26:54.345748	Paid	TXN1791111414340
6	9	600.00	Pay at Salon	2026-10-10 01:26:20.911672	Paid	TXN1791575780911
7	10	700.00	UPI	2026-10-11 10:41:17.733398	Paid	TXN1791695477725
\.


--
-- TOC entry 5080 (class 0 OID 24703)
-- Dependencies: 224
-- Data for Name: service; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service (service_id, service_name, description, price, duration, status) FROM stdin;
2	Hair Spa	Deep conditioning and hair treatment	900.00	60	Active
3	Hair Coloring	Professional hair coloring service	1500.00	90	Active
4	Facial	Skin cleansing and facial treatment	700.00	45	Active
5	Cleanup	Basic skin cleanup and refresh	500.00	30	Active
6	Manicure	Nail care and hand treatment	600.00	45	Active
7	Pedicure	Foot and nail care treatment	650.00	45	Active
1	Haircut	Premium Professional haircut and styling	350.00	30	Active
9	Beard Styling	Professional beard trimming and styling	350.00	30	Active
\.


--
-- TOC entry 5098 (class 0 OID 0)
-- Dependencies: 225
-- Name: appointment_appointment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_appointment_id_seq', 10, true);


--
-- TOC entry 5099 (class 0 OID 0)
-- Dependencies: 219
-- Name: customer_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_customer_id_seq', 9, true);


--
-- TOC entry 5100 (class 0 OID 0)
-- Dependencies: 221
-- Name: employee_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employee_employee_id_seq', 6, true);


--
-- TOC entry 5101 (class 0 OID 0)
-- Dependencies: 229
-- Name: feedback_feedback_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_feedback_id_seq', 2, true);


--
-- TOC entry 5102 (class 0 OID 0)
-- Dependencies: 227
-- Name: payment_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_payment_id_seq', 7, true);


--
-- TOC entry 5103 (class 0 OID 0)
-- Dependencies: 223
-- Name: service_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_service_id_seq', 9, true);


--
-- TOC entry 4914 (class 2606 OID 24738)
-- Name: appointment appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT appointment_pkey PRIMARY KEY (appointment_id);


--
-- TOC entry 4906 (class 2606 OID 24688)
-- Name: customer customer_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_email_key UNIQUE (email);


--
-- TOC entry 4908 (class 2606 OID 24686)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (customer_id);


--
-- TOC entry 4910 (class 2606 OID 24701)
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (employee_id);


--
-- TOC entry 4920 (class 2606 OID 24792)
-- Name: feedback feedback_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_appointment_id_key UNIQUE (appointment_id);


--
-- TOC entry 4922 (class 2606 OID 24790)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- TOC entry 4916 (class 2606 OID 24771)
-- Name: payment payment_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_appointment_id_key UNIQUE (appointment_id);


--
-- TOC entry 4918 (class 2606 OID 24769)
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4912 (class 2606 OID 24718)
-- Name: service service_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service
    ADD CONSTRAINT service_pkey PRIMARY KEY (service_id);


--
-- TOC entry 4923 (class 2606 OID 24739)
-- Name: appointment fk_appointment_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appointment_customer FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 24744)
-- Name: appointment fk_appointment_employee; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appointment_employee FOREIGN KEY (employee_id) REFERENCES public.employee(employee_id) ON DELETE RESTRICT;


--
-- TOC entry 4925 (class 2606 OID 24749)
-- Name: appointment fk_appointment_service; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment
    ADD CONSTRAINT fk_appointment_service FOREIGN KEY (service_id) REFERENCES public.service(service_id) ON DELETE RESTRICT;


--
-- TOC entry 4927 (class 2606 OID 24793)
-- Name: feedback fk_feedback_appointment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback
    ADD CONSTRAINT fk_feedback_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointment(appointment_id) ON DELETE CASCADE;


--
-- TOC entry 4926 (class 2606 OID 24772)
-- Name: payment fk_payment_appointment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointment(appointment_id) ON DELETE CASCADE;


-- Completed on 2026-10-11 11:08:21

--
-- PostgreSQL database dump complete
--

\unrestrict PrD7rYIwcRax5yz6Z6mSTV9bh5LxTNuJXALvdMHK25MvxpfEiLGavIcBCaTgCSM

