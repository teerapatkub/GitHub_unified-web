--
-- PostgreSQL database dump
--

\restrict VNoA5IhaBIufchbVq5LDNyj4cc2Psly4xSuuP2yhHLShQOrziC7uXq0m72T6Mbj

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

-- Started on 2026-08-24 17:36:19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- TOC entry 215 (class 1259 OID 26714)
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    achievement_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    difficulty character varying(50) NOT NULL,
    reward_money numeric(10,2) DEFAULT 0.00
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 27664)
-- Name: achievements_achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.achievements_achievement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_achievement_id_seq OWNER TO postgres;

--
-- TOC entry 5761 (class 0 OID 0)
-- Dependencies: 284
-- Name: achievements_achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.achievements_achievement_id_seq OWNED BY public.achievements.achievement_id;


--
-- TOC entry 257 (class 1259 OID 27400)
-- Name: active_accepted_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.active_accepted_challenges (
    user_id integer NOT NULL,
    challenge_id integer NOT NULL,
    code_state text,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accepted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.active_accepted_challenges OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 27666)
-- Name: active_accepted_challenges_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.active_accepted_challenges_challenge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.active_accepted_challenges_challenge_id_seq OWNER TO postgres;

--
-- TOC entry 5762 (class 0 OID 0)
-- Dependencies: 285
-- Name: active_accepted_challenges_challenge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.active_accepted_challenges_challenge_id_seq OWNED BY public.active_accepted_challenges.challenge_id;


--
-- TOC entry 286 (class 1259 OID 27668)
-- Name: active_accepted_challenges_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.active_accepted_challenges_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.active_accepted_challenges_user_id_seq OWNER TO postgres;

--
-- TOC entry 5763 (class 0 OID 0)
-- Dependencies: 286
-- Name: active_accepted_challenges_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.active_accepted_challenges_user_id_seq OWNED BY public.active_accepted_challenges.user_id;


--
-- TOC entry 216 (class 1259 OID 26720)
-- Name: advanced_validation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advanced_validation (
    id integer NOT NULL,
    question_text text NOT NULL,
    correct_answer character varying(500) NOT NULL
);


ALTER TABLE public.advanced_validation OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 26725)
-- Name: advanced_validation_choices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advanced_validation_choices (
    id integer NOT NULL,
    question_id integer NOT NULL,
    choice_text character varying(500) NOT NULL
);


ALTER TABLE public.advanced_validation_choices OWNER TO postgres;

--
-- TOC entry 288 (class 1259 OID 27672)
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advanced_validation_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advanced_validation_choices_id_seq OWNER TO postgres;

--
-- TOC entry 5764 (class 0 OID 0)
-- Dependencies: 288
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advanced_validation_choices_id_seq OWNED BY public.advanced_validation_choices.id;


--
-- TOC entry 287 (class 1259 OID 27670)
-- Name: advanced_validation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advanced_validation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advanced_validation_id_seq OWNER TO postgres;

--
-- TOC entry 5765 (class 0 OID 0)
-- Dependencies: 287
-- Name: advanced_validation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advanced_validation_id_seq OWNED BY public.advanced_validation.id;


--
-- TOC entry 258 (class 1259 OID 27406)
-- Name: assessment_choices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_choices (
    id integer NOT NULL,
    question_id integer,
    choice_text text,
    "order" integer
);


ALTER TABLE public.assessment_choices OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 27411)
-- Name: assessment_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_choices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_choices_id_seq OWNER TO postgres;

--
-- TOC entry 5766 (class 0 OID 0)
-- Dependencies: 259
-- Name: assessment_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_choices_id_seq OWNED BY public.assessment_choices.id;


--
-- TOC entry 260 (class 1259 OID 27412)
-- Name: assessment_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_questions (
    id integer NOT NULL,
    level_value integer,
    question_text text,
    question_type character varying(20),
    correct_answer text
);


ALTER TABLE public.assessment_questions OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 27417)
-- Name: assessment_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_questions_id_seq OWNER TO postgres;

--
-- TOC entry 5767 (class 0 OID 0)
-- Dependencies: 261
-- Name: assessment_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_questions_id_seq OWNED BY public.assessment_questions.id;


--
-- TOC entry 218 (class 1259 OID 26730)
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    asset_id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(50) NOT NULL,
    battery_capacity_minutes integer DEFAULT 180,
    power_consumption_rate numeric(5,2) DEFAULT 1.00,
    condition_percent integer DEFAULT 100,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- TOC entry 289 (class 1259 OID 27674)
-- Name: assets_asset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assets_asset_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_asset_id_seq OWNER TO postgres;

--
-- TOC entry 5768 (class 0 OID 0)
-- Dependencies: 289
-- Name: assets_asset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assets_asset_id_seq OWNED BY public.assets.asset_id;


--
-- TOC entry 219 (class 1259 OID 26737)
-- Name: contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contracts (
    contract_id integer NOT NULL,
    user_id integer,
    title character varying(150) NOT NULL,
    difficulty character varying(50) NOT NULL,
    reward numeric(10,2) NOT NULL,
    penalty numeric(10,2) DEFAULT 0.00,
    ai_requirements text,
    status character varying(50) DEFAULT 'OFFERED'::character varying,
    deadline_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.contracts OWNER TO postgres;

--
-- TOC entry 290 (class 1259 OID 27676)
-- Name: contracts_contract_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contracts_contract_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contracts_contract_id_seq OWNER TO postgres;

--
-- TOC entry 5769 (class 0 OID 0)
-- Dependencies: 290
-- Name: contracts_contract_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contracts_contract_id_seq OWNED BY public.contracts.contract_id;


--
-- TOC entry 262 (class 1259 OID 27418)
-- Name: cosmetics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cosmetics (
    cosmetic_id integer NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(50) NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    asset_url character varying(500)
);


ALTER TABLE public.cosmetics OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 27424)
-- Name: cosmetics_cosmetic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cosmetics ALTER COLUMN cosmetic_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.cosmetics_cosmetic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 26745)
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_verifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.email_verifications OWNER TO postgres;

--
-- TOC entry 291 (class 1259 OID 27678)
-- Name: email_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.email_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_verifications_id_seq OWNER TO postgres;

--
-- TOC entry 5770 (class 0 OID 0)
-- Dependencies: 291
-- Name: email_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.email_verifications_id_seq OWNED BY public.email_verifications.id;


--
-- TOC entry 222 (class 1259 OID 26757)
-- Name: exercise_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercise_submissions (
    submission_id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    submitted_code text NOT NULL,
    is_passed smallint DEFAULT 0 NOT NULL,
    score integer DEFAULT 0,
    execution_time_ms integer,
    error_message text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exercise_submissions OWNER TO postgres;

--
-- TOC entry 292 (class 1259 OID 27680)
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercise_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_submissions_submission_id_seq OWNER TO postgres;

--
-- TOC entry 5771 (class 0 OID 0)
-- Dependencies: 292
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercise_submissions_submission_id_seq OWNED BY public.exercise_submissions.submission_id;


--
-- TOC entry 221 (class 1259 OID 26749)
-- Name: exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises (
    exercise_id integer NOT NULL,
    lesson_id integer,
    title character varying(100) DEFAULT NULL::character varying,
    description text,
    starter_code text,
    solution_code text,
    test_cases text,
    xp_reward integer DEFAULT 10,
    currency_reward integer DEFAULT 5
);


ALTER TABLE public.exercises OWNER TO postgres;

--
-- TOC entry 293 (class 1259 OID 27682)
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercises_exercise_id_seq OWNER TO postgres;

--
-- TOC entry 5772 (class 0 OID 0)
-- Dependencies: 293
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises.exercise_id;


--
-- TOC entry 223 (class 1259 OID 26765)
-- Name: financial_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.financial_ledger (
    transaction_id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.financial_ledger OWNER TO postgres;

--
-- TOC entry 294 (class 1259 OID 27684)
-- Name: financial_ledger_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.financial_ledger_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_ledger_transaction_id_seq OWNER TO postgres;

--
-- TOC entry 5773 (class 0 OID 0)
-- Dependencies: 294
-- Name: financial_ledger_transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.financial_ledger_transaction_id_seq OWNED BY public.financial_ledger.transaction_id;


--
-- TOC entry 224 (class 1259 OID 26771)
-- Name: game_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_rooms (
    room_id integer NOT NULL,
    room_name character varying(50) NOT NULL,
    host_user_id integer NOT NULL,
    room_password character varying(50) DEFAULT NULL::character varying,
    status character varying(50) DEFAULT 'WAITING'::character varying,
    max_players integer DEFAULT 2,
    current_players integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.game_rooms OWNER TO postgres;

--
-- TOC entry 295 (class 1259 OID 27686)
-- Name: game_rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_rooms_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_rooms_room_id_seq OWNER TO postgres;

--
-- TOC entry 5774 (class 0 OID 0)
-- Dependencies: 295
-- Name: game_rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_rooms_room_id_seq OWNED BY public.game_rooms.room_id;


--
-- TOC entry 225 (class 1259 OID 26779)
-- Name: game_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.game_sessions (
    session_id integer NOT NULL,
    user_id integer,
    mode character varying(20) NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp without time zone
);


ALTER TABLE public.game_sessions OWNER TO postgres;

--
-- TOC entry 296 (class 1259 OID 27688)
-- Name: game_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.game_sessions_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.game_sessions_session_id_seq OWNER TO postgres;

--
-- TOC entry 5775 (class 0 OID 0)
-- Dependencies: 296
-- Name: game_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.game_sessions_session_id_seq OWNED BY public.game_sessions.session_id;


--
-- TOC entry 226 (class 1259 OID 26783)
-- Name: learning_ai_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.learning_ai_tasks (
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    mode character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    section_label character varying(100) DEFAULT NULL::character varying,
    subtitle character varying(100) DEFAULT NULL::character varying,
    accent character varying(20) DEFAULT NULL::character varying,
    instructions_json text NOT NULL,
    example_input text,
    example_output text,
    starter_code text NOT NULL,
    test_cases_json text NOT NULL,
    reward_xp integer DEFAULT 100 NOT NULL,
    reward_coins integer DEFAULT 20 NOT NULL,
    rerolls_used integer DEFAULT 0 NOT NULL,
    max_rerolls integer DEFAULT 3 NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    ai_payload text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.learning_ai_tasks OWNER TO postgres;

--
-- TOC entry 297 (class 1259 OID 27690)
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.learning_ai_tasks_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.learning_ai_tasks_task_id_seq OWNER TO postgres;

--
-- TOC entry 5776 (class 0 OID 0)
-- Dependencies: 297
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.learning_ai_tasks_task_id_seq OWNED BY public.learning_ai_tasks.task_id;


--
-- TOC entry 229 (class 1259 OID 26807)
-- Name: lesson_quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_quiz_attempts (
    attempt_id integer NOT NULL,
    user_id integer NOT NULL,
    lesson_id integer NOT NULL,
    quiz_type character varying(10) NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    total_questions integer DEFAULT 0 NOT NULL,
    answers_json text,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.lesson_quiz_attempts OWNER TO postgres;

--
-- TOC entry 298 (class 1259 OID 27692)
-- Name: lesson_quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_quiz_attempts_attempt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_quiz_attempts_attempt_id_seq OWNER TO postgres;

--
-- TOC entry 5777 (class 0 OID 0)
-- Dependencies: 298
-- Name: lesson_quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_quiz_attempts_attempt_id_seq OWNED BY public.lesson_quiz_attempts.attempt_id;


--
-- TOC entry 228 (class 1259 OID 26803)
-- Name: lesson_quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_quizzes (
    quiz_id integer NOT NULL,
    lesson_id integer NOT NULL,
    quiz_type character varying(10) DEFAULT 'pre'::character varying NOT NULL
);


ALTER TABLE public.lesson_quizzes OWNER TO postgres;

--
-- TOC entry 299 (class 1259 OID 27694)
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_quizzes_quiz_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_quizzes_quiz_id_seq OWNER TO postgres;

--
-- TOC entry 5778 (class 0 OID 0)
-- Dependencies: 299
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_quizzes_quiz_id_seq OWNED BY public.lesson_quizzes.quiz_id;


--
-- TOC entry 230 (class 1259 OID 26816)
-- Name: lesson_slides; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesson_slides (
    slide_id integer NOT NULL,
    lesson_id integer NOT NULL,
    slide_order integer DEFAULT 0 NOT NULL,
    slide_title character varying(200) DEFAULT NULL::character varying,
    slide_content text,
    slide_src character varying(500) DEFAULT NULL::character varying,
    slide_type character varying(20) DEFAULT 'text'::character varying
);


ALTER TABLE public.lesson_slides OWNER TO postgres;

--
-- TOC entry 300 (class 1259 OID 27696)
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesson_slides_slide_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_slides_slide_id_seq OWNER TO postgres;

--
-- TOC entry 5779 (class 0 OID 0)
-- Dependencies: 300
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesson_slides_slide_id_seq OWNED BY public.lesson_slides.slide_id;


--
-- TOC entry 227 (class 1259 OID 26798)
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    lesson_id integer NOT NULL,
    module_id integer NOT NULL,
    title character varying(200) NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    required_level integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- TOC entry 301 (class 1259 OID 27698)
-- Name: lessons_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_lesson_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_lesson_id_seq OWNER TO postgres;

--
-- TOC entry 5780 (class 0 OID 0)
-- Dependencies: 301
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;


--
-- TOC entry 231 (class 1259 OID 26825)
-- Name: level_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level_config (
    id integer NOT NULL,
    question_id integer NOT NULL,
    title character varying(200) NOT NULL,
    option_description character varying(500) DEFAULT NULL::character varying,
    "order" integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.level_config OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 27700)
-- Name: level_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.level_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.level_config_id_seq OWNER TO postgres;

--
-- TOC entry 5781 (class 0 OID 0)
-- Dependencies: 302
-- Name: level_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.level_config_id_seq OWNED BY public.level_config.id;


--
-- TOC entry 232 (class 1259 OID 26833)
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    location_id integer NOT NULL,
    name character varying(50) NOT NULL,
    entry_fee numeric(10,2) DEFAULT 0.00,
    power_reliability integer DEFAULT 100,
    internet_speed numeric(3,2) DEFAULT 1.00
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- TOC entry 303 (class 1259 OID 27702)
-- Name: locations_location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_location_id_seq OWNER TO postgres;

--
-- TOC entry 5782 (class 0 OID 0)
-- Dependencies: 303
-- Name: locations_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_location_id_seq OWNED BY public.locations.location_id;


--
-- TOC entry 233 (class 1259 OID 26839)
-- Name: mini_game_current_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_current_conversations (
    user_id integer NOT NULL,
    exercise_id integer,
    dialogue_id integer NOT NULL,
    current_npc_id integer,
    current_location_id integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mini_game_current_conversations OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 27704)
-- Name: mini_game_current_conversations_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_current_conversations_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_current_conversations_user_id_seq OWNER TO postgres;

--
-- TOC entry 5783 (class 0 OID 0)
-- Dependencies: 304
-- Name: mini_game_current_conversations_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_current_conversations_user_id_seq OWNED BY public.mini_game_current_conversations.user_id;


--
-- TOC entry 234 (class 1259 OID 26843)
-- Name: mini_game_dialogues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_dialogues (
    dialogue_id integer NOT NULL,
    lesson_id integer DEFAULT 1 NOT NULL,
    exercise_id integer,
    dialogue_order integer DEFAULT 0 NOT NULL,
    exercise_order character varying(20) DEFAULT NULL::character varying,
    dialogue_text text NOT NULL,
    npc_id integer,
    npc_emotion character varying(50) DEFAULT 'neutral'::character varying NOT NULL,
    location_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dialogue_phase character varying(50) DEFAULT 'pre_submit'::character varying NOT NULL,
    branch_key character varying(80) DEFAULT 'default'::character varying NOT NULL
);


ALTER TABLE public.mini_game_dialogues OWNER TO postgres;

--
-- TOC entry 305 (class 1259 OID 27706)
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_dialogues_dialogue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_dialogues_dialogue_id_seq OWNER TO postgres;

--
-- TOC entry 5784 (class 0 OID 0)
-- Dependencies: 305
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_dialogues_dialogue_id_seq OWNED BY public.mini_game_dialogues.dialogue_id;


--
-- TOC entry 236 (class 1259 OID 26865)
-- Name: mini_game_exercise_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_exercise_submissions (
    submission_id integer NOT NULL,
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    submitted_code text NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mini_game_exercise_submissions OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 27708)
-- Name: mini_game_exercise_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_exercise_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_exercise_submissions_submission_id_seq OWNER TO postgres;

--
-- TOC entry 5785 (class 0 OID 0)
-- Dependencies: 306
-- Name: mini_game_exercise_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_exercise_submissions_submission_id_seq OWNED BY public.mini_game_exercise_submissions.submission_id;


--
-- TOC entry 235 (class 1259 OID 26854)
-- Name: mini_game_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_exercises (
    exercise_id integer NOT NULL,
    lesson_id integer,
    exercise_order character varying(20) DEFAULT NULL::character varying,
    title character varying(150) NOT NULL,
    description text,
    starter_code text,
    solution_code text,
    test_cases_json text NOT NULL,
    xp_reward integer DEFAULT 10 NOT NULL,
    currency_reward integer DEFAULT 5 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.mini_game_exercises OWNER TO postgres;

--
-- TOC entry 307 (class 1259 OID 27710)
-- Name: mini_game_exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_exercises_exercise_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_exercises_exercise_id_seq OWNER TO postgres;

--
-- TOC entry 5786 (class 0 OID 0)
-- Dependencies: 307
-- Name: mini_game_exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_exercises_exercise_id_seq OWNED BY public.mini_game_exercises.exercise_id;


--
-- TOC entry 237 (class 1259 OID 26871)
-- Name: mini_game_locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_locations (
    location_id integer NOT NULL,
    location_key character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    bg_image_url character varying(255) DEFAULT NULL::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mini_game_locations OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 27712)
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_locations_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_locations_location_id_seq OWNER TO postgres;

--
-- TOC entry 5787 (class 0 OID 0)
-- Dependencies: 308
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_locations_location_id_seq OWNED BY public.mini_game_locations.location_id;


--
-- TOC entry 238 (class 1259 OID 26879)
-- Name: mini_game_npcs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_npcs (
    npc_id integer NOT NULL,
    npc_key character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    avatar_asset_url character varying(255) DEFAULT NULL::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.mini_game_npcs OWNER TO postgres;

--
-- TOC entry 309 (class 1259 OID 27714)
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_npcs_npc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_npcs_npc_id_seq OWNER TO postgres;

--
-- TOC entry 5788 (class 0 OID 0)
-- Dependencies: 309
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_npcs_npc_id_seq OWNED BY public.mini_game_npcs.npc_id;


--
-- TOC entry 239 (class 1259 OID 26887)
-- Name: mini_game_user_exercise_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mini_game_user_exercise_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    exercise_id integer NOT NULL,
    xp_reward integer DEFAULT 0 NOT NULL,
    currency_reward integer DEFAULT 0 NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_completed integer DEFAULT 0 NOT NULL,
    selected_branch_key character varying(80) DEFAULT 'default'::character varying NOT NULL,
    score integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.mini_game_user_exercise_progress OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 27716)
-- Name: mini_game_user_exercise_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mini_game_user_exercise_progress_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mini_game_user_exercise_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 5789 (class 0 OID 0)
-- Dependencies: 310
-- Name: mini_game_user_exercise_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mini_game_user_exercise_progress_progress_id_seq OWNED BY public.mini_game_user_exercise_progress.progress_id;


--
-- TOC entry 240 (class 1259 OID 26893)
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    module_id integer NOT NULL,
    title character varying(200) NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    required_level integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- TOC entry 311 (class 1259 OID 27718)
-- Name: modules_module_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_module_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modules_module_id_seq OWNER TO postgres;

--
-- TOC entry 5790 (class 0 OID 0)
-- Dependencies: 311
-- Name: modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_module_id_seq OWNED BY public.modules.module_id;


--
-- TOC entry 264 (class 1259 OID 27425)
-- Name: multiplayer_challenges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.multiplayer_challenges (
    challenge_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    difficulty character varying(50) DEFAULT 'Easy'::character varying NOT NULL,
    reward integer DEFAULT 500 NOT NULL,
    time_limit integer DEFAULT 300 NOT NULL,
    test_cases jsonb NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_test integer DEFAULT 0,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval)
);


ALTER TABLE public.multiplayer_challenges OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 27436)
-- Name: multiplayer_challenges_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.multiplayer_challenges ALTER COLUMN challenge_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.multiplayer_challenges_challenge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 266 (class 1259 OID 27437)
-- Name: multiplayer_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.multiplayer_sessions (
    session_id character varying(100) NOT NULL,
    mode character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'waiting'::character varying NOT NULL,
    current_round integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.multiplayer_sessions OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 27443)
-- Name: multiplayer_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.multiplayer_submissions (
    submission_id integer NOT NULL,
    session_id character varying(100),
    user_id integer,
    challenge_id integer,
    code text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    passed_cases integer DEFAULT 0 NOT NULL,
    total_cases integer DEFAULT 0 NOT NULL,
    ai_feedback jsonb,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    efficiency_ms integer DEFAULT 0,
    breakdown text
);


ALTER TABLE public.multiplayer_submissions OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 27453)
-- Name: multiplayer_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.multiplayer_submissions ALTER COLUMN submission_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.multiplayer_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 26898)
-- Name: music_tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.music_tracks (
    track_id integer NOT NULL,
    track_name character varying(100) NOT NULL,
    file_path character varying(255) NOT NULL,
    is_default smallint DEFAULT 0
);


ALTER TABLE public.music_tracks OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 27720)
-- Name: music_tracks_track_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.music_tracks_track_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.music_tracks_track_id_seq OWNER TO postgres;

--
-- TOC entry 5791 (class 0 OID 0)
-- Dependencies: 312
-- Name: music_tracks_track_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.music_tracks_track_id_seq OWNED BY public.music_tracks.track_id;


--
-- TOC entry 330 (class 1259 OID 27757)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 329 (class 1259 OID 27756)
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5792 (class 0 OID 0)
-- Dependencies: 329
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_id_seq OWNED BY public.password_reset_tokens.id;


--
-- TOC entry 242 (class 1259 OID 26902)
-- Name: question_choices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_choices (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    choice_text character varying(500) NOT NULL
);


ALTER TABLE public.question_choices OWNER TO postgres;

--
-- TOC entry 313 (class 1259 OID 27722)
-- Name: question_choices_choice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_choices_choice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_choices_choice_id_seq OWNER TO postgres;

--
-- TOC entry 5793 (class 0 OID 0)
-- Dependencies: 313
-- Name: question_choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_choices_choice_id_seq OWNED BY public.question_choices.choice_id;


--
-- TOC entry 243 (class 1259 OID 26907)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quiz_questions (
    question_id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_text text NOT NULL,
    question_type character varying(20) DEFAULT 'choice'::character varying NOT NULL,
    correct_answer text NOT NULL,
    question_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO postgres;

--
-- TOC entry 314 (class 1259 OID 27724)
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quiz_questions_question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_question_id_seq OWNER TO postgres;

--
-- TOC entry 5794 (class 0 OID 0)
-- Dependencies: 314
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quiz_questions_question_id_seq OWNED BY public.quiz_questions.question_id;


--
-- TOC entry 244 (class 1259 OID 26914)
-- Name: random_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.random_events (
    event_id integer NOT NULL,
    event_key character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    effect_type character varying(50) NOT NULL,
    severity character varying(50) DEFAULT 'LOW'::character varying NOT NULL,
    base_chance_percent integer DEFAULT 5 NOT NULL,
    duration_minutes integer,
    force_skip_day smallint DEFAULT 0 NOT NULL,
    auto_resolve smallint DEFAULT 0 NOT NULL,
    affected_systems text
);


ALTER TABLE public.random_events OWNER TO postgres;

--
-- TOC entry 315 (class 1259 OID 27726)
-- Name: random_events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.random_events_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.random_events_event_id_seq OWNER TO postgres;

--
-- TOC entry 5795 (class 0 OID 0)
-- Dependencies: 315
-- Name: random_events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.random_events_event_id_seq OWNED BY public.random_events.event_id;


--
-- TOC entry 245 (class 1259 OID 26923)
-- Name: room_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_participants (
    id integer NOT NULL,
    room_id integer NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    score integer DEFAULT 0,
    is_ready smallint DEFAULT 0
);


ALTER TABLE public.room_participants OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 27728)
-- Name: room_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.room_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.room_participants_id_seq OWNER TO postgres;

--
-- TOC entry 5796 (class 0 OID 0)
-- Dependencies: 316
-- Name: room_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.room_participants_id_seq OWNED BY public.room_participants.id;


--
-- TOC entry 269 (class 1259 OID 27454)
-- Name: session_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_players (
    session_id character varying(100) NOT NULL,
    user_id integer NOT NULL,
    money_balance integer DEFAULT 0 NOT NULL,
    is_survived integer DEFAULT 1 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'joined'::character varying NOT NULL
);


ALTER TABLE public.session_players OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 26929)
-- Name: shop_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shop_items (
    item_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type character varying(50) NOT NULL,
    rarity character varying(50) DEFAULT 'COMMON'::character varying NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    preview_data text,
    is_available smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    item_type character varying(50) DEFAULT NULL::character varying,
    asset_url text,
    preview_image text,
    effects text,
    is_active smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.shop_items OWNER TO postgres;

--
-- TOC entry 317 (class 1259 OID 27730)
-- Name: shop_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shop_items_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shop_items_item_id_seq OWNER TO postgres;

--
-- TOC entry 5797 (class 0 OID 0)
-- Dependencies: 317
-- Name: shop_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.shop_items_item_id_seq OWNED BY public.shop_items.item_id;


--
-- TOC entry 247 (class 1259 OID 26940)
-- Name: simulation_active_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulation_active_events (
    id integer NOT NULL,
    save_id integer NOT NULL,
    event_id integer NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone,
    is_resolved smallint DEFAULT 0 NOT NULL
);


ALTER TABLE public.simulation_active_events OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 27732)
-- Name: simulation_active_events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.simulation_active_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.simulation_active_events_id_seq OWNER TO postgres;

--
-- TOC entry 5798 (class 0 OID 0)
-- Dependencies: 318
-- Name: simulation_active_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.simulation_active_events_id_seq OWNED BY public.simulation_active_events.id;


--
-- TOC entry 248 (class 1259 OID 26945)
-- Name: simulation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulation_logs (
    log_id integer NOT NULL,
    user_id integer NOT NULL,
    save_id integer,
    event_id integer,
    event_type character varying(50) NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.simulation_logs OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 27734)
-- Name: simulation_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.simulation_logs_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.simulation_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 5799 (class 0 OID 0)
-- Dependencies: 319
-- Name: simulation_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.simulation_logs_log_id_seq OWNED BY public.simulation_logs.log_id;


--
-- TOC entry 249 (class 1259 OID 26951)
-- Name: simulation_saves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.simulation_saves (
    save_id integer NOT NULL,
    user_id integer NOT NULL,
    save_name character varying(50) DEFAULT 'Save 1'::character varying NOT NULL,
    sim_money numeric(15,2) DEFAULT 0.00 NOT NULL,
    sim_reputation integer DEFAULT 10 NOT NULL,
    battery_percent integer DEFAULT 100 NOT NULL,
    is_plugged_in smallint DEFAULT 1 NOT NULL,
    current_location_id integer DEFAULT 1,
    current_day integer DEFAULT 1 NOT NULL,
    current_hour numeric(4,1) DEFAULT 8.0 NOT NULL,
    jobs_completed integer DEFAULT 0 NOT NULL,
    jobs_failed integer DEFAULT 0 NOT NULL,
    total_earned numeric(15,2) DEFAULT 0.00 NOT NULL,
    total_spent numeric(15,2) DEFAULT 0.00 NOT NULL,
    environment_status text,
    is_active smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.simulation_saves OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 27736)
-- Name: simulation_saves_save_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.simulation_saves_save_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.simulation_saves_save_id_seq OWNER TO postgres;

--
-- TOC entry 5800 (class 0 OID 0)
-- Dependencies: 320
-- Name: simulation_saves_save_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.simulation_saves_save_id_seq OWNED BY public.simulation_saves.save_id;


--
-- TOC entry 250 (class 1259 OID 26971)
-- Name: survey_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_options (
    id integer NOT NULL,
    question_id integer NOT NULL,
    option_text character varying(200) NOT NULL,
    option_description character varying(500) DEFAULT NULL::character varying,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.survey_options OWNER TO postgres;

--
-- TOC entry 321 (class 1259 OID 27738)
-- Name: survey_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_options_id_seq OWNER TO postgres;

--
-- TOC entry 5801 (class 0 OID 0)
-- Dependencies: 321
-- Name: survey_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_options_id_seq OWNED BY public.survey_options.id;


--
-- TOC entry 251 (class 1259 OID 26978)
-- Name: survey_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_questions (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    image character varying(200) DEFAULT NULL::character varying
);


ALTER TABLE public.survey_questions OWNER TO postgres;

--
-- TOC entry 322 (class 1259 OID 27740)
-- Name: survey_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_questions_id_seq OWNER TO postgres;

--
-- TOC entry 5802 (class 0 OID 0)
-- Dependencies: 322
-- Name: survey_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_questions_id_seq OWNED BY public.survey_questions.id;


--
-- TOC entry 253 (class 1259 OID 27000)
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL,
    unlocked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO postgres;

--
-- TOC entry 323 (class 1259 OID 27742)
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_achievements_id_seq OWNER TO postgres;

--
-- TOC entry 5803 (class 0 OID 0)
-- Dependencies: 323
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- TOC entry 254 (class 1259 OID 27004)
-- Name: user_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_contracts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    contract_id integer NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying,
    status_reason character varying(50) DEFAULT NULL::character varying,
    accepted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    accepted_day integer,
    carried_days integer DEFAULT 0 NOT NULL,
    completed_day integer,
    failed_day integer
);


ALTER TABLE public.user_contracts OWNER TO postgres;

--
-- TOC entry 324 (class 1259 OID 27744)
-- Name: user_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_contracts_id_seq OWNER TO postgres;

--
-- TOC entry 5804 (class 0 OID 0)
-- Dependencies: 324
-- Name: user_contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_contracts_id_seq OWNED BY public.user_contracts.id;


--
-- TOC entry 270 (class 1259 OID 27461)
-- Name: user_cosmetics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_cosmetics (
    user_id integer NOT NULL,
    cosmetic_id integer NOT NULL,
    is_equipped integer DEFAULT 0 NOT NULL,
    purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_cosmetics OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 27011)
-- Name: user_inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_inventory (
    id integer NOT NULL,
    user_id integer NOT NULL,
    item_id integer NOT NULL,
    purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_inventory OWNER TO postgres;

--
-- TOC entry 325 (class 1259 OID 27746)
-- Name: user_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_inventory_id_seq OWNER TO postgres;

--
-- TOC entry 5805 (class 0 OID 0)
-- Dependencies: 325
-- Name: user_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_inventory_id_seq OWNED BY public.user_inventory.id;


--
-- TOC entry 271 (class 1259 OID 27466)
-- Name: user_mailbox; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_mailbox (
    mail_id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    attachment_coins integer DEFAULT 0,
    is_read integer DEFAULT 0,
    is_claimed integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_mailbox OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 27475)
-- Name: user_mailbox_mail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_mailbox ALTER COLUMN mail_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_mailbox_mail_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 273 (class 1259 OID 27476)
-- Name: user_missions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_missions (
    user_mission_id integer NOT NULL,
    user_id integer,
    email_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    accepted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


ALTER TABLE public.user_missions OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 27481)
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_missions_user_mission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_missions_user_mission_id_seq OWNER TO postgres;

--
-- TOC entry 5806 (class 0 OID 0)
-- Dependencies: 274
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_missions_user_mission_id_seq OWNED BY public.user_missions.user_mission_id;


--
-- TOC entry 283 (class 1259 OID 27655)
-- Name: user_presence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_presence (
    user_id integer NOT NULL,
    mode character varying(40) DEFAULT 'learn'::character varying NOT NULL,
    activity_label character varying(120) DEFAULT NULL::character varying,
    current_path character varying(255) DEFAULT NULL::character varying,
    last_seen timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_presence OWNER TO postgres;

--
-- TOC entry 326 (class 1259 OID 27748)
-- Name: user_presence_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_presence_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_presence_user_id_seq OWNER TO postgres;

--
-- TOC entry 5807 (class 0 OID 0)
-- Dependencies: 326
-- Name: user_presence_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_presence_user_id_seq OWNED BY public.user_presence.user_id;


--
-- TOC entry 256 (class 1259 OID 27015)
-- Name: user_profile_showcase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profile_showcase (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_profile_showcase OWNER TO postgres;

--
-- TOC entry 327 (class 1259 OID 27750)
-- Name: user_profile_showcase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_profile_showcase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profile_showcase_id_seq OWNER TO postgres;

--
-- TOC entry 5808 (class 0 OID 0)
-- Dependencies: 327
-- Name: user_profile_showcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_profile_showcase_id_seq OWNED BY public.user_profile_showcase.id;


--
-- TOC entry 275 (class 1259 OID 27482)
-- Name: user_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_progress (
    progress_id integer NOT NULL,
    user_id integer,
    lesson_id integer,
    status character varying(20) DEFAULT 'locked'::character varying,
    score integer DEFAULT 0,
    completed_at timestamp without time zone
);


ALTER TABLE public.user_progress OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 27487)
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_progress_progress_id_seq OWNER TO postgres;

--
-- TOC entry 5809 (class 0 OID 0)
-- Dependencies: 276
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- TOC entry 277 (class 1259 OID 27488)
-- Name: user_quiz_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_quiz_attempts (
    attempt_id integer NOT NULL,
    user_id integer,
    lesson_id integer,
    quiz_type character varying(10),
    score integer NOT NULL,
    total_questions integer NOT NULL,
    passed boolean NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_quiz_attempts_quiz_type_check CHECK (((quiz_type)::text = ANY (ARRAY[('pre'::character varying)::text, ('post'::character varying)::text])))
);


ALTER TABLE public.user_quiz_attempts OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 27493)
-- Name: user_quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_quiz_attempts_attempt_id_seq OWNER TO postgres;

--
-- TOC entry 5810 (class 0 OID 0)
-- Dependencies: 278
-- Name: user_quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_quiz_attempts_attempt_id_seq OWNED BY public.user_quiz_attempts.attempt_id;


--
-- TOC entry 279 (class 1259 OID 27494)
-- Name: user_survey_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_survey_responses (
    response_id integer NOT NULL,
    user_id integer,
    question_id integer,
    selected_option character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_survey_responses OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 27498)
-- Name: user_survey_responses_response_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_survey_responses_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_survey_responses_response_id_seq OWNER TO postgres;

--
-- TOC entry 5811 (class 0 OID 0)
-- Dependencies: 280
-- Name: user_survey_responses_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_survey_responses_response_id_seq OWNED BY public.user_survey_responses.response_id;


--
-- TOC entry 252 (class 1259 OID 26984)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(100) DEFAULT NULL::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reputation integer DEFAULT 10,
    equipped_theme_id integer,
    equipped_mouse_effect_id integer,
    equipped_profile_frame_id integer,
    avatar_url character varying(255) DEFAULT NULL::character varying,
    bio character varying(500) DEFAULT NULL::character varying,
    role character varying(20) DEFAULT 'user'::character varying,
    level integer DEFAULT 1,
    xp integer DEFAULT 0,
    virtual_currency integer DEFAULT 0,
    is_deleted smallint DEFAULT 0 NOT NULL,
    is_banned smallint DEFAULT 0 NOT NULL,
    ban_until timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 328 (class 1259 OID 27752)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5812 (class 0 OID 0)
-- Dependencies: 328
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 281 (class 1259 OID 27499)
-- Name: virtual_emails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.virtual_emails (
    email_id integer NOT NULL,
    sender_name character varying(100),
    subject character varying(200),
    body_content text,
    related_exercise_id integer,
    difficulty_level character varying(20),
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.virtual_emails OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 27505)
-- Name: virtual_emails_email_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.virtual_emails_email_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.virtual_emails_email_id_seq OWNER TO postgres;

--
-- TOC entry 5813 (class 0 OID 0)
-- Dependencies: 282
-- Name: virtual_emails_email_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.virtual_emails_email_id_seq OWNED BY public.virtual_emails.email_id;


--
-- TOC entry 5023 (class 2604 OID 27665)
-- Name: achievements achievement_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements ALTER COLUMN achievement_id SET DEFAULT nextval('public.achievements_achievement_id_seq'::regclass);


--
-- TOC entry 5025 (class 2604 OID 27671)
-- Name: advanced_validation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advanced_validation ALTER COLUMN id SET DEFAULT nextval('public.advanced_validation_id_seq'::regclass);


--
-- TOC entry 5026 (class 2604 OID 27673)
-- Name: advanced_validation_choices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advanced_validation_choices ALTER COLUMN id SET DEFAULT nextval('public.advanced_validation_choices_id_seq'::regclass);


--
-- TOC entry 5201 (class 2604 OID 27506)
-- Name: assessment_choices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_choices ALTER COLUMN id SET DEFAULT nextval('public.assessment_choices_id_seq'::regclass);


--
-- TOC entry 5202 (class 2604 OID 27507)
-- Name: assessment_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_questions ALTER COLUMN id SET DEFAULT nextval('public.assessment_questions_id_seq'::regclass);


--
-- TOC entry 5027 (class 2604 OID 27675)
-- Name: assets asset_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets ALTER COLUMN asset_id SET DEFAULT nextval('public.assets_asset_id_seq'::regclass);


--
-- TOC entry 5032 (class 2604 OID 27677)
-- Name: contracts contract_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts ALTER COLUMN contract_id SET DEFAULT nextval('public.contracts_contract_id_seq'::regclass);


--
-- TOC entry 5036 (class 2604 OID 27679)
-- Name: email_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications ALTER COLUMN id SET DEFAULT nextval('public.email_verifications_id_seq'::regclass);


--
-- TOC entry 5042 (class 2604 OID 27681)
-- Name: exercise_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.exercise_submissions_submission_id_seq'::regclass);


--
-- TOC entry 5038 (class 2604 OID 27683)
-- Name: exercises exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- TOC entry 5046 (class 2604 OID 27685)
-- Name: financial_ledger transaction_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_ledger ALTER COLUMN transaction_id SET DEFAULT nextval('public.financial_ledger_transaction_id_seq'::regclass);


--
-- TOC entry 5048 (class 2604 OID 27687)
-- Name: game_rooms room_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_rooms ALTER COLUMN room_id SET DEFAULT nextval('public.game_rooms_room_id_seq'::regclass);


--
-- TOC entry 5054 (class 2604 OID 27689)
-- Name: game_sessions session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.game_sessions_session_id_seq'::regclass);


--
-- TOC entry 5056 (class 2604 OID 27691)
-- Name: learning_ai_tasks task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_ai_tasks ALTER COLUMN task_id SET DEFAULT nextval('public.learning_ai_tasks_task_id_seq'::regclass);


--
-- TOC entry 5072 (class 2604 OID 27693)
-- Name: lesson_quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.lesson_quiz_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 5070 (class 2604 OID 27695)
-- Name: lesson_quizzes quiz_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.lesson_quizzes_quiz_id_seq'::regclass);


--
-- TOC entry 5077 (class 2604 OID 27697)
-- Name: lesson_slides slide_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_slides ALTER COLUMN slide_id SET DEFAULT nextval('public.lesson_slides_slide_id_seq'::regclass);


--
-- TOC entry 5067 (class 2604 OID 27699)
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- TOC entry 5082 (class 2604 OID 27701)
-- Name: level_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_config ALTER COLUMN id SET DEFAULT nextval('public.level_config_id_seq'::regclass);


--
-- TOC entry 5086 (class 2604 OID 27703)
-- Name: locations location_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN location_id SET DEFAULT nextval('public.locations_location_id_seq'::regclass);


--
-- TOC entry 5091 (class 2604 OID 27707)
-- Name: mini_game_dialogues dialogue_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues ALTER COLUMN dialogue_id SET DEFAULT nextval('public.mini_game_dialogues_dialogue_id_seq'::regclass);


--
-- TOC entry 5107 (class 2604 OID 27709)
-- Name: mini_game_exercise_submissions submission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercise_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.mini_game_exercise_submissions_submission_id_seq'::regclass);


--
-- TOC entry 5100 (class 2604 OID 27711)
-- Name: mini_game_exercises exercise_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercises ALTER COLUMN exercise_id SET DEFAULT nextval('public.mini_game_exercises_exercise_id_seq'::regclass);


--
-- TOC entry 5109 (class 2604 OID 27713)
-- Name: mini_game_locations location_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_locations ALTER COLUMN location_id SET DEFAULT nextval('public.mini_game_locations_location_id_seq'::regclass);


--
-- TOC entry 5113 (class 2604 OID 27715)
-- Name: mini_game_npcs npc_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_npcs ALTER COLUMN npc_id SET DEFAULT nextval('public.mini_game_npcs_npc_id_seq'::regclass);


--
-- TOC entry 5117 (class 2604 OID 27717)
-- Name: mini_game_user_exercise_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.mini_game_user_exercise_progress_progress_id_seq'::regclass);


--
-- TOC entry 5124 (class 2604 OID 27719)
-- Name: modules module_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN module_id SET DEFAULT nextval('public.modules_module_id_seq'::regclass);


--
-- TOC entry 5127 (class 2604 OID 27721)
-- Name: music_tracks track_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.music_tracks ALTER COLUMN track_id SET DEFAULT nextval('public.music_tracks_track_id_seq'::regclass);


--
-- TOC entry 5244 (class 2604 OID 27760)
-- Name: password_reset_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN id SET DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass);


--
-- TOC entry 5129 (class 2604 OID 27723)
-- Name: question_choices choice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_choices ALTER COLUMN choice_id SET DEFAULT nextval('public.question_choices_choice_id_seq'::regclass);


--
-- TOC entry 5130 (class 2604 OID 27725)
-- Name: quiz_questions question_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN question_id SET DEFAULT nextval('public.quiz_questions_question_id_seq'::regclass);


--
-- TOC entry 5133 (class 2604 OID 27727)
-- Name: random_events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.random_events ALTER COLUMN event_id SET DEFAULT nextval('public.random_events_event_id_seq'::regclass);


--
-- TOC entry 5138 (class 2604 OID 27729)
-- Name: room_participants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_participants ALTER COLUMN id SET DEFAULT nextval('public.room_participants_id_seq'::regclass);


--
-- TOC entry 5142 (class 2604 OID 27731)
-- Name: shop_items item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_items ALTER COLUMN item_id SET DEFAULT nextval('public.shop_items_item_id_seq'::regclass);


--
-- TOC entry 5149 (class 2604 OID 27733)
-- Name: simulation_active_events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_active_events ALTER COLUMN id SET DEFAULT nextval('public.simulation_active_events_id_seq'::regclass);


--
-- TOC entry 5152 (class 2604 OID 27735)
-- Name: simulation_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_logs ALTER COLUMN log_id SET DEFAULT nextval('public.simulation_logs_log_id_seq'::regclass);


--
-- TOC entry 5154 (class 2604 OID 27737)
-- Name: simulation_saves save_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_saves ALTER COLUMN save_id SET DEFAULT nextval('public.simulation_saves_save_id_seq'::regclass);


--
-- TOC entry 5170 (class 2604 OID 27739)
-- Name: survey_options id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_options ALTER COLUMN id SET DEFAULT nextval('public.survey_options_id_seq'::regclass);


--
-- TOC entry 5173 (class 2604 OID 27741)
-- Name: survey_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions ALTER COLUMN id SET DEFAULT nextval('public.survey_questions_id_seq'::regclass);


--
-- TOC entry 5187 (class 2604 OID 27743)
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- TOC entry 5189 (class 2604 OID 27745)
-- Name: user_contracts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_contracts ALTER COLUMN id SET DEFAULT nextval('public.user_contracts_id_seq'::regclass);


--
-- TOC entry 5194 (class 2604 OID 27747)
-- Name: user_inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_inventory ALTER COLUMN id SET DEFAULT nextval('public.user_inventory_id_seq'::regclass);


--
-- TOC entry 5228 (class 2604 OID 27508)
-- Name: user_missions user_mission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_missions ALTER COLUMN user_mission_id SET DEFAULT nextval('public.user_missions_user_mission_id_seq'::regclass);


--
-- TOC entry 5196 (class 2604 OID 27751)
-- Name: user_profile_showcase id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_showcase ALTER COLUMN id SET DEFAULT nextval('public.user_profile_showcase_id_seq'::regclass);


--
-- TOC entry 5231 (class 2604 OID 27509)
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- TOC entry 5234 (class 2604 OID 27510)
-- Name: user_quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.user_quiz_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 5236 (class 2604 OID 27511)
-- Name: user_survey_responses response_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_survey_responses ALTER COLUMN response_id SET DEFAULT nextval('public.user_survey_responses_response_id_seq'::regclass);


--
-- TOC entry 5175 (class 2604 OID 27753)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5238 (class 2604 OID 27512)
-- Name: virtual_emails email_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.virtual_emails ALTER COLUMN email_id SET DEFAULT nextval('public.virtual_emails_email_id_seq'::regclass);


--
-- TOC entry 5640 (class 0 OID 26714)
-- Dependencies: 215
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.achievements (achievement_id, name, description, difficulty, reward_money) FROM stdin;
1	Hello World	หาเงินจากการเขียนโค้ดได้ครบ 500 บาทแรก	Medium	50.00
2	First Bill Paid	จ่ายค่าใช้จ่ายงวดแรกสำเร็จทันเวลา	Medium	100.00
3	Syntax Hero	เขียนโค้ดงานระดับง่ายโดยไม่มี Error เลย 1 ครั้ง	Medium	50.00
4	Coffee Lover	ซื้อไอเทมกาแฟ/เครื่องดื่มชูกำลังครบ 5 ครั้ง	Medium	20.00
5	Junior Developer	ทำงานรับจ้างสำเร็จครบ 10 งาน	Medium	150.00
6	Bug Squasher	แก้ไขบั๊กในโค้ดสำเร็จรวม 20 ตัว	Medium	100.00
7	Survivor Week	เอาชีวิตรอดผ่านสัปดาห์แรก (7 วัน) โดยไม่เกมโอเวอร์	Medium	200.00
8	Night Owl	ทำงานโต้รุ่ง (ช่วงเวลากลางคืนในเกม) ติดต่อกัน 3 วัน	Medium	50.00
9	Fast Typer	ทำงานเสร็จก่อนเวลาที่กำหนด 30% ในงานระดับใดก็ได้	Medium	80.00
10	Savings Starter	มีเงินเก็บในบัญชีคงเหลือครบ 5,000 บาท	Medium	100.00
11	Full Stack Master	อัปเกรดทักษะ (Skill) ครบทุกด้านจนเลเวลเต็ม	Hard	500.00
12	Deadline Fighter	ส่งงานและรับเงินใน 5 วินาทีสุดท้ายก่อน Deadline	Hard	300.00
13	Crisis Manager	จ่ายค่าใช้จ่ายงวดใหญ่โดยเหลือเงินติดตัวน้อยกว่า 10 บาท	Hard	500.00
14	Senior Developer	ทำงานรับจ้างสำเร็จครบ 50 งาน	Hard	1000.00
15	No StackOverflow	ทำงานระดับยาก (Hard Task) สำเร็จโดยไม่ใช้ตัวช่วย	Hard	800.00
16	High Roller	มีเงินเก็บสะสมครบ 100,000 บาท	Hard	2000.00
17	Arena Champion	ชนะการแข่งขันในโหมดออนไลน์ 5 ครั้งติดต่อกัน	Hard	1500.00
18	Month Survivor	เอาชีวิตรอดผ่านเดือนแรก (30 วัน) ได้สำเร็จ	Hard	1000.00
19	Python God	จบเกมด้วยเงินคงเหลือมากกว่า 10,000,000 บาท	Very Hard	10000.00
20	Immortal Coder	เล่นจนจบเกมโดยไม่เคยส่งงานพลาด (Fail) เลยแม้แต่ครั้งเดียว	Very Hard	5000.00
\.


--
-- TOC entry 5682 (class 0 OID 27400)
-- Dependencies: 257
-- Data for Name: active_accepted_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.active_accepted_challenges (user_id, challenge_id, code_state, started_at, accepted_at, last_saved_at) FROM stdin;
16	8	n = int(input())\r\nnums = list(map(int, input().split()))\r\ncount = 0\r\n\r\nfor x in nums:\r\n    if x % 2 == 0:\r\n        count += 1\r\n\r\nprint(count)	2026-07-29 20:52:57.488681	2026-07-29 20:52:57.488681	2026-07-29 20:57:37.721049
\.


--
-- TOC entry 5641 (class 0 OID 26720)
-- Dependencies: 216
-- Data for Name: advanced_validation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advanced_validation (id, question_text, correct_answer) FROM stdin;
1	ผลลัพธ์ของ len([1, 2, 3]) คืออะไร?	3
2	คำสั่งใดใช้สร้าง Dictionary ว่าง?	{}
3	ผลลัพธ์ของ \\"Hello\\"[1] คืออะไร?	e
4	คำสั่ง for i in range(3) จะวนลูปกี่รอบ?	3
5	ผลลัพธ์ของ type(3.14) คืออะไร?	float
6	try-except ใช้ทำอะไร?	จัดการ Error
7	ฟังก์ชัน def greet(): return \\"Hi\\" เรียกใช้อย่างไร?	greet()
8	list.append(x) ทำอะไร?	เพิ่ม x ต่อท้าย list
9	ผลลัพธ์ของ 10 // 3 คืออะไร?	3
10	คำสั่ง import ใช้ทำอะไร?	นำเข้าโมดูล
\.


--
-- TOC entry 5642 (class 0 OID 26725)
-- Dependencies: 217
-- Data for Name: advanced_validation_choices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advanced_validation_choices (id, question_id, choice_text) FROM stdin;
1	1	3
2	1	2
3	1	4
4	1	Error
5	2	{}
6	2	[]
7	2	()
8	2	dict[]
9	3	e
10	3	H
11	3	l
12	3	Error
13	4	3
14	4	2
15	4	4
16	4	1
17	5	float
18	5	int
19	5	str
20	5	double
21	6	จัดการ Error
22	6	วนลูป
23	6	สร้างตัวแปร
24	6	นำเข้าไฟล์
25	7	greet()
26	7	call greet
27	7	run greet
28	7	def greet
29	8	เพิ่ม x ต่อท้าย list
30	8	ลบ x ออกจาก list
31	8	แทนที่ค่าใน list
32	8	สร้าง list ใหม่
33	9	3
34	9	3.33
35	9	1
36	9	10
37	10	นำเข้าโมดูล
38	10	สร้างฟังก์ชัน
39	10	ลบไฟล์
40	10	แสดงผล
\.


--
-- TOC entry 5683 (class 0 OID 27406)
-- Dependencies: 258
-- Data for Name: assessment_choices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_choices (id, question_id, choice_text, "order") FROM stdin;
\.


--
-- TOC entry 5685 (class 0 OID 27412)
-- Dependencies: 260
-- Data for Name: assessment_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_questions (id, level_value, question_text, question_type, correct_answer) FROM stdin;
\.


--
-- TOC entry 5643 (class 0 OID 26730)
-- Dependencies: 218
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (asset_id, user_id, name, type, battery_capacity_minutes, power_consumption_rate, condition_percent, created_at) FROM stdin;
\.


--
-- TOC entry 5644 (class 0 OID 26737)
-- Dependencies: 219
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contracts (contract_id, user_id, title, difficulty, reward, penalty, ai_requirements, status, deadline_at, created_at) FROM stdin;
7	\N	Digital Pet Feeder	Easy	1000.00	120.00	{\\"clientName\\":\\"Sir Barksalot III\\",\\"clientRole\\":\\"Professional Couch Potato\\",\\"story\\":\\"My human keeps forgetting to feed me at 6pm sharp. I'm a very important Beagle with a strict napping schedule, and hunger interrupts my beauty sleep. Build me an automated reminder system before I have to resort to dramatic sighing and guilt-tripping eyes.\\",\\"desc\\":\\"Write a Python script that asks for the current time, calculates how many minutes until 6:00 PM, and prints a countdown message. If it's already past 6pm, print 'FEED ME NOW' in all caps exactly 10 times using a loop.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-28 04:08:09
8	\N	Sarcasm Detector for Parents	Easy	1000.00	120.00	{\\"clientName\\":\\"Karen from Accounting (no relation)\\",\\"clientRole\\":\\"Mom of Three Eye-Rolling Teenagers\\",\\"story\\":\\"I told my kids to clean their room three hours ago and they said 'Yeah, sure, totally doing that right now.' I need software to tell me if I'm being mocked. My wine collection depends on accurate threat assessment.\\",\\"desc\\":\\"Create a Python function that takes a string input and returns True if the string contains obvious sarcasm indicators: words in ALL CAPS, more than 3 exclamation marks, or the phrases 'yeah sure', 'totally', or 'obviously'. Test with at least 3 example sentences.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-28 04:08:09
9	\N	Dungeon Snack Calculator	Easy	1000.00	120.00	{\\"clientName\\":\\"Gorp the Intimidating\\",\\"clientRole\\":\\"Part-Time Dragon, Full-Time Hangry\\",\\"story\\":\\"I keep eating adventurers WHO DON'T BRING ENOUGH SNACKS. Last week I got heartburn from a paladin with no rations. I need to know exactly how many sandwiches equal one human in nutritional value. It's for health reasons. I'm watching my figure.\\",\\"desc\\":\\"Build a Python script that converts adventurer types to sandwich equivalents: Warriors = 4 sandwiches, Mages = 2 sandwiches (squishy), Rogues = 3 sandwiches. Ask the user how many of each class they're eating, then print the total sandwich count and a 'satisfaction rating' (Satisfied if total >= 10, Still Hungry otherwise).\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-28 04:08:09
10	\N	Fix a broken print script	Easy	500.00	100.00	{\\"clientName\\":\\"Nina Noodle\\",\\"clientRole\\":\\"Cafe Owner\\",\\"story\\":\\"The receipt printer script keeps crashing when the cashier opens the shop.\\",\\"desc\\":\\"1. Write a Python script that prints a welcome message and the total price.\\\\n2. Ask the user for item name and price.\\\\n3. Display the result clearly with print().\\",\\"source\\":\\"fallback\\"}	COMPLETED	\N	2026-03-28 04:08:29
11	\N	Temperature warning tool	Easy	850.00	150.00	{\\"clientName\\":\\"Sunny Sky\\",\\"clientRole\\":\\"Weather Blogger\\",\\"story\\":\\"I want a tiny script that warns me when the temperature is too hot.\\",\\"desc\\":\\"1. Read temperature from input().\\\\n2. If temperature is above 35, print Hot Warning.\\\\n3. Otherwise print Normal Weather.\\",\\"source\\":\\"fallback\\"}	OFFERED	\N	2026-03-28 08:06:06
12	\N	Lemonade Stand Calculator	Easy	1000.00	120.00	{\\"clientName\\":\\"Timmy \\\\\\"The Squeeze\\\\\\" Thompson\\",\\"clientRole\\":\\"Neighborhood Beverage Mogul\\",\\"story\\":\\"Timmy's empire is crumbling! He's been selling lemonade for weeks but keeps running out of cups or having too many lemons rot. His mom said he needs to \\\\\\"do the math\\\\\\" before the farmers market this Saturday or she's cutting off his sugar supply.\\",\\"desc\\":\\"Write a Python script that calculates how many cups Timmy can fill given lemons, sugar, and water supplies. Each cup needs: 1 lemon, 2 tablespoons sugar, 8oz water. Input three integers (lemons, sugar_tbsp, water_oz). Output: maximum cups possible and which ingredient limits production.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-28 08:06:23
13	\N	Dungeon Dice Roller	Easy	1000.00	120.00	{\\"clientName\\":\\"Gary Gygax's Ghost\\",\\"clientRole\\":\\"Ethereal Game Master\\",\\"story\\":\\"Gary's getting tired of haunting dice at game stores—turns out ethereal fingers can't roll physical dice, and players keep cheating when he manifests to watch. He needs a digital solution before his Thursday night campaign descends into chaos.\\",\\"desc\\":\\"Create a Python dice roller that accepts input like '3d6+2' or '2d10'. Parse the string to extract: number of dice, sides per die, optional modifier. Output: each individual roll result and the final total. Handle invalid input gracefully with an error message.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-28 08:06:23
14	\N	Pet Rock Emotional Support	Easy	1000.00	120.00	{\\"clientName\\":\\"Dwayne \\\\\\"The Boulder\\\\\\" Johnson\\",\\"clientRole\\":\\"Certified Pet Rock Therapist\\",\\"story\\":\\"Dwayne's practice is booming—turns out millennials really latch onto throwable companionship. But manually typing 'You are valid, rock friend' 47 times daily is giving him carpal tunnel. He needs automation before his next group session.\\",\\"desc\\":\\"Write a Python script that generates randomized affirmations for pet rocks. Create five lists: adjectives, nouns, verbs, feelings, closing statements. Randomly select one item from each list to build sentences like \\\\\\"You are a [adjective] [noun] who can [verb] with [feeling]. [closing]\\\\\\". Generate and print 3 unique affirmations per run.\\",\\"source\\":\\"nvidia-ai\\"}	COMPLETED	\N	2026-03-28 08:06:23
15	\N	Tip Splitter Supreme	Easy	850.00	102.00	{\\"clientName\\":\\"Derek \\\\\\"Double-Dip\\\\\\" Donahue\\",\\"clientRole\\":\\"Disgraced Party Host\\",\\"story\\":\\"Threw a pizza party for 47 friends, forgot to collect money upfront, and now nobody will admit how many slices they ate. Needs a script to shame-calculate who owes what.\\",\\"desc\\":\\"• Take total bill and number of people as input.\\\\n• Calculate tip percentages (15%, 18%, 20%) for user selection.\\\\n• Output amount per person including chosen tip.\\\\n• Handle edge case: alert if someone tries to pay for 0 people.\\",\\"source\\":\\"nvidia-ai\\"}	FAILED	\N	2026-03-29 21:09:12
16	\N	Pet Name Generator	Easy	720.00	86.00	{\\"clientName\\":\\"Marnie Whiskerfuzz\\",\\"clientRole\\":\\"Overwhelmed Animal Shelter Volunteer\\",\\"story\\":\\"Has named 400 kittens this year and accidentally called three different cats \\\\\\"Mittens.\\\\\\" Needs a random generator before she names the next one \\\\\\"Chair.\\\\\\"\\",\\"desc\\":\\"• Combine random adjectives and nouns from two lists.\\\\n• Allow user to generate multiple names in one run.\\\\n• Prevent duplicate outputs in the same session.\\\\n• Include at least one silly \\\\\\"rare\\\\\\" prefix that appears 10% of the time.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-29 21:09:12
17	\N	Laundromat Change Counter	Easy	900.00	108.00	{\\"clientName\\":\\"Gus \\\\\\"The Sock\\\\\\" Marzetti\\",\\"clientRole\\":\\"Suspiciously Successful Coin Collector\\",\\"story\\":\\"Owns six laundromats but still counts quarters by hand while muttering about \\\\\\"the machines.\\\\\\" Needs a script to validate his nightly cash-out counts.\\",\\"desc\\":\\"• Input: quantities of quarters, dimes, nickels, pennies.\\\\n• Output total dollar amount formatted to $X.XX.\\\\n• Flag if total exceeds $500 (triggers audit alert).\\\\n• Reject negative coin counts with an error message.\\",\\"source\\":\\"nvidia-ai\\"}	OFFERED	\N	2026-03-29 21:09:12
\.


--
-- TOC entry 5687 (class 0 OID 27418)
-- Dependencies: 262
-- Data for Name: cosmetics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cosmetics (cosmetic_id, name, type, price, asset_url) FROM stdin;
\.


--
-- TOC entry 5645 (class 0 OID 26745)
-- Dependencies: 220
-- Data for Name: email_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_verifications (id, user_id, token, expires_at, verified_at, created_at) FROM stdin;
4	8	e1be77cdc6ebedaa58715387c372df06ccd0a1f9e10559c5ca950b6a1941d344	2026-03-25 22:38:32	\N	2026-03-24 15:38:32
5	9	e49a9f3882394dee875759039ed542bc4ad5d3bed810e27b2453edd51eefce28	2026-04-20 21:32:12	\N	2026-04-19 14:32:12
6	11	google-oauth	\N	2026-07-01 01:47:11	2026-06-30 18:47:11
7	12	2c6dbfacf31efff0d0bba46c63bc9daadf284f3df3a4b0711c0c92ed507956d1	2026-07-03 16:38:21	\N	2026-07-02 09:38:21
8	13	cc44194626d07c19cc468992242d8bb3188ae8467cd19d561442d09da90c1242	2026-07-03 16:38:51	\N	2026-07-02 09:38:51
9	14	3cb31803251bd889d0804dbcc5d69bbe44c3f32ef77e4cd101ba3323b6c94213	2026-07-05 04:31:13	\N	2026-07-03 21:31:13
10	16	6a40fe0b129b87526a0b875d1defe3e12c660cc1b28106c6b8afbb83586c3f44	2026-07-29 15:29:07.174287	\N	2026-07-28 15:29:07.174287
\.


--
-- TOC entry 5647 (class 0 OID 26757)
-- Dependencies: 222
-- Data for Name: exercise_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercise_submissions (submission_id, user_id, exercise_id, submitted_code, is_passed, score, execution_time_ms, error_message, submitted_at) FROM stdin;
1	9	1	print(\\"Hello, Python!\\")	1	100	\N	\N	2026-07-03 09:50:19
2	9	2	name = \\"PySim\\"\\nprint(name)	1	100	\N	\N	2026-06-25 16:07:04
3	11	1	print(\\"Hello, Python!\\")	1	100	\N	\N	2026-07-01 17:25:20
4	9	4	score = int(input())\\nif score >= 50:\\n    print(\\"ผ่าน\\")\\nelse:\\n    print(\\"ไม่ผ่าน\\")	1	100	\N	\N	2026-07-03 16:09:26
5	9	13	try:\\n    print(10/0)\\nexcept ZeroDivisionError:\\n    print(\\"Error\\")	1	100	\N	\N	2026-07-03 19:56:52
6	9	3	name = input()\\nprint(\\"สวัสดี\\", name)	1	100	\N	\N	2026-07-03 19:57:14
15	14	1	print(\\"Hello, Python!\\")	1	100	\N	\N	2026-07-03 22:44:11
16	14	2	name = \\"PySim\\"\\nprint(name)	1	100	\N	\N	2026-07-03 22:44:28
\.


--
-- TOC entry 5646 (class 0 OID 26749)
-- Dependencies: 221
-- Data for Name: exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exercises (exercise_id, lesson_id, title, description, starter_code, solution_code, test_cases, xp_reward, currency_reward) FROM stdin;
1	1	ทักทายด้วย Python	เขียนโปรแกรมแสดงข้อความ \\"Hello, Python!\\"	print(\\"Hello, Python!\\")	print(\\"Hello, Python!\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"Hello, Python!\\"}]	15	5
2	2	สร้างตัวแปรเก็บชื่อ	สร้างตัวแปร name เก็บคำว่า \\"PySim\\"	name = \\"PySim\\"\\nprint(name)	name = \\"PySim\\"\\nprint(name)	[{\\"input\\":\\"\\",\\"expected\\":\\"PySim\\"}]	20	6
3	3	รับชื่อแล้วทักทาย	รับชื่อจากผู้ใช้แล้วแสดง \\"สวัสดี <ชื่อ>\\"	name = input()\\nprint(\\"สวัสดี\\", name)	name = input()\\nprint(\\"สวัสดี\\", name)	[{\\"input\\":\\"Lumi\\",\\"expected\\":\\"สวัสดี Lumi\\"}]	25	8
4	4	ผ่านหรือไม่ผ่าน	คะแนน 50 ขึ้นไปแสดง \\"ผ่าน\\"	score = int(input())\\nif score >= 50:\\n    print(\\"ผ่าน\\")	score = int(input())\\nif score >= 50:\\n    print(\\"ผ่าน\\")\\nelse:\\n    print(\\"ไม่ผ่าน\\")	[{\\"input\\":\\"80\\",\\"expected\\":\\"ผ่าน\\"}]	30	10
5	5	นับเลข 1 ถึง n	แสดงตัวเลข 1 ถึง n	n = int(input())\\nfor i in range(1, n + 1):\\n    print(i)	n = int(input())\\nfor i in range(1, n + 1):\\n    print(i)	[{\\"input\\":\\"3\\",\\"expected\\":\\"1\\\\n2\\\\n3\\"}]	35	12
6	6	สร้างฟังก์ชันบวกเลข	เขียนฟังก์ชัน add(a, b)	def add(a, b):\\n    return a + b	def add(a, b):\\n    return a + b	[{\\"input\\":\\"2\\\\n3\\",\\"expected\\":\\"5\\"}]	40	15
7	7	เช็คอายุ	อายุ 18 ขึ้นไปแสดง \\"ผู้ใหญ่\\"	age = int(input())	age = int(input())\\nif age >= 18:\\n    print(\\"ผู้ใหญ่\\")\\nelse:\\n    print(\\"เด็ก\\")	[{\\"input\\":\\"20\\",\\"expected\\":\\"ผู้ใหญ่\\"}]	40	15
8	8	เลขคู่ 2-20	แสดงเลขคู่ด้วย For loop	for i in range(2, 21, 2):\\n    print(i)	for i in range(2, 21, 2):\\n    print(i)	[{\\"input\\":\\"\\",\\"expected\\":\\"2\\\\n4...20\\"}]	45	18
9	11	ฟังก์ชันคูณเลข	เขียนฟังก์ชัน multiply(a, b)	def multiply(a, b):\\n    return a * b	def multiply(a, b):\\n    return a * b	[{\\"input\\":\\"2\\\\n3\\",\\"expected\\":\\"6\\"}]	50	20
10	12	จัดการ List	แสดงผลข้อมูลตัวแรกใน List	fruits = [\\"Apple\\", \\"Banana\\"]\\nprint(fruits[0])	fruits = [\\"Apple\\", \\"Banana\\"]\\nprint(fruits[0])	[{\\"input\\":\\"\\",\\"expected\\":\\"Apple\\"}]	40	15
11	13	ใช้ Dictionary	ค้นหาคะแนนจากชื่อใน Dict	data = {\\"สมชาย\\": 80}\\nprint(data.get(\\"สมชาย\\"))	data = {\\"สมชาย\\": 80}\\nprint(data.get(\\"สมชาย\\"))	[{\\"input\\":\\"สมชาย\\",\\"expected\\":\\"80\\"}]	50	20
12	14	บันทึกไฟล์	บันทึกข้อความลง note.txt	with open(\\"note.txt\\", \\"w\\") as f:\\n    f.write(\\"Hello\\")	with open(\\"note.txt\\", \\"w\\") as f:\\n    f.write(\\"Hello\\")	[{\\"input\\":\\"Hello\\",\\"expected\\":\\"Saved\\"}]	55	25
13	15	จัดการ Error	Try-Except สำหรับหารด้วยศูนย์	try:\\n    print(10/0)\\nexcept ZeroDivisionError:\\n    print(\\"Error\\")	try:\\n    print(10/0)\\nexcept ZeroDivisionError:\\n    print(\\"Error\\")	[{\\"input\\":\\"10\\\\n0\\",\\"expected\\":\\"Error\\"}]	60	30
\.


--
-- TOC entry 5648 (class 0 OID 26765)
-- Dependencies: 223
-- Data for Name: financial_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.financial_ledger (transaction_id, user_id, type, category, amount, description, created_at) FROM stdin;
1	8	EXPENSE	RANDOM_EVENT	203.00	ELECTRICITY_BILL penalty	2026-03-27 15:23:50
2	8	EXPENSE	RANDOM_EVENT	207.00	ELECTRICITY_BILL penalty	2026-03-27 15:40:57
3	8	EXPENSE	RANDOM_EVENT	178.00	ELECTRICITY_BILL penalty	2026-03-27 21:08:33
4	8	EXPENSE	RANDOM_EVENT	213.00	ELECTRICITY_BILL penalty	2026-03-27 22:26:45
5	8	EXPENSE	RANDOM_EVENT	164.00	ELECTRICITY_BILL penalty	2026-03-27 22:36:57
6	8	EXPENSE	RANDOM_EVENT	130.00	ELECTRICITY_BILL penalty	2026-03-28 04:20:13
7	1	INCOME	JOB_REWARD	500.00	Reward from contract #10 (test.py)	2026-03-28 08:09:39
8	1	INCOME	JOB_REWARD	1000.00	Reward from contract #14 (test.py)	2026-03-28 09:21:07
9	11	EXPENSE	SHOP	30.00	Purchased Heart	2026-07-28 03:56:11.524433
\.


--
-- TOC entry 5649 (class 0 OID 26771)
-- Dependencies: 224
-- Data for Name: game_rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_rooms (room_id, room_name, host_user_id, room_password, status, max_players, current_players, created_at) FROM stdin;
\.


--
-- TOC entry 5650 (class 0 OID 26779)
-- Dependencies: 225
-- Data for Name: game_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.game_sessions (session_id, user_id, mode, started_at, ended_at) FROM stdin;
\.


--
-- TOC entry 5651 (class 0 OID 26783)
-- Dependencies: 226
-- Data for Name: learning_ai_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.learning_ai_tasks (task_id, user_id, mode, title, section_label, subtitle, accent, instructions_json, example_input, example_output, starter_code, test_cases_json, reward_xp, reward_coins, rerolls_used, max_rerolls, status, ai_payload, created_at, updated_at, completed_at) FROM stdin;
1	1	challenge	FizzBuzz Counter	Hard Challenge	Challenge	rose	[\\"Write a function called fizzbuzz that takes a number n and returns a list of strings from 1 to n.\\",\\"For multiples of 3, use 'Fizz' instead of the number.\\",\\"For multiples of 5, use 'Buzz' instead of the number.\\",\\"For multiples of both 3 and 5, use 'FizzBuzz'.\\"]	5	['1', '2', 'Fizz', '4', 'Buzz']	# Write your fizzbuzz function below\\n\\ndef fizzbuzz(n):\\n    # Your code here\\n    pass\\n	[{\\"input\\":\\"3\\",\\"expected\\":\\"['1', '2', 'Fizz']\\"},{\\"input\\":\\"5\\",\\"expected\\":\\"['1', '2', 'Fizz', '4', 'Buzz']\\"},{\\"input\\":\\"15\\",\\"expected\\":\\"['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']\\"},{\\"input\\":\\"1\\",\\"expected\\":\\"['1']\\"}]	250	70	2	3	COMPLETED	{\\"title\\":\\"FizzBuzz Counter\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"Write a function called fizzbuzz that takes a number n and returns a list of strings from 1 to n.\\",\\"For multiples of 3, use 'Fizz' instead of the number.\\",\\"For multiples of 5, use 'Buzz' instead of the number.\\",\\"For multiples of both 3 and 5, use 'FizzBuzz'.\\"],\\"example\\":{\\"input\\":\\"5\\",\\"output\\":\\"['1', '2', 'Fizz', '4', 'Buzz']\\"},\\"starterCode\\":\\"# Write your fizzbuzz function below\\\\n\\\\ndef fizzbuzz(n):\\\\n    # Your code here\\\\n    pass\\\\n\\",\\"testCases\\":[{\\"input\\":\\"3\\",\\"expected\\":\\"['1', '2', 'Fizz']\\"},{\\"input\\":\\"5\\",\\"expected\\":\\"['1', '2', 'Fizz', '4', 'Buzz']\\"},{\\"input\\":\\"15\\",\\"expected\\":\\"['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']\\"},{\\"input\\":\\"1\\",\\"expected\\":\\"['1']\\"}],\\"rewardXp\\":250,\\"rewardCoins\\":70}	2026-03-29 09:52:43	2026-03-29 10:40:04	2026-03-29 10:40:04
2	1	exercise	Fix the Greeting Bot	Exercise	Debug Lab	blue	[\\"This code should greet a user by name and tell them how many letters are in their name.\\",\\"Find and fix the bugs so it works correctly. There are 2-3 mistakes to find.\\"]	Alice	Hello, Alice! Your name has 5 letters.	def greet_user(name):\\n    message = \\"Hello, \\" + name + \\"! Your name has \\" + len(name) + \\" letters.\\"\\n    return Message\\n\\n# Get input\\nuser_name = input()\\nprint(greet_user(user_name))	[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice! Your name has 5 letters.\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob! Your name has 3 letters.\\"},{\\"input\\":\\"Python\\",\\"expected\\":\\"Hello, Python! Your name has 6 letters.\\"},{\\"input\\":\\"A\\",\\"expected\\":\\"Hello, A! Your name has 1 letters.\\"}]	120	30	2	3	ACTIVE	{\\"title\\":\\"Fix the Greeting Bot\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"This code should greet a user by name and tell them how many letters are in their name.\\",\\"Find and fix the bugs so it works correctly. There are 2-3 mistakes to find.\\"],\\"example\\":{\\"input\\":\\"Alice\\",\\"output\\":\\"Hello, Alice! Your name has 5 letters.\\"},\\"starterCode\\":\\"def greet_user(name):\\\\n    message = \\\\\\"Hello, \\\\\\" + name + \\\\\\"! Your name has \\\\\\" + len(name) + \\\\\\" letters.\\\\\\"\\\\n    return Message\\\\n\\\\n# Get input\\\\nuser_name = input()\\\\nprint(greet_user(user_name))\\",\\"testCases\\":[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice! Your name has 5 letters.\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob! Your name has 3 letters.\\"},{\\"input\\":\\"Python\\",\\"expected\\":\\"Hello, Python! Your name has 6 letters.\\"},{\\"input\\":\\"A\\",\\"expected\\":\\"Hello, A! Your name has 1 letters.\\"}],\\"rewardXp\\":120,\\"rewardCoins\\":30}	2026-03-29 09:52:44	2026-03-29 20:55:06	\N
3	1	challenge	Temperature Converter	Hard Challenge	Challenge	rose	[\\"Create a function called celsius_to_fahrenheit that takes one parameter: celsius (a float or int)\\",\\"The formula to convert Celsius to Fahrenheit is: F = (C × 9/5) + 32\\",\\"Return the result rounded to 2 decimal places as a float\\",\\"If the input is below absolute zero (-273.15°C), return the string 'Invalid'\\"]	25	77.0	# Define your function here\\ndef celsius_to_fahrenheit(celsius):\\n    # Your code here\\n    pass	[{\\"input\\":\\"0\\",\\"expected\\":\\"32.0\\"},{\\"input\\":\\"100\\",\\"expected\\":\\"212.0\\"},{\\"input\\":\\"-300\\",\\"expected\\":\\"Invalid\\"},{\\"input\\":\\"37.5\\",\\"expected\\":\\"99.5\\"}]	250	70	1	3	ACTIVE	{\\"title\\":\\"Temperature Converter\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"Create a function called celsius_to_fahrenheit that takes one parameter: celsius (a float or int)\\",\\"The formula to convert Celsius to Fahrenheit is: F = (C × 9/5) + 32\\",\\"Return the result rounded to 2 decimal places as a float\\",\\"If the input is below absolute zero (-273.15°C), return the string 'Invalid'\\"],\\"example\\":{\\"input\\":\\"25\\",\\"output\\":\\"77.0\\"},\\"starterCode\\":\\"# Define your function here\\\\ndef celsius_to_fahrenheit(celsius):\\\\n    # Your code here\\\\n    pass\\",\\"testCases\\":[{\\"input\\":\\"0\\",\\"expected\\":\\"32.0\\"},{\\"input\\":\\"100\\",\\"expected\\":\\"212.0\\"},{\\"input\\":\\"-300\\",\\"expected\\":\\"Invalid\\"},{\\"input\\":\\"37.5\\",\\"expected\\":\\"99.5\\"}],\\"rewardXp\\":250,\\"rewardCoins\\":70}	2026-03-29 10:40:13	2026-03-29 20:40:41	\N
4	9	challenge	Greeting Generator	Hard Challenge	Challenge	rose	[\\"Create a function named greet that takes a name as a parameter\\",\\"Return a greeting string in the format: 'Hello, [name]!'\\"]	Alice	Hello, Alice!	# Define your greet function below\\n# Remember to use the name parameter in your return statement\\n\\ndef greet(name):\\n    # Your code here\\n    pass	[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice!\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob!\\"},{\\"input\\":\\"\\",\\"expected\\":\\"Hello, !\\"},{\\"input\\":\\"Python Learner\\",\\"expected\\":\\"Hello, Python Learner!\\"}]	250	70	0	3	ACTIVE	{\\"title\\":\\"Greeting Generator\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"Create a function named greet that takes a name as a parameter\\",\\"Return a greeting string in the format: 'Hello, [name]!'\\"],\\"example\\":{\\"input\\":\\"Alice\\",\\"output\\":\\"Hello, Alice!\\"},\\"starterCode\\":\\"# Define your greet function below\\\\n# Remember to use the name parameter in your return statement\\\\n\\\\ndef greet(name):\\\\n    # Your code here\\\\n    pass\\",\\"testCases\\":[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice!\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob!\\"},{\\"input\\":\\"\\",\\"expected\\":\\"Hello, !\\"},{\\"input\\":\\"Python Learner\\",\\"expected\\":\\"Hello, Python Learner!\\"}],\\"rewardXp\\":250,\\"rewardCoins\\":70}	2026-04-19 14:46:09	2026-04-19 14:46:09	\N
5	9	exercise	Fix the Grade Calculator	Exercise	Debug Lab	blue	[\\"This function should take a score (0-100) and return a letter grade: A (90+), B (80-89), C (70-79), D (60-69), F (below 60)\\",\\"Find and fix the bugs in the starter code so it works correctly for all scores\\"]	85	B	def get_grade(score):\\n    if score >= 90\\n        return \\"A\\"\\n    elif score >= 80\\n        return \\"B\\"\\n    elif score >= 70:\\n        return \\"C\\"\\n    elif score >= 60\\n        return \\"D\\"\\n    else:\\n        return \\"F\\"	[{\\"input\\":\\"95\\",\\"expected\\":\\"A\\"},{\\"input\\":\\"85\\",\\"expected\\":\\"B\\"},{\\"input\\":\\"75\\",\\"expected\\":\\"C\\"},{\\"input\\":\\"55\\",\\"expected\\":\\"F\\"}]	120	30	0	3	ACTIVE	{\\"title\\":\\"Fix the Grade Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"This function should take a score (0-100) and return a letter grade: A (90+), B (80-89), C (70-79), D (60-69), F (below 60)\\",\\"Find and fix the bugs in the starter code so it works correctly for all scores\\"],\\"example\\":{\\"input\\":\\"85\\",\\"output\\":\\"B\\"},\\"starterCode\\":\\"def get_grade(score):\\\\n    if score >= 90\\\\n        return \\\\\\"A\\\\\\"\\\\n    elif score >= 80\\\\n        return \\\\\\"B\\\\\\"\\\\n    elif score >= 70:\\\\n        return \\\\\\"C\\\\\\"\\\\n    elif score >= 60\\\\n        return \\\\\\"D\\\\\\"\\\\n    else:\\\\n        return \\\\\\"F\\\\\\"\\",\\"testCases\\":[{\\"input\\":\\"95\\",\\"expected\\":\\"A\\"},{\\"input\\":\\"85\\",\\"expected\\":\\"B\\"},{\\"input\\":\\"75\\",\\"expected\\":\\"C\\"},{\\"input\\":\\"55\\",\\"expected\\":\\"F\\"}],\\"rewardXp\\":120,\\"rewardCoins\\":30}	2026-04-19 14:48:02	2026-04-19 14:48:02	\N
6	12	challenge	Calculate VAT	Hard Challenge	Challenge	rose	[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"]	100	Total price with VAT is 107.0	# Write your code from scratch here!\\n# Challenge: Calculate VAT	[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}]	220	60	0	3	ACTIVE	{\\"title\\":\\"Calculate VAT\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"],\\"example\\":{\\"input\\":\\"100\\",\\"output\\":\\"Total price with VAT is 107.0\\"},\\"starterCode\\":\\"# Write your code from scratch here!\\\\n# Challenge: Calculate VAT\\",\\"testCases\\":[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}],\\"rewardXp\\":220,\\"rewardCoins\\":60}	2026-06-30 18:17:43	2026-06-30 18:17:43	\N
7	12	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"]	10000	Tax is 700.0	salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")	[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}]	90	20	0	3	ACTIVE	{\\"title\\":\\"Fix the Tax Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"],\\"example\\":{\\"input\\":\\"10000\\",\\"output\\":\\"Tax is 700.0\\"},\\"starterCode\\":\\"salary = int(input(\\\\\\"Enter salary: \\\\\\"))\\\\ntax = salary * 7\\\\nprint(f\\\\\\"Tax is {tax}\\\\\\")\\",\\"testCases\\":[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}],\\"rewardXp\\":90,\\"rewardCoins\\":20}	2026-06-30 18:21:45	2026-06-30 18:21:45	\N
8	10	challenge	Calculate VAT	Hard Challenge	Challenge	rose	[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"]	100	Total price with VAT is 107.0	# Write your code from scratch here!\\n# Challenge: Calculate VAT	[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}]	220	60	0	3	ACTIVE	{\\"title\\":\\"Calculate VAT\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"],\\"example\\":{\\"input\\":\\"100\\",\\"output\\":\\"Total price with VAT is 107.0\\"},\\"starterCode\\":\\"# Write your code from scratch here!\\\\n# Challenge: Calculate VAT\\",\\"testCases\\":[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}],\\"rewardXp\\":220,\\"rewardCoins\\":60}	2026-06-30 18:29:08	2026-06-30 18:29:08	\N
9	11	challenge	Calculate VAT	Hard Challenge	Challenge	rose	[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"]	100	Total price with VAT is 107.0	# Write your code from scratch here!\\n# Challenge: Calculate VAT	[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}]	220	60	0	3	ACTIVE	{\\"title\\":\\"Calculate VAT\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"],\\"example\\":{\\"input\\":\\"100\\",\\"output\\":\\"Total price with VAT is 107.0\\"},\\"starterCode\\":\\"# Write your code from scratch here!\\\\n# Challenge: Calculate VAT\\",\\"testCases\\":[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}],\\"rewardXp\\":220,\\"rewardCoins\\":60}	2026-06-30 18:47:29	2026-06-30 18:47:29	\N
10	11	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"]	10000	Tax is 700.0	salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")	[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}]	90	20	3	3	COMPLETED	{\\"title\\":\\"Fix the Tax Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"],\\"example\\":{\\"input\\":\\"10000\\",\\"output\\":\\"Tax is 700.0\\"},\\"starterCode\\":\\"salary = int(input(\\\\\\"Enter salary: \\\\\\"))\\\\ntax = salary * 7\\\\nprint(f\\\\\\"Tax is {tax}\\\\\\")\\",\\"testCases\\":[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}],\\"rewardXp\\":90,\\"rewardCoins\\":20}	2026-07-01 10:15:34	2026-07-01 12:40:26	2026-07-01 12:40:26
11	11	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"]	10000	Tax is 700.0	salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")	[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}]	90	20	0	3	COMPLETED	{\\"title\\":\\"Fix the Tax Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"],\\"example\\":{\\"input\\":\\"10000\\",\\"output\\":\\"Tax is 700.0\\"},\\"starterCode\\":\\"salary = int(input(\\\\\\"Enter salary: \\\\\\"))\\\\ntax = salary * 7\\\\nprint(f\\\\\\"Tax is {tax}\\\\\\")\\",\\"testCases\\":[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}],\\"rewardXp\\":90,\\"rewardCoins\\":20}	2026-07-01 12:41:54	2026-07-01 12:42:37	2026-07-01 12:42:37
12	11	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"]	10000	Tax is 700.0	salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")	[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}]	90	20	0	3	COMPLETED	{\\"title\\":\\"Fix the Tax Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"],\\"example\\":{\\"input\\":\\"10000\\",\\"output\\":\\"Tax is 700.0\\"},\\"starterCode\\":\\"salary = int(input(\\\\\\"Enter salary: \\\\\\"))\\\\ntax = salary * 7\\\\nprint(f\\\\\\"Tax is {tax}\\\\\\")\\",\\"testCases\\":[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}],\\"rewardXp\\":90,\\"rewardCoins\\":20}	2026-07-01 12:43:57	2026-07-01 17:11:41	2026-07-01 17:11:41
13	11	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"]	10000	Tax is 700.0	salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")	[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}]	90	20	0	3	ACTIVE	{\\"title\\":\\"Fix the Tax Calculator\\",\\"sectionLabel\\":\\"Exercise\\",\\"subtitle\\":\\"Debug Lab\\",\\"accent\\":\\"blue\\",\\"instructions\\":[\\"แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%\\",\\"ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]\\"],\\"example\\":{\\"input\\":\\"10000\\",\\"output\\":\\"Tax is 700.0\\"},\\"starterCode\\":\\"salary = int(input(\\\\\\"Enter salary: \\\\\\"))\\\\ntax = salary * 7\\\\nprint(f\\\\\\"Tax is {tax}\\\\\\")\\",\\"testCases\\":[{\\"input\\":\\"10000\\",\\"expected\\":\\"Tax is 700.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Tax is 35.0\\"},{\\"input\\":\\"150000\\",\\"expected\\":\\"Tax is 10500.0\\"}],\\"rewardXp\\":90,\\"rewardCoins\\":20}	2026-07-01 17:13:21	2026-07-01 17:13:21	\N
14	13	challenge	Calculate VAT	Hard Challenge	Challenge	rose	[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"]	100	Total price with VAT is 107.0	# Write your code from scratch here!\\n# Challenge: Calculate VAT	[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}]	220	60	0	3	ACTIVE	{\\"title\\":\\"Calculate VAT\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%\\",\\"แสดงผลในรูปแบบ Total price with VAT is [value]\\"],\\"example\\":{\\"input\\":\\"100\\",\\"output\\":\\"Total price with VAT is 107.0\\"},\\"starterCode\\":\\"# Write your code from scratch here!\\\\n# Challenge: Calculate VAT\\",\\"testCases\\":[{\\"input\\":\\"100\\",\\"expected\\":\\"Total price with VAT is 107.0\\"},{\\"input\\":\\"500\\",\\"expected\\":\\"Total price with VAT is 535.0\\"},{\\"input\\":\\"1500\\",\\"expected\\":\\"Total price with VAT is 1605.0\\"}],\\"rewardXp\\":220,\\"rewardCoins\\":60}	2026-07-02 09:39:03	2026-07-02 09:39:03	\N
15	14	challenge	Greeting Generator	Hard Challenge	Challenge	rose	[\\"Create a function called "greet" that takes a name as input.\\",\\"Return the string 'Hello, <name>!' where <name> is the input provided.\\",\\"Make sure to handle the exact spacing and punctuation as shown.\\"]	Alice	Hello, Alice!	# Define your greet function below\\n\\ndef greet(name):\\n    # Your code here\\n    pass\\n	[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice!\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob!\\"},{\\"input\\":\\"\\",\\"expected\\":\\"Hello, !\\"},{\\"input\\":\\"Sam\\",\\"expected\\":\\"Hello, Sam!\\"}]	250	70	0	3	ACTIVE	{\\"title\\":\\"Greeting Generator\\",\\"sectionLabel\\":\\"Hard Challenge\\",\\"subtitle\\":\\"Challenge\\",\\"accent\\":\\"rose\\",\\"instructions\\":[\\"Create a function called "greet" that takes a name as input.\\",\\"Return the string 'Hello, <name>!' where <name> is the input provided.\\",\\"Make sure to handle the exact spacing and punctuation as shown.\\"],\\"example\\":{\\"input\\":\\"Alice\\",\\"output\\":\\"Hello, Alice!\\"},\\"starterCode\\":\\"# Define your greet function below\\\\n\\\\ndef greet(name):\\\\n    # Your code here\\\\n    pass\\\\n\\",\\"testCases\\":[{\\"input\\":\\"Alice\\",\\"expected\\":\\"Hello, Alice!\\"},{\\"input\\":\\"Bob\\",\\"expected\\":\\"Hello, Bob!\\"},{\\"input\\":\\"\\",\\"expected\\":\\"Hello, !\\"},{\\"input\\":\\"Sam\\",\\"expected\\":\\"Hello, Sam!\\"}],\\"rewardXp\\":250,\\"rewardCoins\\":70}	2026-07-03 21:31:51	2026-07-03 21:31:51	\N
16	16	challenge	Calculate VAT	Hard Challenge	Challenge	rose	["เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%","แสดงผลในรูปแบบ Total price with VAT is [value]"]	100	Total price with VAT is 107.0	# Write your code from scratch here!\n# Challenge: Calculate VAT	[{"input":"100","expected":"Total price with VAT is 107.0"},{"input":"500","expected":"Total price with VAT is 535.0"},{"input":"1500","expected":"Total price with VAT is 1605.0"}]	220	60	0	3	ACTIVE	{"title":"Calculate VAT","sectionLabel":"Hard Challenge","subtitle":"Challenge","accent":"rose","instructions":["เขียนโปรแกรมรับค่าราคาสินค้าจากผู้ใช้ แล้วคำนวณราคารวมภาษีมูลค่าเพิ่ม 7%","แสดงผลในรูปแบบ Total price with VAT is [value]"],"example":{"input":"100","output":"Total price with VAT is 107.0"},"starterCode":"# Write your code from scratch here!\\n# Challenge: Calculate VAT","testCases":[{"input":"100","expected":"Total price with VAT is 107.0"},{"input":"500","expected":"Total price with VAT is 535.0"},{"input":"1500","expected":"Total price with VAT is 1605.0"}],"rewardXp":220,"rewardCoins":60}	2026-07-28 15:29:19.987024	2026-07-28 15:29:19.987024	\N
17	16	exercise	Fix the Tax Calculator	Exercise	Debug Lab	blue	["แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%","ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]"]	10000	Tax is 700.0	salary = int(input("Enter salary: "))\ntax = salary * 7\nprint(f"Tax is {tax}")	[{"input":"10000","expected":"Tax is 700.0"},{"input":"500","expected":"Tax is 35.0"},{"input":"150000","expected":"Tax is 10500.0"}]	90	20	0	3	ACTIVE	{"title":"Fix the Tax Calculator","sectionLabel":"Exercise","subtitle":"Debug Lab","accent":"blue","instructions":["แก้ไขโค้ดให้รับค่าเงินเดือนจากผู้ใช้ แล้วคำนวณภาษีมูลค่าเพิ่ม 7%","ตรวจสอบให้ผลลัพธ์แสดงในรูปแบบ Tax is [value]"],"example":{"input":"10000","output":"Tax is 700.0"},"starterCode":"salary = int(input(\\"Enter salary: \\"))\\ntax = salary * 7\\nprint(f\\"Tax is {tax}\\")","testCases":[{"input":"10000","expected":"Tax is 700.0"},{"input":"500","expected":"Tax is 35.0"},{"input":"150000","expected":"Tax is 10500.0"}],"rewardXp":90,"rewardCoins":20}	2026-07-28 16:58:56.642039	2026-07-28 16:58:56.642039	\N
\.


--
-- TOC entry 5654 (class 0 OID 26807)
-- Dependencies: 229
-- Data for Name: lesson_quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_quiz_attempts (attempt_id, user_id, lesson_id, quiz_type, score, total_questions, answers_json, completed_at, updated_at) FROM stdin;
1	9	1	pre	2	2	{\\"0\\":\\"print()\\",\\"1\\":\\"Hello\\"}	2026-04-23 06:34:22	2026-04-23 06:34:22
2	9	1	post	3	3	{\\"0\\":\\"Python\\",\\"1\\":\\"print(\\\\\\"สวัสดี\\\\\\")\\",\\"2\\":\\"Interpreted\\"}	2026-04-23 06:34:35	2026-04-23 06:34:35
3	9	2	pre	0	2	{\\"0\\":\\"//\\",\\"1\\":\\"ทำให้เกิด Error\\"}	2026-04-23 06:34:56	2026-04-23 06:34:56
4	9	2	post	2	2	{\\"0\\":\\"Comment\\",\\"1\\":\\"# This is a comment\\"}	2026-05-06 04:35:45	2026-05-06 04:35:45
5	9	3	pre	0	2	{\\"0\\":\\"scanf()\\",\\"1\\":\\"int\\"}	2026-04-23 06:53:46	2026-04-23 06:53:46
6	9	3	post	2	2	{\\"0\\":\\"str\\",\\"1\\":\\"ใช้ int(input())\\"}	2026-07-03 15:19:28	2026-07-03 15:19:28
8	12	1	pre	2	2	{\\"0\\":\\"print()\\",\\"1\\":\\"Hello\\"}	2026-06-30 18:18:07	2026-06-30 18:18:07
9	12	1	post	2	3	{\\"0\\":\\"Python\\",\\"1\\":\\"print(\\\\\\"สวัสดี\\\\\\")\\",\\"2\\":\\"Compiled\\"}	2026-06-30 18:18:46	2026-06-30 18:18:46
10	11	1	pre	2	2	{\\"0\\":\\"print()\\",\\"1\\":\\"Hello\\"}	2026-07-01 10:18:18	2026-07-01 10:18:18
11	11	1	post	3	3	{\\"0\\":\\"Python\\",\\"1\\":\\"print(\\\\\\"สวัสดี\\\\\\")\\",\\"2\\":\\"Interpreted\\"}	2026-07-01 10:18:52	2026-07-01 10:18:52
12	11	2	pre	2	2	{\\"0\\":\\"#\\",\\"1\\":\\"ไม่มีผล\\"}	2026-07-01 10:30:06	2026-07-01 10:30:06
13	11	2	post	2	2	{\\"0\\":\\"Comment\\",\\"1\\":\\"# This is a comment\\"}	2026-07-01 10:30:54	2026-07-01 10:30:54
15	9	10	pre	3	4	{\\"0\\":\\"def\\",\\"1\\":\\"กล่องเก็บข้อมูล\\",\\"2\\":\\"back\\",\\"3\\":\\"ไม่จำเป็น\\"}	2026-07-03 15:49:23	2026-07-03 15:49:23
16	9	10	post	3	4	{\\"0\\":\\"ชื่อฟังก์ชัน()\\",\\"1\\":\\"my_variable\\",\\"2\\":\\"False\\",\\"3\\":\\"float\\"}	2026-07-03 15:51:36	2026-07-03 15:51:36
17	9	4	pre	1	2	{\\"0\\":\\"เก็บข้อมูลไว้ใช้งาน\\",\\"1\\":\\"ห้ามเว้นวรรค\\"}	2026-07-03 16:05:37	2026-07-03 16:05:37
18	9	4	post	2	3	{\\"0\\":\\"ตัวเลขทศนิยม\\",\\"1\\":\\"int()\\",\\"2\\":\\"float()\\"}	2026-07-03 16:09:20	2026-07-03 16:09:20
19	9	5	pre	1	3	{\\"0\\":\\"str\\",\\"1\\":\\"type()\\",\\"2\\":\\"lood\\"}	2026-07-03 17:34:58	2026-07-03 17:34:58
20	9	5	post	2	3	{\\"0\\":\\"ข้อความ\\",\\"1\\":\\"2\\",\\"2\\":\\"tcui()\\"}	2026-07-03 17:41:13	2026-07-03 17:41:13
21	9	7	pre	1	3	{\\"0\\":\\"while\\",\\"1\\":\\"elif\\",\\"2\\":\\"==\\"}	2026-07-03 18:02:24	2026-07-03 18:02:24
22	9	7	post	2	3	{\\"0\\":\\":\\",\\"1\\":\\"elif\\",\\"2\\":\\"if\\"}	2026-07-03 18:02:59	2026-07-03 18:02:59
23	9	8	pre	2	3	{\\"0\\":\\"while\\",\\"1\\":\\"range()\\",\\"2\\":\\"ใช่\\"}	2026-07-03 18:08:31	2026-07-03 18:08:31
24	9	8	post	2	3	{\\"0\\":\\"ได้\\",\\"1\\":\\"break\\",\\"2\\":\\"f\\"}	2026-07-03 18:10:37	2026-07-03 18:10:37
25	9	9	pre	2	3	{\\"0\\":\\"while\\",\\"1\\":\\"boolean\\",\\"2\\":\\"t\\"}	2026-07-03 18:13:45	2026-07-03 18:13:45
26	9	9	post	2	3	{\\"0\\":\\"ระบุจำนวนรอบไม่ได้\\",\\"1\\":\\"break\\",\\"2\\":\\"loog\\"}	2026-07-03 18:14:02	2026-07-03 18:14:02
27	9	15	pre	2	3	{\\"0\\":\\"try\\",\\"1\\":\\"except\\",\\"2\\":\\"ก\\"}	2026-07-03 19:41:07	2026-07-03 19:41:07
28	9	15	post	2	3	{\\"0\\":\\"finally\\",\\"1\\":\\"โปรแกรมค้าง\\",\\"2\\":\\"ก\\"}	2026-07-03 19:45:30	2026-07-03 19:45:30
29	14	1	pre	2	2	{\\"0\\":\\"print()\\",\\"1\\":\\"Hello\\"}	2026-07-03 21:31:50	2026-07-03 21:31:50
30	14	1	post	3	3	{\\"0\\":\\"Python\\",\\"1\\":\\"print(\\\\\\"สวัสดี\\\\\\")\\",\\"2\\":\\"Interpreted\\"}	2026-07-03 21:32:04	2026-07-03 21:32:04
31	14	2	pre	2	2	{\\"0\\":\\"#\\",\\"1\\":\\"ไม่มีผล\\"}	2026-07-03 21:33:56	2026-07-03 21:33:56
32	14	2	post	2	2	{\\"0\\":\\"Comment\\",\\"1\\":\\"# This is a comment\\"}	2026-07-03 21:34:04	2026-07-03 21:34:04
33	14	3	pre	2	2	{\\"0\\":\\"input()\\",\\"1\\":\\"str\\"}	2026-07-03 22:21:58	2026-07-03 22:21:58
34	14	3	post	2	2	{\\"0\\":\\"str\\",\\"1\\":\\"ใช้ int(input())\\"}	2026-07-03 22:22:09	2026-07-03 22:22:09
35	14	4	pre	1	3	{\\"0\\":\\"เก็บข้อมูลไว้ใช้งาน\\",\\"1\\":\\"ห้ามเว้นวรรค\\",\\"2\\":\\"f\\"}	2026-07-03 22:25:49	2026-07-03 22:25:49
36	14	4	post	3	3	{\\"0\\":\\"ตัวเลขทศนิยม\\",\\"1\\":\\"int()\\",\\"2\\":\\"float\\"}	2026-07-03 22:26:04	2026-07-03 22:26:04
37	14	5	pre	2	3	{\\"0\\":\\"float\\",\\"1\\":\\"type()\\",\\"2\\":\\"lood\\"}	2026-07-03 22:26:31	2026-07-03 22:26:31
38	14	5	post	2	2	{\\"0\\":\\"ข้อความ\\",\\"1\\":\\"2\\"}	2026-07-03 22:26:41	2026-07-03 22:26:41
39	14	6	pre	3	3	{\\"0\\":\\"int()\\",\\"1\\":\\"float()\\",\\"2\\":\\"str()\\"}	2026-07-03 23:07:01	2026-07-03 23:07:01
40	16	1	pre	2	2	{"0":"print()","1":"Hello"}	2026-08-21 02:59:54.239638	2026-08-21 02:59:54.239638
41	16	1	post	2	3	{"0":"Python","1":"print(\\\\\\"สวัสดี\\\\\\")","2":"Compiled"}	2026-08-21 03:00:15.735276	2026-08-21 03:00:15.735276
\.


--
-- TOC entry 5653 (class 0 OID 26803)
-- Dependencies: 228
-- Data for Name: lesson_quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_quizzes (quiz_id, lesson_id, quiz_type) FROM stdin;
1	1	pre
2	1	post
3	2	pre
4	2	post
5	3	pre
6	3	post
7	10	pre
8	10	post
9	4	pre
10	4	post
11	5	pre
12	5	post
13	6	pre
14	6	post
15	7	pre
16	7	post
17	8	pre
18	8	post
19	9	pre
20	9	post
21	10	pre
22	10	post
23	11	pre
24	11	post
25	12	pre
26	12	post
27	13	pre
28	13	post
29	14	pre
30	14	post
31	15	pre
32	15	post
\.


--
-- TOC entry 5655 (class 0 OID 26816)
-- Dependencies: 230
-- Data for Name: lesson_slides; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesson_slides (slide_id, lesson_id, slide_order, slide_title, slide_content, slide_src, slide_type) FROM stdin;
1	1	1	Python คืออะไร?	Python เป็นภาษาโปรแกรมที่ใช้งานง่าย เหมาะสำหรับผู้เริ่มต้น\\nสร้างโดย Guido van Rossum ในปี 1991	/gif/first_print.gif	text
2	1	2	คำสั่ง print()	ใช้คำสั่ง print() เพื่อแสดงผลลัพธ์\\nตัวอย่าง: print(\\"Hello World!\\")	\N	text
3	1	3	ลองเขียนโค้ด	print(\\"Hello World!\\")\\nprint(\\"สวัสดีชาว Python!\\")	\N	code
4	2	1	Comments คืออะไร?	Comments คือข้อความอธิบายโค้ดที่ Python จะข้ามไม่ประมวลผล\\nใช้เครื่องหมาย # นำหน้า	/gif/comments.gif	text
5	2	2	ตัวอย่าง Comment	# นี่คือ Comment\\nprint(\\"Hello\\") # Comment ท้ายบรรทัด\\n\\n# หลายบรรทัด\\n# ใช้ # หลายตัว	\N	code
6	3	1	รับข้อมูลจากผู้ใช้	ใช้คำสั่ง input() เพื่อรับข้อมูลจาก keyboard\\nข้อมูลที่ได้จะเป็น string เสมอ	/gif/input.gif	text
7	3	2	ลองเขียน Input	name = input(\\"ชื่ออะไร: \\")\\nprint(\\"สวัสดี\\", name)	\N	code
8	4	1	ตัวแปรคืออะไร?	ตัวแปร (Variable) คือ \\"กล่อง\\" เก็บข้อมูล\\nใน Python ไม่ต้องประกาศชนิดล่วงหน้า	/gif/python4.gif	text
9	4	2	การตั้งชื่อตัวแปร	x = 10\\nname = \\"John\\"\\nmy_list = [1, 2, 3]\\n\\n# กฎการตั้งชื่อ:\\n# - เริ่มด้วยตัวอักษรหรือ _\\n# - ห้ามเริ่มด้วยตัวเลข\\n# - case-sensitive	\N	code
10	6	1	Type Conversion	การแปลงชนิดข้อมูล เช่น str เป็น int\\nใช้ int(), float(), str()	/data_lesson/lesson_06	text
11	6	2	ตัวอย่าง Type Conversion	x = \\"100\\"\\ny = int(x)  # แปลง str เป็น int\\nprint(y + 50)  # ผลลัพธ์ 150\\n\\nz = float(\\"3.14\\")\\nprint(z)  # 3.14	\N	code
28	5	1	ชนิดข้อมูลคืออะไร?	ชนิดข้อมูล (Data Types) คือการกำหนดลักษณะของข้อมูลที่จะเก็บในตัวแปร เพื่อให้ Python ประมวลผลได้อย่างถูกต้อง	\N	text
29	5	2	ทำไมต้องรู้ชนิดข้อมูล?	การรู้ชนิดข้อมูลช่วยให้เราเลือกใช้คำสั่งจัดการข้อมูลได้เหมาะสม เช่น การคำนวณตัวเลข หรือการเชื่อมต่อข้อความ	\N	text
30	5	3	ภาพรวมชนิดข้อมูลพื้นฐาน	ข้อมูลชนิดหลักที่ควรรู้จัก ได้แก่ int, float, str, bool และ list	/data_lesson/lesson_05.gif	text
31	5	4	ตัวอย่างการประกาศตัวแปร	name = \\"Python\\"  # str\\nage = 25          # int\\nheight = 175.5    # float\\nis_active = True  # bool\\nmy_list = [1, 2, 3] # list	\N	code
36	7	1	คำสั่งเงื่อนไขคืออะไร?	คำสั่งเงื่อนไข (If-Else) คือการให้โปรแกรมตัดสินใจทำตามเงื่อนไขที่กำหนด หากเงื่อนไขเป็นจริง (True) ให้ทำอย่างหนึ่ง หากเป็นเท็จ (False) ให้ทำอีกอย่างหนึ่ง	\N	text
37	7	2	โครงสร้างการทำงาน	Python ใช้คำสั่ง if เพื่อตรวจสอบเงื่อนไขหลัก ถ้ามีเงื่อนไขอื่นเพิ่มเติมใช้ elif และหากไม่ตรงกับเงื่อนไขใดเลยจะใช้ else เพื่อกำหนดค่าเริ่มต้น	\N	text
38	7	3	แผนผังการตัดสินใจ	ภาพแสดงการทำงานของ If-Else ที่มีการแยกเส้นทางตามผลลัพธ์ของเงื่อนไข (จริง/เท็จ)	/data_lesson/lesson_07.gif	text
39	7	4	ตัวอย่างโค้ด If-Else	score = 75\\nif score >= 50:\\n    print(\\"Passed\\")\\nelse:\\n    print(\\"Failed\\")	\N	code
40	8	1	For Loop คืออะไร?	For Loop คือคำสั่งที่ใช้ทำซ้ำชุดคำสั่งเดิมตามจำนวนรอบที่กำหนดไว้ล่วงหน้า หรือทำซ้ำตามจำนวนสมาชิกที่มีอยู่ในข้อมูลชุด (Collection)	\N	text
41	8	2	ทำไมต้องใช้ For Loop?	ช่วยลดการเขียนโค้ดซ้ำๆ ในกรณีที่เราทราบจำนวนรอบที่แน่นอน หรือต้องการเข้าถึงสมาชิกทุกตัวใน List, Tuple หรือ String	\N	text
42	8	3	แผนผังการทำงานของ For Loop	การวนลูปจะตรวจสอบค่าในลำดับที่กำหนด หากยังมีข้อมูลเหลืออยู่จะทำคำสั่งภายในลูปไปเรื่อยๆ จนครบจำนวน	/data_lesson/lesson_08.gif	text
43	8	4	ตัวอย่างโค้ด For Loop	fruits = [\\"apple\\", \\"banana\\", \\"cherry\\"]\\nfor fruit in fruits:\\n    print(fruit)	\N	code
44	9	1	While Loop คืออะไร?	While Loop คือคำสั่งที่ใช้ทำซ้ำชุดคำสั่งเดิมตราบเท่าที่เงื่อนไขที่กำหนดไว้ยังคงเป็นจริง (True) เหมาะสำหรับการทำซ้ำที่ไม่ทราบจำนวนรอบที่แน่นอน	\N	text
45	9	2	ข้อควรระวังในการใช้	สิ่งที่สำคัญที่สุดคือต้องมีการปรับค่าตัวแปรในลูป เพื่อให้เงื่อนไขเป็นเท็จ (False) ในที่สุด มิฉะนั้นโปรแกรมจะทำงานไม่สิ้นสุด (Infinite Loop)	\N	text
46	9	3	แผนผังการทำงานของ While Loop	การทำงานจะเริ่มจากตรวจสอบเงื่อนไข หากเป็นจริงจะทำงานในลูปแล้ววนกลับไปเช็คเงื่อนไขใหม่ หากเป็นเท็จจะจบการทำงาน	/data_lesson/lesson_09.gif	text
47	9	4	ตัวอย่างโค้ด While Loop	count = 1\\nwhile count <= 5:\\n    print(\\"รอบที่:\\", count)\\n    count += 1	\N	code
48	10	1	ฟังก์ชันคืออะไร?	ฟังก์ชัน (Function) คือกลุ่มของคำสั่งที่ถูกเขียนขึ้นมาเพื่อทำงานเฉพาะอย่างหนึ่ง เมื่อต้องการใช้งานก็แค่เรียกใช้ฟังก์ชันนั้น ช่วยให้โค้ดสะอาดและนำกลับมาใช้ใหม่ได้ง่าย	\N	text
49	10	2	ประโยชน์ของการใช้ฟังก์ชัน	1. ช่วยแบ่งงานที่ซับซ้อนให้เป็นส่วนย่อยๆ\\n2. ลดการเขียนโค้ดซ้ำ (Reusable Code)\\n3. ง่ายต่อการแก้ไขและหาจุดผิด (Debugging)	\N	text
50	10	3	โครงสร้างของฟังก์ชัน	ใน Python ใช้คำสั่ง def ตามด้วยชื่อฟังก์ชัน และวงเล็บสำหรับรับค่า (Parameter) และจบด้วย : เพื่อเริ่มบล็อกของฟังก์ชัน	/data_lesson/lesson_10.gif	text
51	10	4	ตัวอย่างโค้ดสร้างฟังก์ชัน	def say_hello(name):\\n    print(\\"Hello, \\" + name)\\n\\n# การเรียกใช้งาน\\nsay_hello(\\"Python\\")	\N	code
52	11	1	พารามิเตอร์ (Parameters)	พารามิเตอร์คือตัวแปรที่รับค่าเข้าไปในฟังก์ชัน เพื่อให้ฟังก์ชันนำค่านั้นไปประมวลผล ทำให้ฟังก์ชันมีความยืดหยุ่นและนำไปใช้กับข้อมูลที่แตกต่างกันได้	\N	text
53	11	2	การส่งค่ากลับ (Return)	คำสั่ง return ใช้สำหรับส่งผลลัพธ์ที่ได้จากการประมวลผลในฟังก์ชันกลับไปยังจุดที่เรียกใช้ฟังก์ชันนั้น ทำให้เราสามารถนำผลลัพธ์ไปใช้งานต่อได้	\N	text
54	11	3	แผนภาพการทำงานของฟังก์ชัน	ภาพแสดงขั้นตอนการรับ Input (Parameter) เข้าสู่ฟังก์ชัน การประมวลผลภายใน และการส่ง Output กลับออกมา (Return)	/data_lesson/lesson_11.gif	text
55	11	4	ตัวอย่างโค้ด Parameters & Return	def add(a, b):\\n    return a + b\\n\\n# เรียกใช้ฟังก์ชันและเก็บผลลัพธ์\\nresult = add(5, 10)\\nprint(result) # ผลลัพธ์คือ 15	\N	code
56	12	1	List คืออะไร?	List คือชนิดข้อมูลที่ใช้เก็บข้อมูลหลายๆ ค่าไว้ในตัวแปรเดียว โดยข้อมูลจะถูกเก็บเรียงลำดับกันและสามารถเก็บข้อมูลต่างชนิดกันได้	\N	text
57	12	2	การเข้าถึงข้อมูลใน List	เราสามารถเข้าถึงข้อมูลแต่ละตัวใน List ได้ด้วยการใช้ Index (ตำแหน่ง) เริ่มต้นที่ 0 สำหรับตัวแรก และสามารถใช้ค่าติดลบเพื่ออ้างอิงจากด้านหลังได้	\N	text
58	12	3	แผนภาพการจัดเก็บข้อมูลใน List	ภาพแสดงโครงสร้างของ List ที่มีช่องเก็บข้อมูลเรียงลำดับจาก Index 0 ไปจนถึงตำแหน่งสุดท้าย	/data_lesson/lesson_12.gif	text
59	12	4	ตัวอย่างโค้ด List	my_list = [10, 20, 30, \\"Python\\"]\\n\\n# การเข้าถึงข้อมูล\\nprint(my_list[0])  # ผลลัพธ์: 10\\nprint(my_list[-1]) # ผลลัพธ์: Python	\N	code
64	13	1	Dictionary คืออะไร?	Dictionary เป็นโครงสร้างข้อมูลที่เก็บข้อมูลในรูปแบบคู่ของ Key และ Value ทำให้เราสามารถค้นหาหรือเข้าถึงข้อมูลได้รวดเร็วโดยใช้ Key แทนการใช้ลำดับ (Index)	\N	text
65	13	2	รูปแบบของ Dictionary	เราใช้เครื่องหมายปีกกา { } ในการกำหนด Dictionary โดยแต่ละคู่ของข้อมูลจะคั่นด้วยเครื่องหมายจุลภาค (comma) และคั่นระหว่าง Key กับ Value ด้วยเครื่องหมายโคลอน (:) 	\N	text
66	13	3	แผนภาพการทำงานของ Key-Value	ภาพเปรียบเทียบการเก็บข้อมูลแบบ Dictionary ที่เปรียบเหมือนสมุดโทรศัพท์ ซึ่งเราใช้ชื่อ (Key) เพื่อค้นหาเบอร์โทรศัพท์ (Value)	/data_lesson/lesson_13.gif	text
67	13	4	ตัวอย่างโค้ด Dictionary	student = {\\"name\\": \\"Somchai\\", \\"age\\": 20}\\n\\n# การเข้าถึงข้อมูลด้วย Key\\nprint(student[\\"name\\"])  # ผลลัพธ์: Somchai	\N	code
68	14	1	การจัดการไฟล์คืออะไร?	การอ่านและเขียนไฟล์ (File I/O) คือกระบวนการที่โปรแกรมติดต่อกับไฟล์ในเครื่องคอมพิวเตอร์ เพื่อดึงข้อมูลมาใช้งาน หรือบันทึกผลลัพธ์ลงในไฟล์เก็บไว้ใช้งานในภายหลัง	\N	text
69	14	2	โหมดการเปิดไฟล์	ในการเปิดไฟล์เราต้องระบุโหมดการทำงานที่เหมาะสม:\\n- 'r': อ่านไฟล์ (Read)\\n- 'w': เขียนไฟล์ (Write) - จะลบข้อมูลเดิม\\n- 'a': เพิ่มข้อมูล (Append) - ต่อท้ายข้อมูลเดิม	\N	text
70	14	3	ขั้นตอนการทำงานกับไฟล์	ภาพแสดงขั้นตอนตั้งแต่การเปิดไฟล์ การดำเนินการ (อ่าน/เขียน) และการปิดไฟล์ เพื่อความปลอดภัยของข้อมูล	/data_lesson/lesson_14.gif	text
71	14	4	ตัวอย่างโค้ดอ่าน/เขียนไฟล์	# การเขียนไฟล์\\nwith open(\\"test.txt\\", \\"w\\") as f:\\n    f.write(\\"Hello Python\\")\\n\\n# การอ่านไฟล์\\nwith open(\\"test.txt\\", \\"r\\") as f:\\n    print(f.read())	\N	code
72	14	1	การจัดการไฟล์คืออะไร?	การอ่านและเขียนไฟล์ (File I/O) คือกระบวนการที่โปรแกรมติดต่อกับไฟล์ในเครื่องคอมพิวเตอร์ เพื่อดึงข้อมูลมาใช้งาน หรือบันทึกผลลัพธ์ลงในไฟล์เก็บไว้ใช้งานในภายหลัง	\N	text
73	14	2	โหมดการเปิดไฟล์	ในการเปิดไฟล์เราต้องระบุโหมดการทำงานที่เหมาะสม:\\n- 'r': อ่านไฟล์ (Read)\\n- 'w': เขียนไฟล์ (Write) - จะลบข้อมูลเดิม\\n- 'a': เพิ่มข้อมูล (Append) - ต่อท้ายข้อมูลเดิม	\N	text
74	14	3	ขั้นตอนการทำงานกับไฟล์	ภาพแสดงขั้นตอนตั้งแต่การเปิดไฟล์ การดำเนินการ (อ่าน/เขียน) และการปิดไฟล์ เพื่อความปลอดภัยของข้อมูล	/data_lesson/lesson_14.gif	text
75	14	4	ตัวอย่างโค้ดอ่าน/เขียนไฟล์	# การเขียนไฟล์\\nwith open(\\"test.txt\\", \\"w\\") as f:\\n    f.write(\\"Hello Python\\")\\n\\n# การอ่านไฟล์\\nwith open(\\"test.txt\\", \\"r\\") as f:\\n    print(f.read())	\N	code
76	15	1	Try-Except คืออะไร?	Try-Except เป็นเครื่องมือสำหรับจัดการข้อผิดพลาด (Exception) ในขณะที่โปรแกรมทำงาน เพื่อป้องกันไม่ให้โปรแกรมหยุดการทำงานกระทันหันเมื่อเกิด Error ขึ้น	\N	text
77	15	2	ทำไมต้องจัดการ Error?	หากโปรแกรมเกิด Error แล้วไม่มีการจัดการ โปรแกรมจะหยุดทำงานทันที (Crash) การใช้ Try-Except ช่วยให้เราสามารถกำหนดขั้นตอนการแก้ไขหรือแจ้งเตือนผู้ใช้งานได้อย่างเหมาะสม	\N	text
78	15	3	การทำงานของ Try-Except	ภาพแสดงโครงสร้างการทำงาน: ส่วนที่สงสัยว่าจะมี Error จะอยู่ใน Try หากเกิด Error จะกระโดดไปทำงานที่บล็อก Except ทันที	/data_lesson/lesson_15.gif	text
79	15	4	ตัวอย่างโค้ด Try-Except	try:\\n    result = 10 / 0\\nexcept ZeroDivisionError:\\n    print(\\"ไม่สามารถหารด้วยศูนย์ได้!\\")	\N	code
\.


--
-- TOC entry 5652 (class 0 OID 26798)
-- Dependencies: 227
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (lesson_id, module_id, title, order_index, required_level) FROM stdin;
1	1	Hello World & print()	1	0
2	1	Comments และการเขียนโค้ด	2	0
3	1	Input จากผู้ใช้	3	0
4	2	ตัวแปร (Variables)	1	0
5	2	ชนิดข้อมูล (Data Types)	2	0
6	2	Type Conversion	3	0
7	3	If-Else	1	2
8	3	For Loop	2	2
9	3	While Loop	3	3
10	4	การสร้างฟังก์ชัน	1	4
11	4	Parameters & Return	2	5
12	5	List	1	6
13	5	Dictionary	2	7
14	6	อ่าน/เขียนไฟล์	1	8
15	6	Try-Except	2	9
\.


--
-- TOC entry 5656 (class 0 OID 26825)
-- Dependencies: 231
-- Data for Name: level_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level_config (id, question_id, title, option_description, "order", level) FROM stdin;
1	3	Beginner	ไม่เคยเขียนโปรแกรมมาก่อนเลย	1	1
2	3	Advanced	เคยเขียน Python หรือภาษาอื่นมาบ้าง ต้องการข้ามบทพื้นฐาน	2	10
\.


--
-- TOC entry 5657 (class 0 OID 26833)
-- Dependencies: 232
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (location_id, name, entry_fee, power_reliability, internet_speed) FROM stdin;
1	Home (My Room)	0.00	70	1.00
2	Starbugs Cafe	150.00	95	2.00
\.


--
-- TOC entry 5658 (class 0 OID 26839)
-- Dependencies: 233
-- Data for Name: mini_game_current_conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_current_conversations (user_id, exercise_id, dialogue_id, current_npc_id, current_location_id, updated_at) FROM stdin;
\.


--
-- TOC entry 5659 (class 0 OID 26843)
-- Dependencies: 234
-- Data for Name: mini_game_dialogues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_dialogues (dialogue_id, lesson_id, exercise_id, dialogue_order, exercise_order, dialogue_text, npc_id, npc_emotion, location_id, created_at, updated_at, dialogue_phase, branch_key) FROM stdin;
1	1	1	0	START	สวัสดีค่ะ ยินดีต้อนรับสู่ห้องเรียนเขียนโปรแกรม Python ลำดับแรกมาเรียนรู้ระบบกันก่อนนะคะ	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
2	1	1	1	START	ในด่านนี้เราจะมาฝึกคำนวณภาษีมูลค่าเพิ่ม (VAT 7%) กันค่ะ ลองเขียนโค้ดตามโจทย์ดูนะคะ	1	neutral	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
3	1	2	0	1A	ยินดีต้อนรับเข้าสู่ด่านเส้นทางวิทยาศาสตร์ 1A ค่ะ!	1	smile	1	2026-06-24 02:19:03	2026-06-25 08:00:00	pre_submit	default
4	1	2	1	1A	ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1A_2A หรือ 1A_2B เพื่อไปต่อค่ะ	1	happy	1	2026-06-24 02:19:03	2026-06-25 17:57:41	pre_submit	default
5	1	3	0	1B	ยินดีต้อนรับสู่ห้องแล็บฝั่งเวทมนตร์ 1B ครับผม	2	neutral	1	2026-06-24 02:19:03	2026-06-25 08:00:00	pre_submit	default
6	1	3	1	1B	ภารกิจของด่านนี้คือฝึกฝนการใช้คำสั่งพิมพ์คำว่า 1B_2A หรือ 1B_2B เพื่อไปต่อครับ	2	smile	1	2026-06-24 02:19:03	2026-06-25 08:00:00	pre_submit	default
7	1	4	0	1A_2A	ยินดีต้อนรับเข้าสู่ด่านสรุป 1A_2A ค่ะ คุณทำคะแนนได้ดีมาก!	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
8	1	4	1	1A_2A	พิมพ์คำสั่ง print(\\"success\\") เพื่อส่งงานและสรุปผลรับรางวัลชิ้นแรกกันเลย	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
9	1	5	0	1A_2B	เดินทางมาถึงด่านสรุป 1A_2B แล้วครับ เก่งมากเลย	2	neutral	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
10	1	5	1	1A_2B	พิมพ์ส่งคำตอบ print(\\"success\\") เพื่อตรวจสอบความถูกต้องขั้นสุดท้ายกันนะครับ	2	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
11	1	6	0	1B_2A	ในที่สุดคุณก็ฝ่าฟันมาถึงหอคอยเวทมนตร์สาย 1B_2A ได้สำเร็จแล้วค่ะ!	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
12	1	6	1	1B_2A	รวบรวมมานาแล้วพิมพ์ print(\\"success\\") เพื่อปลดล็อครางวัลของด่านนี้กันเลย	1	curious	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
13	1	7	0	1B_2B	ยินดีต้อนรับสู่โรงงานผลิตอาวุธเวทมนตร์ 1B_2B ครับ อุปกรณ์ทุกอย่างพร้อมแล้ว	2	neutral	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
14	1	7	1	1B_2B	มาเปิดสวิตช์เดินเครื่องจักรด้วยคำสั่ง print(\\"success\\") เพื่อจบการทำงานกันเถอะครับ	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
15	1	\N	0	end	ยินดีด้วยค่ะ! แบบทดสอบทั้งหมดได้จบลงเป็นที่เรียบร้อยแล้ว	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
16	1	\N	1	end	คุณได้ผ่านการเรียนรู้และทำภารกิจครบถ้วนแล้ว เก่งมากๆ เลยไว้เจอกันใหม่นะคะ!	1	smile	1	2026-06-24 02:19:03	2026-06-24 02:19:03	pre_submit	default
17	2	8	0	1	โจทย์ที่ 1: Mini 1: อธิบายโค้ดด้วยคอมเมนต์ ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
18	2	8	1	1	เพิ่ม comment 1 บรรทัด แล้วแสดงข้อความ \\"อ่านโค้ดง่ายขึ้น\\"	\N	neutral	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
19	2	9	0	2	โจทย์ที่ 2: Mini 2: ปิดโค้ดทดลองด้วยคอมเมนต์ ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
20	2	9	1	2	ใช้ # ปิดบรรทัด print(\\"debug\\") แล้วให้โปรแกรมแสดงเฉพาะ \\"พร้อมส่งงาน\\"	\N	neutral	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
21	2	10	0	3	โจทย์ที่ 3: Mini 3: โน้ตขั้นตอนก่อนรัน ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
22	2	10	1	3	เขียน comment บอกขั้นตอนสั้น ๆ แล้วแสดงข้อความ \\"โค้ดนี้มีคำอธิบาย\\"	\N	neutral	\N	2026-07-03 09:45:11	2026-07-03 09:45:11	pre_submit	default
23	4	11	0	1	โจทย์ที่ 1: Mini 1: เก็บชื่อคอร์ส ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
24	4	11	1	1	สร้างตัวแปร course เก็บคำว่า \\"Python\\" แล้วแสดงค่าตัวแปร	\N	neutral	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
25	4	12	0	2	โจทย์ที่ 2: Mini 2: คำนวณคะแนนรวม ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
26	4	12	1	2	สร้างตัวแปร score มีค่า 40 แล้วเพิ่มอีก 10 จากนั้นแสดงผลรวม	\N	neutral	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
27	4	13	0	3	โจทย์ที่ 3: Mini 3: รวมข้อความจากตัวแปร ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
28	4	13	1	3	สร้างตัวแปร first และ last แล้วแสดง \\"Lumi Python\\"	\N	neutral	\N	2026-07-03 16:09:30	2026-07-03 16:09:30	pre_submit	default
29	15	14	0	1	โจทย์ที่ 1: Mini 1: เริ่มโจทย์ Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
30	15	14	1	1	เขียนโปรแกรม Python แสดงข้อความ \\"พร้อมเรียน Try-Except\\"	\N	neutral	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
31	15	15	0	2	โจทย์ที่ 2: Mini 2: ทบทวน Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
32	15	15	1	2	สร้างตัวแปร status เก็บคำว่า \\"เข้าใจแล้ว\\" แล้วแสดงผล	\N	neutral	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
33	15	16	0	3	โจทย์ที่ 3: Mini 3: ปิดท้าย Try-Except ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
34	15	16	1	3	แสดงข้อความ \\"ผ่านมินิเกมแล้ว\\" เพื่อจบบทนี้	\N	neutral	\N	2026-07-03 19:56:55	2026-07-03 19:56:55	pre_submit	default
35	3	17	0	1	โจทย์ที่ 1: Mini 1: รับชื่อผู้เล่น ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
36	3	17	1	1	รับชื่อ 1 ค่า แล้วแสดงคำทักทายในรูปแบบ \\"สวัสดี <ชื่อ>\\"	\N	neutral	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
37	3	18	0	2	โจทย์ที่ 2: Mini 2: รับของโปรด ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
38	3	18	1	2	รับชื่ออาหาร 1 ค่า แล้วแสดง \\"ฉันชอบ <อาหาร>\\"	\N	neutral	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
39	3	19	0	3	โจทย์ที่ 3: Mini 3: รับตัวเลขแล้วสะท้อนผล ลองอ่าน Hint แล้วเติมโค้ดให้ผ่านนะคะ	\N	smile	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
40	3	19	1	3	รับตัวเลข 1 ค่า แล้วแสดง \\"เลขที่เลือกคือ <ตัวเลข>\\"	\N	neutral	\N	2026-07-03 19:57:43	2026-07-03 19:57:43	pre_submit	default
\.


--
-- TOC entry 5661 (class 0 OID 26865)
-- Dependencies: 236
-- Data for Name: mini_game_exercise_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_exercise_submissions (submission_id, user_id, exercise_id, submitted_code, submitted_at) FROM stdin;
1	9	1	price = float(input(\\"ซื้อสินค้าราคา: \\"))\\r\\n\\r\\n# คำนวณราคารวมภาษี\\r\\nvat_total = price * 1.07\\r\\n\\r\\n# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ\\r\\nprint(\\"ราคารวมทั้งหมดคือ:\\", vat_total)	2026-07-03 09:09:11
2	9	3	print(\\" 1B_2B \\")	2026-07-02 23:04:53
5	9	6	print(\\"success\\")	2026-06-26 20:26:54
7	9	2	print(\\"1A_2B\\")	2026-07-02 22:27:00
8	9	5	print(\\"success\\")	2026-07-02 22:27:06
11	9	4	print(\\"success\\")	2026-06-26 22:32:34
16	9	7	print(\\"  success\\")	2026-07-02 23:04:58
109	11	1	price = float(input(\\"ซื้อสินค้าราคา: \\"))\\r\\n\\r\\n# คำนวณราคารวมภาษี\\r\\nvat_total = price * 1.07\\r\\n\\r\\n# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ\\r\\nprint(\\"ราคารวมทั้งหมดคือ:\\", vat_total)	2026-07-01 17:16:16
110	11	2	print(\\" 1A_2A\\")	2026-07-01 17:16:52
111	11	4	print(\\"success\\")	2026-07-01 17:17:05
166	9	8	# เขียนคำอธิบายโค้ดตรงนี้\\nprint(\\"        อ่านโค้ดง่ายขึ้น\\")	2026-07-03 09:45:35
167	9	17	name = input(\\"ชื่อของคุณ: \\")\\nprint(\\"สวัสดี\\", name)	2026-07-03 19:58:17
\.


--
-- TOC entry 5660 (class 0 OID 26854)
-- Dependencies: 235
-- Data for Name: mini_game_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_exercises (exercise_id, lesson_id, exercise_order, title, description, starter_code, solution_code, test_cases_json, xp_reward, currency_reward, created_at, updated_at, is_active) FROM stdin;
1	1	START	จุดเริ่มต้นของทางแยก	เขียนคำสั่งคำนวณภาษีมูลค่าเพิ่ม 7% (VAT 7%) จากซื้อสินค้าที่ป้อนเข้ามา แล้วแสดงราคารวมทั้งหมดออกทางหน้าจอ\\r\\n(ระบบจะตรวจสอบจากราคารวมภาษี: หากราคารวมภาษีมากกว่า 500 จะไปทางเลือก 1A, ถ้าน้อยกว่าหรือเท่ากับ 500 จะไปทางเลือก 1B)		price = float(input(\\"ซื้อสินค้าราคา: \\"))\\r\\n\\r\\n# คำนวณราคารวมภาษี\\r\\nvat_total = price * 1.07\\r\\n\\r\\n# TODO: แสดงผลราคารวมทั้งหมดให้ถูกต้องตามรูปแบบ\\r\\nprint(\\"ราคารวมทั้งหมดคือ:\\", vat_total)	{\\"expected_format\\": \\"ราคารวมทั้งหมดคือ: {total}\\",\\"rules\\": [{ \\"condition\\": \\"float > 500\\", \\"branch_key\\": \\"1A\\" },{ \\"condition\\": \\"float <= 500\\", \\"branch_key\\": \\"1B\\" }],\\"correctness\\": [{ \\"input\\": \\"100\\", \\"expected\\": \\"ราคารวมทั้งหมดคือ: 107.0\\" },{ \\"input\\": \\"250\\", \\"expected\\": \\"ราคารวมทั้งหมดคือ: 267.5\\" },{ \\"input\\": \\"500\\", \\"expected\\": \\"ราคารวมทั้งหมดคือ: 535.0\\" },{ \\"input\\": \\"700\\", \\"expected\\": \\"ราคารวมทั้งหมดคือ: 749.0\\" },{ \\"input\\": \\"1000\\", \\"expected\\": \\"ราคารวมทั้งหมดคือ: 1070.0\\" }]}	15	5	2026-06-20 15:00:56	2026-07-02 17:36:39	1
2	1	1A	เส้นทางวิทยาศาสตร์ 1A	ยินดีต้อนรับสู่เส้นทาง 1A พิมพ์ 1A_2A หรือ 1A_2B เพื่อไปต่อ	print(\\"\\")	print(\\"\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == '1A_2A'\\", \\"branch_key\\": \\"1A_2A\\"}, {\\"condition\\": \\"value == '1A_2B'\\", \\"branch_key\\": \\"1A_2B\\"}]}	20	10	2026-06-20 15:00:56	2026-06-26 22:47:58	1
3	1	1B	เส้นทางเวทมนตร์ 1B	ยินดีต้อนรับสู่เส้นทาง 1B พิมพ์ 1B_2A หรือ 1B_2B เพื่อไปต่อ	print(\\"\\")	print(\\"\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == '1B_2A'\\", \\"branch_key\\": \\"1B_2A\\"}, {\\"condition\\": \\"value == '1B_2B'\\", \\"branch_key\\": \\"1B_2B\\"}]}	20	10	2026-06-20 15:00:56	2026-06-26 22:48:09	1
4	1	1A_2A	บทสรุปสายวิชาการ 1A_2A	ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2A แล้ว พิมพ์ print(\\"success\\") เพื่อจบด่าน	print(\\"\\")	print(\\"success\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == 'success'\\", \\"branch_key\\": \\"end\\"}]}	30	15	2026-06-20 15:00:56	2026-06-25 08:00:00	1
5	1	1A_2B	บทสรุปสายวิชาการ 1A_2B	ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1A_2B แล้ว พิมพ์ print(\\"success\\") เพื่อจบด่าน	print(\\"\\")	print(\\"success\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == 'success'\\", \\"branch_key\\": \\"end\\"}]}	30	15	2026-06-20 15:00:56	2026-06-25 08:00:00	1
6	1	1B_2A	บทสรุปสายเวทมนตร์ 1B_2A	ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2A แล้ว พิมพ์ print(\\"success\\") เพื่อจบด่าน	print(\\"\\")	print(\\"success\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == 'success'\\", \\"branch_key\\": \\"end\\"}]}	30	15	2026-06-20 15:00:56	2026-06-25 08:00:00	1
7	1	1B_2B	บทสรุปสายเวทมนตร์ 1B_2B	ยินดีด้วยคุณมาถึงจุดสิ้นสุดของสาย 1B_2B แล้ว พิมพ์ print(\\"success\\") เพื่อจบด่าน	print(\\"\\")	print(\\"success\\")	{\\"expected_format\\": \\"{value}\\", \\"rules\\": [{\\"condition\\": \\"value == 'success'\\", \\"branch_key\\": \\"end\\"}]}	30	15	2026-06-20 15:00:56	2026-06-25 08:00:00	1
8	2	1	Mini 1: อธิบายโค้ดด้วยคอมเมนต์	เพิ่ม comment 1 บรรทัด แล้วแสดงข้อความ \\"อ่านโค้ดง่ายขึ้น\\"	# เขียนคำอธิบายโค้ดตรงนี้\\nprint(\\"อ่านโค้ดง่ายขึ้น\\")	# แสดงข้อความว่าคอมเมนต์ช่วยให้อ่านง่าย\\nprint(\\"อ่านโค้ดง่ายขึ้น\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"อ่านโค้ดง่ายขึ้น\\"}]	15	5	2026-07-03 09:45:11	2026-07-03 09:45:11	1
9	2	2	Mini 2: ปิดโค้ดทดลองด้วยคอมเมนต์	ใช้ # ปิดบรรทัด print(\\"debug\\") แล้วให้โปรแกรมแสดงเฉพาะ \\"พร้อมส่งงาน\\"	# print(\\"debug\\")\\nprint(\\"พร้อมส่งงาน\\")	# print(\\"debug\\")\\nprint(\\"พร้อมส่งงาน\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"พร้อมส่งงาน\\"}]	20	5	2026-07-03 09:45:11	2026-07-03 09:45:11	1
10	2	3	Mini 3: โน้ตขั้นตอนก่อนรัน	เขียน comment บอกขั้นตอนสั้น ๆ แล้วแสดงข้อความ \\"โค้ดนี้มีคำอธิบาย\\"	# 1. เตรียมข้อความ\\nprint(\\"โค้ดนี้มีคำอธิบาย\\")	# 1. เตรียมข้อความ\\nprint(\\"โค้ดนี้มีคำอธิบาย\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"โค้ดนี้มีคำอธิบาย\\"}]	25	5	2026-07-03 09:45:11	2026-07-03 09:45:11	1
11	4	1	Mini 1: เก็บชื่อคอร์ส	สร้างตัวแปร course เก็บคำว่า \\"Python\\" แล้วแสดงค่าตัวแปร	course = \\"Python\\"\\nprint(course)	course = \\"Python\\"\\nprint(course)	[{\\"input\\":\\"\\",\\"expected\\":\\"Python\\"}]	15	5	2026-07-03 16:09:30	2026-07-03 16:09:30	1
12	4	2	Mini 2: คำนวณคะแนนรวม	สร้างตัวแปร score มีค่า 40 แล้วเพิ่มอีก 10 จากนั้นแสดงผลรวม	score = 40\\nscore = score + 10\\nprint(score)	score = 40\\nscore = score + 10\\nprint(score)	[{\\"input\\":\\"\\",\\"expected\\":\\"50\\"}]	20	5	2026-07-03 16:09:30	2026-07-03 16:09:30	1
13	4	3	Mini 3: รวมข้อความจากตัวแปร	สร้างตัวแปร first และ last แล้วแสดง \\"Lumi Python\\"	first = \\"Lumi\\"\\nlast = \\"Python\\"\\nprint(first, last)	first = \\"Lumi\\"\\nlast = \\"Python\\"\\nprint(first, last)	[{\\"input\\":\\"\\",\\"expected\\":\\"Lumi Python\\"}]	25	5	2026-07-03 16:09:30	2026-07-03 16:09:30	1
14	15	1	Mini 1: เริ่มโจทย์ Try-Except	เขียนโปรแกรม Python แสดงข้อความ \\"พร้อมเรียน Try-Except\\"	print(\\"พร้อมเรียน Try-Except\\")	print(\\"พร้อมเรียน Try-Except\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"พร้อมเรียน Try-Except\\"}]	15	5	2026-07-03 19:56:55	2026-07-03 19:56:55	1
15	15	2	Mini 2: ทบทวน Try-Except	สร้างตัวแปร status เก็บคำว่า \\"เข้าใจแล้ว\\" แล้วแสดงผล	status = \\"เข้าใจแล้ว\\"\\nprint(status)	status = \\"เข้าใจแล้ว\\"\\nprint(status)	[{\\"input\\":\\"\\",\\"expected\\":\\"เข้าใจแล้ว\\"}]	20	5	2026-07-03 19:56:55	2026-07-03 19:56:55	1
16	15	3	Mini 3: ปิดท้าย Try-Except	แสดงข้อความ \\"ผ่านมินิเกมแล้ว\\" เพื่อจบบทนี้	print(\\"ผ่านมินิเกมแล้ว\\")	print(\\"ผ่านมินิเกมแล้ว\\")	[{\\"input\\":\\"\\",\\"expected\\":\\"ผ่านมินิเกมแล้ว\\"}]	25	5	2026-07-03 19:56:55	2026-07-03 19:56:55	1
17	3	1	Mini 1: รับชื่อผู้เล่น	รับชื่อ 1 ค่า แล้วแสดงคำทักทายในรูปแบบ \\"สวัสดี <ชื่อ>\\"	name = input(\\"ชื่อของคุณ: \\")\\nprint(\\"สวัสดี\\", name)	name = input(\\"ชื่อของคุณ: \\")\\nprint(\\"สวัสดี\\", name)	[{\\"input\\":\\"Lumi\\",\\"expected\\":\\"สวัสดี Lumi\\"},{\\"input\\":\\"PySim\\",\\"expected\\":\\"สวัสดี PySim\\"}]	15	5	2026-07-03 19:57:43	2026-07-03 19:57:43	1
18	3	2	Mini 2: รับของโปรด	รับชื่ออาหาร 1 ค่า แล้วแสดง \\"ฉันชอบ <อาหาร>\\"	food = input(\\"อาหารที่ชอบ: \\")\\nprint(\\"ฉันชอบ\\", food)	food = input(\\"อาหารที่ชอบ: \\")\\nprint(\\"ฉันชอบ\\", food)	[{\\"input\\":\\"ราเมง\\",\\"expected\\":\\"ฉันชอบ ราเมง\\"},{\\"input\\":\\"ข้าวผัด\\",\\"expected\\":\\"ฉันชอบ ข้าวผัด\\"}]	20	5	2026-07-03 19:57:43	2026-07-03 19:57:43	1
19	3	3	Mini 3: รับตัวเลขแล้วสะท้อนผล	รับตัวเลข 1 ค่า แล้วแสดง \\"เลขที่เลือกคือ <ตัวเลข>\\"	number = input(\\"เลือกเลข: \\")\\nprint(\\"เลขที่เลือกคือ\\", number)	number = input(\\"เลือกเลข: \\")\\nprint(\\"เลขที่เลือกคือ\\", number)	[{\\"input\\":\\"7\\",\\"expected\\":\\"เลขที่เลือกคือ 7\\"},{\\"input\\":\\"21\\",\\"expected\\":\\"เลขที่เลือกคือ 21\\"}]	25	5	2026-07-03 19:57:43	2026-07-03 19:57:43	1
\.


--
-- TOC entry 5662 (class 0 OID 26871)
-- Dependencies: 237
-- Data for Name: mini_game_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_locations (location_id, location_key, name, description, bg_image_url, created_at, updated_at) FROM stdin;
1	python_lab	ห้องเรียน	ห้องเรียนปกติธรรมดาไม่มีอะไรเป็นพิเศษ	/data_MiNiGame/locations/classroom.jpg	2026-06-20 22:00:56	2026-06-24 16:28:24
\.


--
-- TOC entry 5663 (class 0 OID 26879)
-- Dependencies: 238
-- Data for Name: mini_game_npcs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_npcs (npc_id, npc_key, name, avatar_asset_url, description, created_at, updated_at) FROM stdin;
1	lumi	Lumi	/data_MiNiGame/NPC_lumi	lumi แสนน่ารักที่สุดในโลก	2026-06-20 22:00:56	2026-06-25 16:36:40
2	system	System	\N	ระบบจัดการสถานการณ์ของเกม	2026-06-20 22:00:56	2026-06-20 22:00:56
\.


--
-- TOC entry 5664 (class 0 OID 26887)
-- Dependencies: 239
-- Data for Name: mini_game_user_exercise_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mini_game_user_exercise_progress (progress_id, user_id, exercise_id, xp_reward, currency_reward, updated_at, is_completed, selected_branch_key, score) FROM stdin;
1	9	1	15	5	2026-07-03 09:09:11	0	default	0
12	9	2	20	10	2026-07-02 22:27:00	0	default	0
13	9	4	30	15	2026-06-26 22:32:34	0	default	0
29	11	1	15	5	2026-07-01 17:16:16	0	default	0
30	11	2	20	10	2026-07-01 17:16:52	0	default	0
31	11	4	30	15	2026-07-01 17:17:05	0	default	0
37	9	5	30	15	2026-07-02 22:27:06	0	default	0
51	9	3	20	10	2026-07-02 23:04:53	0	default	0
52	9	7	30	15	2026-07-02 23:04:58	0	default	0
86	9	8	15	5	2026-07-03 09:45:35	0	default	0
87	9	17	15	5	2026-07-03 19:58:17	0	default	0
89	9	18	20	5	2026-07-03 19:58:26	0	default	0
90	14	1	15	5	2026-07-03 21:33:03	0	default	0
91	14	2	20	10	2026-07-03 21:33:15	0	default	0
92	14	4	30	15	2026-07-03 21:33:34	0	default	0
93	14	8	15	5	2026-07-03 21:34:30	0	default	0
94	14	9	20	5	2026-07-03 21:34:36	0	default	0
95	14	10	25	5	2026-07-03 21:34:43	0	default	0
\.


--
-- TOC entry 5665 (class 0 OID 26893)
-- Dependencies: 240
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (module_id, title, order_index, required_level) FROM stdin;
1	พื้นฐาน Python	1	0
2	ตัวแปรและชนิดข้อมูล	2	0
3	เงื่อนไขและลูป	3	2
4	ฟังก์ชัน	4	4
5	โครงสร้างข้อมูล	5	6
6	ไฟล์และ Exception	6	8
\.


--
-- TOC entry 5689 (class 0 OID 27425)
-- Dependencies: 264
-- Data for Name: multiplayer_challenges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.multiplayer_challenges (challenge_id, title, description, difficulty, reward, time_limit, test_cases, created_by, created_at, is_test, expires_at) FROM stdin;
7	หาเลขที่มากที่สุด	กำหนดตัวเลขมาให้ n จำนวน ให้เขียนโปรแกรมเพื่อหาเลขที่มีค่ามากที่สุด\n\nข้อมูลนำเข้า:\nบรรทัดแรกเป็นจำนวนเต็ม n\nบรรทัดที่สองเป็นตัวเลขจำนวนเต็ม n ตัว\n\nผลลัพธ์:\nแสดงเลขที่มีค่ามากที่สุดออกมา	Easy	300	300	[{"input": "5\\n1 9 3 7 2", "expected": "9"}]	16	2026-07-28 20:12:35.631767	0	2026-07-29 13:12:35.63
8	นับจำนวนเลขคู่	กำหนดตัวเลขมาให้ n จำนวน ให้เขียนโปรแกรมนับว่ามีเลขคู่ทั้งหมดกี่ตัว\n\nข้อมูลนำเข้า:\nบรรทัดแรกเป็นจำนวนเต็ม n\nบรรทัดที่สองเป็นตัวเลขจำนวนเต็ม n ตัว\n\nผลลัพธ์:\nแสดงจำนวนเลขคู่ทั้งหมดออกมา	Easy	300	300	[{"input": "6\\n1 2 3 4 5 6", "expected": "3"}, {"input": "5\\n7 9 11 13 15", "expected": "0"}, {"input": "4\\n-2 -1 0 8", "expected": "3"}]	16	2026-07-29 20:45:24.73878	0	2026-07-30 13:45:24.738
9	คำนวณค่าไฟประจำเดือน	ให้เขียนโปรแกรม Python รับจำนวนหน่วยไฟฟ้าที่ใช้ในเดือนนั้น แล้วคำนวณค่าไฟตามเงื่อนไขนี้\n1 ถึง 50 หน่วยแรก หน่วยละ 3 บาท\nหน่วยที่ 51 ถึง 100 หน่วยละ 4 บาท\nหน่วยที่เกิน 100 หน่วย หน่วยละ 5 บาท	Easy	100	300	[{"input": "40", "expected": "120"}, {"input": "75", "expected": "250"}, {"input": "120", "expected": "550"}]	16	2026-08-16 02:11:42.682361	0	2026-08-16 19:11:42.681
10	หาคะแนนสูงสุด	ให้เขียนโปรแกรม Python รับจำนวนเต็ม n จากบรรทัดแรก จากนั้นรับคะแนนจำนวน n ค่าในบรรทัดถัดไป โดยคะแนนคั่นด้วยช่องว่าง\nให้โปรแกรมหาคะแนนที่มากที่สุด แล้วแสดงคะแนนนั้นออกมา	Easy	200	300	[{"input": "5\\n70 88 95 60 81", "expected": "95"}, {"input": "4\\n10 10 9 8", "expected": "10"}, {"input": "6\\n-5 -2 -9 -1 -7 -3", "expected": "-1"}]	16	2026-08-16 03:11:11.415684	0	2026-08-16 20:11:11.414
11	กลับคำในประโยค	ให้เขียนโปรแกรม Python รับข้อความ 1 บรรทัด\nจากนั้นให้แยกคำด้วยช่องว่าง แล้วแสดงคำทั้งหมดเรียงจากหลังมาหน้า	Admin	100	300	[{"input": "hello world", "expected": "world hello"}, {"input": "I love Python", "expected": "Python love I"}, {"input": "coding is fun", "expected": "fun is coding"}]	10	2026-08-16 04:55:18.717759	0	2026-08-16 21:55:18.715
12	พิมพ์เลขคู่จาก 1 ถึง N	ให้เขียนโปรแกรม Python รับจำนวนเต็ม n\nจากนั้นให้แสดงเลขคู่ทั้งหมดตั้งแต่ 1 ถึง n โดยคั่นแต่ละตัวด้วยช่องว่าง\nถ้าไม่มีเลขคู่ ให้แสดงคำว่า ไม่มีเลขคู่	Admin	200	300	[{"input": "10", "expected": "2 4 6 8 10"}, {"input": "7", "expected": "2 4 6"}, {"input": "1", "expected": "ไม่มีเลขคู่"}]	10	2026-08-16 06:10:50.825422	0	2026-08-16 23:10:50.824
13	ตรวจสอบอุณหภูมิ	ให้เขียนโปรแกรม Python รับค่าอุณหภูมิเป็นจำนวนเต็ม 1 ค่า\nจากนั้นให้แสดงผลตามเงื่อนไขต่อไปนี้\nถ้าอุณหภูมิน้อยกว่า 20 ให้แสดงคำว่า หนาว\nถ้าอุณหภูมิอยู่ระหว่าง 20 ถึง 30 ให้แสดงคำว่า ปกติ\nถ้าอุณหภูมิมากกว่า 30 ให้แสดงคำว่า ร้อน\n	Easy	200	300	[{"input": "8", "expected": "เลขคู่"}, {"input": "7", "expected": "เลขคี่"}, {"input": "0", "expected": "เลขคู่"}]	16	2026-08-16 15:17:47.15293	0	2026-08-17 08:17:47.151
\.


--
-- TOC entry 5691 (class 0 OID 27437)
-- Dependencies: 266
-- Data for Name: multiplayer_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.multiplayer_sessions (session_id, mode, status, current_round, created_at) FROM stdin;
\.


--
-- TOC entry 5692 (class 0 OID 27443)
-- Dependencies: 267
-- Data for Name: multiplayer_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.multiplayer_submissions (submission_id, session_id, user_id, challenge_id, code, score, passed_cases, total_cases, ai_feedback, submitted_at, efficiency_ms, breakdown) FROM stdin;
4	\N	16	8	n = int(input())\r\nnums = list(map(int, input().split()))\r\ncount = 0\r\n\r\nfor x in nums:\r\n    if x % 2 == 0:\r\n        count += 1\r\n\r\nprint(count)	0	0	3	{"review": "Time limit exceeded. This challenge receives 0 score."}	2026-07-29 21:00:09.586336	0	{"correctness":0,"complexity":0,"cleanCode":0,"speedBonus":0,"elapsedSeconds":null,"timeExpired":true}
5	\N	11	7	# หาเลขที่มากที่สุด\n# Read input with input(), then print the answer.\n# Example:\n# n = int(input())\n# values = list(map(int, input().split()))\n# print(max(values))\n	0	0	1	{"review": "Time limit exceeded. This challenge receives 0 score."}	2026-08-16 01:38:28.441771	300000	{"correctness":0,"complexity":0,"cleanCode":0,"speedBonus":0,"elapsedSeconds":null,"timeExpired":true}
6	\N	11	9	units = int(input())\r\n\r\nif units <= 50:\r\n    total = units * 3\r\nelif units <= 100:\r\n    total = (50 * 3) + ((units - 50) * 4)\r\nelse:\r\n    total = (50 * 3) + (50 * 4) + ((units - 100) * 10)\r\n\r\nprint(total)	97	3	3	{"review": "Rubric score: correctness 50/50, complexity 15/20, clean code 30/30. Speed tie-breaker +2. AI review is temporarily unavailable, so this score used automated test results and local rubric fallback."}	2026-08-16 02:14:41.009004	155000	{"correctness":50,"complexity":15,"cleanCode":30,"speedBonus":2,"elapsedSeconds":155,"aiReviewed":false,"aiApproved":true,"aiVerdict":"fallback","aiUnavailable":true}
7	\N	11	10	n = int(input())\r\nscores = list(map(int, input().split()))\r\n	0	0	3	{"review": "Time limit exceeded. This challenge receives 0 score."}	2026-08-16 03:17:00.968335	300000	{"correctness":0,"complexity":0,"cleanCode":0,"speedBonus":0,"elapsedSeconds":null,"timeExpired":true}
8	\N	11	11	print(" ".join(input().split()[::-1]))	98	3	3	{"review": "Rubric score: correctness 50/50, complexity 15/20, clean code 30/30. Speed tie-breaker +3. AI review is temporarily unavailable, so this score used automated test results and local rubric fallback."}	2026-08-16 04:56:25.268027	30000	{"correctness":50,"complexity":15,"cleanCode":30,"speedBonus":3,"elapsedSeconds":30,"aiReviewed":false,"aiApproved":true,"aiVerdict":"fallback","aiUnavailable":true}
9	\N	16	13	\r\ntemp = int(input())\r\n\r\nif temp < 20:\r\n    print("หนาว")\r\nelif temp <= 30:\r\n    print("ปกติ")\r\nelse:\r\n    print("ร้อน")\r\n	48	0	3	{"review": "Rubric score: correctness 0/50, complexity 15/20, clean code 30/30. Speed tie-breaker +3. AI review is temporarily unavailable, so this score used automated test results and local rubric fallback."}	2026-08-16 15:19:14.668359	53000	{"correctness":0,"complexity":15,"cleanCode":30,"speedBonus":3,"elapsedSeconds":53,"aiReviewed":false,"aiApproved":false,"aiVerdict":"fallback","aiUnavailable":true}
\.


--
-- TOC entry 5666 (class 0 OID 26898)
-- Dependencies: 241
-- Data for Name: music_tracks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.music_tracks (track_id, track_name, file_path, is_default) FROM stdin;
\.


--
-- TOC entry 5755 (class 0 OID 27757)
-- Dependencies: 330
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token_hash, expires_at, used_at, created_at) FROM stdin;
\.


--
-- TOC entry 5667 (class 0 OID 26902)
-- Dependencies: 242
-- Data for Name: question_choices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_choices (choice_id, question_id, choice_text) FROM stdin;
1	1	print()
2	1	echo()
3	1	write()
4	1	console.log()
5	4	print(\\"สวัสดี\\")
6	4	echo(\\"สวัสดี\\")
7	4	say \\"สวัสดี\\"
8	4	output(\\"สวัสดี\\")
9	5	Compiled
10	5	Interpreted
11	5	Assembly
12	5	Machine Language
13	6	#
14	6	//
15	6	/*
16	6	--
17	7	ไม่มีผล
18	7	ทำให้โปรแกรมเร็วขึ้น
19	7	ทำให้เกิด Error
20	7	แสดงผลบนหน้าจอ
21	8	Comment
22	8	ตัวแปร
23	8	ฟังก์ชัน
24	8	Operator
25	9	# This is a comment
26	9	// This is a comment
27	9	/* This is a comment */
28	9	-- This is a comment
29	10	input()
30	10	read()
31	10	scanf()
32	10	get()
33	11	str
34	11	int
35	11	float
36	11	bool
37	12	str
38	12	int
39	12	float
40	12	list
41	13	ใช้ int(input())
42	13	ใช้ input(int)
43	13	ใช้ number(input())
44	13	ไม่ต้องทำอะไร
45	14	def
46	14	func
47	14	define
48	14	create
49	15	return
50	15	send
51	15	give
52	15	back
53	16	ชื่อฟังก์ชัน()
54	16	call ชื่อฟังก์ชัน
55	16	run ชื่อฟังก์ชัน
56	16	ชื่อฟังก์ชัน[]
57	17	None
58	17	0
59	17	Error
60	17	False
61	14	กล่องเก็บข้อมูล
62	14	ฟังก์ชัน
63	14	คำสั่งเงื่อนไข
64	14	โมดูล
65	15	จำเป็นต้องระบุ
66	15	ไม่จำเป็น
67	15	ระบุเฉพาะตัวเลข
68	15	ระบุเฉพาะข้อความ
69	16	1st_name
70	16	my-variable
71	16	my_variable
72	16	class
73	17	int
74	17	str
75	17	float
76	17	bool
77	22	เก็บข้อมูลไว้ใช้งาน
78	22	แสดงผลลัพธ์
79	22	รับข้อมูลจากคีย์บอร์ด
80	22	สร้างเงื่อนไข
81	23	ห้ามขึ้นต้นด้วยตัวเลข
82	23	ห้ามใช้ตัวอักษร
83	23	ห้ามเว้นวรรค
84	23	ต้องเป็นตัวพิมพ์ใหญ่เท่านั้น
85	24	ตัวเลขทศนิยม
86	24	ข้อความ
87	24	ตัวเลขจำนวนเต็ม
88	24	ค่าความจริง
89	25	int()
90	25	float()
91	25	str()
92	25	bool()
93	26	int
94	26	float
95	26	str
96	26	bool
97	27	print()
98	27	input()
99	27	type()
100	27	len()
101	29	print()
102	29	input()
103	29	type()
104	29	len()
109	26	int
110	26	float
111	26	str
112	26	bool
113	27	print()
114	27	input()
115	27	type()
116	27	len()
117	28	int
118	28	str
119	28	float
120	28	bool
125	32	1
126	32	2
127	32	3
128	32	4
129	31	ข้อความ
130	31	จำนวนเต็ม
131	31	ค่าจริง
132	31	ตัวเลขทศนิตม
141	37	ค่าความจริง
142	37	ข้อความ
143	37	ตัวเลข
144	37	ลิสต์
145	38	52
146	38	7
147	38	Error
148	38	5.0
149	40	if
150	40	for
151	40	while
152	40	def
153	41	if
154	41	else
155	41	elif
156	41	print
157	43	;
158	43	:
159	43	{
160	43	}
161	44	if
162	44	elif
163	44	else
164	44	then
165	46	for
166	46	while
167	46	if
168	46	def
169	47	range()
170	47	list()
171	47	input()
172	47	print()
173	49	ได้
174	49	ไม่ได้
175	49	ต้องแปลงเป็น int ก่อน
176	49	ต้องใช้ while เท่านั้น
177	50	stop
178	50	break
179	50	exit
180	50	return
197	52	while
198	52	for
199	52	if
200	52	loop
201	53	string
202	53	integer
203	53	boolean
204	53	float
205	55	ระบุจำนวนรอบไม่ได้
206	55	ทำงานเร็วขึ้น
207	55	ใช้งานง่ายกว่า
208	55	ใช้กับ List เท่านั้น
209	56	break
210	56	stop
211	56	exit
212	56	pass
213	58	def
214	58	function
215	58	func
216	58	define
217	59	[]
218	59	()
219	59	{}
220	59	<>
221	61	output
222	61	return
223	61	send
224	61	give
225	62	0
226	62	False
227	62	None
228	62	Error
229	64	Parameter
230	64	Argument
231	64	Variable
232	64	Function
233	65	Parameter
234	65	Argument
235	65	Input
236	65	Return
237	67	print
238	67	return
239	67	get
240	67	input
241	68	ได้
242	68	ไม่ได้
243	68	ต้องใช้ list
244	68	ต้องใช้ tuple
245	70	()
246	70	{}
247	70	[]
248	70	<>
249	71	0
250	71	1
251	71	-1
252	71	None
253	73	add()
254	73	append()
255	73	insert()
256	73	push()
257	74	size()
258	74	count()
259	74	len()
260	74	length()
261	76	()
262	76	[]
263	76	{}
264	76	<>
265	77	key และ value
266	77	index และ value
267	77	list และ tuple
268	77	id และ data
269	79	index
270	79	key
271	79	position
272	79	name
273	80	is
274	80	in
275	80	has
276	80	exists
373	82	open()
374	82	read()
375	82	file()
376	82	load()
377	83	Read
378	83	Write
379	83	Append
380	83	Binary
381	85	save()
382	85	close()
383	85	end()
384	85	exit()
385	86	ปิดไฟล์อัตโนมัติ
386	86	เขียนไฟล์เร็วขึ้น
387	86	อ่านไฟล์ได้มากขึ้น
388	86	ลบไฟล์
389	88	try
390	88	except
391	88	catch
392	88	finally
393	89	try
394	89	except
395	89	else
396	89	finally
397	91	try
398	91	except
399	91	else
400	91	finally
401	92	โปรแกรมค้าง
402	92	โค้ดทำงานเร็วขึ้น
403	92	ไฟล์เสียหาย
404	92	หน่วยความจำเต็ม
405	33	int()
406	33	float()
407	33	str()
408	33	bool()
409	34	int()
410	34	float()
411	34	str()
412	34	bool()
\.


--
-- TOC entry 5668 (class 0 OID 26907)
-- Dependencies: 243
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quiz_questions (question_id, quiz_id, question_text, question_type, correct_answer, question_order) FROM stdin;
1	1	คำสั่งใดใช้แสดงผลข้อความใน Python?	choice	print()	1
2	1	ผลลัพธ์ของ print(\\"Hello\\") คืออะไร?	fill	Hello	2
3	2	print(\\"Python\\") จะแสดงผลอะไร?	fill	Python	1
4	2	คำสั่งใดถูกต้อง?	choice	print(\\"สวัสดี\\")	2
5	2	Python เป็นภาษาแบบใด?	choice	Interpreted	3
6	3	Comment ใน Python ใช้เครื่องหมายอะไร?	choice	#	1
7	3	Comment มีผลต่อการทำงานของโปรแกรมหรือไม่?	choice	ไม่มีผล	2
8	4	เครื่องหมาย # ใน Python มีความหมายว่าอะไร?	choice	Comment	1
9	4	บรรทัดใดเป็น Comment ที่ถูกต้อง?	choice	# This is a comment	2
10	5	คำสั่งใดใช้รับข้อมูลจากผู้ใช้?	choice	input()	1
11	5	ผลลัพธ์ของ input() มีชนิดข้อมูลเป็นอะไร?	choice	str	2
12	6	name = input(\\"ชื่อ: \\") ค่าของ name เป็นชนิดใด?	choice	str	1
13	6	ถ้าต้องการรับตัวเลขจาก input ต้องทำอย่างไร?	choice	ใช้ int(input())	2
14	7	คำสั่งใดใช้ในการเริ่มประกาศฟังก์ชันใน Python?	choice	def	1
15	7	ส่วนใดของฟังก์ชันที่ใช้ส่งค่ากลับ?	choice	return	2
16	8	การเรียกใช้ฟังก์ชันทำได้อย่างไร?	choice	ชื่อฟังก์ชัน()	1
17	8	ถ้าฟังก์ชันไม่มีการ return ค่า จะได้ค่าอะไร?	choice	None	2
22	9	ตัวแปร (Variable) ใน Python ทำหน้าที่อะไร?	choice	เก็บข้อมูลไว้ใช้งาน	1
23	9	กฎข้อใดถูกต้องในการตั้งชื่อตัวแปร?	choice	ห้ามขึ้นต้นด้วยตัวเลข	2
24	10	ชนิดข้อมูลประเภท float ใช้เก็บค่าแบบใด?	choice	ตัวเลขทศนิยม	1
25	10	หากต้องการแปลงข้อมูลเป็นตัวเลขจำนวนเต็ม ต้องใช้คำสั่งใด?	choice	int()	2
26	9	คำสั่งใดที่ใช้ในการแสดงผลข้อมูล?	fill	print()	2
27	10	ชนิดข้อมูลที่เก็บเลขทศนิยมคืออะไร?	fill	float	2
28	11	ชนิดข้อมูลที่ใช้เก็บเลขทศนิยมคือ?	choice	float	1
29	11	ข้อใดคือคำสั่งตรวจสอบชนิดข้อมูล?	choice	type()	2
30	11	ค่าความจริง True/False เรียกว่าข้อมูลประเภท?	fill	bool	3
31	12	ข้อมูลประเภท str ใช้เก็บค่าแบบใด?	choice	ข้อความ	1
32	12	ผลลัพธ์ของ 5 // 2 ใน Python คือ?	choice	2	2
33	13	คำสั่งใดใช้แปลงข้อมูลเป็นจำนวนเต็มใน Python?	choice	int()	1
34	13	หากต้องการแปลงข้อมูลเป็นเลขทศนิยมต้องใช้คำสั่งใด?	choice	float()	2
35	13	ถ้าต้องการแปลงตัวเลข 10 ให้เป็นข้อความ ต้องใช้คำสั่งใด?	fill	str()	3
37	14	คำสั่ง bool() ใช้สำหรับแปลงข้อมูลประเภทใด?	choice	ค่าความจริง	1
38	14	ผลลัพธ์ของ int(\\"5\\") + 2 คืออะไร?	choice	7	2
39	14	ถ้าต้องการแปลงค่าความจริงเป็นข้อความใช้คำสั่งอะไร?	fill	str()	3
40	15	คำสั่งใดใช้ตรวจสอบเงื่อนไขใน Python?	choice	if	1
41	15	หากเงื่อนไขเป็นเท็จ จะทำงานในส่วนของอะไร?	choice	else	2
42	15	เครื่องหมายเปรียบเทียบ \\"เท่ากับ\\" ใน Python คือ?	fill	==	3
43	16	โครงสร้าง If-Else ต้องจบด้วยเครื่องหมายใด?	choice	:	1
44	16	การเขียนเงื่อนไขซ้อนกันใช้คำสั่งใด?	choice	elif	2
45	16	คำสั่งที่ใช้ตรวจสอบเงื่อนไขหลายระดับคือ?	fill	elif	3
46	17	คำสั่งใดใช้ในการทำซ้ำแบบทราบจำนวนรอบที่แน่นอน?	choice	for	1
47	17	ฟังก์ชันใดที่นิยมใช้คู่กับ for loop เพื่อสร้างลำดับตัวเลข?	choice	range()	2
48	17	หากต้องการวนลูป 5 รอบ ต้องใช้ range(5) ใช่หรือไม่?	fill	ใช่	3
49	18	for loop สามารถวนลูปใน List ได้หรือไม่?	choice	ได้	1
50	18	คำสั่งที่ใช้หยุดการทำงานของลูปทันทีคือ?	choice	break	2
51	18	คำสั่งที่ใช้ข้ามการทำงานในรอบปัจจุบันไปยังรอบถัดไปคือ?	fill	continue	3
52	19	คำสั่งใดใช้ทำซ้ำในขณะที่เงื่อนไขเป็นจริง?	choice	while	1
53	19	เงื่อนไขของ while loop ต้องเป็นค่าประเภทใด?	choice	boolean	2
54	19	หากเงื่อนไขเป็นจริงตลอดไป จะเกิดเหตุการณ์ใด?	fill	Infinite Loop	3
55	20	while loop แตกต่างจาก for loop อย่างไร?	choice	ระบุจำนวนรอบไม่ได้	1
56	20	คำสั่งใดใช้สำหรับออกจาก loop ทันที?	choice	break	2
57	20	คำสั่งที่ใช้ตรวจสอบเงื่อนไขใน while คือ?	fill	condition	3
58	21	คำสั่งใดใช้ในการประกาศฟังก์ชันใน Python?	choice	def	1
59	21	ส่วนประกอบของฟังก์ชันที่ต้องมีหลังชื่อฟังก์ชันคือ?	choice	()	2
60	21	การเขียนเนื้อหาฟังก์ชันใน Python ต้องใช้อะไร?	fill	indentation	3
61	22	คำสั่งใดที่ใช้ส่งค่าข้อมูลออกจากฟังก์ชัน?	choice	return	1
62	22	ฟังก์ชันที่ไม่มีการ return ค่า จะส่งค่าอะไรออกมา?	choice	None	2
63	22	ชื่อฟังก์ชันควรตั้งให้สื่อความหมายเพื่ออะไร?	fill	อ่านง่าย	3
64	23	ตัวแปรที่รับค่าเข้ามาในฟังก์ชันเรียกว่าอะไร?	choice	Parameter	1
65	23	การส่งค่าเข้าไปในฟังก์ชันเรียกว่าอะไร?	choice	Argument	2
66	23	ถ้าฟังก์ชันมี Parameter ต้องส่งค่าให้ครบใช่หรือไม่?	fill	ใช่	3
67	24	คำสั่งใดที่ใช้ส่งค่าผลลัพธ์กลับจากฟังก์ชัน?	choice	return	1
68	24	เราสามารถ return ค่าได้มากกว่า 1 ค่าหรือไม่?	choice	ได้	2
69	24	หลังคำสั่ง return โค้ดที่เหลือในฟังก์ชันจะทำงานหรือไม่?	fill	ไม่	3
70	25	เครื่องหมายใดใช้ในการสร้าง List ใน Python?	choice	[]	1
71	25	Index ของสมาชิกตัวแรกใน List คืออะไร?	choice	0	2
72	25	List สามารถเก็บข้อมูลต่างชนิดกันได้หรือไม่?	fill	ได้	3
73	26	คำสั่งใดใช้เพิ่มข้อมูลต่อท้าย List?	choice	append()	1
74	26	คำสั่งใดใช้ตรวจสอบจำนวนสมาชิกใน List?	choice	len()	2
75	26	หากต้องการลบข้อมูลใน List ใช้คำสั่งอะไร?	fill	remove()	3
76	27	เครื่องหมายใดใช้ในการสร้าง Dictionary?	choice	{}	1
77	27	ข้อมูลใน Dictionary ประกอบด้วยคู่ของสิ่งใด?	choice	key และ value	2
78	27	Dictionary เป็นข้อมูลแบบเรียงลำดับหรือไม่?	fill	ไม่	3
79	28	การเข้าถึงค่าใน Dictionary ใช้สิ่งใด?	choice	key	1
80	28	คำสั่งใดใช้ตรวจสอบว่ามี key อยู่ใน Dictionary หรือไม่?	choice	in	2
81	28	คำสั่งที่ใช้ลบข้อมูลใน Dictionary คือ?	fill	del	3
82	29	ฟังก์ชันใดที่ใช้สำหรับเปิดไฟล์ใน Python?	choice	open()	1
83	29	โหมด r ในการเปิดไฟล์หมายถึงอะไร?	choice	Read	2
84	29	การเขียนข้อมูลลงไฟล์ควรใช้โหมดใด?	fill	w	3
85	30	คำสั่งที่ควรใช้เสมอหลังจากเปิดไฟล์คือ?	choice	close()	1
86	30	การใช้ with statement ช่วยจัดการเรื่องใด?	choice	ปิดไฟล์อัตโนมัติ	2
87	30	หากต้องการเพิ่มข้อมูลต่อท้ายไฟล์ใช้โหมดใด?	fill	a	3
88	31	คำสั่งใดใช้สำหรับดักจับข้อผิดพลาด (Exception)?	choice	try	1
89	31	ส่วนใดของโค้ดจะทำงานเมื่อเกิด Error?	choice	except	2
90	31	ข้อผิดพลาดใน Python เรียกว่าอะไร?	fill	Exception	3
91	32	ส่วนที่ต้องทำงานเสมอไม่ว่าจะมี Error หรือไม่คือ?	choice	finally	1
92	32	การใช้ try-except ช่วยป้องกันอะไร?	choice	โปรแกรมค้าง	2
93	32	หากต้องการดักจับทุก Error โดยไม่ระบุชื่อใช้คำว่า?	fill	Exception	3
\.


--
-- TOC entry 5669 (class 0 OID 26914)
-- Dependencies: 244
-- Data for Name: random_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.random_events (event_id, event_key, name, description, effect_type, severity, base_chance_percent, duration_minutes, force_skip_day, auto_resolve, affected_systems) FROM stdin;
1	BLACKOUT	⚡ ไฟฟ้าดับ	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	POWER_CUT	CRITICAL	0	\N	1	0	[\\"charging\\",\\"save_warning\\"]
2	INTERNET_DOWN	🌐 อินเทอร์เน็ตขัดข้อง	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	INTERNET_CUT	MEDIUM	8	30	0	1	[\\"job_browse\\",\\"job_submit\\",\\"job_accept\\"]
3	HEAVY_RAIN	🌧️ ฝนตกหนัก	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	INTERNET_CUT	LOW	15	15	0	1	[\\"job_browse\\",\\"job_submit\\"]
4	LAPTOP_OVERHEAT	🔥 โน๊ตบุ๊คร้อนจัด	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	BATTERY_DRAIN	MEDIUM	5	20	0	1	[\\"battery_drain_rate\\"]
5	ELECTRICITY_BILL	💸 ค่าไฟเพิ่มขึ้น	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	MONEY_LOSS	LOW	3	0	0	1	[\\"money\\"]
6	CAFE_DISCOUNT	☕ โปรโมชั่นร้านกาแฟ	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	SPEED_BOOST	LOW	10	30	0	1	[\\"work_speed\\"]
\.


--
-- TOC entry 5670 (class 0 OID 26923)
-- Dependencies: 245
-- Data for Name: room_participants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_participants (id, room_id, user_id, joined_at, score, is_ready) FROM stdin;
\.


--
-- TOC entry 5694 (class 0 OID 27454)
-- Dependencies: 269
-- Data for Name: session_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session_players (session_id, user_id, money_balance, is_survived, score, status) FROM stdin;
\.


--
-- TOC entry 5671 (class 0 OID 26929)
-- Dependencies: 246
-- Data for Name: shop_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shop_items (item_id, name, description, type, rarity, price, preview_data, is_available, created_at, item_type, asset_url, preview_image, effects, is_active) FROM stdin;
13	Sakura		THEME	COMMON	0.00	\N	1	2026-06-30 18:32:25	THEME	http://localhost:3001/uploads/1782844342595-474510254.png		\N	1
15	Heart		MOUSE_EFFECT	COMMON	30.00	[{"trigger":"click","visual":"💖","color":"#FF69B4","size":26,"duration":800}]	1	2026-07-28 03:55:58.878673	MOUSE_EFFECT	\N	\N	[{"trigger":"click","visual":"💖","color":"#FF69B4","size":26,"duration":800}]	1
16	Pirate		PROFILE_FRAME	COMMON	100.00	\N	1	2026-07-29 19:29:38.791755	PROFILE_BACKGROUND	http://localhost:3001/uploads/1785328098100-177166891.png		\N	1
17	Naruto		PROFILE_FRAME	COMMON	100.00	\N	1	2026-07-29 19:39:30.277698	PROFILE_BACKGROUND	http://localhost:3001/uploads/1785328752242-692910128.png		\N	1
18	Stars		MOUSE_EFFECT	COMMON	50.00	[{"trigger":"click","visual":"✨","color":"#e7d50d","size":29,"duration":800}]	1	2026-07-29 19:40:47.922156	MOUSE_EFFECT	\N	\N	[{"trigger":"click","visual":"✨","color":"#e7d50d","size":29,"duration":800}]	1
19	 Thunder		MOUSE_EFFECT	COMMON	80.00	[{"trigger":"click","visual":"⚡","color":"#e89521","size":28,"duration":800}]	1	2026-07-29 19:41:58.439063	MOUSE_EFFECT	\N	\N	[{"trigger":"click","visual":"⚡","color":"#e89521","size":28,"duration":800}]	1
\.


--
-- TOC entry 5672 (class 0 OID 26940)
-- Dependencies: 247
-- Data for Name: simulation_active_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.simulation_active_events (id, save_id, event_id, started_at, expires_at, is_resolved) FROM stdin;
1	1	4	2026-03-04 18:47:54	2026-03-04 12:07:54	1
2	1	1	2026-03-04 18:47:57	\N	1
3	1	3	2026-03-04 18:50:09	2026-03-04 12:05:09	1
4	1	1	2026-03-04 18:50:10	\N	1
5	1	5	2026-03-04 18:52:19	\N	1
6	1	1	2026-03-04 18:52:19	\N	1
7	1	3	2026-03-04 18:54:25	2026-03-04 12:09:25	1
8	1	1	2026-03-04 18:54:30	\N	1
9	1	3	2026-03-04 18:56:45	2026-03-04 12:11:45	1
10	1	1	2026-03-04 18:56:45	\N	1
11	1	3	2026-03-04 18:58:55	2026-03-04 12:13:55	1
12	1	1	2026-03-04 18:58:56	\N	1
13	1	1	2026-03-04 19:01:05	\N	1
14	1	1	2026-03-04 19:03:11	\N	1
15	1	6	2026-03-04 19:05:25	2026-03-04 12:35:25	1
16	1	1	2026-03-04 19:05:25	\N	1
17	1	1	2026-03-04 19:07:31	\N	1
18	1	2	2026-03-04 19:09:41	2026-03-04 12:39:41	1
19	1	1	2026-03-04 19:09:42	\N	1
20	1	1	2026-03-04 19:11:52	\N	1
21	1	4	2026-03-04 19:14:01	2026-03-04 12:34:01	1
22	1	1	2026-03-04 19:14:02	\N	1
23	1	6	2026-03-04 19:16:32	2026-03-04 12:46:32	1
24	1	1	2026-03-04 19:16:37	\N	1
25	1	1	2026-03-04 19:18:47	\N	1
26	1	2	2026-03-04 20:03:36	2026-03-04 13:33:36	1
27	1	1	2026-03-04 20:03:41	\N	1
28	1	1	2026-03-05 17:39:04	\N	1
29	1	1	2026-03-05 17:41:39	\N	1
30	1	6	2026-03-05 17:43:50	2026-03-05 11:13:50	1
31	1	1	2026-03-05 17:43:59	\N	1
32	1	1	2026-03-05 17:46:14	\N	1
33	1	3	2026-03-05 17:48:20	2026-03-05 11:03:20	1
34	1	1	2026-03-05 17:48:30	\N	1
35	1	3	2026-03-05 17:50:40	2026-03-05 11:05:40	1
36	1	1	2026-03-05 17:50:41	\N	1
37	1	3	2026-03-05 17:52:51	2026-03-05 11:07:51	1
38	1	1	2026-03-05 17:52:55	\N	1
39	1	3	2026-03-05 17:55:01	2026-03-05 11:10:01	1
40	1	1	2026-03-05 17:55:01	\N	1
41	1	1	2026-03-05 17:57:11	\N	1
42	1	3	2026-03-05 17:59:21	2026-03-05 11:14:21	1
43	1	1	2026-03-05 17:59:26	\N	1
44	1	1	2026-03-05 18:01:32	\N	1
45	1	5	2026-03-05 18:03:41	\N	1
46	1	1	2026-03-05 18:03:42	\N	1
47	1	1	2026-03-05 18:05:52	\N	1
48	1	1	2026-03-05 18:08:06	\N	1
49	1	1	2026-03-05 18:10:17	\N	1
50	1	1	2026-03-05 18:12:23	\N	1
51	1	1	2026-03-05 18:14:32	\N	1
52	1	4	2026-03-05 18:16:38	2026-03-05 11:36:38	1
53	1	1	2026-03-05 18:16:38	\N	1
54	1	1	2026-03-05 18:18:43	\N	1
55	1	6	2026-03-05 18:20:52	2026-03-05 11:50:52	1
56	1	1	2026-03-05 18:20:52	\N	1
57	1	3	2026-03-05 18:23:03	2026-03-05 11:38:03	1
58	1	1	2026-03-05 18:23:13	\N	1
59	1	5	2026-03-05 18:25:19	\N	1
60	1	1	2026-03-05 18:25:19	\N	1
61	1	3	2026-03-05 18:27:29	2026-03-05 11:42:29	1
62	1	1	2026-03-05 18:27:34	\N	1
63	1	1	2026-03-05 18:29:48	\N	1
64	1	3	2026-03-05 18:31:55	2026-03-05 11:46:55	1
65	1	1	2026-03-05 18:31:55	\N	1
66	1	6	2026-03-05 18:34:19	2026-03-05 12:04:19	1
67	1	1	2026-03-05 18:34:20	\N	1
68	1	4	2026-03-05 18:36:29	2026-03-05 11:56:29	1
69	1	1	2026-03-05 18:36:50	\N	1
70	1	3	2026-03-05 18:39:00	2026-03-05 11:54:00	1
71	1	1	2026-03-05 18:39:30	\N	1
72	1	1	2026-03-07 06:37:35	\N	1
73	1	6	2026-03-07 06:41:50	2026-03-07 00:11:50	1
74	1	1	2026-03-07 06:42:40	\N	1
75	1	3	2026-03-07 06:46:56	2026-03-07 00:01:56	1
76	1	1	2026-03-07 06:47:11	\N	1
77	1	1	2026-03-07 06:51:31	\N	1
78	1	4	2026-03-07 06:55:46	2026-03-07 00:15:46	1
79	1	1	2026-03-07 06:55:51	\N	1
80	1	5	2026-03-07 07:00:07	\N	1
81	1	1	2026-03-07 07:00:22	\N	1
82	1	1	2026-03-07 07:04:42	\N	1
83	1	2	2026-03-07 07:09:03	2026-03-07 00:39:03	1
84	1	1	2026-03-07 07:09:08	\N	1
85	1	4	2026-03-11 08:01:21	2026-03-11 01:21:21	1
86	1	1	2026-03-11 08:01:51	\N	1
87	1	2	2026-03-11 08:06:11	2026-03-11 01:36:11	1
88	1	1	2026-03-11 08:06:11	\N	1
89	1	5	2026-03-11 08:10:32	\N	1
90	1	1	2026-03-11 08:10:32	\N	1
117	4	1	2026-03-24 16:35:56	\N	1
118	4	6	2026-03-24 16:40:12	2026-03-24 10:10:12	1
119	4	1	2026-03-24 16:40:17	\N	1
120	4	6	2026-03-24 16:44:32	2026-03-24 10:14:32	1
121	4	1	2026-03-24 16:44:57	\N	1
122	4	1	2026-03-24 16:49:33	\N	1
123	4	3	2026-03-24 16:53:53	2026-03-24 10:08:53	1
124	4	1	2026-03-24 16:53:58	\N	1
125	5	1	2026-03-24 16:57:48	\N	1
126	6	3	2026-03-24 16:58:04	2026-03-24 10:13:04	1
127	6	1	2026-03-24 16:58:09	\N	1
128	6	1	2026-03-24 17:02:29	\N	1
129	7	1	2026-03-24 17:05:29	\N	1
130	6	3	2026-03-24 17:06:44	2026-03-24 10:21:44	1
131	6	1	2026-03-24 17:06:54	\N	1
132	8	2	2026-03-24 17:08:29	2026-03-24 10:38:29	1
133	8	1	2026-03-24 17:08:29	\N	1
134	6	1	2026-03-24 17:11:15	\N	1
135	8	1	2026-03-24 17:12:55	\N	1
136	6	1	2026-03-24 17:15:35	\N	1
137	8	6	2026-03-24 17:17:10	2026-03-24 10:47:10	1
138	8	1	2026-03-24 17:17:10	\N	1
139	6	1	2026-03-24 17:19:50	\N	1
140	8	1	2026-03-24 17:21:41	\N	1
141	6	6	2026-03-24 17:24:11	2026-03-24 10:54:11	1
142	6	1	2026-03-24 17:24:11	\N	1
143	8	3	2026-03-24 17:25:56	2026-03-24 10:40:56	1
144	8	1	2026-03-24 17:26:01	\N	1
145	6	3	2026-03-24 17:28:26	2026-03-24 10:43:26	1
146	6	1	2026-03-24 17:28:41	\N	1
147	8	4	2026-03-24 17:30:26	2026-03-24 10:50:26	1
148	8	1	2026-03-24 17:30:26	\N	1
149	6	1	2026-03-24 17:33:02	\N	1
150	8	3	2026-03-24 17:35:07	2026-03-24 10:50:07	1
151	8	1	2026-03-24 17:35:07	\N	1
152	6	6	2026-03-24 17:37:22	2026-03-24 11:07:22	1
153	6	1	2026-03-24 17:37:47	\N	1
154	8	4	2026-03-24 17:39:22	2026-03-24 10:59:22	1
155	8	1	2026-03-24 17:39:42	\N	1
156	6	3	2026-03-24 17:42:03	2026-03-24 10:57:03	1
157	6	1	2026-03-24 17:42:13	\N	1
158	8	1	2026-03-24 17:43:58	\N	1
159	6	3	2026-03-24 17:46:28	2026-03-24 11:01:28	1
160	6	1	2026-03-24 17:46:38	\N	1
161	8	2	2026-03-24 17:48:13	2026-03-24 11:18:13	1
162	8	1	2026-03-24 17:48:13	\N	1
163	6	1	2026-03-24 17:50:53	\N	1
164	8	3	2026-03-24 17:52:28	2026-03-24 11:07:28	1
165	8	1	2026-03-24 17:52:33	\N	1
166	6	4	2026-03-24 17:55:09	2026-03-24 11:15:09	1
167	6	1	2026-03-24 17:55:09	\N	1
168	8	3	2026-03-24 17:56:49	2026-03-24 11:11:49	1
169	8	1	2026-03-24 17:57:29	\N	1
170	6	4	2026-03-24 17:59:19	2026-03-24 11:19:19	1
171	6	1	2026-03-24 17:59:24	\N	1
172	8	1	2026-03-26 21:40:03	\N	1
173	8	3	2026-03-26 21:44:19	2026-03-26 14:59:19	1
174	8	1	2026-03-26 21:44:19	\N	1
175	8	3	2026-03-26 21:48:39	2026-03-26 15:03:39	1
176	8	1	2026-03-26 21:49:09	\N	1
177	8	1	2026-03-26 21:53:25	\N	1
178	8	6	2026-03-26 21:57:40	2026-03-26 15:27:40	1
179	8	1	2026-03-26 21:58:15	\N	1
180	8	1	2026-03-26 22:02:40	\N	1
181	8	2	2026-03-27 15:02:58	2026-03-27 08:32:58	1
182	8	1	2026-03-27 15:02:58	\N	1
183	8	6	2026-03-27 15:04:53	2026-03-27 08:34:53	1
184	8	1	2026-03-27 15:04:58	\N	1
185	8	6	2026-03-27 15:06:18	2026-03-27 08:36:18	1
186	8	1	2026-03-27 15:06:23	\N	1
187	8	1	2026-03-27 15:07:44	\N	1
188	8	4	2026-03-27 15:09:14	2026-03-27 08:29:14	1
189	8	1	2026-03-27 15:09:14	\N	1
190	8	1	2026-03-27 15:10:39	\N	1
191	8	1	2026-03-27 15:11:59	\N	1
192	8	1	2026-03-27 15:13:24	\N	1
193	8	3	2026-03-27 15:14:49	2026-03-27 08:29:49	1
194	8	1	2026-03-27 15:14:54	\N	1
195	8	3	2026-03-27 15:16:20	2026-03-27 08:31:20	1
196	8	1	2026-03-27 15:16:30	\N	1
197	8	1	2026-03-27 15:17:55	\N	1
198	8	4	2026-03-27 15:19:20	2026-03-27 08:39:20	1
199	8	1	2026-03-27 15:19:25	\N	1
200	8	6	2026-03-27 15:20:50	2026-03-27 08:50:50	1
201	8	1	2026-03-27 15:20:55	\N	1
202	8	3	2026-03-27 15:22:20	2026-03-27 08:37:20	1
203	8	1	2026-03-27 15:22:25	\N	1
204	8	5	2026-03-27 15:23:50	\N	1
205	8	1	2026-03-27 15:24:05	\N	1
206	8	3	2026-03-27 15:25:35	2026-03-27 08:40:35	1
207	8	1	2026-03-27 15:25:35	\N	1
208	8	3	2026-03-27 15:27:01	2026-03-27 08:42:01	1
209	8	1	2026-03-27 15:27:06	\N	1
210	8	3	2026-03-27 15:28:22	2026-03-27 08:43:22	1
211	8	1	2026-03-27 15:28:36	\N	1
212	8	1	2026-03-27 15:29:41	\N	1
213	8	2	2026-03-27 15:30:46	2026-03-27 09:00:46	1
214	8	1	2026-03-27 15:30:46	\N	1
215	8	3	2026-03-27 15:31:51	2026-03-27 08:46:51	1
216	8	1	2026-03-27 15:31:52	\N	1
217	8	2	2026-03-27 15:32:56	2026-03-27 09:02:56	1
218	8	1	2026-03-27 15:33:07	\N	1
219	8	1	2026-03-27 15:34:16	\N	1
220	8	4	2026-03-27 15:35:21	2026-03-27 08:55:21	1
221	8	1	2026-03-27 15:35:21	\N	1
222	8	3	2026-03-27 15:36:26	2026-03-27 08:51:26	1
223	8	1	2026-03-27 15:36:27	\N	1
224	8	1	2026-03-27 15:37:36	\N	1
225	8	2	2026-03-27 15:38:37	2026-03-27 09:08:37	1
226	8	1	2026-03-27 15:38:47	\N	1
227	8	1	2026-03-27 15:39:51	\N	1
228	8	5	2026-03-27 15:40:57	\N	1
229	8	1	2026-03-27 15:41:02	\N	1
230	8	2	2026-03-27 15:42:07	2026-03-27 09:12:07	1
231	8	1	2026-03-27 15:42:07	\N	1
232	8	4	2026-03-27 15:43:09	2026-03-27 09:03:09	1
233	8	1	2026-03-27 15:43:12	\N	1
234	8	1	2026-03-27 15:44:17	\N	1
235	8	2	2026-03-27 15:45:22	2026-03-27 09:15:22	1
236	8	1	2026-03-27 15:45:22	\N	1
237	8	6	2026-03-27 15:46:28	2026-03-27 09:16:28	1
238	8	1	2026-03-27 15:46:28	\N	1
239	8	2	2026-03-27 15:47:34	2026-03-27 09:17:34	1
240	8	1	2026-03-27 15:47:37	\N	1
241	8	1	2026-03-27 15:48:42	\N	1
242	8	2	2026-03-27 15:49:48	2026-03-27 09:19:48	1
243	8	1	2026-03-27 15:49:48	\N	1
244	8	1	2026-03-27 15:50:53	\N	1
245	8	3	2026-03-27 15:51:58	2026-03-27 09:06:58	1
246	8	1	2026-03-27 15:52:00	\N	1
247	8	6	2026-03-27 15:53:03	2026-03-27 09:23:03	1
248	8	1	2026-03-27 15:53:05	\N	1
249	8	3	2026-03-27 15:54:08	2026-03-27 09:09:08	1
250	8	1	2026-03-27 15:54:13	\N	1
251	8	3	2026-03-27 15:55:18	2026-03-27 09:10:18	1
252	8	1	2026-03-27 15:55:23	\N	1
253	8	4	2026-03-27 15:56:28	2026-03-27 09:16:28	1
254	8	1	2026-03-27 15:56:30	\N	1
255	8	6	2026-03-27 15:57:39	2026-03-27 09:27:39	1
256	8	1	2026-03-27 15:57:50	\N	1
257	8	3	2026-03-27 15:58:58	2026-03-27 09:13:58	1
258	8	1	2026-03-27 15:59:00	\N	1
259	8	1	2026-03-27 16:00:09	\N	1
260	8	3	2026-03-27 16:01:14	2026-03-27 09:16:14	1
261	8	1	2026-03-27 16:01:14	\N	1
262	8	3	2026-03-27 16:02:19	2026-03-27 09:17:19	1
263	8	1	2026-03-27 16:02:19	\N	1
264	8	3	2026-03-27 16:03:24	2026-03-27 09:18:24	1
265	8	1	2026-03-27 16:03:29	\N	1
266	8	2	2026-03-27 16:04:39	2026-03-27 09:34:39	1
267	8	1	2026-03-27 16:04:39	\N	1
268	8	4	2026-03-27 16:05:59	2026-03-27 09:25:59	1
269	8	1	2026-03-27 16:05:59	\N	1
270	8	2	2026-03-27 16:07:09	2026-03-27 09:37:09	1
271	8	1	2026-03-27 16:07:09	\N	1
272	8	1	2026-03-27 16:08:29	\N	1
273	8	6	2026-03-27 16:09:54	2026-03-27 09:39:54	1
274	8	1	2026-03-27 16:09:54	\N	1
275	8	3	2026-03-27 16:11:14	2026-03-27 09:26:14	1
276	8	1	2026-03-27 16:11:15	\N	1
277	8	4	2026-03-27 16:12:40	2026-03-27 09:32:40	1
278	8	1	2026-03-27 16:12:45	\N	1
279	8	4	2026-03-27 16:14:10	2026-03-27 09:34:10	1
280	8	1	2026-03-27 16:14:10	\N	1
281	8	6	2026-03-27 16:15:35	2026-03-27 09:45:35	1
282	8	1	2026-03-27 16:15:40	\N	1
283	8	6	2026-03-27 16:17:05	2026-03-27 09:47:05	1
284	8	1	2026-03-27 16:17:15	\N	1
285	8	3	2026-03-27 16:18:25	2026-03-27 09:33:25	1
286	8	1	2026-03-27 16:18:25	\N	1
287	8	1	2026-03-27 16:19:30	\N	1
288	8	1	2026-03-27 16:20:41	\N	1
289	8	2	2026-03-27 16:21:51	2026-03-27 09:51:51	1
290	8	1	2026-03-27 16:21:51	\N	1
291	8	3	2026-03-27 16:23:11	2026-03-27 09:38:11	1
292	8	1	2026-03-27 16:23:11	\N	1
293	8	6	2026-03-27 16:24:16	2026-03-27 09:54:16	1
294	8	1	2026-03-27 16:24:16	\N	1
295	8	2	2026-03-27 16:25:31	2026-03-27 09:55:31	1
296	8	1	2026-03-27 16:25:31	\N	1
297	8	3	2026-03-27 16:26:35	2026-03-27 09:41:35	1
298	8	1	2026-03-27 16:26:35	\N	1
299	8	1	2026-03-27 16:27:41	\N	1
300	8	3	2026-03-27 16:27:41	2026-03-27 09:42:41	1
301	8	6	2026-03-27 16:28:41	2026-03-27 09:58:41	1
302	8	1	2026-03-27 16:28:50	\N	1
303	8	1	2026-03-27 16:30:07	\N	1
304	8	1	2026-03-27 16:31:27	\N	1
305	8	2	2026-03-27 16:32:32	2026-03-27 10:02:32	1
306	8	1	2026-03-27 16:32:41	\N	1
307	8	2	2026-03-27 16:33:46	2026-03-27 10:03:46	1
308	8	1	2026-03-27 16:33:47	\N	1
309	8	6	2026-03-27 16:35:12	2026-03-27 10:05:12	1
310	8	1	2026-03-27 16:35:12	\N	1
311	8	2	2026-03-27 16:36:37	2026-03-27 10:06:37	1
312	8	1	2026-03-27 16:36:41	\N	1
313	8	3	2026-03-27 16:38:06	2026-03-27 09:53:06	1
314	8	1	2026-03-27 16:38:06	\N	1
315	8	1	2026-03-27 16:39:32	\N	1
316	8	2	2026-03-27 16:39:32	2026-03-27 10:09:32	1
317	8	2	2026-03-27 16:40:33	2026-03-27 10:10:33	1
318	8	1	2026-03-27 16:40:48	\N	1
319	8	2	2026-03-27 16:41:53	2026-03-27 10:11:53	1
320	8	1	2026-03-27 16:41:53	\N	1
321	8	1	2026-03-27 16:43:02	\N	1
322	8	3	2026-03-27 16:44:03	2026-03-27 09:59:03	1
323	8	1	2026-03-27 16:44:08	\N	1
324	8	1	2026-03-27 16:45:12	\N	1
325	8	1	2026-03-27 16:46:18	\N	1
326	8	4	2026-03-27 16:47:23	2026-03-27 10:07:23	1
327	8	1	2026-03-27 16:47:23	\N	1
328	8	1	2026-03-27 16:48:27	\N	1
329	8	1	2026-03-27 16:49:33	\N	1
330	8	1	2026-03-27 20:45:40	\N	1
331	8	2	2026-03-27 20:47:05	2026-03-27 14:17:05	1
332	8	1	2026-03-27 20:47:06	\N	1
333	8	2	2026-03-27 20:48:26	2026-03-27 14:18:26	1
334	8	1	2026-03-27 20:48:31	\N	1
335	8	4	2026-03-27 20:49:37	2026-03-27 14:09:37	1
336	8	1	2026-03-27 20:49:41	\N	1
337	8	6	2026-03-27 20:50:46	2026-03-27 14:20:46	1
338	8	1	2026-03-27 20:50:46	\N	1
339	8	1	2026-03-27 20:51:47	\N	1
340	8	3	2026-03-27 20:52:52	2026-03-27 14:07:52	1
341	8	1	2026-03-27 20:52:52	\N	1
342	8	1	2026-03-27 20:53:57	\N	1
343	8	3	2026-03-27 20:55:02	2026-03-27 14:10:02	1
344	8	1	2026-03-27 20:55:07	\N	1
345	8	3	2026-03-27 20:56:17	2026-03-27 14:11:17	1
346	8	1	2026-03-27 20:56:26	\N	1
347	8	6	2026-03-27 20:57:30	2026-03-27 14:27:30	1
348	8	1	2026-03-27 20:57:30	\N	1
349	8	4	2026-03-27 20:58:36	2026-03-27 14:18:36	1
350	8	1	2026-03-27 20:58:36	\N	1
351	8	4	2026-03-27 20:59:37	2026-03-27 14:19:37	1
352	8	1	2026-03-27 20:59:37	\N	1
353	8	1	2026-03-27 21:00:42	\N	1
354	8	6	2026-03-27 21:01:47	2026-03-27 14:31:47	1
355	8	1	2026-03-27 21:01:47	\N	1
356	8	1	2026-03-27 21:02:58	\N	1
357	8	4	2026-03-27 21:04:03	2026-03-27 14:24:03	1
358	8	1	2026-03-27 21:04:08	\N	1
359	8	1	2026-03-27 21:05:13	\N	1
360	8	3	2026-03-27 21:06:22	2026-03-27 14:21:22	1
361	8	1	2026-03-27 21:06:22	\N	1
362	8	1	2026-03-27 21:07:27	\N	1
363	8	5	2026-03-27 21:08:33	\N	1
364	8	1	2026-03-27 21:08:33	\N	1
365	8	1	2026-03-27 21:09:38	\N	1
366	8	6	2026-03-27 21:10:41	2026-03-27 14:40:41	1
367	8	1	2026-03-27 21:10:53	\N	1
368	8	3	2026-03-27 21:11:58	2026-03-27 14:26:58	1
369	8	1	2026-03-27 21:11:59	\N	1
370	8	1	2026-03-27 21:13:04	\N	1
371	8	3	2026-03-27 21:14:08	2026-03-27 14:29:08	1
372	8	1	2026-03-27 21:14:16	\N	1
373	8	1	2026-03-27 21:15:23	\N	1
374	8	1	2026-03-27 21:16:26	\N	1
375	8	3	2026-03-27 21:17:29	2026-03-27 14:32:29	1
376	8	1	2026-03-27 21:17:31	\N	1
377	8	2	2026-03-27 21:18:39	2026-03-27 14:48:39	1
378	8	1	2026-03-27 21:18:40	\N	1
379	8	6	2026-03-27 21:19:49	2026-03-27 14:49:49	1
380	8	1	2026-03-27 21:19:49	\N	1
381	8	6	2026-03-27 21:20:54	2026-03-27 14:50:54	1
382	8	1	2026-03-27 21:20:59	\N	1
383	8	3	2026-03-27 21:22:04	2026-03-27 14:37:04	1
384	8	1	2026-03-27 21:22:04	\N	1
385	8	2	2026-03-27 21:23:09	2026-03-27 14:53:09	1
386	8	1	2026-03-27 21:23:10	\N	1
387	8	4	2026-03-27 21:24:15	2026-03-27 14:44:15	1
388	8	1	2026-03-27 21:24:19	\N	1
389	8	1	2026-03-27 21:25:25	\N	1
390	8	1	2026-03-27 21:26:29	\N	1
391	8	3	2026-03-27 21:27:34	2026-03-27 14:42:34	1
392	8	1	2026-03-27 21:27:35	\N	1
393	8	1	2026-03-27 21:28:40	\N	1
394	8	3	2026-03-27 21:29:45	2026-03-27 14:44:45	1
395	8	1	2026-03-27 21:29:45	\N	1
396	8	1	2026-03-27 21:30:49	\N	1
397	8	1	2026-03-27 21:31:54	\N	1
398	8	1	2026-03-27 21:32:56	\N	1
399	8	1	2026-03-27 21:34:01	\N	1
400	8	1	2026-03-27 21:35:09	\N	1
401	8	4	2026-03-27 21:36:16	2026-03-27 14:56:16	1
402	8	1	2026-03-27 21:36:21	\N	1
403	8	1	2026-03-27 21:37:26	\N	1
404	8	6	2026-03-27 21:38:30	2026-03-27 15:08:30	1
405	8	1	2026-03-27 21:38:31	\N	1
406	8	3	2026-03-27 21:39:36	2026-03-27 14:54:36	1
407	8	1	2026-03-27 21:39:42	\N	1
408	8	1	2026-03-27 21:40:51	\N	1
409	8	1	2026-03-27 21:41:56	\N	1
410	8	6	2026-03-27 21:43:04	2026-03-27 15:13:04	1
411	8	1	2026-03-27 21:43:04	\N	1
412	8	3	2026-03-27 21:44:12	2026-03-27 14:59:12	1
413	8	1	2026-03-27 21:44:13	\N	1
414	8	6	2026-03-27 21:45:23	2026-03-27 15:15:23	1
415	8	1	2026-03-27 21:45:27	\N	1
416	8	3	2026-03-27 21:46:33	2026-03-27 15:01:33	1
417	8	1	2026-03-27 21:46:33	\N	1
418	8	6	2026-03-27 21:47:42	2026-03-27 15:17:42	1
419	8	1	2026-03-27 21:47:47	\N	1
420	8	6	2026-03-27 21:48:52	2026-03-27 15:18:52	1
421	8	1	2026-03-27 21:48:52	\N	1
422	8	1	2026-03-27 21:50:02	\N	1
423	8	3	2026-03-27 21:51:08	2026-03-27 15:06:08	1
424	8	1	2026-03-27 21:51:12	\N	1
425	8	3	2026-03-27 21:52:17	2026-03-27 15:07:17	1
426	8	1	2026-03-27 21:52:18	\N	1
427	8	1	2026-03-27 21:53:23	\N	1
428	8	1	2026-03-27 21:54:31	\N	1
429	8	3	2026-03-27 21:55:37	2026-03-27 15:10:37	1
430	8	1	2026-03-27 21:55:37	\N	1
431	8	4	2026-03-27 21:56:57	2026-03-27 15:16:57	1
432	8	1	2026-03-27 21:56:57	\N	1
433	8	3	2026-03-27 21:58:23	2026-03-27 15:13:23	1
434	8	1	2026-03-27 21:58:23	\N	1
435	8	4	2026-03-27 21:59:48	2026-03-27 15:19:48	1
436	8	1	2026-03-27 21:59:52	\N	1
437	8	1	2026-03-27 22:01:18	\N	1
438	8	3	2026-03-27 22:02:43	2026-03-27 15:17:43	1
439	8	1	2026-03-27 22:02:43	\N	1
440	8	1	2026-03-27 22:04:08	\N	1
441	8	1	2026-03-27 22:05:33	\N	1
442	8	6	2026-03-27 22:06:59	2026-03-27 15:36:59	1
443	8	1	2026-03-27 22:07:08	\N	1
444	8	6	2026-03-27 22:08:34	2026-03-27 15:38:34	1
445	8	1	2026-03-27 22:08:34	\N	1
446	8	3	2026-03-27 22:09:59	2026-03-27 15:24:59	1
447	8	1	2026-03-27 22:09:59	\N	1
448	8	3	2026-03-27 22:11:29	2026-03-27 15:26:29	1
449	8	1	2026-03-27 22:11:30	\N	1
450	8	3	2026-03-27 22:12:59	2026-03-27 15:27:59	1
451	8	1	2026-03-27 22:13:09	\N	1
452	8	1	2026-03-27 22:14:34	\N	1
453	8	2	2026-03-27 22:15:59	2026-03-27 15:45:59	1
454	8	1	2026-03-27 22:16:14	\N	1
455	8	1	2026-03-27 22:17:40	\N	1
456	8	3	2026-03-27 22:19:05	2026-03-27 15:34:05	1
457	8	1	2026-03-27 22:19:20	\N	1
458	8	3	2026-03-27 22:20:45	2026-03-27 15:35:45	1
459	8	1	2026-03-27 22:20:55	\N	1
460	8	1	2026-03-27 22:22:21	\N	1
461	8	3	2026-03-27 22:23:50	2026-03-27 15:38:50	1
462	8	1	2026-03-27 22:23:55	\N	1
463	8	1	2026-03-27 22:25:20	\N	1
464	8	5	2026-03-27 22:26:45	\N	1
465	8	1	2026-03-27 22:26:45	\N	1
466	8	1	2026-03-27 22:28:11	\N	1
467	8	1	2026-03-27 22:29:41	\N	1
468	8	1	2026-03-27 22:31:06	\N	1
469	8	1	2026-03-27 22:32:31	\N	1
470	8	3	2026-03-27 22:33:56	2026-03-27 15:48:56	1
471	8	1	2026-03-27 22:33:57	\N	1
472	8	3	2026-03-27 22:35:31	2026-03-27 15:50:31	1
473	8	1	2026-03-27 22:35:31	\N	1
474	8	5	2026-03-27 22:36:57	\N	1
475	8	1	2026-03-27 22:37:06	\N	1
476	8	1	2026-03-27 22:38:32	\N	1
477	8	2	2026-03-27 22:39:57	2026-03-27 16:09:57	1
478	8	1	2026-03-27 22:39:57	\N	1
479	8	3	2026-03-27 22:41:22	2026-03-27 15:56:22	1
480	8	1	2026-03-27 22:41:22	\N	1
481	8	1	2026-03-27 22:42:47	\N	1
482	8	1	2026-03-27 22:44:17	\N	1
483	8	3	2026-03-27 22:45:42	2026-03-27 16:00:42	1
484	8	1	2026-03-27 22:45:43	\N	1
485	8	3	2026-03-27 22:47:08	2026-03-27 16:02:08	1
486	8	1	2026-03-27 22:47:12	\N	1
487	8	2	2026-03-27 22:48:37	2026-03-27 16:18:37	1
488	8	1	2026-03-27 22:48:38	\N	1
489	8	2	2026-03-27 22:50:03	2026-03-27 16:20:03	1
490	8	1	2026-03-27 22:50:08	\N	1
491	8	1	2026-03-27 22:51:33	\N	1
492	8	1	2026-03-27 22:52:58	\N	1
493	8	2	2026-03-27 22:54:27	2026-03-27 16:24:27	1
494	8	1	2026-03-27 22:54:28	\N	1
495	8	1	2026-03-27 22:55:53	\N	1
496	8	6	2026-03-27 22:57:18	2026-03-27 16:27:18	1
497	8	1	2026-03-27 22:57:18	\N	1
498	8	1	2026-03-27 22:58:43	\N	1
499	8	3	2026-03-27 23:00:09	2026-03-27 16:15:09	1
500	8	1	2026-03-27 23:00:14	\N	1
501	8	1	2026-03-28 03:44:55	\N	1
502	8	1	2026-03-28 03:46:25	\N	1
503	8	6	2026-03-28 03:47:50	2026-03-27 21:17:50	1
504	8	1	2026-03-28 03:47:51	\N	1
505	8	1	2026-03-28 03:49:16	\N	1
506	8	1	2026-03-28 03:50:41	\N	1
507	8	1	2026-03-28 03:52:11	\N	1
508	8	1	2026-03-28 03:53:36	\N	1
509	8	2	2026-03-28 03:55:06	2026-03-27 21:25:06	1
510	8	1	2026-03-28 03:55:21	\N	1
511	8	4	2026-03-28 03:56:46	2026-03-27 21:16:46	1
512	8	1	2026-03-28 03:56:46	\N	1
513	8	1	2026-03-28 03:58:11	\N	1
514	8	3	2026-03-28 03:59:36	2026-03-27 21:14:36	1
515	8	1	2026-03-28 03:59:42	\N	1
516	8	1	2026-03-28 04:01:07	\N	1
517	8	1	2026-03-28 04:02:32	\N	1
518	8	6	2026-03-28 04:03:52	2026-03-27 21:33:52	1
519	8	1	2026-03-28 04:03:52	\N	1
520	8	3	2026-03-28 04:04:57	2026-03-27 21:19:57	1
521	8	1	2026-03-28 04:04:57	\N	1
522	8	4	2026-03-28 04:06:02	2026-03-27 21:26:02	1
523	8	1	2026-03-28 04:06:07	\N	1
524	8	1	2026-03-28 04:07:10	\N	1
525	8	1	2026-03-28 04:08:15	\N	1
526	8	1	2026-03-28 04:09:37	\N	1
527	8	1	2026-03-28 04:11:02	\N	1
528	8	1	2026-03-28 04:12:33	\N	1
529	8	2	2026-03-28 04:14:03	2026-03-27 21:44:03	1
530	8	1	2026-03-28 04:14:03	\N	1
531	8	3	2026-03-28 04:15:28	2026-03-27 21:30:28	1
532	8	1	2026-03-28 04:15:37	\N	1
533	8	2	2026-03-28 04:17:02	2026-03-27 21:47:02	1
534	8	1	2026-03-28 04:17:08	\N	1
535	8	2	2026-03-28 04:18:37	2026-03-27 21:48:37	1
536	8	1	2026-03-28 04:18:43	\N	1
537	8	5	2026-03-28 04:20:13	\N	1
538	8	1	2026-03-28 04:20:28	\N	1
539	8	3	2026-03-28 04:21:54	2026-03-27 21:36:54	1
540	8	1	2026-03-28 04:22:04	\N	1
541	8	1	2026-03-28 04:23:33	\N	1
542	8	1	2026-03-28 04:24:59	\N	1
543	8	3	2026-03-28 04:26:24	2026-03-27 21:41:24	1
544	8	1	2026-03-28 04:26:29	\N	1
545	8	1	2026-03-28 04:27:54	\N	1
546	8	3	2026-03-28 04:29:23	2026-03-27 21:44:23	1
547	8	1	2026-03-28 04:29:24	\N	1
548	8	1	2026-03-28 04:30:49	\N	1
549	8	6	2026-03-28 04:32:14	2026-03-27 22:02:14	1
550	8	1	2026-03-28 04:32:15	\N	1
551	8	1	2026-03-28 04:33:40	\N	1
552	8	1	2026-03-28 04:35:05	\N	1
553	8	4	2026-03-28 04:36:30	2026-03-27 21:56:30	1
554	8	1	2026-03-28 04:36:30	\N	1
555	8	1	2026-03-28 04:37:55	\N	1
556	8	1	2026-03-28 04:39:20	\N	1
557	8	6	2026-03-28 04:40:49	2026-03-27 22:10:49	1
558	8	1	2026-03-28 04:41:00	\N	1
559	8	3	2026-03-28 04:42:26	2026-03-27 21:57:26	1
560	8	1	2026-03-28 04:42:40	\N	1
561	8	1	2026-03-28 04:44:06	\N	1
562	8	1	2026-03-28 04:45:31	\N	1
563	8	1	2026-03-28 04:46:56	\N	1
564	8	3	2026-03-28 08:04:41	2026-03-28 01:19:41	1
565	8	1	2026-03-28 08:04:41	\N	1
566	8	1	2026-03-28 08:08:56	\N	1
567	9	1	2026-03-28 08:10:11	\N	1
568	8	2	2026-03-28 08:13:11	2026-03-28 01:43:11	1
569	8	1	2026-03-28 08:13:21	\N	1
570	9	3	2026-03-28 08:14:26	2026-03-28 01:29:26	1
571	9	1	2026-03-28 08:14:37	\N	1
572	8	6	2026-03-28 08:17:37	2026-03-28 01:47:37	1
573	8	1	2026-03-28 08:17:42	\N	0
574	9	1	2026-03-28 08:18:52	\N	1
575	10	1	2026-03-29 21:59:59	\N	1
576	11	1	2026-03-29 22:00:29	\N	1
577	12	6	2026-04-23 06:21:45	2026-04-22 23:51:45	1
578	13	1	2026-04-23 06:21:45	\N	0
579	12	1	2026-04-23 06:21:55	\N	0
\.


--
-- TOC entry 5673 (class 0 OID 26945)
-- Dependencies: 248
-- Data for Name: simulation_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.simulation_logs (log_id, user_id, save_id, event_id, event_type, message, created_at) FROM stdin;
1	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:07
2	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:17
3	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:21
4	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:27
5	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:32
6	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:35
7	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:42
8	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:44
9	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:48
10	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:51
11	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:55:53
12	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:04
13	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:07
14	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:09
15	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:18
16	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:21
17	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:26
18	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:30
19	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:35
20	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:38
21	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:41
22	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:46
23	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:54
24	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:56:59
25	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:10
26	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:14
27	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:17
28	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:27
29	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:30
30	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:34
31	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:46
32	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:49
33	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:57:55
34	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:00
35	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:05
36	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:10
37	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:17
38	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:20
39	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:23
40	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:31
41	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:33
42	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:38
43	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:43
44	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:46
45	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:58:53
46	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:01
47	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:11
48	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:14
49	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:21
50	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:23
51	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:27
52	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:38
53	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:47
54	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:56
55	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 08:59:59
56	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:06
57	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:10
58	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:14
59	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:20
60	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:31
61	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:34
62	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:37
63	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:41
64	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:46
65	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:00:58
66	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:03
67	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:06
68	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:08
69	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:13
70	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:18
71	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:24
72	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:26
73	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:28
74	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:32
75	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:36
76	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:39
77	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:42
78	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:52
79	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:01:57
80	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:01
81	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:15
82	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:18
83	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:24
84	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:29
85	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:32
86	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:38
87	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:48
88	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:02:57
89	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:02
90	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:06
91	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:11
92	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:18
93	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:21
94	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:25
95	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:33
96	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:49
97	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:51
98	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:03:58
99	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:01
100	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:12
101	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:17
102	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:19
103	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:25
104	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:27
105	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:29
106	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:32
107	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:37
108	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:42
109	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:46
110	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:48
111	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:50
112	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:55
113	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:04:58
114	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:09
115	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:14
116	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:19
117	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:26
118	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:30
119	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:33
120	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:39
121	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:43
122	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:48
123	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:54
124	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:05:59
125	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:02
126	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:08
127	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:10
128	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:18
129	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:22
130	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:26
131	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:32
132	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:40
133	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:45
134	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:50
135	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:55
136	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:06:59
137	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:03
138	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:07
139	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:12
140	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:22
141	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:32
142	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:37
143	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:43
144	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:07:52
145	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:02
146	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:05
147	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:07
148	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:13
149	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:20
150	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:22
151	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:27
152	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:37
153	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:42
154	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:44
155	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:46
156	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:51
157	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:08:54
158	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:05
159	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:14
160	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:23
161	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:28
162	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:31
163	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:35
164	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:39
165	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:43
166	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:49
167	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:09:59
168	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:03
169	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:09
170	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:13
171	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:17
172	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:21
173	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:24
174	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:27
175	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:31
176	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:34
177	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:38
178	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:44
179	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:49
180	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:52
181	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:55
182	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:10:58
183	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:03
184	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:07
185	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:11
186	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:14
187	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:18
188	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:21
189	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:30
190	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:33
191	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:38
192	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:43
193	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:47
194	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:49
195	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:51
196	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:11:56
197	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:05
198	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:13
199	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:19
200	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:23
201	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:30
202	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:35
203	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:38
204	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:42
205	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:12:48
206	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:04
207	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:06
208	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:13
209	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:16
210	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:20
211	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:24
212	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:33
213	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:40
214	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:42
215	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:48
216	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:13:54
217	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:02
218	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:08
219	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:10
220	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:15
221	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:22
222	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:25
223	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:30
224	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:34
225	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:41
226	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:43
227	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:47
228	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:51
229	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:14:56
230	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:04
231	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:08
232	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:11
233	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:14
234	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:18
235	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:23
236	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:35
237	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:38
238	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:44
239	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:48
240	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:51
241	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:55
242	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:15:59
243	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:02
244	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:06
245	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:12
246	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:14
247	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:23
248	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:25
249	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:33
250	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:35
251	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:38
252	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:40
253	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:43
254	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:50
255	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:16:53
256	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:00
257	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:02
258	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:06
259	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:11
260	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:13
261	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:16
262	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:35
263	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:39
264	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:45
265	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:17:55
266	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:20
267	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:22
268	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:24
269	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:27
270	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:30
271	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:41
272	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:44
273	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:49
274	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:51
275	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:18:55
276	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:04
277	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:10
278	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:14
279	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:18
280	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:20
281	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:23
282	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:25
283	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:30
284	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:37
285	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:40
286	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:47
287	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:50
288	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:54
289	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:19:58
290	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:00
291	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:07
292	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:14
293	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:19
294	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:23
295	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:25
296	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:29
297	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:34
298	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:38
299	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:41
300	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:51
301	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:53
302	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:20:57
303	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:21:00
304	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:21:10
305	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:21:15
306	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-18 09:21:17
307	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:10:57
308	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:05
309	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:09
310	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:11
311	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:14
312	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:19
313	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:23
314	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:28
315	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:33
316	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:39
317	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:42
318	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:50
319	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:52
320	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:54
321	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:11:57
322	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:01
323	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:06
324	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:09
325	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:15
326	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:17
327	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:20
328	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:26
329	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:38
330	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:12:52
331	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:05
332	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:21
333	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:27
334	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:38
335	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:42
336	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:49
337	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:53
338	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:13:55
339	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:03
340	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:08
341	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:11
342	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:13
343	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:28
344	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:36
345	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:41
346	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:45
347	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:50
348	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:54
349	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:14:59
350	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:03
351	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:07
352	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:13
353	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:22
354	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:24
355	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:31
356	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:38
357	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:46
358	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:48
359	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:15:52
360	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:01
361	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:05
362	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:11
363	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:18
364	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:20
365	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:25
366	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:30
367	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:34
368	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:41
369	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:16:49
370	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:09
371	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:18
372	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:24
373	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:32
374	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:36
375	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:43
376	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:46
377	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:52
378	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:17:57
379	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:02
380	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:06
381	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:14
382	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:20
383	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:22
384	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:26
385	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:40
386	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:43
387	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:50
388	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:18:57
389	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:02
390	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:07
391	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:15
392	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:19
393	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:23
394	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:26
395	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:28
396	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:33
397	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:41
398	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:44
399	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:50
400	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:19:56
401	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:02
402	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:10
403	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:16
404	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:20
405	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:23
406	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:33
407	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:35
408	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:40
409	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:46
410	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:52
411	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:20:57
412	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:08
413	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:14
414	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:20
415	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:23
416	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:26
417	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:42
418	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:45
419	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:55
420	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:21:58
421	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:01
422	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:07
423	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:11
424	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:17
425	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:20
426	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:50
427	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:55
428	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:22:59
429	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:06
430	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:09
431	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:13
432	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:23
433	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:29
434	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:36
435	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:42
436	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:23:51
437	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:01
438	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:05
439	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:11
440	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:13
441	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:22
442	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:24
443	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:26
444	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:32
445	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:35
446	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:38
447	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:45
448	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:48
449	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:50
450	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:53
451	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:56
452	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:24:58
453	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:08
454	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:11
455	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:18
456	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:22
457	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:26
458	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:32
459	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:38
460	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:43
461	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:50
462	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:25:59
463	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:05
464	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:10
465	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:12
466	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:15
467	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:18
468	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:24
469	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:28
470	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:36
471	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:40
472	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:44
473	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:46
474	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:54
475	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:26:59
476	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:03
477	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:07
478	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:14
479	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:20
480	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:22
481	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:26
482	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:28
483	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:46
484	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:27:58
485	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:28:01
486	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:28:04
487	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-19 21:28:11
488	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:09:11
489	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:10:07
490	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:11:12
491	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:11:52
492	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:12:12
493	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:12:22
494	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:12:32
495	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:12:42
496	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:12:52
497	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:13:27
498	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:14:12
499	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:14:27
500	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:15:12
501	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:15:37
502	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:16:07
503	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-20 05:16:17
504	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:55:43
505	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:55:58
506	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:56:13
507	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:56:28
508	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:57:13
509	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:57:28
510	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:57:48
511	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:58:04
512	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:58:19
513	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:58:44
514	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:59:14
515	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 03:59:54
516	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:00:14
517	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:00:39
518	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:01:24
519	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:01:34
520	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:01:49
521	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:02:29
522	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:03:36
523	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:03:46
524	1	\N	\N	BLACKOUT	ไฟฟ้าดับกะทันหัน! ระบบกำลังใช้แบตเตอรี่สำรอง	2026-02-21 04:04:01
525	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-04 18:47:54
526	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-04 18:47:57
527	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:47:57
528	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 18:50:05
529	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-04 18:50:09
530	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-04 18:50:10
531	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:50:10
532	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 18:52:15
533	1	1	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-04 18:52:19
534	1	1	\N	MONEY_DEDUCTED	ถูกหักเงิน 128 ฿	2026-03-04 18:52:19
535	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:52:19
536	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 18:54:24
537	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-04 18:54:25
538	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-04 18:54:29
539	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:54:30
540	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 18:56:35
541	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-04 18:56:45
542	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:56:45
543	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-04 18:56:50
544	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 18:58:51
545	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-04 18:58:55
546	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-04 18:58:56
547	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 18:58:56
548	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:01:01
549	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:01:05
550	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:03:10
582	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:43:44
551	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:03:11
552	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:05:16
553	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-04 19:05:25
554	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:05:25
555	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-04 19:05:26
556	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:07:31
557	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:07:31
558	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:09:37
559	1	1	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-04 19:09:41
560	1	1	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-04 19:09:42
561	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:09:42
562	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:11:47
563	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:11:52
564	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:13:57
565	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-04 19:14:01
566	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-04 19:14:02
567	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:14:02
568	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:16:27
569	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-04 19:16:32
570	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-04 19:16:37
571	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:16:37
572	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 19:18:42
573	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 19:18:47
574	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-04 20:03:26
575	1	1	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-04 20:03:36
576	1	1	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-04 20:03:41
577	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-04 20:03:41
578	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:38:59
579	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:39:04
580	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:41:35
581	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:41:39
583	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-05 17:43:50
584	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-05 17:43:54
585	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:43:59
586	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:46:04
587	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:46:14
588	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:48:20
589	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 17:48:20
590	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 17:48:25
591	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:48:30
592	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:50:36
593	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 17:50:40
594	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 17:50:41
595	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:50:41
596	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:52:46
597	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 17:52:51
598	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 17:52:55
599	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:52:55
600	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:55:00
601	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 17:55:01
602	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:55:01
603	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 17:55:05
604	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:57:06
605	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:57:11
606	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 17:59:16
607	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 17:59:21
608	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 17:59:21
609	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 17:59:26
610	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:01:31
611	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:01:32
612	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:03:37
613	1	1	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-05 18:03:41
614	1	1	\N	MONEY_DEDUCTED	ถูกหักเงิน 134 ฿	2026-03-05 18:03:41
646	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 18:27:33
615	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:03:42
616	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:05:47
617	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:05:52
618	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:07:57
619	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:08:06
620	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:10:12
621	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:10:17
622	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:12:22
623	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:12:23
624	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:14:28
625	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:14:32
626	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:16:37
627	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-05 18:16:38
628	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:16:38
629	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-05 18:16:42
630	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:18:42
631	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:18:43
632	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:20:49
633	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-05 18:20:52
634	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:20:52
635	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-05 18:20:54
636	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:22:58
637	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 18:23:03
638	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 18:23:04
639	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:23:13
640	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:25:18
641	1	1	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-05 18:25:19
642	1	1	\N	MONEY_DEDUCTED	ถูกหักเงิน 259 ฿	2026-03-05 18:25:19
643	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:25:19
644	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:27:24
645	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 18:27:29
647	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:27:34
648	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:29:39
649	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:29:48
650	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:31:53
651	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 18:31:55
652	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:31:55
653	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 18:31:59
654	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:34:00
655	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-05 18:34:19
656	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-05 18:34:20
657	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:34:20
658	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:36:25
659	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-05 18:36:29
660	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-05 18:36:30
661	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:36:50
662	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-05 18:38:55
663	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-05 18:39:00
664	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-05 18:39:04
665	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-05 18:39:30
666	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 06:37:30
667	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 06:37:35
668	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 06:41:45
669	1	1	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-07 06:41:50
670	1	1	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-07 06:41:55
671	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 06:42:40
672	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 06:46:51
673	1	1	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-07 06:46:56
674	1	1	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-07 06:47:01
675	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 06:47:11
676	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 06:51:21
677	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 06:51:31
678	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 06:55:41
1709	1	9	\N	JOB_STOLEN	Bot stole contract #15 (Tip Splitter Supreme) after 3 day(s)	2026-03-29 21:59:38
679	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-07 06:55:46
680	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-07 06:55:51
681	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 06:55:51
682	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 07:00:02
683	1	1	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-07 07:00:07
684	1	1	\N	MONEY_DEDUCTED	ถูกหักเงิน 146 ฿	2026-03-07 07:00:07
685	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 07:00:22
686	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 07:04:32
687	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 07:04:42
688	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-07 07:08:53
689	1	1	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-07 07:09:03
690	1	1	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-07 07:09:08
691	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-07 07:09:08
692	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-11 08:01:16
693	1	1	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-11 08:01:21
694	1	1	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-11 08:01:26
695	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-11 08:01:51
696	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-11 08:06:01
697	1	1	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-11 08:06:11
698	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-11 08:06:11
699	1	1	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-11 08:06:16
700	1	1	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-11 08:10:21
701	1	1	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-11 08:10:32
702	1	1	\N	MONEY_DEDUCTED	ถูกหักเงิน 173 ฿	2026-03-11 08:10:32
703	1	1	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-11 08:10:32
704	1	1	\N	NEW_DAY	เริ่มวันที่ 56	2026-03-11 08:49:17
755	1	1	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 56 — Game Over	2026-03-24 16:35:52
756	1	4	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:35:56
757	1	4	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 16:40:07
758	1	4	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-24 16:40:12
759	1	4	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-24 16:40:17
760	1	4	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:40:17
761	1	4	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 16:44:27
762	1	4	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-24 16:44:32
763	1	4	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-24 16:44:37
764	1	4	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:44:57
765	1	4	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 16:49:08
766	1	4	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:49:33
767	1	4	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 16:53:43
768	1	4	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 16:53:53
769	1	4	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 16:53:58
770	1	4	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:53:58
771	1	4	\N	NEW_DAY	เริ่มวันที่ 6	2026-03-24 16:57:34
772	1	4	\N	NEW_DAY	เริ่มวันที่ 7	2026-03-24 16:57:43
773	1	4	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 7 — Game Over	2026-03-24 16:57:45
774	1	5	\N	NEW_DAY	เริ่มวันที่ 2	2026-03-24 16:57:48
775	1	5	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:57:48
776	1	5	\N	NEW_DAY	เริ่มวันที่ 3	2026-03-24 16:57:50
777	1	5	\N	NEW_DAY	เริ่มวันที่ 4	2026-03-24 16:57:52
778	1	5	\N	NEW_DAY	เริ่มวันที่ 5	2026-03-24 16:57:53
779	1	5	\N	NEW_DAY	เริ่มวันที่ 6	2026-03-24 16:57:55
780	1	5	\N	NEW_DAY	เริ่มวันที่ 7	2026-03-24 16:57:56
781	1	5	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 7 — Game Over	2026-03-24 16:57:59
782	1	6	\N	NEW_DAY	เริ่มวันที่ 2	2026-03-24 16:58:01
783	1	6	\N	NEW_DAY	เริ่มวันที่ 3	2026-03-24 16:58:03
784	1	6	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 16:58:04
785	1	6	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 16:58:09
786	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 16:58:09
787	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:02:19
788	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:02:29
789	8	7	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:05:29
790	8	7	\N	NEW_DAY	เริ่มวันที่ 2	2026-03-24 17:06:10
791	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:06:39
792	1	6	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:06:44
793	1	6	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:06:49
794	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:06:54
795	8	7	\N	NEW_DAY	เริ่มวันที่ 3	2026-03-24 17:07:23
796	8	7	\N	NEW_DAY	เริ่มวันที่ 4	2026-03-24 17:07:51
797	8	7	\N	NEW_DAY	เริ่มวันที่ 5	2026-03-24 17:07:53
798	8	7	\N	NEW_DAY	เริ่มวันที่ 6	2026-03-24 17:07:55
799	8	7	\N	NEW_DAY	เริ่มวันที่ 7	2026-03-24 17:07:56
800	8	7	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 7 — Game Over	2026-03-24 17:07:59
801	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-24 17:08:29
802	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:08:29
803	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-24 17:08:34
804	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:11:05
1710	1	9	\N	NEW_DAY	เริ่มวันที่ 7	2026-03-29 21:59:38
805	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:11:15
806	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:12:40
807	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:12:55
808	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:15:25
809	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:15:35
810	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:17:05
811	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-24 17:17:10
812	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:17:10
813	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-24 17:17:15
814	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:19:45
815	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:19:50
816	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:21:21
817	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:21:41
818	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:24:01
819	1	6	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-24 17:24:11
820	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:24:11
821	1	6	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-24 17:24:16
822	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:25:51
823	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:25:56
824	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:26:01
825	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:26:01
826	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:28:21
827	1	6	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:28:26
828	1	6	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:28:31
829	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:28:41
830	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:30:11
831	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-24 17:30:26
832	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:30:26
833	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-24 17:30:31
834	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:32:52
835	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:33:02
1157	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:33:46
836	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:34:32
837	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:35:07
838	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:35:07
839	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:35:12
840	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:37:12
841	1	6	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-24 17:37:22
842	1	6	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-24 17:37:27
843	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:37:47
844	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:39:17
845	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-24 17:39:22
846	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-24 17:39:27
847	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:39:42
848	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:41:58
849	1	6	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:42:03
850	1	6	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:42:08
851	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:42:13
852	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:43:53
853	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:43:58
854	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:46:23
855	1	6	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:46:28
856	1	6	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:46:33
857	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:46:38
858	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:48:08
859	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-24 17:48:13
860	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:48:13
861	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-24 17:48:18
862	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:50:48
863	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:50:53
864	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:52:23
865	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:52:28
866	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:52:33
867	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:52:33
1665	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:42:30
868	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:55:04
869	1	6	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-24 17:55:09
870	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:55:09
871	1	6	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-24 17:55:14
872	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:56:44
873	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-24 17:56:49
874	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-24 17:56:54
875	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:57:29
876	1	6	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-24 17:59:14
877	1	6	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-24 17:59:19
878	1	6	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-24 17:59:24
879	1	6	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-24 17:59:24
880	1	6	\N	NEW_DAY	เริ่มวันที่ 18	2026-03-26 21:39:47
881	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 21:39:48
882	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 21:40:03
883	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 21:44:14
884	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-26 21:44:19
885	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 21:44:19
886	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-26 21:44:24
887	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 21:48:29
888	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-26 21:48:39
889	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-26 21:48:44
890	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 21:49:09
891	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 21:53:20
892	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 21:53:25
893	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 21:57:35
894	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-26 21:57:40
895	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-26 21:57:45
896	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 21:58:15
897	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-26 22:02:25
898	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-26 22:02:40
899	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:02:48
900	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:02:58
901	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:02:58
902	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:03:03
903	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:04:53
904	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:04:53
905	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:04:54
906	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:04:58
907	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:06:14
908	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:06:18
909	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:06:19
910	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:06:23
911	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:07:44
912	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:07:44
913	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:09:09
914	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 15:09:14
915	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:09:14
916	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 15:09:14
917	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:10:34
918	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:10:39
919	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:11:54
920	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:11:59
921	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:13:19
922	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:13:24
923	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:14:49
924	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:14:49
925	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:14:50
926	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:14:54
927	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:16:19
928	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:16:20
929	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:16:20
930	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:16:30
931	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:17:54
932	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:17:55
933	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:19:20
934	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 15:19:20
935	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 15:19:25
936	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:19:25
937	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:20:45
938	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:20:50
939	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:20:55
940	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:20:55
941	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:22:20
942	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:22:20
943	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:22:25
944	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:22:25
945	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:23:50
946	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-27 15:23:50
947	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 203 ฿	2026-03-27 15:23:50
948	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:24:05
949	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:25:30
950	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:25:35
951	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:25:35
952	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:25:36
953	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:27:00
954	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:27:01
955	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:27:01
956	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:27:06
957	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:28:21
958	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:28:22
959	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:28:25
960	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:28:36
961	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:29:41
962	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:29:41
963	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:30:42
964	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:30:46
965	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:30:46
1700	1	9	\N	JOB_ACCEPTED	Accepted contract #14 on day 3	2026-03-28 09:19:52
966	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:30:46
967	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:31:51
968	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:31:51
969	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:31:51
970	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:31:52
971	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:32:56
972	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:32:56
973	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:32:57
974	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:33:07
975	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:34:11
976	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:34:16
977	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:35:17
978	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 15:35:21
979	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 15:35:21
980	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:35:21
981	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:36:22
982	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:36:26
983	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:36:27
984	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:36:27
985	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:37:32
986	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:37:36
987	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:38:37
988	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:38:37
989	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:38:41
990	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:38:47
991	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:39:48
992	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:39:51
993	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:40:52
994	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-27 15:40:57
995	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 207 ฿	2026-03-27 15:40:57
996	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:41:02
1701	1	9	\N	JOB_COMPLETED	Completed contract #14 on day 3	2026-03-28 09:21:07
997	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:42:03
998	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:42:07
999	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:42:07
1000	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:42:07
1001	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:43:07
1002	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 15:43:09
1003	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 15:43:12
1004	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:43:12
1005	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:44:17
1006	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:44:17
1007	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:45:19
1008	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:45:22
1009	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:45:22
1010	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:45:22
1011	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:46:27
1012	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:46:28
1013	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:46:28
1014	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:46:29
1015	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:47:32
1016	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:47:34
1017	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:47:37
1018	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:47:37
1019	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:48:38
1020	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:48:42
1021	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:49:43
1022	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 15:49:48
1023	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:49:48
1024	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 15:49:48
1025	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:50:49
1026	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:50:53
1027	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:51:57
1702	1	9	\N	NEW_DAY	เริ่มวันที่ 4	2026-03-28 09:22:01
1028	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:51:58
1029	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:51:58
1030	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:52:00
1031	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:53:03
1032	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:53:03
1033	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:53:05
1034	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:53:05
1035	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:54:08
1036	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:54:08
1037	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:54:10
1038	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:54:13
1039	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:55:13
1040	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:55:18
1041	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:55:18
1042	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:55:23
1043	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:56:23
1044	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 15:56:28
1045	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 15:56:28
1046	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:56:30
1047	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:57:33
1048	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 15:57:39
1049	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 15:57:40
1050	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:57:50
1051	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 15:58:53
1052	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 15:58:58
1053	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 15:58:59
1054	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 15:59:00
1055	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:00:04
1056	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:00:09
1057	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:01:10
1058	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:01:14
1059	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:01:14
1060	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:01:14
1703	1	9	\N	JOB_ACCEPTED	Accepted contract #15 on day 4	2026-03-29 21:09:33
1061	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:02:16
1062	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:02:19
1063	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:02:19
1064	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:02:19
1065	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:03:24
1066	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:03:24
1067	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:03:26
1068	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:03:29
1069	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:04:34
1070	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:04:39
1071	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:04:39
1072	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:04:39
1073	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:05:59
1074	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 16:05:59
1075	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 16:05:59
1076	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:05:59
1077	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:07:04
1078	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:07:09
1079	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:07:09
1080	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:07:09
1081	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:08:25
1082	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:08:25
1083	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:08:29
1084	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:09:50
1085	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:09:50
1086	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:09:54
1087	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:09:54
1088	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:09:55
1089	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:11:10
1090	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:11:10
1091	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:11:14
1092	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:11:15
1190	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:44:03
1093	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:11:15
1094	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:12:40
1095	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 16:12:40
1096	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 16:12:44
1097	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:12:45
1098	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:14:10
1099	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 16:14:10
1100	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:14:10
1101	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 16:14:15
1102	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:15:35
1103	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:15:35
1104	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:15:40
1105	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:15:40
1106	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:17:05
1107	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:17:05
1108	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:17:10
1109	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:17:15
1110	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:18:20
1111	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:18:25
1112	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:18:25
1113	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:18:25
1114	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:19:26
1115	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:19:30
1116	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:20:41
1117	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:20:41
1118	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:20:41
1119	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:21:50
1120	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:21:51
1121	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:21:51
1122	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:21:51
1123	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:23:06
1124	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:23:11
1191	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:44:07
1125	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:23:11
1126	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:23:15
1127	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:24:16
1128	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:24:16
1129	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:24:16
1130	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:24:16
1131	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:25:26
1132	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:25:31
1133	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:25:31
1134	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:25:31
1135	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:26:31
1136	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:26:35
1137	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:26:35
1138	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:26:36
1139	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:27:41
1140	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:27:41
1141	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:27:41
1142	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:27:45
1143	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:28:41
1144	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:28:41
1145	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:28:46
1146	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:28:50
1147	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:30:06
1148	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:30:07
1149	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:31:26
1150	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:31:27
1151	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:32:31
1152	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:32:32
1153	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:32:32
1154	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:32:41
1155	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:33:42
1156	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:33:46
1158	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:33:47
1159	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:35:02
1160	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:35:02
1161	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 16:35:12
1162	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:35:12
1163	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 16:35:12
1164	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:35:12
1165	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:36:37
1166	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:36:37
1167	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:36:41
1168	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:36:41
1169	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:38:02
1170	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:38:02
1171	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 16:38:06
1172	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:38:06
1173	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 16:38:07
1174	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:39:27
1175	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:39:27
1176	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:39:32
1177	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:39:32
1178	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:39:36
1179	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:40:33
1180	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:40:33
1181	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:40:48
1182	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:40:48
1183	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:41:52
1184	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 16:41:53
1185	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:41:53
1186	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 16:41:56
1187	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:42:57
1188	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:43:02
1189	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:44:03
1192	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:44:08
1193	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:45:12
1194	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:45:12
1195	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:46:13
1196	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:46:18
1197	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:47:18
1198	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 16:47:23
1199	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:47:23
1200	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 16:47:23
1201	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:48:23
1202	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:48:27
1203	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 16:49:28
1204	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 16:49:33
1205	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:45:31
1206	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:45:40
1207	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:47:02
1208	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 20:47:05
1209	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 20:47:06
1210	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:47:06
1211	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:48:26
1212	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 20:48:26
1213	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 20:48:27
1214	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:48:31
1215	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:49:31
1216	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 20:49:37
1217	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 20:49:41
1218	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:49:41
1219	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:50:42
1220	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 20:50:46
1221	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:50:46
1222	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 20:50:46
1223	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:51:47
1224	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:51:47
1225	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:52:51
1226	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 20:52:52
1227	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 20:52:52
1228	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:52:52
1229	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:53:57
1230	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:53:57
1231	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:55:02
1232	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 20:55:02
1233	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 20:55:02
1234	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:55:07
1235	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:56:11
1236	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 20:56:17
1237	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 20:56:17
1238	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:56:26
1239	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:57:28
1240	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 20:57:30
1241	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:57:30
1242	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 20:57:32
1243	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:58:33
1244	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 20:58:36
1245	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:58:36
1246	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 20:58:37
1247	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 20:59:37
1248	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 20:59:37
1249	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 20:59:37
1250	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 20:59:38
1251	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:00:38
1252	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:00:42
1253	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:01:43
1254	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:01:47
1255	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:01:47
1256	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:01:47
1257	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:02:52
1258	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:02:58
1259	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:04:02
1260	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 21:04:03
1261	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 21:04:03
1262	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:04:08
1263	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:05:10
1264	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:05:13
1265	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:06:17
1266	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:06:22
1267	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:06:22
1268	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:06:23
1269	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:07:24
1270	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:07:28
1271	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:08:30
1272	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-27 21:08:33
1273	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 178 ฿	2026-03-27 21:08:33
1274	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:08:33
1275	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:09:36
1276	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:09:38
1277	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:10:39
1278	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:10:41
1279	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:10:43
1280	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:10:53
1281	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:11:55
1282	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:11:58
1283	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:11:58
1284	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:11:59
1285	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:13:03
1286	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:13:04
1414	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:58:23
1287	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:14:06
1288	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:14:08
1289	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:14:09
1290	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:14:16
1291	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:15:19
1292	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:15:23
1293	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:16:24
1294	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:16:26
1295	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:17:29
1296	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:17:29
1297	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:17:31
1298	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:17:31
1299	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:18:35
1300	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 21:18:39
1301	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 21:18:39
1302	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:18:40
1303	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:19:44
1304	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:19:49
1305	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:19:49
1306	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:19:49
1307	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:20:50
1308	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:20:54
1309	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:20:54
1310	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:20:59
1311	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:22:00
1312	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:22:04
1313	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:22:04
1314	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:22:04
1315	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:23:05
1316	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 21:23:09
1317	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 21:23:09
1318	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:23:10
1319	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:24:14
1320	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 21:24:15
1321	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 21:24:18
1322	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:24:19
1323	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:25:20
1324	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:25:25
1325	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:26:29
1326	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:26:29
1327	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:27:30
1328	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:27:34
1329	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:27:35
1330	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:27:35
1331	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:28:40
1332	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:28:40
1333	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:29:44
1334	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:29:45
1335	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:29:45
1336	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:29:45
1337	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:30:46
1338	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:30:49
1339	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:31:50
1340	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:31:54
1341	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:32:55
1342	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:32:56
1343	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:34:00
1344	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:34:01
1345	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:35:05
1346	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:35:09
1347	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:36:11
1348	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 21:36:16
1349	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 21:36:16
1350	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:36:21
1351	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:37:25
1352	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:37:26
1353	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:38:27
1354	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:38:30
1355	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:38:31
1356	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:38:31
1357	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:39:32
1358	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:39:36
1359	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:39:36
1360	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:39:42
1361	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:40:46
1362	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:40:51
1363	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:41:52
1364	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:41:56
1365	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:42:59
1366	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:43:04
1367	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:43:04
1368	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:43:06
1369	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:44:07
1370	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:44:12
1371	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:44:13
1372	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:44:13
1373	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:45:17
1374	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:45:23
1375	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:45:26
1376	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:45:27
1377	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:46:31
1378	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:46:33
1379	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:46:33
1380	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:46:36
1381	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:47:37
1704	1	9	\N	JOB_REJECTED	REJECTED contract #15 on day 4 (score 0)	2026-03-29 21:09:52
1382	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:47:42
1383	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:47:42
1384	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:47:47
1385	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:48:52
1386	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 21:48:52
1387	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:48:52
1388	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 21:48:57
1389	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:49:57
1390	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:50:02
1391	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:51:07
1392	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:51:08
1393	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:51:12
1394	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:51:12
1395	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:52:13
1396	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:52:17
1397	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:52:17
1398	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:52:18
1399	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:53:22
1400	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:53:23
1401	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:54:28
1402	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:54:31
1403	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:55:33
1404	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:55:37
1405	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:55:37
1406	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 21:55:38
1407	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:56:53
1408	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 21:56:57
1409	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:56:57
1410	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 21:56:58
1411	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:58:18
1412	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 21:58:23
1413	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:58:23
1415	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 21:59:48
1416	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-27 21:59:48
1417	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-27 21:59:48
1418	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 21:59:52
1419	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:01:14
1420	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:01:18
1421	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:02:39
1422	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:02:43
1423	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:02:43
1424	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:02:43
1425	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:04:04
1426	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:04:08
1427	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:05:29
1428	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:05:33
1429	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:06:54
1430	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 22:06:59
1431	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 22:06:59
1432	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:07:08
1433	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:08:29
1434	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 22:08:34
1435	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:08:34
1436	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 22:08:34
1437	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:09:58
1438	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:09:59
1439	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:09:59
1440	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:10:03
1441	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:11:24
1442	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:11:29
1443	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:11:30
1444	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:11:30
1445	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:12:54
1446	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:12:59
1447	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:12:59
1448	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:13:09
1449	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:14:30
1450	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:14:34
1451	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:15:55
1452	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 22:15:59
1453	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 22:16:00
1454	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:16:14
1455	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:17:35
1456	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:17:40
1457	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:19:04
1458	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:19:05
1459	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:19:05
1460	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:19:20
1461	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:20:45
1462	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:20:45
1463	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:20:49
1464	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:20:55
1465	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:22:19
1466	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:22:21
1467	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:23:45
1468	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:23:50
1469	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:23:50
1470	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:23:55
1471	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:25:16
1472	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:25:20
1473	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:26:41
1474	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-27 22:26:45
1475	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 213 ฿	2026-03-27 22:26:45
1476	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:26:45
1477	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:28:10
1478	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:28:11
1479	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:29:36
1480	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:29:41
1481	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:31:05
1482	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:31:06
1483	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:32:30
1484	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:32:31
1485	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:33:56
1486	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:33:56
1487	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:33:57
1488	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:33:57
1489	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:35:21
1490	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:35:31
1491	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:35:31
1492	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:35:31
1493	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:36:52
1494	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-27 22:36:57
1495	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 164 ฿	2026-03-27 22:36:57
1496	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:37:06
1497	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:38:27
1498	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:38:32
1499	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:39:56
1500	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 22:39:57
1501	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:39:57
1502	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 22:39:57
1503	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:41:21
1504	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:41:22
1505	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:41:22
1506	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:41:26
1507	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:42:47
1508	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:42:47
1509	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:44:12
1705	1	9	\N	JOB_CARRY_OVER	Carried contract #15 (Tip Splitter Supreme) into next day (1)	2026-03-29 21:59:30
1510	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:44:17
1511	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:45:42
1512	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:45:42
1513	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:45:43
1514	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:45:43
1515	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:47:07
1516	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 22:47:08
1517	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 22:47:12
1518	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:47:12
1519	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:48:33
1520	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 22:48:37
1521	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 22:48:38
1522	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:48:38
1523	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:50:03
1524	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 22:50:03
1525	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 22:50:07
1526	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:50:08
1527	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:51:32
1528	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:51:33
1529	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:52:58
1530	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:52:58
1531	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:54:24
1532	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-27 22:54:28
1533	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-27 22:54:28
1534	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:54:28
1535	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:55:53
1536	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:55:53
1537	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:57:18
1538	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-27 22:57:18
1539	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:57:18
1540	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-27 22:57:19
1541	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 22:58:43
1542	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 22:58:43
1543	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-27 23:00:08
1544	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-27 23:00:09
1545	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-27 23:00:09
1546	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-27 23:00:14
1547	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:44:55
1548	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:44:55
1549	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:46:20
1550	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:46:25
1551	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:47:46
1552	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-28 03:47:50
1553	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-28 03:47:51
1554	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:47:51
1555	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:49:16
1556	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:49:16
1557	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:50:41
1558	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:50:41
1559	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:52:06
1560	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:52:11
1561	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:53:36
1562	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:53:36
1563	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:55:01
1564	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-28 03:55:06
1565	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-28 03:55:07
1566	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:55:21
1567	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:56:46
1568	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-28 03:56:46
1569	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:56:46
1570	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-28 03:56:47
1571	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:58:07
1572	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:58:11
1573	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 03:59:32
1574	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 03:59:36
1575	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 03:59:37
1576	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 03:59:42
1577	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:01:06
1578	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:01:07
1579	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:02:31
1580	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:02:32
1581	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:03:52
1582	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-28 04:03:52
1583	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:03:52
1584	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-28 04:03:53
1585	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:04:54
1586	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:04:57
1587	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:04:57
1588	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:04:58
1589	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:06:00
1590	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-28 04:06:02
1591	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-28 04:06:03
1592	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:06:07
1593	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:07:08
1594	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:07:10
1595	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:08:12
1596	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:08:15
1597	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:09:33
1598	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:09:37
1599	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:11:01
1600	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:11:02
1601	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:12:27
1633	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:26:28
1706	1	9	\N	NEW_DAY	เริ่มวันที่ 5	2026-03-29 21:59:30
1602	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:12:33
1603	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:13:57
1604	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-28 04:14:03
1605	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:14:03
1606	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-28 04:14:07
1607	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:15:28
1608	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:15:28
1609	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:15:32
1610	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:15:37
1611	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:16:58
1612	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-28 04:17:02
1613	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-28 04:17:03
1614	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:17:08
1615	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:18:32
1616	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-28 04:18:37
1617	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-28 04:18:38
1618	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:18:43
1619	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:20:08
1620	8	8	5	ELECTRICITY_BILL	ได้รับแจ้งเตือน ค่าไฟฟ้าเดือนนี้สูงผิดปกติ! ถูกหักเงินเพิ่ม	2026-03-28 04:20:13
1621	8	8	\N	MONEY_DEDUCTED	ถูกหักเงิน 130 ฿	2026-03-28 04:20:13
1622	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:20:28
1623	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:21:53
1624	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:21:54
1625	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:21:58
1626	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:22:04
1627	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:23:29
1628	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:23:33
1629	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:24:54
1630	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:24:59
1631	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:26:24
1632	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:26:24
1707	1	9	\N	JOB_CARRY_OVER	Carried contract #15 (Tip Splitter Supreme) into next day (2)	2026-03-29 21:59:34
1634	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:26:29
1635	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:27:54
1636	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:27:54
1637	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:29:19
1638	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:29:23
1639	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 04:29:24
1640	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:29:24
1641	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:30:48
1642	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:30:49
1643	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:32:14
1644	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-28 04:32:14
1645	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-28 04:32:15
1646	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:32:15
1647	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:33:39
1648	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:33:40
1649	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:35:05
1650	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:35:05
1651	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:36:30
1652	8	8	4	LAPTOP_OVERHEAT	โน๊ตบุ๊คร้อนมาก! แบตเตอรี่จะหมดเร็วขึ้น 2 เท่า	2026-03-28 04:36:30
1653	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:36:30
1654	8	8	4	LAPTOP_OVERHEAT_RESOLVED	เหตุการณ์ LAPTOP_OVERHEAT สิ้นสุดลงแล้ว	2026-03-28 04:36:34
1655	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:37:54
1656	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:37:55
1657	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:39:20
1658	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:39:20
1659	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:40:45
1660	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-28 04:40:49
1661	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-28 04:40:50
1662	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:41:00
1663	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:42:25
1664	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 04:42:26
1708	1	9	\N	NEW_DAY	เริ่มวันที่ 6	2026-03-29 21:59:34
1666	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:42:40
1667	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:44:01
1668	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:44:06
1669	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:45:30
1670	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:45:31
1671	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 04:46:55
1672	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 04:46:56
1673	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:04:36
1674	8	8	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 08:04:41
1675	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:04:41
1676	8	8	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 08:04:46
1677	1	6	\N	JOB_ACCEPTED	Accepted contract #10 on day 18	2026-03-28 08:05:56
1678	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:08:51
1679	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:08:56
1680	1	6	\N	JOB_COMPLETED	Completed contract #10 on day 18	2026-03-28 08:09:39
1681	1	6	\N	NEW_DAY	เริ่มวันที่ 19	2026-03-28 08:09:49
1682	1	6	\N	NEW_DAY	เริ่มวันที่ 20	2026-03-28 08:09:58
1683	1	6	\N	NEW_DAY	เริ่มวันที่ 21	2026-03-28 08:10:00
1684	1	6	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 21 — Game Over	2026-03-28 08:10:06
1685	1	9	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:10:11
1686	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:13:06
1687	8	8	2	INTERNET_DOWN	อินเทอร์เน็ตเกิดปัญหา! ไม่สามารถเข้าหน้าเว็บงานได้ ส่งงานหรือรับงานไม่ได้ชั่วคราว	2026-03-28 08:13:11
1688	8	8	2	INTERNET_DOWN_RESOLVED	เหตุการณ์ INTERNET_DOWN สิ้นสุดลงแล้ว	2026-03-28 08:13:16
1689	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:13:21
1690	1	9	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:14:22
1691	1	9	3	HEAVY_RAIN	ฝนตกหนัก! สัญญาณอินเทอร์เน็ตไม่เสถียร อาจใช้งานเว็บได้ช้าลง	2026-03-28 08:14:26
1692	1	9	3	HEAVY_RAIN_RESOLVED	เหตุการณ์ HEAVY_RAIN สิ้นสุดลงแล้ว	2026-03-28 08:14:32
1693	1	9	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:14:37
1694	8	8	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:17:32
1695	8	8	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-03-28 08:17:37
1696	8	8	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-03-28 08:17:42
1697	8	8	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:17:42
1698	1	9	\N	FORCE_SKIP_DAY	แบตเตอรี่หมด! ข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save หายไปแล้ว	2026-03-28 08:18:47
1699	1	9	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-28 08:18:52
1711	1	9	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 7 — Game Over	2026-03-29 21:59:41
1712	1	10	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-29 21:59:59
1713	1	10	\N	NEW_DAY	เริ่มวันที่ 2	2026-03-29 22:00:06
1714	1	10	\N	NEW_DAY	เริ่มวันที่ 3	2026-03-29 22:00:08
1715	1	10	\N	NEW_DAY	เริ่มวันที่ 4	2026-03-29 22:00:09
1716	1	10	\N	NEW_DAY	เริ่มวันที่ 5	2026-03-29 22:00:13
1717	1	10	\N	NEW_DAY	เริ่มวันที่ 6	2026-03-29 22:00:15
1718	1	10	\N	NEW_DAY	เริ่มวันที่ 7	2026-03-29 22:00:18
1719	1	10	\N	GAME_OVER	ไม่มีเงินจ่ายค่าเช่าวันที่ 7 — Game Over	2026-03-29 22:00:20
1720	1	11	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-03-29 22:00:29
1721	1	11	\N	NEW_DAY	เริ่มวันที่ 2	2026-03-29 22:00:37
1722	9	12	6	CAFE_DISCOUNT	ร้าน Starbugs Cafe มีโปรลดราคา! ทำงานได้เร็วขึ้น 20%	2026-04-23 06:21:45
1723	9	13	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-04-23 06:21:45
1724	9	12	6	CAFE_DISCOUNT_RESOLVED	เหตุการณ์ CAFE_DISCOUNT สิ้นสุดลงแล้ว	2026-04-23 06:21:50
1725	9	12	1	BLACKOUT	ไฟฟ้าดับกะทันหัน! โน๊ตบุ๊คจะไม่ถูกชาร์จ หากแบตหมดจะบังคับข้ามไปวันถัดไป ข้อมูลที่ไม่ได้ save จะหายไป	2026-04-23 06:21:55
\.


--
-- TOC entry 5674 (class 0 OID 26951)
-- Dependencies: 249
-- Data for Name: simulation_saves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.simulation_saves (save_id, user_id, save_name, sim_money, sim_reputation, battery_percent, is_plugged_in, current_location_id, current_day, current_hour, jobs_completed, jobs_failed, total_earned, total_spent, environment_status, is_active, created_at, updated_at) FROM stdin;
1	1	Auto Save	0.00	10	100	1	1	56	9.2	0	0	0.00	840.00	{\\"is_blackout\\":false,\\"events_today_count\\":2,\\"last_event_time\\":\\"2026-03-11T08:10:32.009Z\\",\\"critical_today\\":true}	0	2026-03-04 18:47:52	2026-03-24 16:35:52
4	1	Auto Save	0.00	10	24	1	1	7	8.0	0	0	0.00	0.00	{\\"critical_today\\":true,\\"events_today_count\\":2,\\"last_event_time\\":\\"2026-03-24T16:53:58.657Z\\",\\"is_blackout\\":false}	0	2026-03-24 16:35:56	2026-03-24 16:57:45
5	1	Auto Save	0.00	10	100	1	1	7	8.0	0	0	0.00	0.00	{\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-03-24T16:57:48.977Z\\",\\"is_blackout\\":false}	0	2026-03-24 16:57:47	2026-03-24 16:57:59
6	1	Auto Save	500.00	15	100	1	1	21	8.0	1	0	500.00	0.00	{\\"events_today_count\\":2,\\"last_event_time\\":\\"2026-03-24T17:59:24.537Z\\",\\"is_blackout\\":false,\\"critical_today\\":true}	0	2026-03-24 16:58:00	2026-03-28 08:10:06
7	8	Auto Save	0.00	10	100	1	1	7	8.0	0	0	0.00	0.00	{\\"is_blackout\\":false,\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-03-24T17:05:29.636Z\\"}	0	2026-03-24 17:05:23	2026-03-24 17:07:59
8	8	Auto Save	0.00	10	100	1	1	259	8.0	0	0	0.00	1095.00	{\\"events_today_count\\":2,\\"last_event_time\\":\\"2026-03-28T08:17:42.297Z\\",\\"critical_today\\":true,\\"is_blackout\\":true}	1	2026-03-24 17:08:25	2026-03-28 08:18:59
9	1	Auto Save	1000.00	4	100	1	1	7	8.0	1	1	1000.00	0.00	{\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-03-28T08:18:52.422Z\\",\\"is_blackout\\":false}	0	2026-03-28 08:10:08	2026-03-29 21:59:41
10	1	Auto Save	0.00	10	100	1	1	7	8.0	0	0	0.00	0.00	{\\"is_blackout\\":false,\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-03-29T21:59:59.502Z\\"}	0	2026-03-29 21:59:44	2026-03-29 22:00:20
11	1	Auto Save	0.00	10	100	1	1	2	8.0	0	0	0.00	0.00	{\\"is_blackout\\":false,\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-03-29T22:00:29.545Z\\"}	1	2026-03-29 22:00:23	2026-03-29 22:00:39
12	9	Auto Save	0.00	10	100	1	1	1	8.0	0	0	0.00	0.00	{\\"events_today_count\\":2,\\"last_event_time\\":\\"2026-04-23T06:21:55.310Z\\",\\"is_blackout\\":true,\\"critical_today\\":true}	1	2026-04-23 06:21:42	2026-04-23 06:22:00
13	9	Auto Save	0.00	10	100	1	1	1	8.0	0	0	0.00	0.00	{\\"critical_today\\":true,\\"events_today_count\\":1,\\"last_event_time\\":\\"2026-04-23T06:21:45.309Z\\",\\"is_blackout\\":true}	1	2026-04-23 06:21:42	2026-04-23 06:21:50
14	16	Auto Save	0.00	10	100	1	1	1	8.0	0	0	0.00	0.00	\N	1	2026-07-28 16:49:01.333499	2026-07-28 16:49:01.333499
15	16	Auto Save	0.00	10	100	1	1	1	8.0	0	0	0.00	0.00	\N	1	2026-07-28 16:49:01.335736	2026-07-28 16:49:01.335736
\.


--
-- TOC entry 5675 (class 0 OID 26971)
-- Dependencies: 250
-- Data for Name: survey_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_options (id, question_id, option_text, option_description, "order") FROM stdin;
1	1	ดูวิดีโอ	เรียนรู้ผ่านวิดีโอและตัวอย่าง	1
2	1	ลงมือทำ	เรียนรู้ผ่านการฝึกเขียนโค้ดจริง	2
3	1	อ่านบทความ	เรียนรู้ผ่านเนื้อหาและเอกสาร	3
4	2	พัฒนาเว็บไซต์	สร้างเว็บแอปพลิเคชัน	1
5	2	วิเคราะห์ข้อมูล	Data Science & Analytics	2
6	2	สร้างเกม	Game Development	3
7	2	ทั่วไป	เรียนรู้พื้นฐานเพื่อใช้งานทั่วไป	4
\.


--
-- TOC entry 5676 (class 0 OID 26978)
-- Dependencies: 251
-- Data for Name: survey_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_questions (id, title, description, image) FROM stdin;
1	คุณเรียนรู้ได้ดีที่สุดด้วยวิธีใด?	เราจะปรับเส้นทางการเรียนรู้ให้เหมาะกับคุณ	cat-coding.png
2	คุณอยากเรียน Python ไปทำอะไร?	เป้าหมายจะช่วยให้เราแนะนำเนื้อหาที่เหมาะกับคุณ	cat-mascot.png
3	ประสบการณ์ของคุณ	เลือกระดับที่ตรงกับคุณมากที่สุด	cat-logo.png
\.


--
-- TOC entry 5678 (class 0 OID 27000)
-- Dependencies: 253
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_achievements (id, user_id, achievement_id, unlocked_at) FROM stdin;
\.


--
-- TOC entry 5679 (class 0 OID 27004)
-- Dependencies: 254
-- Data for Name: user_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_contracts (id, user_id, contract_id, status, status_reason, accepted_at, accepted_day, carried_days, completed_day, failed_day) FROM stdin;
1	1	10	COMPLETED	SUBMITTED	2026-03-28 08:05:56	18	0	18	\N
2	1	14	COMPLETED	SUBMITTED	2026-03-28 09:19:52	3	0	3	\N
3	1	15	FAILED	BOT_STEAL	2026-03-29 21:09:33	4	3	\N	6
\.


--
-- TOC entry 5695 (class 0 OID 27461)
-- Dependencies: 270
-- Data for Name: user_cosmetics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_cosmetics (user_id, cosmetic_id, is_equipped, purchased_at) FROM stdin;
\.


--
-- TOC entry 5680 (class 0 OID 27011)
-- Dependencies: 255
-- Data for Name: user_inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_inventory (id, user_id, item_id, purchased_at) FROM stdin;
9	10	13	2026-06-30 18:40:15
11	11	13	2026-06-30 18:47:33
12	11	15	2026-07-28 03:56:11.524433
13	16	13	2026-07-28 16:59:03.110163
\.


--
-- TOC entry 5696 (class 0 OID 27466)
-- Dependencies: 271
-- Data for Name: user_mailbox; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_mailbox (mail_id, user_id, title, content, attachment_coins, is_read, is_claimed, created_at) FROM stdin;
9	11	สรุปโจทย์สำเร็จ: คำนวณค่าไฟประจำเดือน	คุณส่งโจทย์ "คำนวณค่าไฟประจำเดือน" แล้ว คะแนนรวม 97/100 ผ่าน test cases 3/3 ได้รับรางวัล 97 เหรียญ	97	1	1	2026-08-16 02:14:41.015607
10	16	มีคนทำโจทย์ของคุณแล้ว: คำนวณค่าไฟประจำเดือน	มีผู้เล่นส่งคำตอบโจทย์ "คำนวณค่าไฟประจำเดือน" ของคุณแล้ว คะแนนที่ได้คือ 97/100 คุณได้รับโบนัสผู้สร้างโจทย์ 15 เหรียญ	15	1	1	2026-08-16 02:14:41.017753
8	11	สรุปโจทย์ไม่สำเร็จ: หาเลขที่มากที่สุด	คุณทำโจทย์ "หาเลขที่มากที่สุด" ไม่ทันเวลาที่กำหนด จึงได้รับคะแนน 0 และรางวัล 0 เหรียญ	0	1	0	2026-08-16 01:38:28.446277
11	11	สรุปโจทย์ไม่สำเร็จ: หาคะแนนสูงสุด	คุณทำโจทย์ "หาคะแนนสูงสุด" ไม่ทันเวลาที่กำหนด จึงได้รับคะแนน 0 และรางวัล 0 เหรียญ	0	1	0	2026-08-16 03:17:00.974325
13	10	มีคนทำโจทย์ของคุณแล้ว: กลับคำในประโยค	มีผู้เล่นส่งคำตอบโจทย์ "กลับคำในประโยค" ของคุณแล้ว คะแนนที่ได้คือ 98/100 คุณได้รับโบนัสผู้สร้างโจทย์ 15 เหรียญ	15	0	0	2026-08-16 04:56:25.270802
12	11	สรุปโจทย์สำเร็จ: กลับคำในประโยค	คุณส่งโจทย์ "กลับคำในประโยค" แล้ว คะแนนรวม 98/100 ผ่าน test cases 3/3 ได้รับรางวัล 98 เหรียญ	98	1	1	2026-08-16 04:56:25.269319
14	16	สรุปโจทย์สำเร็จ: ตรวจสอบอุณหภูมิ	คุณส่งโจทย์ "ตรวจสอบอุณหภูมิ" แล้ว คะแนนรวม 48/100 ผ่าน test cases 0/3 ได้รับรางวัล 96 เหรียญ	96	1	0	2026-08-16 15:19:14.669539
\.


--
-- TOC entry 5698 (class 0 OID 27476)
-- Dependencies: 273
-- Data for Name: user_missions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_missions (user_mission_id, user_id, email_id, status, accepted_at, completed_at) FROM stdin;
\.


--
-- TOC entry 5708 (class 0 OID 27655)
-- Dependencies: 283
-- Data for Name: user_presence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_presence (user_id, mode, activity_label, current_path, last_seen) FROM stdin;
11	learn	กำลังดูบทเรียน	/learn	2026-08-24 17:35:54.91568
10	admin	อยู่ในหน้าแอดมิน	/admin/dashboard	2026-08-24 17:36:01.692484
16	learn	กำลังอ่านบทเรียน	/lesson/1	2026-08-21 14:15:26.501625
\.


--
-- TOC entry 5681 (class 0 OID 27015)
-- Dependencies: 256
-- Data for Name: user_profile_showcase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profile_showcase (id, user_id, achievement_id, display_order) FROM stdin;
\.


--
-- TOC entry 5700 (class 0 OID 27482)
-- Dependencies: 275
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_progress (progress_id, user_id, lesson_id, status, score, completed_at) FROM stdin;
\.


--
-- TOC entry 5702 (class 0 OID 27488)
-- Dependencies: 277
-- Data for Name: user_quiz_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_quiz_attempts (attempt_id, user_id, lesson_id, quiz_type, score, total_questions, passed, created_at) FROM stdin;
\.


--
-- TOC entry 5704 (class 0 OID 27494)
-- Dependencies: 279
-- Data for Name: user_survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_survey_responses (response_id, user_id, question_id, selected_option, created_at) FROM stdin;
\.


--
-- TOC entry 5677 (class 0 OID 26984)
-- Dependencies: 252
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, username, password_hash, email, created_at, reputation, equipped_theme_id, equipped_mouse_effect_id, equipped_profile_frame_id, avatar_url, bio, role, level, xp, virtual_currency, is_deleted, is_banned, ban_until, deleted_at) FROM stdin;
1	test	$2b$10$.g6mWLu5/itUWztGvhusv.WsNSmJMVtge7eMCapzPUDulm0cHiqVW	\N	2026-02-18 08:55:06	10	\N	\N	\N	\N	\N	user	2	250	70	0	0	\N	\N
8	123	$2b$10$ouVGRGz/415AVML0TBnm4elpb8skVyUrU4GZSW9zIFM.QnXcmeUSy	abc@mail.com	2026-03-24 15:38:32	10	\N	\N	\N	\N	\N	user	1	0	0	0	0	\N	\N
9	max	$2b$10$TRgCkVKswG8YDrlapEpeGeEHS6qLijnnXzhfZWg0nIjzzQAd60RLC	maxmac13333@gmail.com	2026-04-19 14:32:12	10	\N	\N	\N	\N	\N	user	100	1250	505	0	0	\N	\N
10	Teerapat boonmeeprasert	$2b$10$Mn0nq74Hp4E5QQXgFICpteN9G5dbtJ4UoEIrQ9k28KuLmghLSBtn6	\N	2026-06-30 18:28:59	10	\N	\N	\N	\N	\N	admin	1	0	0	0	0	\N	\N
12	1	$2b$10$hEBXt9Gc6g2r1/ZlCx6Ob.XliU/piLjg67x0b9v5WqsvqsP5B7QYm	1@gmail.com	2026-07-02 09:38:21	10	\N	\N	\N	\N	\N	user	0	0	0	0	0	\N	\N
13	nn	$2b$10$MkZkOihIUEjy23RbHwIC8OlI4LBizKNf71VBd8ES7cU01WrvQW/fq	nn@gmail.com	2026-07-02 09:38:51	10	\N	\N	\N	\N	\N	user	0	0	0	0	0	\N	\N
14	d	$2b$10$lIFnsyaDvG89rZ2Lh0BR5.tc1.QJZRYzZ7p5IjUg2bUv.3RtKJQVm	uu11@gmail.com	2026-07-03 21:31:13	10	\N	\N	\N	\N	\N	user	2	20	116	0	0	\N	\N
16	belmoth	$2b$10$IIjamGauGf39KhqY6t.rFuAOZwwUehxskmJa2iMJ9yDnKs0lfYTgG	za@gmail.com	2026-07-28 15:29:07.169052	10	\N	\N	\N	\N	\N	user	1	0	15	0	0	\N	\N
11	ปุณยภา สกุลคู	$2b$10$534zmnXjYr21ZEblZinGCeY92AmZHjtQrEiUxLc8.sI07/C4LrCG2	punyapanam0911@gmail.com	2026-06-30 18:47:11	10	13	15	\N	\N	\N	user	1	350	260	0	0	\N	\N
\.


--
-- TOC entry 5706 (class 0 OID 27499)
-- Dependencies: 281
-- Data for Name: virtual_emails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.virtual_emails (email_id, sender_name, subject, body_content, related_exercise_id, difficulty_level, sent_at) FROM stdin;
\.


--
-- TOC entry 5814 (class 0 OID 0)
-- Dependencies: 284
-- Name: achievements_achievement_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.achievements_achievement_id_seq', 21, false);


--
-- TOC entry 5815 (class 0 OID 0)
-- Dependencies: 285
-- Name: active_accepted_challenges_challenge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.active_accepted_challenges_challenge_id_seq', 1, false);


--
-- TOC entry 5816 (class 0 OID 0)
-- Dependencies: 286
-- Name: active_accepted_challenges_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.active_accepted_challenges_user_id_seq', 1, false);


--
-- TOC entry 5817 (class 0 OID 0)
-- Dependencies: 288
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advanced_validation_choices_id_seq', 41, false);


--
-- TOC entry 5818 (class 0 OID 0)
-- Dependencies: 287
-- Name: advanced_validation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advanced_validation_id_seq', 11, false);


--
-- TOC entry 5819 (class 0 OID 0)
-- Dependencies: 259
-- Name: assessment_choices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_choices_id_seq', 1, false);


--
-- TOC entry 5820 (class 0 OID 0)
-- Dependencies: 261
-- Name: assessment_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_questions_id_seq', 1, false);


--
-- TOC entry 5821 (class 0 OID 0)
-- Dependencies: 289
-- Name: assets_asset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assets_asset_id_seq', 1, false);


--
-- TOC entry 5822 (class 0 OID 0)
-- Dependencies: 290
-- Name: contracts_contract_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contracts_contract_id_seq', 18, false);


--
-- TOC entry 5823 (class 0 OID 0)
-- Dependencies: 263
-- Name: cosmetics_cosmetic_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cosmetics_cosmetic_id_seq', 5, true);


--
-- TOC entry 5824 (class 0 OID 0)
-- Dependencies: 291
-- Name: email_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.email_verifications_id_seq', 10, true);


--
-- TOC entry 5825 (class 0 OID 0)
-- Dependencies: 292
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercise_submissions_submission_id_seq', 17, false);


--
-- TOC entry 5826 (class 0 OID 0)
-- Dependencies: 293
-- Name: exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.exercises_exercise_id_seq', 14, false);


--
-- TOC entry 5827 (class 0 OID 0)
-- Dependencies: 294
-- Name: financial_ledger_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.financial_ledger_transaction_id_seq', 9, true);


--
-- TOC entry 5828 (class 0 OID 0)
-- Dependencies: 295
-- Name: game_rooms_room_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_rooms_room_id_seq', 1, false);


--
-- TOC entry 5829 (class 0 OID 0)
-- Dependencies: 296
-- Name: game_sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.game_sessions_session_id_seq', 1, false);


--
-- TOC entry 5830 (class 0 OID 0)
-- Dependencies: 297
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.learning_ai_tasks_task_id_seq', 17, true);


--
-- TOC entry 5831 (class 0 OID 0)
-- Dependencies: 298
-- Name: lesson_quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_quiz_attempts_attempt_id_seq', 41, true);


--
-- TOC entry 5832 (class 0 OID 0)
-- Dependencies: 299
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_quizzes_quiz_id_seq', 33, false);


--
-- TOC entry 5833 (class 0 OID 0)
-- Dependencies: 300
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesson_slides_slide_id_seq', 80, false);


--
-- TOC entry 5834 (class 0 OID 0)
-- Dependencies: 301
-- Name: lessons_lesson_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_lesson_id_seq', 16, false);


--
-- TOC entry 5835 (class 0 OID 0)
-- Dependencies: 302
-- Name: level_config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.level_config_id_seq', 3, false);


--
-- TOC entry 5836 (class 0 OID 0)
-- Dependencies: 303
-- Name: locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_location_id_seq', 3, false);


--
-- TOC entry 5837 (class 0 OID 0)
-- Dependencies: 304
-- Name: mini_game_current_conversations_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_current_conversations_user_id_seq', 1, false);


--
-- TOC entry 5838 (class 0 OID 0)
-- Dependencies: 305
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_dialogues_dialogue_id_seq', 41, false);


--
-- TOC entry 5839 (class 0 OID 0)
-- Dependencies: 306
-- Name: mini_game_exercise_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_exercise_submissions_submission_id_seq', 168, false);


--
-- TOC entry 5840 (class 0 OID 0)
-- Dependencies: 307
-- Name: mini_game_exercises_exercise_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_exercises_exercise_id_seq', 20, false);


--
-- TOC entry 5841 (class 0 OID 0)
-- Dependencies: 308
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_locations_location_id_seq', 2, false);


--
-- TOC entry 5842 (class 0 OID 0)
-- Dependencies: 309
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_npcs_npc_id_seq', 3, false);


--
-- TOC entry 5843 (class 0 OID 0)
-- Dependencies: 310
-- Name: mini_game_user_exercise_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mini_game_user_exercise_progress_progress_id_seq', 96, false);


--
-- TOC entry 5844 (class 0 OID 0)
-- Dependencies: 311
-- Name: modules_module_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_module_id_seq', 7, false);


--
-- TOC entry 5845 (class 0 OID 0)
-- Dependencies: 265
-- Name: multiplayer_challenges_challenge_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.multiplayer_challenges_challenge_id_seq', 13, true);


--
-- TOC entry 5846 (class 0 OID 0)
-- Dependencies: 268
-- Name: multiplayer_submissions_submission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.multiplayer_submissions_submission_id_seq', 9, true);


--
-- TOC entry 5847 (class 0 OID 0)
-- Dependencies: 312
-- Name: music_tracks_track_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.music_tracks_track_id_seq', 1, false);


--
-- TOC entry 5848 (class 0 OID 0)
-- Dependencies: 329
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- TOC entry 5849 (class 0 OID 0)
-- Dependencies: 313
-- Name: question_choices_choice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_choices_choice_id_seq', 413, false);


--
-- TOC entry 5850 (class 0 OID 0)
-- Dependencies: 314
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quiz_questions_question_id_seq', 94, false);


--
-- TOC entry 5851 (class 0 OID 0)
-- Dependencies: 315
-- Name: random_events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.random_events_event_id_seq', 7, false);


--
-- TOC entry 5852 (class 0 OID 0)
-- Dependencies: 316
-- Name: room_participants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_participants_id_seq', 1, false);


--
-- TOC entry 5853 (class 0 OID 0)
-- Dependencies: 317
-- Name: shop_items_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.shop_items_item_id_seq', 19, true);


--
-- TOC entry 5854 (class 0 OID 0)
-- Dependencies: 318
-- Name: simulation_active_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.simulation_active_events_id_seq', 580, false);


--
-- TOC entry 5855 (class 0 OID 0)
-- Dependencies: 319
-- Name: simulation_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.simulation_logs_log_id_seq', 1726, false);


--
-- TOC entry 5856 (class 0 OID 0)
-- Dependencies: 320
-- Name: simulation_saves_save_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.simulation_saves_save_id_seq', 15, true);


--
-- TOC entry 5857 (class 0 OID 0)
-- Dependencies: 321
-- Name: survey_options_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_options_id_seq', 8, false);


--
-- TOC entry 5858 (class 0 OID 0)
-- Dependencies: 322
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_questions_id_seq', 4, false);


--
-- TOC entry 5859 (class 0 OID 0)
-- Dependencies: 323
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 1, false);


--
-- TOC entry 5860 (class 0 OID 0)
-- Dependencies: 324
-- Name: user_contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_contracts_id_seq', 4, false);


--
-- TOC entry 5861 (class 0 OID 0)
-- Dependencies: 325
-- Name: user_inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_inventory_id_seq', 13, true);


--
-- TOC entry 5862 (class 0 OID 0)
-- Dependencies: 272
-- Name: user_mailbox_mail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_mailbox_mail_id_seq', 14, true);


--
-- TOC entry 5863 (class 0 OID 0)
-- Dependencies: 274
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_missions_user_mission_id_seq', 1, false);


--
-- TOC entry 5864 (class 0 OID 0)
-- Dependencies: 326
-- Name: user_presence_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_presence_user_id_seq', 12, false);


--
-- TOC entry 5865 (class 0 OID 0)
-- Dependencies: 327
-- Name: user_profile_showcase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_profile_showcase_id_seq', 1, false);


--
-- TOC entry 5866 (class 0 OID 0)
-- Dependencies: 276
-- Name: user_progress_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_progress_progress_id_seq', 1, false);


--
-- TOC entry 5867 (class 0 OID 0)
-- Dependencies: 278
-- Name: user_quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_quiz_attempts_attempt_id_seq', 1, false);


--
-- TOC entry 5868 (class 0 OID 0)
-- Dependencies: 280
-- Name: user_survey_responses_response_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_survey_responses_response_id_seq', 1, false);


--
-- TOC entry 5869 (class 0 OID 0)
-- Dependencies: 328
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 16, true);


--
-- TOC entry 5870 (class 0 OID 0)
-- Dependencies: 282
-- Name: virtual_emails_email_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.virtual_emails_email_id_seq', 1, false);


--
-- TOC entry 5248 (class 2606 OID 27020)
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (achievement_id);


--
-- TOC entry 5390 (class 2606 OID 27514)
-- Name: active_accepted_challenges active_accepted_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT active_accepted_challenges_pkey PRIMARY KEY (user_id, challenge_id);


--
-- TOC entry 5253 (class 2606 OID 27024)
-- Name: advanced_validation_choices advanced_validation_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advanced_validation_choices
    ADD CONSTRAINT advanced_validation_choices_pkey PRIMARY KEY (id);


--
-- TOC entry 5250 (class 2606 OID 27022)
-- Name: advanced_validation advanced_validation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advanced_validation
    ADD CONSTRAINT advanced_validation_pkey PRIMARY KEY (id);


--
-- TOC entry 5392 (class 2606 OID 27516)
-- Name: assessment_choices assessment_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_choices
    ADD CONSTRAINT assessment_choices_pkey PRIMARY KEY (id);


--
-- TOC entry 5394 (class 2606 OID 27518)
-- Name: assessment_questions assessment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 5255 (class 2606 OID 27026)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (asset_id);


--
-- TOC entry 5258 (class 2606 OID 27028)
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (contract_id);


--
-- TOC entry 5396 (class 2606 OID 27520)
-- Name: cosmetics cosmetics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cosmetics
    ADD CONSTRAINT cosmetics_pkey PRIMARY KEY (cosmetic_id);


--
-- TOC entry 5261 (class 2606 OID 27030)
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5266 (class 2606 OID 27034)
-- Name: exercise_submissions exercise_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercise_submissions
    ADD CONSTRAINT exercise_submissions_pkey PRIMARY KEY (submission_id);


--
-- TOC entry 5264 (class 2606 OID 27032)
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- TOC entry 5268 (class 2606 OID 27036)
-- Name: financial_ledger financial_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_ledger
    ADD CONSTRAINT financial_ledger_pkey PRIMARY KEY (transaction_id);


--
-- TOC entry 5272 (class 2606 OID 27038)
-- Name: game_rooms game_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT game_rooms_pkey PRIMARY KEY (room_id);


--
-- TOC entry 5274 (class 2606 OID 27040)
-- Name: game_sessions game_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5278 (class 2606 OID 27042)
-- Name: learning_ai_tasks learning_ai_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.learning_ai_tasks
    ADD CONSTRAINT learning_ai_tasks_pkey PRIMARY KEY (task_id);


--
-- TOC entry 5288 (class 2606 OID 27048)
-- Name: lesson_quiz_attempts lesson_quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_quiz_attempts
    ADD CONSTRAINT lesson_quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 5284 (class 2606 OID 27046)
-- Name: lesson_quizzes lesson_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_quizzes
    ADD CONSTRAINT lesson_quizzes_pkey PRIMARY KEY (quiz_id);


--
-- TOC entry 5292 (class 2606 OID 27050)
-- Name: lesson_slides lesson_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_slides
    ADD CONSTRAINT lesson_slides_pkey PRIMARY KEY (slide_id);


--
-- TOC entry 5281 (class 2606 OID 27044)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- TOC entry 5295 (class 2606 OID 27052)
-- Name: level_config level_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_config
    ADD CONSTRAINT level_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5297 (class 2606 OID 27054)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (location_id);


--
-- TOC entry 5303 (class 2606 OID 27056)
-- Name: mini_game_current_conversations mini_game_current_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT mini_game_current_conversations_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5309 (class 2606 OID 27058)
-- Name: mini_game_dialogues mini_game_dialogues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT mini_game_dialogues_pkey PRIMARY KEY (dialogue_id);


--
-- TOC entry 5316 (class 2606 OID 27062)
-- Name: mini_game_exercise_submissions mini_game_exercise_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT mini_game_exercise_submissions_pkey PRIMARY KEY (submission_id);


--
-- TOC entry 5313 (class 2606 OID 27060)
-- Name: mini_game_exercises mini_game_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercises
    ADD CONSTRAINT mini_game_exercises_pkey PRIMARY KEY (exercise_id);


--
-- TOC entry 5319 (class 2606 OID 27064)
-- Name: mini_game_locations mini_game_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_locations
    ADD CONSTRAINT mini_game_locations_pkey PRIMARY KEY (location_id);


--
-- TOC entry 5322 (class 2606 OID 27066)
-- Name: mini_game_npcs mini_game_npcs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_npcs
    ADD CONSTRAINT mini_game_npcs_pkey PRIMARY KEY (npc_id);


--
-- TOC entry 5326 (class 2606 OID 27068)
-- Name: mini_game_user_exercise_progress mini_game_user_exercise_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress
    ADD CONSTRAINT mini_game_user_exercise_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 5329 (class 2606 OID 27070)
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);


--
-- TOC entry 5398 (class 2606 OID 27522)
-- Name: multiplayer_challenges multiplayer_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_challenges
    ADD CONSTRAINT multiplayer_challenges_pkey PRIMARY KEY (challenge_id);


--
-- TOC entry 5400 (class 2606 OID 27524)
-- Name: multiplayer_sessions multiplayer_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_sessions
    ADD CONSTRAINT multiplayer_sessions_pkey PRIMARY KEY (session_id);


--
-- TOC entry 5402 (class 2606 OID 27526)
-- Name: multiplayer_submissions multiplayer_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_pkey PRIMARY KEY (submission_id);


--
-- TOC entry 5331 (class 2606 OID 27072)
-- Name: music_tracks music_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.music_tracks
    ADD CONSTRAINT music_tracks_pkey PRIMARY KEY (track_id);


--
-- TOC entry 5426 (class 2606 OID 27763)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5334 (class 2606 OID 27074)
-- Name: question_choices question_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT question_choices_pkey PRIMARY KEY (choice_id);


--
-- TOC entry 5337 (class 2606 OID 27076)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (question_id);


--
-- TOC entry 5339 (class 2606 OID 27078)
-- Name: random_events random_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.random_events
    ADD CONSTRAINT random_events_pkey PRIMARY KEY (event_id);


--
-- TOC entry 5342 (class 2606 OID 27080)
-- Name: room_participants room_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_pkey PRIMARY KEY (id);


--
-- TOC entry 5404 (class 2606 OID 27528)
-- Name: session_players session_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_pkey PRIMARY KEY (session_id, user_id);


--
-- TOC entry 5346 (class 2606 OID 27082)
-- Name: shop_items shop_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_items
    ADD CONSTRAINT shop_items_pkey PRIMARY KEY (item_id);


--
-- TOC entry 5350 (class 2606 OID 27084)
-- Name: simulation_active_events simulation_active_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_active_events
    ADD CONSTRAINT simulation_active_events_pkey PRIMARY KEY (id);


--
-- TOC entry 5354 (class 2606 OID 27086)
-- Name: simulation_logs simulation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_logs
    ADD CONSTRAINT simulation_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5360 (class 2606 OID 27088)
-- Name: simulation_saves simulation_saves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_saves
    ADD CONSTRAINT simulation_saves_pkey PRIMARY KEY (save_id);


--
-- TOC entry 5363 (class 2606 OID 27090)
-- Name: survey_options survey_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_options
    ADD CONSTRAINT survey_options_pkey PRIMARY KEY (id);


--
-- TOC entry 5365 (class 2606 OID 27092)
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 5418 (class 2606 OID 27530)
-- Name: user_survey_responses unique_user_question; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT unique_user_question UNIQUE (user_id, question_id);


--
-- TOC entry 5428 (class 2606 OID 27765)
-- Name: password_reset_tokens uq_password_reset_token_hash; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT uq_password_reset_token_hash UNIQUE (token_hash);


--
-- TOC entry 5375 (class 2606 OID 27096)
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 5378 (class 2606 OID 27098)
-- Name: user_contracts user_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_contracts
    ADD CONSTRAINT user_contracts_pkey PRIMARY KEY (id);


--
-- TOC entry 5406 (class 2606 OID 27532)
-- Name: user_cosmetics user_cosmetics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_pkey PRIMARY KEY (user_id, cosmetic_id);


--
-- TOC entry 5382 (class 2606 OID 27100)
-- Name: user_inventory user_inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT user_inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 5408 (class 2606 OID 27534)
-- Name: user_mailbox user_mailbox_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_mailbox
    ADD CONSTRAINT user_mailbox_pkey PRIMARY KEY (mail_id);


--
-- TOC entry 5410 (class 2606 OID 27536)
-- Name: user_missions user_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_pkey PRIMARY KEY (user_mission_id);


--
-- TOC entry 5424 (class 2606 OID 27663)
-- Name: user_presence user_presence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT user_presence_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5387 (class 2606 OID 27102)
-- Name: user_profile_showcase user_profile_showcase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT user_profile_showcase_pkey PRIMARY KEY (id);


--
-- TOC entry 5412 (class 2606 OID 27538)
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- TOC entry 5414 (class 2606 OID 27540)
-- Name: user_quiz_attempts user_quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 5416 (class 2606 OID 27542)
-- Name: user_quiz_attempts user_quiz_attempts_user_id_lesson_id_quiz_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_user_id_lesson_id_quiz_type_key UNIQUE (user_id, lesson_id, quiz_type);


--
-- TOC entry 5420 (class 2606 OID 27544)
-- Name: user_survey_responses user_survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_pkey PRIMARY KEY (response_id);


--
-- TOC entry 5371 (class 2606 OID 27094)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5422 (class 2606 OID 27546)
-- Name: virtual_emails virtual_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.virtual_emails
    ADD CONSTRAINT virtual_emails_pkey PRIMARY KEY (email_id);


--
-- TOC entry 5251 (class 1259 OID 27113)
-- Name: advanced_validation_choices_idx_adv_choices_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX advanced_validation_choices_idx_adv_choices_question ON public.advanced_validation_choices USING btree (question_id);


--
-- TOC entry 5256 (class 1259 OID 27114)
-- Name: assets_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX assets_user_id ON public.assets USING btree (user_id);


--
-- TOC entry 5259 (class 1259 OID 27115)
-- Name: contracts_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contracts_user_id ON public.contracts USING btree (user_id);


--
-- TOC entry 5262 (class 1259 OID 27116)
-- Name: email_verifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_verifications_user_id ON public.email_verifications USING btree (user_id);


--
-- TOC entry 5269 (class 1259 OID 27117)
-- Name: financial_ledger_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX financial_ledger_user_id ON public.financial_ledger USING btree (user_id);


--
-- TOC entry 5270 (class 1259 OID 27118)
-- Name: game_rooms_host_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX game_rooms_host_user_id ON public.game_rooms USING btree (host_user_id);


--
-- TOC entry 5275 (class 1259 OID 27650)
-- Name: idx_learning_ai_tasks_user_mode_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_learning_ai_tasks_user_mode_status ON public.learning_ai_tasks USING btree (user_id, mode, status);


--
-- TOC entry 5276 (class 1259 OID 27119)
-- Name: learning_ai_tasks_idx_learning_ai_tasks_user_mode_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX learning_ai_tasks_idx_learning_ai_tasks_user_mode_status ON public.learning_ai_tasks USING btree (user_id, mode, status);


--
-- TOC entry 5285 (class 1259 OID 27122)
-- Name: lesson_quiz_attempts_idx_lesson_quiz_attempt_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lesson_quiz_attempts_idx_lesson_quiz_attempt_lesson ON public.lesson_quiz_attempts USING btree (lesson_id, quiz_type);


--
-- TOC entry 5286 (class 1259 OID 27123)
-- Name: lesson_quiz_attempts_idx_lesson_quiz_attempt_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lesson_quiz_attempts_idx_lesson_quiz_attempt_user ON public.lesson_quiz_attempts USING btree (user_id);


--
-- TOC entry 5289 (class 1259 OID 27103)
-- Name: lesson_quiz_attempts_uk_lesson_quiz_attempt; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX lesson_quiz_attempts_uk_lesson_quiz_attempt ON public.lesson_quiz_attempts USING btree (user_id, lesson_id, quiz_type);


--
-- TOC entry 5282 (class 1259 OID 27121)
-- Name: lesson_quizzes_idx_quizzes_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lesson_quizzes_idx_quizzes_lesson ON public.lesson_quizzes USING btree (lesson_id);


--
-- TOC entry 5290 (class 1259 OID 27124)
-- Name: lesson_slides_idx_slides_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lesson_slides_idx_slides_lesson ON public.lesson_slides USING btree (lesson_id);


--
-- TOC entry 5279 (class 1259 OID 27120)
-- Name: lessons_idx_lessons_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX lessons_idx_lessons_module ON public.lessons USING btree (module_id);


--
-- TOC entry 5293 (class 1259 OID 27125)
-- Name: level_config_idx_level_config_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX level_config_idx_level_config_question ON public.level_config USING btree (question_id);


--
-- TOC entry 5298 (class 1259 OID 27127)
-- Name: mini_game_current_conversations_idx_mini_game_current_dialogue; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_current_conversations_idx_mini_game_current_dialogue ON public.mini_game_current_conversations USING btree (dialogue_id);


--
-- TOC entry 5299 (class 1259 OID 27126)
-- Name: mini_game_current_conversations_idx_mini_game_current_exercise; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_current_conversations_idx_mini_game_current_exercise ON public.mini_game_current_conversations USING btree (exercise_id);


--
-- TOC entry 5300 (class 1259 OID 27129)
-- Name: mini_game_current_conversations_idx_mini_game_current_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_current_conversations_idx_mini_game_current_location ON public.mini_game_current_conversations USING btree (current_location_id);


--
-- TOC entry 5301 (class 1259 OID 27128)
-- Name: mini_game_current_conversations_idx_mini_game_current_npc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_current_conversations_idx_mini_game_current_npc ON public.mini_game_current_conversations USING btree (current_npc_id);


--
-- TOC entry 5304 (class 1259 OID 27132)
-- Name: mini_game_dialogues_fk_mgd_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_dialogues_fk_mgd_lesson ON public.mini_game_dialogues USING btree (lesson_id);


--
-- TOC entry 5305 (class 1259 OID 27133)
-- Name: mini_game_dialogues_idx_mini_game_dialogues_exercise_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_dialogues_idx_mini_game_dialogues_exercise_order ON public.mini_game_dialogues USING btree (exercise_id, dialogue_order);


--
-- TOC entry 5306 (class 1259 OID 27131)
-- Name: mini_game_dialogues_idx_mini_game_dialogues_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_dialogues_idx_mini_game_dialogues_location ON public.mini_game_dialogues USING btree (location_id);


--
-- TOC entry 5307 (class 1259 OID 27130)
-- Name: mini_game_dialogues_idx_mini_game_dialogues_npc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_dialogues_idx_mini_game_dialogues_npc ON public.mini_game_dialogues USING btree (npc_id);


--
-- TOC entry 5314 (class 1259 OID 27136)
-- Name: mini_game_exercise_submissions_fk_mini_game_submissions_exercis; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_exercise_submissions_fk_mini_game_submissions_exercis ON public.mini_game_exercise_submissions USING btree (exercise_id);


--
-- TOC entry 5317 (class 1259 OID 27104)
-- Name: mini_game_exercise_submissions_uq_user_exercise_submission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mini_game_exercise_submissions_uq_user_exercise_submission ON public.mini_game_exercise_submissions USING btree (user_id, exercise_id);


--
-- TOC entry 5310 (class 1259 OID 27134)
-- Name: mini_game_exercises_idx_mini_game_exercises_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_exercises_idx_mini_game_exercises_lesson ON public.mini_game_exercises USING btree (lesson_id);


--
-- TOC entry 5311 (class 1259 OID 27135)
-- Name: mini_game_exercises_idx_mini_game_exercises_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_exercises_idx_mini_game_exercises_order ON public.mini_game_exercises USING btree (exercise_order);


--
-- TOC entry 5320 (class 1259 OID 27105)
-- Name: mini_game_locations_uq_mini_game_locations_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mini_game_locations_uq_mini_game_locations_key ON public.mini_game_locations USING btree (location_key);


--
-- TOC entry 5323 (class 1259 OID 27106)
-- Name: mini_game_npcs_uq_mini_game_npcs_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mini_game_npcs_uq_mini_game_npcs_key ON public.mini_game_npcs USING btree (npc_key);


--
-- TOC entry 5324 (class 1259 OID 27137)
-- Name: mini_game_user_exercise_progress_fk_mini_game_progress_exercise; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mini_game_user_exercise_progress_fk_mini_game_progress_exercise ON public.mini_game_user_exercise_progress USING btree (exercise_id);


--
-- TOC entry 5327 (class 1259 OID 27107)
-- Name: mini_game_user_exercise_progress_uq_user_exercise_progress; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX mini_game_user_exercise_progress_uq_user_exercise_progress ON public.mini_game_user_exercise_progress USING btree (user_id, exercise_id);


--
-- TOC entry 5332 (class 1259 OID 27138)
-- Name: question_choices_idx_choices_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX question_choices_idx_choices_question ON public.question_choices USING btree (question_id);


--
-- TOC entry 5335 (class 1259 OID 27139)
-- Name: quiz_questions_idx_questions_quiz; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX quiz_questions_idx_questions_quiz ON public.quiz_questions USING btree (quiz_id);


--
-- TOC entry 5340 (class 1259 OID 27108)
-- Name: random_events_uk_event_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX random_events_uk_event_key ON public.random_events USING btree (event_key);


--
-- TOC entry 5343 (class 1259 OID 27140)
-- Name: room_participants_room_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX room_participants_room_id ON public.room_participants USING btree (room_id);


--
-- TOC entry 5344 (class 1259 OID 27141)
-- Name: room_participants_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX room_participants_user_id ON public.room_participants USING btree (user_id);


--
-- TOC entry 5347 (class 1259 OID 27143)
-- Name: simulation_active_events_fk_active_events_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_active_events_fk_active_events_event ON public.simulation_active_events USING btree (event_id);


--
-- TOC entry 5348 (class 1259 OID 27142)
-- Name: simulation_active_events_idx_active_events_save; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_active_events_idx_active_events_save ON public.simulation_active_events USING btree (save_id, is_resolved);


--
-- TOC entry 5351 (class 1259 OID 27146)
-- Name: simulation_logs_fk_sim_logs_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_logs_fk_sim_logs_event ON public.simulation_logs USING btree (event_id);


--
-- TOC entry 5352 (class 1259 OID 27145)
-- Name: simulation_logs_fk_sim_logs_save; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_logs_fk_sim_logs_save ON public.simulation_logs USING btree (save_id);


--
-- TOC entry 5355 (class 1259 OID 27144)
-- Name: simulation_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_logs_user_id ON public.simulation_logs USING btree (user_id);


--
-- TOC entry 5356 (class 1259 OID 27149)
-- Name: simulation_saves_fk_sim_saves_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_saves_fk_sim_saves_location ON public.simulation_saves USING btree (current_location_id);


--
-- TOC entry 5357 (class 1259 OID 27148)
-- Name: simulation_saves_idx_sim_saves_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_saves_idx_sim_saves_active ON public.simulation_saves USING btree (user_id, is_active);


--
-- TOC entry 5358 (class 1259 OID 27147)
-- Name: simulation_saves_idx_sim_saves_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX simulation_saves_idx_sim_saves_user ON public.simulation_saves USING btree (user_id);


--
-- TOC entry 5361 (class 1259 OID 27150)
-- Name: survey_options_idx_survey_opts_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_options_idx_survey_opts_question ON public.survey_options USING btree (question_id);


--
-- TOC entry 5373 (class 1259 OID 27155)
-- Name: user_achievements_achievement_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_achievements_achievement_id ON public.user_achievements USING btree (achievement_id);


--
-- TOC entry 5376 (class 1259 OID 27154)
-- Name: user_achievements_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_achievements_user_id ON public.user_achievements USING btree (user_id);


--
-- TOC entry 5379 (class 1259 OID 27157)
-- Name: user_inventory_fk_inventory_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_inventory_fk_inventory_item ON public.user_inventory USING btree (item_id);


--
-- TOC entry 5380 (class 1259 OID 27156)
-- Name: user_inventory_idx_inventory_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_inventory_idx_inventory_user ON public.user_inventory USING btree (user_id);


--
-- TOC entry 5383 (class 1259 OID 27111)
-- Name: user_inventory_uk_user_item; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_inventory_uk_user_item ON public.user_inventory USING btree (user_id, item_id);


--
-- TOC entry 5384 (class 1259 OID 27159)
-- Name: user_profile_showcase_fk_showcase_achievement; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_profile_showcase_fk_showcase_achievement ON public.user_profile_showcase USING btree (achievement_id);


--
-- TOC entry 5385 (class 1259 OID 27158)
-- Name: user_profile_showcase_idx_showcase_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_profile_showcase_idx_showcase_user ON public.user_profile_showcase USING btree (user_id);


--
-- TOC entry 5388 (class 1259 OID 27112)
-- Name: user_profile_showcase_uk_user_achievement_showcase; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_profile_showcase_uk_user_achievement_showcase ON public.user_profile_showcase USING btree (user_id, achievement_id);


--
-- TOC entry 5366 (class 1259 OID 27110)
-- Name: users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email ON public.users USING btree (email);


--
-- TOC entry 5367 (class 1259 OID 27152)
-- Name: users_fk_users_mouse_effect; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_fk_users_mouse_effect ON public.users USING btree (equipped_mouse_effect_id);


--
-- TOC entry 5368 (class 1259 OID 27153)
-- Name: users_fk_users_profile_frame; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_fk_users_profile_frame ON public.users USING btree (equipped_profile_frame_id);


--
-- TOC entry 5369 (class 1259 OID 27151)
-- Name: users_fk_users_theme; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_fk_users_theme ON public.users USING btree (equipped_theme_id);


--
-- TOC entry 5372 (class 1259 OID 27109)
-- Name: users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_username ON public.users USING btree (username);


--
-- TOC entry 5477 (class 2606 OID 27547)
-- Name: active_accepted_challenges active_accepted_challenges_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT active_accepted_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.multiplayer_challenges(challenge_id) ON DELETE CASCADE;


--
-- TOC entry 5478 (class 2606 OID 27552)
-- Name: active_accepted_challenges active_accepted_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT active_accepted_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5430 (class 2606 OID 27165)
-- Name: assets assets_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5431 (class 2606 OID 27170)
-- Name: contracts contracts_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5432 (class 2606 OID 27175)
-- Name: email_verifications email_verifications_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5433 (class 2606 OID 27180)
-- Name: financial_ledger financial_ledger_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.financial_ledger
    ADD CONSTRAINT financial_ledger_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5460 (class 2606 OID 27315)
-- Name: simulation_active_events fk_active_events_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_active_events
    ADD CONSTRAINT fk_active_events_event FOREIGN KEY (event_id) REFERENCES public.random_events(event_id) ON DELETE CASCADE;


--
-- TOC entry 5461 (class 2606 OID 27320)
-- Name: simulation_active_events fk_active_events_save; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_active_events
    ADD CONSTRAINT fk_active_events_save FOREIGN KEY (save_id) REFERENCES public.simulation_saves(save_id) ON DELETE CASCADE;


--
-- TOC entry 5429 (class 2606 OID 27160)
-- Name: advanced_validation_choices fk_adv_choices_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advanced_validation_choices
    ADD CONSTRAINT fk_adv_choices_question FOREIGN KEY (question_id) REFERENCES public.advanced_validation(id) ON DELETE CASCADE;


--
-- TOC entry 5456 (class 2606 OID 27295)
-- Name: question_choices fk_choices_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES public.quiz_questions(question_id) ON DELETE CASCADE;


--
-- TOC entry 5473 (class 2606 OID 27380)
-- Name: user_inventory fk_inventory_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES public.shop_items(item_id) ON DELETE CASCADE;


--
-- TOC entry 5474 (class 2606 OID 27385)
-- Name: user_inventory fk_inventory_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5435 (class 2606 OID 27190)
-- Name: lessons fk_lessons_module; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES public.modules(module_id) ON DELETE CASCADE;


--
-- TOC entry 5438 (class 2606 OID 27205)
-- Name: level_config fk_level_config_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_config
    ADD CONSTRAINT fk_level_config_question FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;


--
-- TOC entry 5443 (class 2606 OID 27230)
-- Name: mini_game_dialogues fk_mgd_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5444 (class 2606 OID 27235)
-- Name: mini_game_dialogues fk_mgd_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5445 (class 2606 OID 27240)
-- Name: mini_game_dialogues fk_mgd_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_location FOREIGN KEY (location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5446 (class 2606 OID 27245)
-- Name: mini_game_dialogues fk_mgd_npc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_npc FOREIGN KEY (npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5450 (class 2606 OID 27265)
-- Name: mini_game_exercises fk_mge_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercises
    ADD CONSTRAINT fk_mge_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5452 (class 2606 OID 27275)
-- Name: mini_game_exercise_submissions fk_mges_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT fk_mges_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5453 (class 2606 OID 27280)
-- Name: mini_game_exercise_submissions fk_mges_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT fk_mges_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5439 (class 2606 OID 27210)
-- Name: mini_game_current_conversations fk_mini_game_current_dialogue; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_dialogue FOREIGN KEY (dialogue_id) REFERENCES public.mini_game_dialogues(dialogue_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5440 (class 2606 OID 27215)
-- Name: mini_game_current_conversations fk_mini_game_current_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5441 (class 2606 OID 27220)
-- Name: mini_game_current_conversations fk_mini_game_current_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_location FOREIGN KEY (current_location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5442 (class 2606 OID 27225)
-- Name: mini_game_current_conversations fk_mini_game_current_npc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_npc FOREIGN KEY (current_npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5447 (class 2606 OID 27250)
-- Name: mini_game_dialogues fk_mini_game_dialogues_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5448 (class 2606 OID 27255)
-- Name: mini_game_dialogues fk_mini_game_dialogues_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_location FOREIGN KEY (location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5449 (class 2606 OID 27260)
-- Name: mini_game_dialogues fk_mini_game_dialogues_npc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_npc FOREIGN KEY (npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5451 (class 2606 OID 27270)
-- Name: mini_game_exercises fk_mini_game_exercises_main_lessons; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercises
    ADD CONSTRAINT fk_mini_game_exercises_main_lessons FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5455 (class 2606 OID 27290)
-- Name: mini_game_user_exercise_progress fk_mini_game_progress_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress
    ADD CONSTRAINT fk_mini_game_progress_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5454 (class 2606 OID 27285)
-- Name: mini_game_exercise_submissions fk_mini_game_submissions_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT fk_mini_game_submissions_exercise FOREIGN KEY (exercise_id) REFERENCES public.mini_game_exercises(exercise_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5457 (class 2606 OID 27300)
-- Name: quiz_questions fk_questions_quiz; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES public.lesson_quizzes(quiz_id) ON DELETE CASCADE;


--
-- TOC entry 5436 (class 2606 OID 27195)
-- Name: lesson_quizzes fk_quizzes_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_quizzes
    ADD CONSTRAINT fk_quizzes_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 5475 (class 2606 OID 27390)
-- Name: user_profile_showcase fk_showcase_achievement; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT fk_showcase_achievement FOREIGN KEY (achievement_id) REFERENCES public.achievements(achievement_id) ON DELETE CASCADE;


--
-- TOC entry 5476 (class 2606 OID 27395)
-- Name: user_profile_showcase fk_showcase_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT fk_showcase_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5462 (class 2606 OID 27325)
-- Name: simulation_logs fk_sim_logs_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_logs
    ADD CONSTRAINT fk_sim_logs_event FOREIGN KEY (event_id) REFERENCES public.random_events(event_id) ON DELETE SET NULL;


--
-- TOC entry 5463 (class 2606 OID 27330)
-- Name: simulation_logs fk_sim_logs_save; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_logs
    ADD CONSTRAINT fk_sim_logs_save FOREIGN KEY (save_id) REFERENCES public.simulation_saves(save_id) ON DELETE SET NULL;


--
-- TOC entry 5465 (class 2606 OID 27340)
-- Name: simulation_saves fk_sim_saves_location; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_saves
    ADD CONSTRAINT fk_sim_saves_location FOREIGN KEY (current_location_id) REFERENCES public.locations(location_id) ON DELETE SET NULL;


--
-- TOC entry 5466 (class 2606 OID 27345)
-- Name: simulation_saves fk_sim_saves_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_saves
    ADD CONSTRAINT fk_sim_saves_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5437 (class 2606 OID 27200)
-- Name: lesson_slides fk_slides_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesson_slides
    ADD CONSTRAINT fk_slides_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 5467 (class 2606 OID 27350)
-- Name: survey_options fk_survey_opts_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_options
    ADD CONSTRAINT fk_survey_opts_question FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;


--
-- TOC entry 5468 (class 2606 OID 27355)
-- Name: users fk_users_mouse_effect; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_mouse_effect FOREIGN KEY (equipped_mouse_effect_id) REFERENCES public.shop_items(item_id) ON DELETE SET NULL;


--
-- TOC entry 5469 (class 2606 OID 27360)
-- Name: users fk_users_profile_frame; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_profile_frame FOREIGN KEY (equipped_profile_frame_id) REFERENCES public.shop_items(item_id) ON DELETE SET NULL;


--
-- TOC entry 5470 (class 2606 OID 27365)
-- Name: users fk_users_theme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_theme FOREIGN KEY (equipped_theme_id) REFERENCES public.shop_items(item_id) ON DELETE SET NULL;


--
-- TOC entry 5434 (class 2606 OID 27185)
-- Name: game_rooms game_rooms_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT game_rooms_ibfk_1 FOREIGN KEY (host_user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5479 (class 2606 OID 27557)
-- Name: multiplayer_challenges multiplayer_challenges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_challenges
    ADD CONSTRAINT multiplayer_challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- TOC entry 5480 (class 2606 OID 27562)
-- Name: multiplayer_submissions multiplayer_submissions_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.multiplayer_challenges(challenge_id) ON DELETE CASCADE;


--
-- TOC entry 5481 (class 2606 OID 27567)
-- Name: multiplayer_submissions multiplayer_submissions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.multiplayer_sessions(session_id) ON DELETE CASCADE;


--
-- TOC entry 5482 (class 2606 OID 27572)
-- Name: multiplayer_submissions multiplayer_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5458 (class 2606 OID 27305)
-- Name: room_participants room_participants_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_ibfk_1 FOREIGN KEY (room_id) REFERENCES public.game_rooms(room_id) ON DELETE CASCADE;


--
-- TOC entry 5459 (class 2606 OID 27310)
-- Name: room_participants room_participants_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_ibfk_2 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5483 (class 2606 OID 27577)
-- Name: session_players session_players_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.multiplayer_sessions(session_id) ON DELETE CASCADE;


--
-- TOC entry 5484 (class 2606 OID 27582)
-- Name: session_players session_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5464 (class 2606 OID 27335)
-- Name: simulation_logs simulation_logs_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.simulation_logs
    ADD CONSTRAINT simulation_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5471 (class 2606 OID 27370)
-- Name: user_achievements user_achievements_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_ibfk_1 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5472 (class 2606 OID 27375)
-- Name: user_achievements user_achievements_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_ibfk_2 FOREIGN KEY (achievement_id) REFERENCES public.achievements(achievement_id) ON DELETE CASCADE;


--
-- TOC entry 5485 (class 2606 OID 27587)
-- Name: user_cosmetics user_cosmetics_cosmetic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_cosmetic_id_fkey FOREIGN KEY (cosmetic_id) REFERENCES public.cosmetics(cosmetic_id) ON DELETE CASCADE;


--
-- TOC entry 5486 (class 2606 OID 27592)
-- Name: user_cosmetics user_cosmetics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5487 (class 2606 OID 27597)
-- Name: user_mailbox user_mailbox_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_mailbox
    ADD CONSTRAINT user_mailbox_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5488 (class 2606 OID 27602)
-- Name: user_missions user_missions_email_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.virtual_emails(email_id) ON DELETE CASCADE;


--
-- TOC entry 5489 (class 2606 OID 27607)
-- Name: user_missions user_missions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5490 (class 2606 OID 27612)
-- Name: user_progress user_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 5491 (class 2606 OID 27617)
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5492 (class 2606 OID 27622)
-- Name: user_quiz_attempts user_quiz_attempts_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- TOC entry 5493 (class 2606 OID 27627)
-- Name: user_quiz_attempts user_quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5494 (class 2606 OID 27632)
-- Name: user_survey_responses user_survey_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;


--
-- TOC entry 5495 (class 2606 OID 27637)
-- Name: user_survey_responses user_survey_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5496 (class 2606 OID 27642)
-- Name: virtual_emails virtual_emails_related_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.virtual_emails
    ADD CONSTRAINT virtual_emails_related_exercise_id_fkey FOREIGN KEY (related_exercise_id) REFERENCES public.exercises(exercise_id);


-- Completed on 2026-08-24 17:36:20

--
-- PostgreSQL database dump complete
--

\unrestrict VNoA5IhaBIufchbVq5LDNyj4cc2Psly4xSuuP2yhHLShQOrziC7uXq0m72T6Mbj

