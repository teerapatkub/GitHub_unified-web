--
-- PySim database structure
--
-- GENERATED FILE - do not edit by hand.
-- Regenerate with:  node scripts/dump-schema.js
--
-- Structure only. Contains no rows of any kind.
--

SET search_path TO public;

--
-- PostgreSQL database dump
--


-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: fullprojectpython; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA fullprojectpython;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--



--
-- Name: achievements_difficulty; Type: TYPE; Schema: fullprojectpython; Owner: -
--

CREATE TYPE fullprojectpython.achievements_difficulty AS ENUM (
    'Medium',
    'Hard',
    'Very Hard'
);


--
-- Name: learning_ai_tasks_status; Type: TYPE; Schema: fullprojectpython; Owner: -
--

CREATE TYPE fullprojectpython.learning_ai_tasks_status AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'ARCHIVED'
);


--
-- Name: shop_items_rarity; Type: TYPE; Schema: fullprojectpython; Owner: -
--

CREATE TYPE fullprojectpython.shop_items_rarity AS ENUM (
    'COMMON',
    'RARE',
    'EPIC',
    'LEGENDARY'
);


--
-- Name: shop_items_type; Type: TYPE; Schema: fullprojectpython; Owner: -
--

CREATE TYPE fullprojectpython.shop_items_type AS ENUM (
    'THEME',
    'MOUSE_EFFECT',
    'PROFILE_FRAME'
);


--
-- Name: assets_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.assets_type AS ENUM (
    'HARDWARE',
    'SOFTWARE'
);


--
-- Name: contracts_difficulty; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contracts_difficulty AS ENUM (
    'Easy',
    'Medium',
    'Hard'
);


--
-- Name: contracts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contracts_status AS ENUM (
    'OFFERED',
    'ACTIVE',
    'COMPLETED',
    'FAILED'
);


--
-- Name: financial_ledger_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.financial_ledger_type AS ENUM (
    'INCOME',
    'EXPENSE'
);


--
-- Name: game_rooms_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.game_rooms_status AS ENUM (
    'WAITING',
    'PLAYING',
    'FINISHED'
);


--
-- Name: mini_game_dialogues_dialogue_phase; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mini_game_dialogues_dialogue_phase AS ENUM (
    'pre_submit',
    'post_submit'
);


--
-- Name: random_events_effect_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.random_events_effect_type AS ENUM (
    'POWER_CUT',
    'INTERNET_CUT',
    'BATTERY_DRAIN',
    'SPEED_BOOST',
    'MONEY_LOSS'
);


--
-- Name: random_events_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.random_events_severity AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);


--
-- Name: user_contracts_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_contracts_status AS ENUM (
    'ACTIVE',
    'COMPLETED',
    'FAILED'
);


--
-- Name: on_update_current_timestamp_learning_ai_tasks(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_learning_ai_tasks() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_lesson_quiz_attempts(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_lesson_quiz_attempts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_current_conversations(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_current_conversations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_dialogues(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_dialogues() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_exercise_submissions(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_exercise_submissions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.submitted_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_exercises(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_exercises() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_locations(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_locations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_npcs(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_npcs() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_mini_game_user_exercise_progress(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_user_exercise_progress() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_simulation_saves(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_simulation_saves() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_user_presence(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_user_presence() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.last_seen = now();
   RETURN NEW;
END;
$$;


--
-- Name: on_update_current_timestamp_user_xp_log(); Type: FUNCTION; Schema: fullprojectpython; Owner: -
--

CREATE FUNCTION fullprojectpython.on_update_current_timestamp_user_xp_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.achievements (
    achievement_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    difficulty fullprojectpython.achievements_difficulty NOT NULL,
    reward_money numeric(10,2) DEFAULT 0.00
);


--
-- Name: achievements_achievement_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.achievements_achievement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: achievements_achievement_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.achievements_achievement_id_seq OWNED BY fullprojectpython.achievements.achievement_id;


--
-- Name: advanced_validation; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.advanced_validation (
    id bigint NOT NULL,
    question_text text NOT NULL,
    correct_answer character varying(500) NOT NULL
);


--
-- Name: advanced_validation_choices; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.advanced_validation_choices (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    choice_text character varying(500) NOT NULL
);


--
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.advanced_validation_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.advanced_validation_choices_id_seq OWNED BY fullprojectpython.advanced_validation_choices.id;


--
-- Name: advanced_validation_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.advanced_validation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: advanced_validation_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.advanced_validation_id_seq OWNED BY fullprojectpython.advanced_validation.id;


--
-- Name: email_verifications; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.email_verifications (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_verifications_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.email_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: email_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.email_verifications_id_seq OWNED BY fullprojectpython.email_verifications.id;


--
-- Name: exercise_submissions; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.exercise_submissions (
    submission_id bigint NOT NULL,
    user_id bigint,
    exercise_id bigint,
    submitted_code text NOT NULL,
    is_passed boolean DEFAULT false NOT NULL,
    score bigint DEFAULT '0'::bigint,
    execution_time_ms bigint,
    error_message text,
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.exercise_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.exercise_submissions_submission_id_seq OWNED BY fullprojectpython.exercise_submissions.submission_id;


--
-- Name: exercises; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.exercises (
    exercise_id bigint NOT NULL,
    lesson_id bigint,
    title character varying(100) DEFAULT NULL::character varying,
    description text,
    starter_code text,
    solution_code text,
    test_cases text,
    xp_reward bigint DEFAULT '10'::bigint,
    currency_reward bigint DEFAULT '5'::bigint,
    file_name character varying(100) DEFAULT NULL::character varying,
    order_index bigint DEFAULT '0'::bigint
);


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.exercises_exercise_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.exercises_exercise_id_seq OWNED BY fullprojectpython.exercises.exercise_id;


--
-- Name: learning_ai_tasks; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.learning_ai_tasks (
    task_id bigint NOT NULL,
    user_id bigint NOT NULL,
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
    reward_xp bigint DEFAULT '100'::bigint NOT NULL,
    reward_coins bigint DEFAULT '20'::bigint NOT NULL,
    rerolls_used bigint DEFAULT '0'::bigint NOT NULL,
    max_rerolls bigint DEFAULT '3'::bigint NOT NULL,
    status fullprojectpython.learning_ai_tasks_status DEFAULT 'ACTIVE'::fullprojectpython.learning_ai_tasks_status NOT NULL,
    ai_payload text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    completed_at timestamp with time zone
);


--
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.learning_ai_tasks_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.learning_ai_tasks_task_id_seq OWNED BY fullprojectpython.learning_ai_tasks.task_id;


--
-- Name: lesson_quizzes; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.lesson_quizzes (
    quiz_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    quiz_type character varying(10) DEFAULT 'pre'::character varying NOT NULL
);


--
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.lesson_quizzes_quiz_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.lesson_quizzes_quiz_id_seq OWNED BY fullprojectpython.lesson_quizzes.quiz_id;


--
-- Name: lesson_slides; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.lesson_slides (
    slide_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    slide_order bigint DEFAULT '0'::bigint NOT NULL,
    slide_title character varying(200) DEFAULT NULL::character varying,
    slide_content text,
    slide_src character varying(500) DEFAULT NULL::character varying,
    slide_type character varying(20) DEFAULT 'text'::character varying
);


--
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.lesson_slides_slide_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.lesson_slides_slide_id_seq OWNED BY fullprojectpython.lesson_slides.slide_id;


--
-- Name: lessons; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.lessons (
    lesson_id bigint NOT NULL,
    module_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    order_index bigint DEFAULT '0'::bigint NOT NULL,
    required_level bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: lessons_lesson_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.lessons_lesson_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.lessons_lesson_id_seq OWNED BY fullprojectpython.lessons.lesson_id;


--
-- Name: level_config; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.level_config (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    option_description character varying(500) DEFAULT NULL::character varying,
    "order" bigint DEFAULT '0'::bigint NOT NULL,
    level bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: level_config_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.level_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: level_config_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.level_config_id_seq OWNED BY fullprojectpython.level_config.id;


--
-- Name: modules; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.modules (
    module_id bigint NOT NULL,
    title character varying(200) NOT NULL,
    order_index bigint DEFAULT '0'::bigint NOT NULL,
    required_level bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: modules_module_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.modules_module_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.modules_module_id_seq OWNED BY fullprojectpython.modules.module_id;


--
-- Name: music_tracks; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.music_tracks (
    track_id bigint NOT NULL,
    track_name character varying(100) NOT NULL,
    file_path character varying(255) NOT NULL,
    is_default boolean DEFAULT false
);


--
-- Name: music_tracks_track_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.music_tracks_track_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: music_tracks_track_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.music_tracks_track_id_seq OWNED BY fullprojectpython.music_tracks.track_id;


--
-- Name: question_choices; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.question_choices (
    choice_id bigint NOT NULL,
    question_id bigint NOT NULL,
    choice_text character varying(500) NOT NULL
);


--
-- Name: question_choices_choice_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.question_choices_choice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.question_choices_choice_id_seq OWNED BY fullprojectpython.question_choices.choice_id;


--
-- Name: quiz_questions; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.quiz_questions (
    question_id bigint NOT NULL,
    quiz_id bigint NOT NULL,
    question_text text NOT NULL,
    question_type character varying(20) DEFAULT 'choice'::character varying NOT NULL,
    correct_answer text NOT NULL,
    question_order bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.quiz_questions_question_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.quiz_questions_question_id_seq OWNED BY fullprojectpython.quiz_questions.question_id;


--
-- Name: shop_items; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.shop_items (
    item_id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type fullprojectpython.shop_items_type NOT NULL,
    rarity fullprojectpython.shop_items_rarity DEFAULT 'COMMON'::fullprojectpython.shop_items_rarity NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    preview_data text,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    item_type character varying(50) DEFAULT NULL::character varying,
    asset_url text,
    preview_image text,
    effects text,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: shop_items_item_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.shop_items_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.shop_items_item_id_seq OWNED BY fullprojectpython.shop_items.item_id;


--
-- Name: survey_options; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.survey_options (
    id bigint NOT NULL,
    question_id bigint NOT NULL,
    option_text character varying(200) NOT NULL,
    option_description character varying(500) DEFAULT NULL::character varying,
    "order" bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: survey_options_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.survey_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_options_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.survey_options_id_seq OWNED BY fullprojectpython.survey_options.id;


--
-- Name: survey_questions; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.survey_questions (
    id bigint NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    image character varying(200) DEFAULT NULL::character varying
);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.survey_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.survey_questions_id_seq OWNED BY fullprojectpython.survey_questions.id;


--
-- Name: user_achievements; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.user_achievements (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    achievement_id bigint NOT NULL,
    unlocked_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.user_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.user_achievements_id_seq OWNED BY fullprojectpython.user_achievements.id;


--
-- Name: users; Type: TABLE; Schema: fullprojectpython; Owner: -
--

CREATE TABLE fullprojectpython.users (
    user_id bigint NOT NULL,
    username character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(100) DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reputation bigint DEFAULT '10'::bigint,
    equipped_theme_id bigint,
    equipped_mouse_effect_id bigint,
    equipped_profile_frame_id bigint,
    avatar_url character varying(255) DEFAULT NULL::character varying,
    bio character varying(500) DEFAULT NULL::character varying,
    role character varying(20) DEFAULT 'user'::character varying,
    level bigint DEFAULT '1'::bigint,
    xp bigint DEFAULT '0'::bigint,
    virtual_currency bigint DEFAULT '0'::bigint,
    is_deleted boolean DEFAULT false NOT NULL,
    is_banned boolean DEFAULT false NOT NULL,
    ban_until timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: fullprojectpython; Owner: -
--

CREATE SEQUENCE fullprojectpython.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: fullprojectpython; Owner: -
--

ALTER SEQUENCE fullprojectpython.users_user_id_seq OWNED BY fullprojectpython.users.user_id;


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    achievement_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    difficulty character varying(50) NOT NULL,
    reward_money numeric(10,2) DEFAULT 0.00,
    code character varying(50),
    metric character varying(50),
    threshold integer,
    is_active smallint DEFAULT 1,
    icon character varying(20)
);


--
-- Name: achievements_achievement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.achievements ALTER COLUMN achievement_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.achievements_achievement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: active_accepted_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_accepted_challenges (
    user_id integer NOT NULL,
    challenge_id integer NOT NULL,
    code_state text,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accepted_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'::text) NOT NULL,
    last_saved_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC'::text) NOT NULL,
    problem_mode_competitive character varying(20) GENERATED ALWAYS AS ('competitive'::character varying) STORED
);


--
-- Name: advanced_validation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advanced_validation (
    id integer NOT NULL,
    question_text text NOT NULL,
    correct_answer character varying(500) NOT NULL
);


--
-- Name: advanced_validation_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advanced_validation_choices (
    id integer NOT NULL,
    question_id integer NOT NULL,
    choice_text character varying(500) NOT NULL
);


--
-- Name: advanced_validation_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.advanced_validation_choices ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.advanced_validation_choices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: advanced_validation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.advanced_validation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.advanced_validation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: arcade_chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_chat_messages (
    id integer NOT NULL,
    room_id integer NOT NULL,
    user_name character varying(50) NOT NULL,
    kind character varying(10) DEFAULT 'text'::character varying NOT NULL,
    message character varying(300),
    emoji character varying(16),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: arcade_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_chat_messages_id_seq OWNED BY public.arcade_chat_messages.id;


--
-- Name: arcade_effects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_effects (
    id integer NOT NULL,
    room_id integer NOT NULL,
    attacker_name character varying(50) NOT NULL,
    target_name character varying(50) NOT NULL,
    effect_type character varying(30) NOT NULL,
    item_name character varying(100),
    amount integer,
    delivered integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: arcade_effects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_effects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_effects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_effects_id_seq OWNED BY public.arcade_effects.id;


--
-- Name: arcade_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_items (
    item_id integer NOT NULL,
    item_code character varying(50) NOT NULL,
    name_th character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    desc_th text NOT NULL,
    desc_en text NOT NULL,
    price integer NOT NULL,
    icon character varying(20) NOT NULL,
    type character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: arcade_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_items_item_id_seq OWNED BY public.arcade_items.item_id;


--
-- Name: arcade_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_participants (
    id integer NOT NULL,
    room_id integer,
    user_name character varying(50) NOT NULL,
    is_host integer DEFAULT 0,
    score integer DEFAULT 0,
    cash integer DEFAULT 0,
    is_eliminated integer DEFAULT 0,
    joined_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_seen timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    pending_round_score integer,
    has_submitted integer DEFAULT 0,
    coins_awarded integer DEFAULT 0,
    submitted_code text,
    submitted_at timestamp without time zone,
    score_multiplier_active smallint DEFAULT 0,
    draft_code text,
    draft_updated_at timestamp without time zone
);


--
-- Name: arcade_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_participants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_participants_id_seq OWNED BY public.arcade_participants.id;


--
-- Name: arcade_player_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_player_stats (
    user_name character varying(50) NOT NULL,
    matches_played integer DEFAULT 0,
    wins integer DEFAULT 0,
    best_rank integer,
    total_score integer DEFAULT 0,
    total_cash_earned integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: arcade_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_rooms (
    room_id integer NOT NULL,
    room_code character varying(10) NOT NULL,
    room_name character varying(100) NOT NULL,
    host_name character varying(50) NOT NULL,
    password character varying(100) DEFAULT NULL::character varying,
    max_players integer DEFAULT 5,
    current_round integer DEFAULT 0,
    status character varying(20) DEFAULT 'WAITING'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    phase character varying(20) DEFAULT 'LOBBY'::character varying,
    phase_deadline timestamp without time zone,
    last_round_summary jsonb,
    round_duration_mode character varying(10) DEFAULT 'standard'::character varying,
    difficulty character varying(10) DEFAULT 'default'::character varying,
    round_task_ids jsonb
);


--
-- Name: arcade_rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_rooms_room_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_rooms_room_id_seq OWNED BY public.arcade_rooms.room_id;


--
-- Name: arcade_round_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_round_history (
    id integer NOT NULL,
    room_id integer NOT NULL,
    user_name character varying(50) NOT NULL,
    round_num integer NOT NULL,
    code text,
    pass_count integer DEFAULT 0,
    total_count integer DEFAULT 0,
    quality_score integer DEFAULT 0,
    time_used_seconds integer DEFAULT 0,
    round_score integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    room_code character varying(10),
    room_name character varying(100),
    match_ended_at timestamp without time zone,
    difficulty character varying(20),
    round_duration_mode character varying(20)
);


--
-- Name: arcade_round_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_round_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_round_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_round_history_id_seq OWNED BY public.arcade_round_history.id;


--
-- Name: problem_modes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problem_modes (
    mode character varying(20) NOT NULL,
    entry_id integer NOT NULL,
    problem_id bigint NOT NULL,
    lesson_id integer,
    order_index character varying(50),
    difficulty character varying(50),
    xp_reward integer DEFAULT 0 NOT NULL,
    coin_reward integer DEFAULT 0 NOT NULL,
    time_limit_sec integer,
    extra jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active smallint DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone
);


--
-- Name: problems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.problems (
    problem_id bigint NOT NULL,
    title_th text DEFAULT ''::text NOT NULL,
    title_en text,
    desc_th text DEFAULT ''::text NOT NULL,
    desc_en text,
    hint_th text,
    hint_en text,
    starter_code text,
    solution_code text,
    test_kind character varying(20) DEFAULT 'stdio'::character varying NOT NULL,
    test_cases jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_auto_gradable smallint DEFAULT 1 NOT NULL
);


--
-- Name: arcade_tasks; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.arcade_tasks AS
 SELECT m.entry_id AS task_id,
    m.difficulty,
    p.title_th,
    p.title_en,
    p.desc_th,
    p.desc_en,
    p.solution_code AS initial_code,
    ( SELECT COALESCE(jsonb_agg(jsonb_build_object('input', (c.value -> 'args'::text), 'output', (c.value -> 'expected'::text))), '[]'::jsonb) AS "coalesce"
           FROM jsonb_array_elements(p.test_cases) c(value)) AS test_cases,
    p.created_at,
    p.starter_code,
    ((m.extra ->> 'work_chars'::text))::integer AS work_chars,
    p.hint_th,
    p.hint_en
   FROM (public.problem_modes m
     JOIN public.problems p ON ((p.problem_id = m.problem_id)))
  WHERE ((m.mode)::text = 'arcade'::text);


--
-- Name: arcade_tasks_pre_merge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.arcade_tasks_pre_merge (
    task_id integer CONSTRAINT arcade_tasks_task_id_not_null NOT NULL,
    difficulty character varying(20) CONSTRAINT arcade_tasks_difficulty_not_null NOT NULL,
    title_th character varying(255) CONSTRAINT arcade_tasks_title_th_not_null NOT NULL,
    title_en character varying(255) CONSTRAINT arcade_tasks_title_en_not_null NOT NULL,
    desc_th text CONSTRAINT arcade_tasks_desc_th_not_null NOT NULL,
    desc_en text CONSTRAINT arcade_tasks_desc_en_not_null NOT NULL,
    initial_code text CONSTRAINT arcade_tasks_initial_code_not_null NOT NULL,
    test_cases jsonb CONSTRAINT arcade_tasks_test_cases_not_null NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    starter_code text,
    work_chars integer,
    hint_th text,
    hint_en text
);


--
-- Name: arcade_tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.arcade_tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: arcade_tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.arcade_tasks_task_id_seq OWNED BY public.arcade_tasks_pre_merge.task_id;


--
-- Name: assessment_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_choices (
    id integer NOT NULL,
    question_id integer,
    choice_text text,
    "order" integer
);


--
-- Name: assessment_choices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_choices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_choices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_choices_id_seq OWNED BY public.assessment_choices.id;


--
-- Name: assessment_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_questions (
    id integer NOT NULL,
    level_value integer,
    question_text text,
    question_type character varying(20),
    correct_answer text
);


--
-- Name: assessment_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.assessment_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: assessment_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.assessment_questions_id_seq OWNED BY public.assessment_questions.id;


--
-- Name: cosmetics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cosmetics (
    cosmetic_id integer NOT NULL,
    name character varying(200) NOT NULL,
    type character varying(50) NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    asset_url character varying(500)
);


--
-- Name: cosmetics_cosmetic_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: email_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_verifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: email_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.email_verifications ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.email_verifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: exercise_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_submissions (
    submission_id integer NOT NULL,
    user_id integer,
    exercise_id integer,
    submitted_code text NOT NULL,
    is_passed smallint DEFAULT 0,
    score integer DEFAULT 0,
    execution_time_ms integer,
    error_message text,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    problem_mode_lesson character varying(20) GENERATED ALWAYS AS ('lesson'::character varying) STORED
);


--
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercise_submissions_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercise_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercise_submissions_submission_id_seq OWNED BY public.exercise_submissions.submission_id;


--
-- Name: exercises; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.exercises AS
 SELECT m.entry_id AS exercise_id,
    m.lesson_id,
    p.title_th AS title,
    p.desc_th AS description,
    p.title_en,
    p.desc_en AS description_en,
    p.starter_code,
    p.solution_code,
    p.test_cases,
    m.xp_reward,
    m.coin_reward AS currency_reward,
    NULLIF((m.extra ->> 'file_name'::text), ''::text) AS file_name,
    (NULLIF((m.order_index)::text, ''::text))::integer AS order_index
   FROM (public.problem_modes m
     JOIN public.problems p ON ((p.problem_id = m.problem_id)))
  WHERE ((m.mode)::text = 'lesson'::text);


--
-- Name: exercises_pre_merge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises_pre_merge (
    exercise_id integer CONSTRAINT exercises_exercise_id_not_null NOT NULL,
    lesson_id integer,
    title character varying(100),
    description text,
    starter_code text,
    solution_code text,
    test_cases jsonb,
    xp_reward integer DEFAULT 10,
    currency_reward integer DEFAULT 5,
    file_name character varying(255),
    order_index integer DEFAULT 0
);


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercises_exercise_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercises_exercise_id_seq OWNED BY public.exercises_pre_merge.exercise_id;


--
-- Name: exercises_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises_files (
    file_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    file_name character varying(100) NOT NULL,
    file_content text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    problem_mode_lesson character varying(20) GENERATED ALWAYS AS ('lesson'::character varying) STORED
);


--
-- Name: exercises_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exercises_files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exercises_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exercises_files_file_id_seq OWNED BY public.exercises_files.file_id;


--
-- Name: game_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_rooms (
    room_id bigint NOT NULL,
    room_name character varying(50) NOT NULL,
    host_user_id bigint NOT NULL,
    room_password character varying(50) DEFAULT NULL::character varying,
    status public.game_rooms_status DEFAULT 'WAITING'::public.game_rooms_status,
    max_players bigint DEFAULT '2'::bigint,
    current_players bigint DEFAULT '1'::bigint,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: game_rooms_room_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.game_rooms_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_rooms_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.game_rooms_room_id_seq OWNED BY public.game_rooms.room_id;


--
-- Name: game_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_sessions (
    session_id bigint NOT NULL,
    user_id bigint,
    mode character varying(20) NOT NULL,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ended_at timestamp with time zone
);


--
-- Name: game_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.game_sessions_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: game_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.game_sessions_session_id_seq OWNED BY public.game_sessions.session_id;


--
-- Name: learning_ai_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.learning_ai_tasks (
    task_id integer NOT NULL,
    user_id integer NOT NULL,
    mode character varying(20) NOT NULL,
    title character varying(255) NOT NULL,
    section_label character varying(100),
    subtitle character varying(100),
    accent character varying(20),
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
    completed_at timestamp without time zone,
    problem_id integer
);


--
-- Name: learning_ai_tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.learning_ai_tasks ALTER COLUMN task_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.learning_ai_tasks_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lesson_quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_quiz_attempts (
    attempt_id bigint NOT NULL,
    user_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    quiz_type character varying(10) NOT NULL,
    score bigint DEFAULT '0'::bigint NOT NULL,
    total_questions bigint DEFAULT '0'::bigint NOT NULL,
    answers_json text,
    completed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: lesson_quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lesson_quiz_attempts_attempt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lesson_quiz_attempts_attempt_id_seq OWNED BY public.lesson_quiz_attempts.attempt_id;


--
-- Name: lesson_quizzes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_quizzes (
    quiz_id integer NOT NULL,
    lesson_id integer NOT NULL,
    quiz_type character varying(10) NOT NULL
);


--
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lesson_quizzes_quiz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_quizzes_quiz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lesson_quizzes_quiz_id_seq OWNED BY public.lesson_quizzes.quiz_id;


--
-- Name: lesson_slides; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_slides (
    slide_id integer NOT NULL,
    lesson_id integer NOT NULL,
    slide_order integer NOT NULL,
    slide_title character varying(255),
    slide_content text,
    slide_src character varying(255),
    slide_type character varying(20) DEFAULT 'image'::character varying NOT NULL
);


--
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lesson_slides_slide_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lesson_slides_slide_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lesson_slides_slide_id_seq OWNED BY public.lesson_slides.slide_id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    lesson_id integer NOT NULL,
    module_id integer,
    title character varying(100) NOT NULL,
    content text,
    order_index integer NOT NULL,
    required_level integer DEFAULT 1,
    description text
);


--
-- Name: lessons_lesson_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lessons_lesson_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lessons_lesson_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lessons_lesson_id_seq OWNED BY public.lessons.lesson_id;


--
-- Name: level_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_config (
    id integer NOT NULL,
    q_id integer,
    title character varying(50),
    level_value integer,
    "order" integer
);


--
-- Name: level_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.level_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: level_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.level_config_id_seq OWNED BY public.level_config.id;


--
-- Name: mini_game_current_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_current_conversations (
    user_id bigint NOT NULL,
    exercise_id bigint,
    dialogue_id bigint NOT NULL,
    current_npc_id bigint,
    current_location_id bigint,
    updated_at timestamp with time zone,
    problem_mode_minigame character varying(20) GENERATED ALWAYS AS ('minigame'::character varying) STORED
);


--
-- Name: mini_game_dialogues; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_dialogues (
    dialogue_id bigint NOT NULL,
    lesson_id bigint DEFAULT '1'::bigint NOT NULL,
    exercise_id bigint,
    dialogue_order bigint DEFAULT '0'::bigint NOT NULL,
    exercise_order character varying(20) DEFAULT NULL::character varying,
    dialogue_text text NOT NULL,
    npc_id bigint,
    npc_emotion character varying(50) DEFAULT 'neutral'::character varying NOT NULL,
    location_id bigint,
    dialogue_phase public.mini_game_dialogues_dialogue_phase DEFAULT 'pre_submit'::public.mini_game_dialogues_dialogue_phase NOT NULL,
    branch_key character varying(80) DEFAULT 'default'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone,
    problem_mode_minigame character varying(20) GENERATED ALWAYS AS ('minigame'::character varying) STORED
);


--
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_dialogues_dialogue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_dialogues_dialogue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_dialogues_dialogue_id_seq OWNED BY public.mini_game_dialogues.dialogue_id;


--
-- Name: mini_game_exercise_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_exercise_submissions (
    submission_id bigint NOT NULL,
    user_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    submitted_code text NOT NULL,
    submitted_at timestamp with time zone,
    problem_mode_minigame character varying(20) GENERATED ALWAYS AS ('minigame'::character varying) STORED
);


--
-- Name: mini_game_exercise_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_exercise_submissions_submission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_exercise_submissions_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_exercise_submissions_submission_id_seq OWNED BY public.mini_game_exercise_submissions.submission_id;


--
-- Name: mini_game_exercises; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.mini_game_exercises AS
 SELECT m.entry_id AS exercise_id,
    m.lesson_id,
    m.order_index AS exercise_order,
    p.title_th AS title,
    p.desc_th AS description,
    p.title_en,
    p.desc_en AS description_en,
    p.starter_code,
    p.solution_code,
    (jsonb_build_object('expected_format', COALESCE((m.extra -> 'expected_format'::text), '""'::jsonb), 'rules', COALESCE((m.extra -> 'rules'::text), '[]'::jsonb), 'correctness', p.test_cases))::text AS test_cases_json,
    m.xp_reward,
    m.coin_reward AS currency_reward,
    p.created_at,
    p.updated_at,
    m.is_active
   FROM (public.problem_modes m
     JOIN public.problems p ON ((p.problem_id = m.problem_id)))
  WHERE ((m.mode)::text = 'minigame'::text);


--
-- Name: mini_game_exercises_pre_merge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_exercises_pre_merge (
    exercise_id bigint CONSTRAINT mini_game_exercises_exercise_id_not_null NOT NULL,
    lesson_id bigint,
    exercise_order character varying(20) DEFAULT NULL::character varying,
    title character varying(150) CONSTRAINT mini_game_exercises_title_not_null NOT NULL,
    description text,
    starter_code text,
    solution_code text,
    test_cases_json text CONSTRAINT mini_game_exercises_test_cases_json_not_null NOT NULL,
    xp_reward bigint DEFAULT '10'::bigint CONSTRAINT mini_game_exercises_xp_reward_not_null NOT NULL,
    currency_reward bigint DEFAULT '5'::bigint CONSTRAINT mini_game_exercises_currency_reward_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT mini_game_exercises_created_at_not_null NOT NULL,
    updated_at timestamp with time zone,
    is_active smallint DEFAULT 1 CONSTRAINT mini_game_exercises_is_active_not_null NOT NULL
);


--
-- Name: mini_game_exercises_exercise_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_exercises_exercise_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_exercises_exercise_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_exercises_exercise_id_seq OWNED BY public.mini_game_exercises_pre_merge.exercise_id;


--
-- Name: mini_game_exercises_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_exercises_files (
    file_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    file_name character varying(100) NOT NULL,
    file_content text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    problem_mode_minigame character varying(20) GENERATED ALWAYS AS ('minigame'::character varying) STORED
);


--
-- Name: mini_game_exercises_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_exercises_files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_exercises_files_file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_exercises_files_file_id_seq OWNED BY public.mini_game_exercises_files.file_id;


--
-- Name: mini_game_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_locations (
    location_id bigint NOT NULL,
    location_key character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    bg_image_url character varying(255) DEFAULT NULL::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_locations_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_locations_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_locations_location_id_seq OWNED BY public.mini_game_locations.location_id;


--
-- Name: mini_game_npcs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_npcs (
    npc_id bigint NOT NULL,
    npc_key character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    avatar_asset_url character varying(255) DEFAULT NULL::character varying,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_npcs_npc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_npcs_npc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_npcs_npc_id_seq OWNED BY public.mini_game_npcs.npc_id;


--
-- Name: mini_game_user_exercise_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mini_game_user_exercise_progress (
    progress_id bigint NOT NULL,
    user_id bigint NOT NULL,
    exercise_id bigint NOT NULL,
    is_completed smallint DEFAULT 0 NOT NULL,
    xp_reward bigint DEFAULT '0'::bigint NOT NULL,
    currency_reward bigint DEFAULT '0'::bigint NOT NULL,
    selected_branch_key character varying(80) DEFAULT 'default'::character varying NOT NULL,
    updated_at timestamp with time zone,
    score integer DEFAULT 0 NOT NULL,
    problem_mode_minigame character varying(20) GENERATED ALWAYS AS ('minigame'::character varying) STORED
);


--
-- Name: mini_game_user_exercise_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mini_game_user_exercise_progress_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mini_game_user_exercise_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mini_game_user_exercise_progress_progress_id_seq OWNED BY public.mini_game_user_exercise_progress.progress_id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.modules (
    module_id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    order_index integer NOT NULL,
    is_locked smallint DEFAULT 1,
    required_level integer DEFAULT 1
);


--
-- Name: modules_module_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.modules_module_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: modules_module_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.modules_module_id_seq OWNED BY public.modules.module_id;


--
-- Name: multiplayer_challenges; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.multiplayer_challenges AS
 SELECT m.entry_id AS challenge_id,
    p.title_th AS title,
    p.desc_th AS description,
    p.title_en,
    p.desc_en AS description_en,
    m.difficulty,
    m.coin_reward AS reward,
    m.time_limit_sec AS time_limit,
    p.test_cases,
    p.created_by,
    p.created_at,
    COALESCE(((m.extra ->> 'is_test'::text))::integer, 0) AS is_test,
    COALESCE(NULLIF((m.extra ->> 'challenge_type'::text), ''::text), 'standard'::text) AS challenge_type,
    COALESCE(NULLIF((m.extra ->> 'challenge_scope'::text), ''::text), 'standard'::text) AS challenge_scope,
    m.expires_at
   FROM (public.problem_modes m
     JOIN public.problems p ON ((p.problem_id = m.problem_id)))
  WHERE ((m.mode)::text = 'competitive'::text);


--
-- Name: multiplayer_challenges_pre_merge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.multiplayer_challenges_pre_merge (
    challenge_id integer CONSTRAINT multiplayer_challenges_challenge_id_not_null NOT NULL,
    title character varying(200) CONSTRAINT multiplayer_challenges_title_not_null NOT NULL,
    description text CONSTRAINT multiplayer_challenges_description_not_null NOT NULL,
    difficulty character varying(50) DEFAULT 'Easy'::character varying CONSTRAINT multiplayer_challenges_difficulty_not_null NOT NULL,
    reward integer DEFAULT 500 CONSTRAINT multiplayer_challenges_reward_not_null NOT NULL,
    time_limit integer DEFAULT 300 CONSTRAINT multiplayer_challenges_time_limit_not_null NOT NULL,
    test_cases jsonb CONSTRAINT multiplayer_challenges_test_cases_not_null NOT NULL,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_test integer DEFAULT 0,
    expires_at timestamp without time zone DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval)
);


--
-- Name: multiplayer_challenges_challenge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.multiplayer_challenges_pre_merge ALTER COLUMN challenge_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.multiplayer_challenges_challenge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: multiplayer_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.multiplayer_sessions (
    session_id character varying(100) NOT NULL,
    mode character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'waiting'::character varying NOT NULL,
    current_round integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: multiplayer_submissions; Type: TABLE; Schema: public; Owner: -
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
    breakdown text,
    problem_mode_competitive character varying(20) GENERATED ALWAYS AS ('competitive'::character varying) STORED
);


--
-- Name: multiplayer_submissions_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: music_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.music_tracks (
    track_id integer NOT NULL,
    track_name character varying(100) NOT NULL,
    file_path character varying(255) NOT NULL,
    is_default integer DEFAULT 0
);


--
-- Name: music_tracks_track_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.music_tracks ALTER COLUMN track_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.music_tracks_track_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.password_reset_tokens ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: problems_problem_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.problems_problem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: problems_problem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.problems_problem_id_seq OWNED BY public.problems.problem_id;


--
-- Name: question_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question_choices (
    choice_id integer NOT NULL,
    question_id integer NOT NULL,
    choice_text character varying(255) NOT NULL
);


--
-- Name: question_choices_choice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.question_choices_choice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: question_choices_choice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.question_choices_choice_id_seq OWNED BY public.question_choices.choice_id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quiz_questions (
    question_id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_order integer NOT NULL,
    question_text text NOT NULL,
    question_type character varying(10) NOT NULL,
    correct_answer text NOT NULL
);


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quiz_questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quiz_questions_question_id_seq OWNED BY public.quiz_questions.question_id;


--
-- Name: room_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.room_participants (
    id bigint NOT NULL,
    room_id bigint NOT NULL,
    user_id bigint NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    score bigint DEFAULT '0'::bigint,
    is_ready smallint DEFAULT 0
);


--
-- Name: room_participants_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.room_participants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_participants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.room_participants_id_seq OWNED BY public.room_participants.id;


--
-- Name: session_players; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_players (
    session_id character varying(100) NOT NULL,
    user_id integer NOT NULL,
    money_balance integer DEFAULT 0 NOT NULL,
    is_survived integer DEFAULT 1 NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    status character varying(50) DEFAULT 'joined'::character varying NOT NULL
);


--
-- Name: shop_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_items (
    item_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    item_type character varying(50) NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    asset_url character varying(255),
    preview_image character varying(255),
    is_active smallint DEFAULT 1,
    effects jsonb DEFAULT '[]'::jsonb,
    type character varying(50),
    rarity character varying(50),
    preview_data text,
    is_available smallint DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    set_key character varying(50)
);


--
-- Name: shop_items_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.shop_items_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: shop_items_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.shop_items_item_id_seq OWNED BY public.shop_items.item_id;


--
-- Name: shop_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_sets (
    set_key character varying(50) NOT NULL,
    name_th character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    description_th text,
    price integer NOT NULL,
    is_active smallint DEFAULT 1,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: survey_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_options (
    id integer NOT NULL,
    question_id integer,
    option_text character varying(100) NOT NULL,
    option_description text,
    "order" integer DEFAULT 0,
    level_value integer,
    option_key character varying(50)
);


--
-- Name: survey_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.survey_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.survey_options_id_seq OWNED BY public.survey_options.id;


--
-- Name: survey_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_questions (
    id integer NOT NULL,
    title text NOT NULL,
    image character varying(255),
    description text,
    question_key character varying(50),
    is_active smallint DEFAULT 1,
    "order" integer DEFAULT 0
);


--
-- Name: survey_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.survey_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: survey_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.survey_questions_id_seq OWNED BY public.survey_questions.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL,
    unlocked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_achievements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_cosmetics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_cosmetics (
    user_id integer NOT NULL,
    cosmetic_id integer NOT NULL,
    is_equipped integer DEFAULT 0 NOT NULL,
    purchased_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_inventory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_inventory (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    item_id bigint NOT NULL,
    purchased_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_inventory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_inventory_id_seq OWNED BY public.user_inventory.id;


--
-- Name: user_mailbox; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: user_mailbox_mail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: user_missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_missions (
    user_mission_id integer NOT NULL,
    user_id integer,
    email_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    accepted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone
);


--
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_missions_user_mission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_missions_user_mission_id_seq OWNED BY public.user_missions.user_mission_id;


--
-- Name: user_presence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_presence (
    user_id bigint NOT NULL,
    mode character varying(40) DEFAULT 'learn'::character varying NOT NULL,
    activity_label character varying(120) DEFAULT NULL::character varying,
    current_path character varying(255) DEFAULT NULL::character varying,
    last_seen timestamp with time zone
);


--
-- Name: user_profile_showcase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profile_showcase (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    achievement_id bigint NOT NULL,
    display_order bigint DEFAULT '0'::bigint NOT NULL
);


--
-- Name: user_profile_showcase_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_profile_showcase_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_profile_showcase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_profile_showcase_id_seq OWNED BY public.user_profile_showcase.id;


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    progress_id integer NOT NULL,
    user_id integer,
    lesson_id integer,
    status character varying(20) DEFAULT 'locked'::character varying,
    score integer DEFAULT 0,
    completed_at timestamp without time zone
);


--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_progress_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_progress_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_progress_progress_id_seq OWNED BY public.user_progress.progress_id;


--
-- Name: user_quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_quiz_attempts (
    attempt_id integer NOT NULL,
    user_id integer,
    lesson_id integer,
    quiz_type character varying(10),
    score integer NOT NULL,
    total_questions integer NOT NULL,
    passed smallint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_quiz_attempts_quiz_type_check CHECK (((quiz_type)::text = ANY (ARRAY[('pre'::character varying)::text, ('post'::character varying)::text])))
);


--
-- Name: user_quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_quiz_attempts_attempt_id_seq OWNED BY public.user_quiz_attempts.attempt_id;


--
-- Name: user_survey_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_survey_responses (
    response_id integer NOT NULL,
    user_id integer,
    question_id integer,
    selected_option character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_survey_responses_response_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_survey_responses_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_survey_responses_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_survey_responses_response_id_seq OWNED BY public.user_survey_responses.response_id;


--
-- Name: user_xp_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_xp_log (
    log_id bigint NOT NULL,
    user_id bigint NOT NULL,
    xp_date date,
    xp_earned bigint DEFAULT '0'::bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone
);


--
-- Name: user_xp_log_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_xp_log_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_xp_log_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_xp_log_log_id_seq OWNED BY public.user_xp_log.log_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100),
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'student'::character varying,
    level integer DEFAULT 1,
    xp integer DEFAULT 0,
    virtual_currency integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reset_token character varying(255),
    reset_token_expiry timestamp without time zone,
    is_deleted smallint DEFAULT 0,
    deleted_at timestamp without time zone,
    is_banned smallint DEFAULT 0,
    ban_until timestamp without time zone,
    reputation integer DEFAULT 10,
    equipped_theme_id integer,
    equipped_mouse_effect_id integer,
    equipped_profile_frame_id integer,
    avatar_url character varying(255),
    bio character varying(500),
    email_verified smallint DEFAULT 0
);


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: virtual_emails; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: virtual_emails_email_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.virtual_emails_email_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: virtual_emails_email_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.virtual_emails_email_id_seq OWNED BY public.virtual_emails.email_id;


--
-- Name: achievements achievement_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.achievements ALTER COLUMN achievement_id SET DEFAULT nextval('fullprojectpython.achievements_achievement_id_seq'::regclass);


--
-- Name: advanced_validation id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.advanced_validation ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.advanced_validation_id_seq'::regclass);


--
-- Name: advanced_validation_choices id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.advanced_validation_choices ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.advanced_validation_choices_id_seq'::regclass);


--
-- Name: email_verifications id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.email_verifications ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.email_verifications_id_seq'::regclass);


--
-- Name: exercise_submissions submission_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.exercise_submissions ALTER COLUMN submission_id SET DEFAULT nextval('fullprojectpython.exercise_submissions_submission_id_seq'::regclass);


--
-- Name: exercises exercise_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.exercises ALTER COLUMN exercise_id SET DEFAULT nextval('fullprojectpython.exercises_exercise_id_seq'::regclass);


--
-- Name: learning_ai_tasks task_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.learning_ai_tasks ALTER COLUMN task_id SET DEFAULT nextval('fullprojectpython.learning_ai_tasks_task_id_seq'::regclass);


--
-- Name: lesson_quizzes quiz_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('fullprojectpython.lesson_quizzes_quiz_id_seq'::regclass);


--
-- Name: lesson_slides slide_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_slides ALTER COLUMN slide_id SET DEFAULT nextval('fullprojectpython.lesson_slides_slide_id_seq'::regclass);


--
-- Name: lessons lesson_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('fullprojectpython.lessons_lesson_id_seq'::regclass);


--
-- Name: level_config id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.level_config ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.level_config_id_seq'::regclass);


--
-- Name: modules module_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.modules ALTER COLUMN module_id SET DEFAULT nextval('fullprojectpython.modules_module_id_seq'::regclass);


--
-- Name: music_tracks track_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.music_tracks ALTER COLUMN track_id SET DEFAULT nextval('fullprojectpython.music_tracks_track_id_seq'::regclass);


--
-- Name: question_choices choice_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.question_choices ALTER COLUMN choice_id SET DEFAULT nextval('fullprojectpython.question_choices_choice_id_seq'::regclass);


--
-- Name: quiz_questions question_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.quiz_questions ALTER COLUMN question_id SET DEFAULT nextval('fullprojectpython.quiz_questions_question_id_seq'::regclass);


--
-- Name: shop_items item_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.shop_items ALTER COLUMN item_id SET DEFAULT nextval('fullprojectpython.shop_items_item_id_seq'::regclass);


--
-- Name: survey_options id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.survey_options ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.survey_options_id_seq'::regclass);


--
-- Name: survey_questions id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.survey_questions ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.survey_questions_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.user_achievements ALTER COLUMN id SET DEFAULT nextval('fullprojectpython.user_achievements_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.users ALTER COLUMN user_id SET DEFAULT nextval('fullprojectpython.users_user_id_seq'::regclass);


--
-- Name: arcade_chat_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.arcade_chat_messages_id_seq'::regclass);


--
-- Name: arcade_effects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_effects ALTER COLUMN id SET DEFAULT nextval('public.arcade_effects_id_seq'::regclass);


--
-- Name: arcade_items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_items ALTER COLUMN item_id SET DEFAULT nextval('public.arcade_items_item_id_seq'::regclass);


--
-- Name: arcade_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_participants ALTER COLUMN id SET DEFAULT nextval('public.arcade_participants_id_seq'::regclass);


--
-- Name: arcade_rooms room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_rooms ALTER COLUMN room_id SET DEFAULT nextval('public.arcade_rooms_room_id_seq'::regclass);


--
-- Name: arcade_round_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_round_history ALTER COLUMN id SET DEFAULT nextval('public.arcade_round_history_id_seq'::regclass);


--
-- Name: arcade_tasks_pre_merge task_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_tasks_pre_merge ALTER COLUMN task_id SET DEFAULT nextval('public.arcade_tasks_task_id_seq'::regclass);


--
-- Name: assessment_choices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_choices ALTER COLUMN id SET DEFAULT nextval('public.assessment_choices_id_seq'::regclass);


--
-- Name: assessment_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions ALTER COLUMN id SET DEFAULT nextval('public.assessment_questions_id_seq'::regclass);


--
-- Name: exercise_submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.exercise_submissions_submission_id_seq'::regclass);


--
-- Name: exercises_files file_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_files ALTER COLUMN file_id SET DEFAULT nextval('public.exercises_files_file_id_seq'::regclass);


--
-- Name: exercises_pre_merge exercise_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_pre_merge ALTER COLUMN exercise_id SET DEFAULT nextval('public.exercises_exercise_id_seq'::regclass);


--
-- Name: game_rooms room_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rooms ALTER COLUMN room_id SET DEFAULT nextval('public.game_rooms_room_id_seq'::regclass);


--
-- Name: game_sessions session_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.game_sessions_session_id_seq'::regclass);


--
-- Name: lesson_quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.lesson_quiz_attempts_attempt_id_seq'::regclass);


--
-- Name: lesson_quizzes quiz_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quizzes ALTER COLUMN quiz_id SET DEFAULT nextval('public.lesson_quizzes_quiz_id_seq'::regclass);


--
-- Name: lesson_slides slide_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_slides ALTER COLUMN slide_id SET DEFAULT nextval('public.lesson_slides_slide_id_seq'::regclass);


--
-- Name: lessons lesson_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons ALTER COLUMN lesson_id SET DEFAULT nextval('public.lessons_lesson_id_seq'::regclass);


--
-- Name: level_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_config ALTER COLUMN id SET DEFAULT nextval('public.level_config_id_seq'::regclass);


--
-- Name: mini_game_dialogues dialogue_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues ALTER COLUMN dialogue_id SET DEFAULT nextval('public.mini_game_dialogues_dialogue_id_seq'::regclass);


--
-- Name: mini_game_exercise_submissions submission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercise_submissions ALTER COLUMN submission_id SET DEFAULT nextval('public.mini_game_exercise_submissions_submission_id_seq'::regclass);


--
-- Name: mini_game_exercises_files file_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_files ALTER COLUMN file_id SET DEFAULT nextval('public.mini_game_exercises_files_file_id_seq'::regclass);


--
-- Name: mini_game_exercises_pre_merge exercise_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_pre_merge ALTER COLUMN exercise_id SET DEFAULT nextval('public.mini_game_exercises_exercise_id_seq'::regclass);


--
-- Name: mini_game_locations location_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_locations ALTER COLUMN location_id SET DEFAULT nextval('public.mini_game_locations_location_id_seq'::regclass);


--
-- Name: mini_game_npcs npc_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_npcs ALTER COLUMN npc_id SET DEFAULT nextval('public.mini_game_npcs_npc_id_seq'::regclass);


--
-- Name: mini_game_user_exercise_progress progress_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.mini_game_user_exercise_progress_progress_id_seq'::regclass);


--
-- Name: modules module_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules ALTER COLUMN module_id SET DEFAULT nextval('public.modules_module_id_seq'::regclass);


--
-- Name: problems problem_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems ALTER COLUMN problem_id SET DEFAULT nextval('public.problems_problem_id_seq'::regclass);


--
-- Name: question_choices choice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_choices ALTER COLUMN choice_id SET DEFAULT nextval('public.question_choices_choice_id_seq'::regclass);


--
-- Name: quiz_questions question_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN question_id SET DEFAULT nextval('public.quiz_questions_question_id_seq'::regclass);


--
-- Name: room_participants id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_participants ALTER COLUMN id SET DEFAULT nextval('public.room_participants_id_seq'::regclass);


--
-- Name: shop_items item_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_items ALTER COLUMN item_id SET DEFAULT nextval('public.shop_items_item_id_seq'::regclass);


--
-- Name: survey_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_options ALTER COLUMN id SET DEFAULT nextval('public.survey_options_id_seq'::regclass);


--
-- Name: survey_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions ALTER COLUMN id SET DEFAULT nextval('public.survey_questions_id_seq'::regclass);


--
-- Name: user_inventory id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory ALTER COLUMN id SET DEFAULT nextval('public.user_inventory_id_seq'::regclass);


--
-- Name: user_missions user_mission_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions ALTER COLUMN user_mission_id SET DEFAULT nextval('public.user_missions_user_mission_id_seq'::regclass);


--
-- Name: user_profile_showcase id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile_showcase ALTER COLUMN id SET DEFAULT nextval('public.user_profile_showcase_id_seq'::regclass);


--
-- Name: user_progress progress_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress ALTER COLUMN progress_id SET DEFAULT nextval('public.user_progress_progress_id_seq'::regclass);


--
-- Name: user_quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.user_quiz_attempts_attempt_id_seq'::regclass);


--
-- Name: user_survey_responses response_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_survey_responses ALTER COLUMN response_id SET DEFAULT nextval('public.user_survey_responses_response_id_seq'::regclass);


--
-- Name: user_xp_log log_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_xp_log ALTER COLUMN log_id SET DEFAULT nextval('public.user_xp_log_log_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: virtual_emails email_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.virtual_emails ALTER COLUMN email_id SET DEFAULT nextval('public.virtual_emails_email_id_seq'::regclass);


--
-- Name: achievements idx_16674_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.achievements
    ADD CONSTRAINT idx_16674_primary PRIMARY KEY (achievement_id);


--
-- Name: advanced_validation idx_16682_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.advanced_validation
    ADD CONSTRAINT idx_16682_primary PRIMARY KEY (id);


--
-- Name: advanced_validation_choices idx_16689_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.advanced_validation_choices
    ADD CONSTRAINT idx_16689_primary PRIMARY KEY (id);


--
-- Name: email_verifications idx_16715_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.email_verifications
    ADD CONSTRAINT idx_16715_primary PRIMARY KEY (id);


--
-- Name: exercises idx_16721_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.exercises
    ADD CONSTRAINT idx_16721_primary PRIMARY KEY (exercise_id);


--
-- Name: exercise_submissions idx_16741_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.exercise_submissions
    ADD CONSTRAINT idx_16741_primary PRIMARY KEY (submission_id);


--
-- Name: learning_ai_tasks idx_16775_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.learning_ai_tasks
    ADD CONSTRAINT idx_16775_primary PRIMARY KEY (task_id);


--
-- Name: lessons idx_16791_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lessons
    ADD CONSTRAINT idx_16791_primary PRIMARY KEY (lesson_id);


--
-- Name: lesson_quizzes idx_16798_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_quizzes
    ADD CONSTRAINT idx_16798_primary PRIMARY KEY (quiz_id);


--
-- Name: lesson_slides idx_16814_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_slides
    ADD CONSTRAINT idx_16814_primary PRIMARY KEY (slide_id);


--
-- Name: level_config idx_16825_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.level_config
    ADD CONSTRAINT idx_16825_primary PRIMARY KEY (id);


--
-- Name: modules idx_16914_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.modules
    ADD CONSTRAINT idx_16914_primary PRIMARY KEY (module_id);


--
-- Name: music_tracks idx_16921_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.music_tracks
    ADD CONSTRAINT idx_16921_primary PRIMARY KEY (track_id);


--
-- Name: question_choices idx_16927_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.question_choices
    ADD CONSTRAINT idx_16927_primary PRIMARY KEY (choice_id);


--
-- Name: quiz_questions idx_16934_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.quiz_questions
    ADD CONSTRAINT idx_16934_primary PRIMARY KEY (question_id);


--
-- Name: shop_items idx_16962_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.shop_items
    ADD CONSTRAINT idx_16962_primary PRIMARY KEY (item_id);


--
-- Name: survey_options idx_17011_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.survey_options
    ADD CONSTRAINT idx_17011_primary PRIMARY KEY (id);


--
-- Name: survey_questions idx_17020_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.survey_questions
    ADD CONSTRAINT idx_17020_primary PRIMARY KEY (id);


--
-- Name: users idx_17028_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.users
    ADD CONSTRAINT idx_17028_primary PRIMARY KEY (user_id);


--
-- Name: user_achievements idx_17046_primary; Type: CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.user_achievements
    ADD CONSTRAINT idx_17046_primary PRIMARY KEY (id);


--
-- Name: achievements achievements_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_code_key UNIQUE (code);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (achievement_id);


--
-- Name: active_accepted_challenges active_accepted_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT active_accepted_challenges_pkey PRIMARY KEY (user_id, challenge_id);


--
-- Name: advanced_validation_choices advanced_validation_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_validation_choices
    ADD CONSTRAINT advanced_validation_choices_pkey PRIMARY KEY (id);


--
-- Name: advanced_validation advanced_validation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_validation
    ADD CONSTRAINT advanced_validation_pkey PRIMARY KEY (id);


--
-- Name: arcade_chat_messages arcade_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_chat_messages
    ADD CONSTRAINT arcade_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: arcade_effects arcade_effects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_effects
    ADD CONSTRAINT arcade_effects_pkey PRIMARY KEY (id);


--
-- Name: arcade_items arcade_items_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_items
    ADD CONSTRAINT arcade_items_item_code_key UNIQUE (item_code);


--
-- Name: arcade_items arcade_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_items
    ADD CONSTRAINT arcade_items_pkey PRIMARY KEY (item_id);


--
-- Name: arcade_participants arcade_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_participants
    ADD CONSTRAINT arcade_participants_pkey PRIMARY KEY (id);


--
-- Name: arcade_player_stats arcade_player_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_player_stats
    ADD CONSTRAINT arcade_player_stats_pkey PRIMARY KEY (user_name);


--
-- Name: arcade_rooms arcade_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_rooms
    ADD CONSTRAINT arcade_rooms_pkey PRIMARY KEY (room_id);


--
-- Name: arcade_rooms arcade_rooms_room_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_rooms
    ADD CONSTRAINT arcade_rooms_room_code_key UNIQUE (room_code);


--
-- Name: arcade_round_history arcade_round_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_round_history
    ADD CONSTRAINT arcade_round_history_pkey PRIMARY KEY (id);


--
-- Name: arcade_round_history arcade_round_history_room_id_user_name_round_num_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_round_history
    ADD CONSTRAINT arcade_round_history_room_id_user_name_round_num_key UNIQUE (room_id, user_name, round_num);


--
-- Name: arcade_tasks_pre_merge arcade_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_tasks_pre_merge
    ADD CONSTRAINT arcade_tasks_pkey PRIMARY KEY (task_id);


--
-- Name: assessment_choices assessment_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_choices
    ADD CONSTRAINT assessment_choices_pkey PRIMARY KEY (id);


--
-- Name: assessment_questions assessment_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_questions
    ADD CONSTRAINT assessment_questions_pkey PRIMARY KEY (id);


--
-- Name: cosmetics cosmetics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cosmetics
    ADD CONSTRAINT cosmetics_pkey PRIMARY KEY (cosmetic_id);


--
-- Name: email_verifications email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_verifications
    ADD CONSTRAINT email_verifications_pkey PRIMARY KEY (id);


--
-- Name: exercise_submissions exercise_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_submissions
    ADD CONSTRAINT exercise_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: exercises_pre_merge exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_pre_merge
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (exercise_id);


--
-- Name: exercises_files idx_16733_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_files
    ADD CONSTRAINT idx_16733_primary PRIMARY KEY (file_id);


--
-- Name: game_rooms idx_16759_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT idx_16759_primary PRIMARY KEY (room_id);


--
-- Name: game_sessions idx_16769_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT idx_16769_primary PRIMARY KEY (session_id);


--
-- Name: lesson_quiz_attempts idx_16804_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quiz_attempts
    ADD CONSTRAINT idx_16804_primary PRIMARY KEY (attempt_id);


--
-- Name: mini_game_current_conversations idx_16842_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT idx_16842_primary PRIMARY KEY (user_id);


--
-- Name: mini_game_dialogues idx_16846_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT idx_16846_primary PRIMARY KEY (dialogue_id);


--
-- Name: mini_game_exercises_pre_merge idx_16860_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_pre_merge
    ADD CONSTRAINT idx_16860_primary PRIMARY KEY (exercise_id);


--
-- Name: mini_game_exercises_files idx_16872_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_files
    ADD CONSTRAINT idx_16872_primary PRIMARY KEY (file_id);


--
-- Name: mini_game_exercise_submissions idx_16880_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT idx_16880_primary PRIMARY KEY (submission_id);


--
-- Name: mini_game_locations idx_16887_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_locations
    ADD CONSTRAINT idx_16887_primary PRIMARY KEY (location_id);


--
-- Name: mini_game_npcs idx_16896_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_npcs
    ADD CONSTRAINT idx_16896_primary PRIMARY KEY (npc_id);


--
-- Name: mini_game_user_exercise_progress idx_16905_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress
    ADD CONSTRAINT idx_16905_primary PRIMARY KEY (progress_id);


--
-- Name: room_participants idx_16954_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT idx_16954_primary PRIMARY KEY (id);


--
-- Name: user_inventory idx_17061_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT idx_17061_primary PRIMARY KEY (id);


--
-- Name: user_presence idx_17066_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_presence
    ADD CONSTRAINT idx_17066_primary PRIMARY KEY (user_id);


--
-- Name: user_profile_showcase idx_17073_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT idx_17073_primary PRIMARY KEY (id);


--
-- Name: user_xp_log idx_17079_primary; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_xp_log
    ADD CONSTRAINT idx_17079_primary PRIMARY KEY (log_id);


--
-- Name: learning_ai_tasks learning_ai_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.learning_ai_tasks
    ADD CONSTRAINT learning_ai_tasks_pkey PRIMARY KEY (task_id);


--
-- Name: lesson_quizzes lesson_quizzes_lesson_id_quiz_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quizzes
    ADD CONSTRAINT lesson_quizzes_lesson_id_quiz_type_key UNIQUE (lesson_id, quiz_type);


--
-- Name: lesson_quizzes lesson_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quizzes
    ADD CONSTRAINT lesson_quizzes_pkey PRIMARY KEY (quiz_id);


--
-- Name: lesson_slides lesson_slides_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_slides
    ADD CONSTRAINT lesson_slides_pkey PRIMARY KEY (slide_id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (lesson_id);


--
-- Name: level_config level_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_config
    ADD CONSTRAINT level_config_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (module_id);


--
-- Name: multiplayer_challenges_pre_merge multiplayer_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_challenges_pre_merge
    ADD CONSTRAINT multiplayer_challenges_pkey PRIMARY KEY (challenge_id);


--
-- Name: multiplayer_sessions multiplayer_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_sessions
    ADD CONSTRAINT multiplayer_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: multiplayer_submissions multiplayer_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_pkey PRIMARY KEY (submission_id);


--
-- Name: music_tracks music_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_tracks
    ADD CONSTRAINT music_tracks_pkey PRIMARY KEY (track_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: problem_modes problem_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_modes
    ADD CONSTRAINT problem_modes_pkey PRIMARY KEY (mode, entry_id);


--
-- Name: problems problems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problems
    ADD CONSTRAINT problems_pkey PRIMARY KEY (problem_id);


--
-- Name: question_choices question_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT question_choices_pkey PRIMARY KEY (choice_id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (question_id);


--
-- Name: session_players session_players_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_pkey PRIMARY KEY (session_id, user_id);


--
-- Name: shop_items shop_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_items
    ADD CONSTRAINT shop_items_pkey PRIMARY KEY (item_id);


--
-- Name: shop_sets shop_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_sets
    ADD CONSTRAINT shop_sets_pkey PRIMARY KEY (set_key);


--
-- Name: survey_options survey_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_options
    ADD CONSTRAINT survey_options_pkey PRIMARY KEY (id);


--
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (id);


--
-- Name: user_survey_responses unique_user_question; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT unique_user_question UNIQUE (user_id, question_id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_cosmetics user_cosmetics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_pkey PRIMARY KEY (user_id, cosmetic_id);


--
-- Name: user_mailbox user_mailbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mailbox
    ADD CONSTRAINT user_mailbox_pkey PRIMARY KEY (mail_id);


--
-- Name: user_missions user_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_pkey PRIMARY KEY (user_mission_id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (progress_id);


--
-- Name: user_quiz_attempts user_quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: user_quiz_attempts user_quiz_attempts_user_id_lesson_id_quiz_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_user_id_lesson_id_quiz_type_key UNIQUE (user_id, lesson_id, quiz_type);


--
-- Name: user_survey_responses user_survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_pkey PRIMARY KEY (response_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: virtual_emails virtual_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.virtual_emails
    ADD CONSTRAINT virtual_emails_pkey PRIMARY KEY (email_id);


--
-- Name: idx_16689_idx_adv_choices_question; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16689_idx_adv_choices_question ON fullprojectpython.advanced_validation_choices USING btree (question_id);


--
-- Name: idx_16715_user_id; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16715_user_id ON fullprojectpython.email_verifications USING btree (user_id);


--
-- Name: idx_16775_idx_learning_ai_tasks_user_mode_status; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16775_idx_learning_ai_tasks_user_mode_status ON fullprojectpython.learning_ai_tasks USING btree (user_id, mode, status);


--
-- Name: idx_16791_idx_lessons_module; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16791_idx_lessons_module ON fullprojectpython.lessons USING btree (module_id);


--
-- Name: idx_16798_idx_quizzes_lesson; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16798_idx_quizzes_lesson ON fullprojectpython.lesson_quizzes USING btree (lesson_id);


--
-- Name: idx_16814_idx_slides_lesson; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16814_idx_slides_lesson ON fullprojectpython.lesson_slides USING btree (lesson_id);


--
-- Name: idx_16825_idx_level_config_question; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16825_idx_level_config_question ON fullprojectpython.level_config USING btree (question_id);


--
-- Name: idx_16927_idx_choices_question; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16927_idx_choices_question ON fullprojectpython.question_choices USING btree (question_id);


--
-- Name: idx_16934_idx_questions_quiz; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_16934_idx_questions_quiz ON fullprojectpython.quiz_questions USING btree (quiz_id);


--
-- Name: idx_17011_idx_survey_opts_question; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17011_idx_survey_opts_question ON fullprojectpython.survey_options USING btree (question_id);


--
-- Name: idx_17028_email; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE UNIQUE INDEX idx_17028_email ON fullprojectpython.users USING btree (email);


--
-- Name: idx_17028_fk_users_mouse_effect; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17028_fk_users_mouse_effect ON fullprojectpython.users USING btree (equipped_mouse_effect_id);


--
-- Name: idx_17028_fk_users_profile_frame; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17028_fk_users_profile_frame ON fullprojectpython.users USING btree (equipped_profile_frame_id);


--
-- Name: idx_17028_fk_users_theme; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17028_fk_users_theme ON fullprojectpython.users USING btree (equipped_theme_id);


--
-- Name: idx_17028_username; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE UNIQUE INDEX idx_17028_username ON fullprojectpython.users USING btree (username);


--
-- Name: idx_17046_achievement_id; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17046_achievement_id ON fullprojectpython.user_achievements USING btree (achievement_id);


--
-- Name: idx_17046_user_id; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_17046_user_id ON fullprojectpython.user_achievements USING btree (user_id);


--
-- Name: idx_learning_ai_tasks_user_mode_status; Type: INDEX; Schema: fullprojectpython; Owner: -
--

CREATE INDEX idx_learning_ai_tasks_user_mode_status ON fullprojectpython.learning_ai_tasks USING btree (user_id, mode, status);


--
-- Name: idx_16733_exercise_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16733_exercise_id ON public.exercises_files USING btree (exercise_id);


--
-- Name: idx_16759_host_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16759_host_user_id ON public.game_rooms USING btree (host_user_id);


--
-- Name: idx_16804_idx_lesson_quiz_attempt_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16804_idx_lesson_quiz_attempt_lesson ON public.lesson_quiz_attempts USING btree (lesson_id, quiz_type);


--
-- Name: idx_16804_idx_lesson_quiz_attempt_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16804_idx_lesson_quiz_attempt_user ON public.lesson_quiz_attempts USING btree (user_id);


--
-- Name: idx_16804_uk_lesson_quiz_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_16804_uk_lesson_quiz_attempt ON public.lesson_quiz_attempts USING btree (user_id, lesson_id, quiz_type);


--
-- Name: idx_16842_idx_mini_game_current_dialogue; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16842_idx_mini_game_current_dialogue ON public.mini_game_current_conversations USING btree (dialogue_id);


--
-- Name: idx_16842_idx_mini_game_current_exercise; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16842_idx_mini_game_current_exercise ON public.mini_game_current_conversations USING btree (exercise_id);


--
-- Name: idx_16842_idx_mini_game_current_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16842_idx_mini_game_current_location ON public.mini_game_current_conversations USING btree (current_location_id);


--
-- Name: idx_16842_idx_mini_game_current_npc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16842_idx_mini_game_current_npc ON public.mini_game_current_conversations USING btree (current_npc_id);


--
-- Name: idx_16846_fk_mgd_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16846_fk_mgd_lesson ON public.mini_game_dialogues USING btree (lesson_id);


--
-- Name: idx_16846_idx_mini_game_dialogues_exercise_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16846_idx_mini_game_dialogues_exercise_order ON public.mini_game_dialogues USING btree (exercise_id, dialogue_order);


--
-- Name: idx_16846_idx_mini_game_dialogues_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16846_idx_mini_game_dialogues_location ON public.mini_game_dialogues USING btree (location_id);


--
-- Name: idx_16846_idx_mini_game_dialogues_npc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16846_idx_mini_game_dialogues_npc ON public.mini_game_dialogues USING btree (npc_id);


--
-- Name: idx_16860_idx_mini_game_exercises_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16860_idx_mini_game_exercises_lesson ON public.mini_game_exercises_pre_merge USING btree (lesson_id);


--
-- Name: idx_16860_idx_mini_game_exercises_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16860_idx_mini_game_exercises_order ON public.mini_game_exercises_pre_merge USING btree (exercise_order);


--
-- Name: idx_16872_exercise_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16872_exercise_id ON public.mini_game_exercises_files USING btree (exercise_id);


--
-- Name: idx_16880_fk_mini_game_submissions_exercise; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16880_fk_mini_game_submissions_exercise ON public.mini_game_exercise_submissions USING btree (exercise_id);


--
-- Name: idx_16880_uq_user_exercise_submission; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_16880_uq_user_exercise_submission ON public.mini_game_exercise_submissions USING btree (user_id, exercise_id);


--
-- Name: idx_16887_uq_mini_game_locations_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_16887_uq_mini_game_locations_key ON public.mini_game_locations USING btree (location_key);


--
-- Name: idx_16896_uq_mini_game_npcs_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_16896_uq_mini_game_npcs_key ON public.mini_game_npcs USING btree (npc_key);


--
-- Name: idx_16905_fk_mini_game_progress_exercise; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16905_fk_mini_game_progress_exercise ON public.mini_game_user_exercise_progress USING btree (exercise_id);


--
-- Name: idx_16905_uq_user_exercise_progress; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_16905_uq_user_exercise_progress ON public.mini_game_user_exercise_progress USING btree (user_id, exercise_id);


--
-- Name: idx_16954_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16954_room_id ON public.room_participants USING btree (room_id);


--
-- Name: idx_16954_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_16954_user_id ON public.room_participants USING btree (user_id);


--
-- Name: idx_17061_fk_inventory_item; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17061_fk_inventory_item ON public.user_inventory USING btree (item_id);


--
-- Name: idx_17061_idx_inventory_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17061_idx_inventory_user ON public.user_inventory USING btree (user_id);


--
-- Name: idx_17061_uk_user_item; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_17061_uk_user_item ON public.user_inventory USING btree (user_id, item_id);


--
-- Name: idx_17066_idx_user_presence_last_seen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17066_idx_user_presence_last_seen ON public.user_presence USING btree (last_seen);


--
-- Name: idx_17073_fk_showcase_achievement; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17073_fk_showcase_achievement ON public.user_profile_showcase USING btree (achievement_id);


--
-- Name: idx_17073_idx_showcase_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17073_idx_showcase_user ON public.user_profile_showcase USING btree (user_id);


--
-- Name: idx_17073_uk_user_achievement_showcase; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_17073_uk_user_achievement_showcase ON public.user_profile_showcase USING btree (user_id, achievement_id);


--
-- Name: idx_17079_idx_user_xp_log_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_17079_idx_user_xp_log_user ON public.user_xp_log USING btree (user_id, xp_date);


--
-- Name: idx_17079_uniq_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_17079_uniq_user_date ON public.user_xp_log USING btree (user_id, xp_date);


--
-- Name: idx_arcade_chat_room_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arcade_chat_room_id ON public.arcade_chat_messages USING btree (room_id, id);


--
-- Name: idx_arcade_history_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_arcade_history_user ON public.arcade_round_history USING btree (user_name, room_id DESC);


--
-- Name: idx_learning_ai_tasks_user_mode_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_ai_tasks_user_mode_status ON public.learning_ai_tasks USING btree (user_id, mode, status);


--
-- Name: idx_lesson_quiz_attempt_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_quiz_attempt_lesson ON public.lesson_quiz_attempts USING btree (lesson_id, quiz_type);


--
-- Name: idx_lesson_quiz_attempt_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_quiz_attempt_user ON public.lesson_quiz_attempts USING btree (user_id);


--
-- Name: idx_problem_modes_lesson; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_problem_modes_lesson ON public.problem_modes USING btree (mode, lesson_id);


--
-- Name: idx_problem_modes_problem; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_problem_modes_problem ON public.problem_modes USING btree (problem_id);


--
-- Name: uk_lesson_quiz_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uk_lesson_quiz_attempt ON public.lesson_quiz_attempts USING btree (user_id, lesson_id, quiz_type);


--
-- Name: learning_ai_tasks on_update_current_timestamp; Type: TRIGGER; Schema: fullprojectpython; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON fullprojectpython.learning_ai_tasks FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_learning_ai_tasks();


--
-- Name: lesson_quiz_attempts on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.lesson_quiz_attempts FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_lesson_quiz_attempts();


--
-- Name: mini_game_current_conversations on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_current_conversations FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_current_conversations();


--
-- Name: mini_game_dialogues on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_dialogues FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_dialogues();


--
-- Name: mini_game_exercise_submissions on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_exercise_submissions FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_exercise_submissions();


--
-- Name: mini_game_exercises_pre_merge on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_exercises_pre_merge FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_exercises();


--
-- Name: mini_game_locations on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_locations FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_locations();


--
-- Name: mini_game_npcs on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_npcs FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_npcs();


--
-- Name: mini_game_user_exercise_progress on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.mini_game_user_exercise_progress FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_mini_game_user_exercise_progress();


--
-- Name: user_presence on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.user_presence FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_user_presence();


--
-- Name: user_xp_log on_update_current_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_update_current_timestamp BEFORE UPDATE ON public.user_xp_log FOR EACH ROW EXECUTE FUNCTION fullprojectpython.on_update_current_timestamp_user_xp_log();


--
-- Name: email_verifications email_verifications_ibfk_1; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.email_verifications
    ADD CONSTRAINT email_verifications_ibfk_1 FOREIGN KEY (user_id) REFERENCES fullprojectpython.users(user_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: advanced_validation_choices fk_adv_choices_question; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.advanced_validation_choices
    ADD CONSTRAINT fk_adv_choices_question FOREIGN KEY (question_id) REFERENCES fullprojectpython.advanced_validation(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: question_choices fk_choices_question; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.question_choices
    ADD CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES fullprojectpython.quiz_questions(question_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: lessons fk_lessons_module; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lessons
    ADD CONSTRAINT fk_lessons_module FOREIGN KEY (module_id) REFERENCES fullprojectpython.modules(module_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: level_config fk_level_config_question; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.level_config
    ADD CONSTRAINT fk_level_config_question FOREIGN KEY (question_id) REFERENCES fullprojectpython.survey_questions(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: quiz_questions fk_questions_quiz; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.quiz_questions
    ADD CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_id) REFERENCES fullprojectpython.lesson_quizzes(quiz_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: lesson_quizzes fk_quizzes_lesson; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_quizzes
    ADD CONSTRAINT fk_quizzes_lesson FOREIGN KEY (lesson_id) REFERENCES fullprojectpython.lessons(lesson_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: lesson_slides fk_slides_lesson; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.lesson_slides
    ADD CONSTRAINT fk_slides_lesson FOREIGN KEY (lesson_id) REFERENCES fullprojectpython.lessons(lesson_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: survey_options fk_survey_opts_question; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.survey_options
    ADD CONSTRAINT fk_survey_opts_question FOREIGN KEY (question_id) REFERENCES fullprojectpython.survey_questions(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: users fk_users_mouse_effect; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.users
    ADD CONSTRAINT fk_users_mouse_effect FOREIGN KEY (equipped_mouse_effect_id) REFERENCES fullprojectpython.shop_items(item_id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: users fk_users_profile_frame; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.users
    ADD CONSTRAINT fk_users_profile_frame FOREIGN KEY (equipped_profile_frame_id) REFERENCES fullprojectpython.shop_items(item_id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: users fk_users_theme; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.users
    ADD CONSTRAINT fk_users_theme FOREIGN KEY (equipped_theme_id) REFERENCES fullprojectpython.shop_items(item_id) ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: user_achievements user_achievements_ibfk_1; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.user_achievements
    ADD CONSTRAINT user_achievements_ibfk_1 FOREIGN KEY (user_id) REFERENCES fullprojectpython.users(user_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_ibfk_2; Type: FK CONSTRAINT; Schema: fullprojectpython; Owner: -
--

ALTER TABLE ONLY fullprojectpython.user_achievements
    ADD CONSTRAINT user_achievements_ibfk_2 FOREIGN KEY (achievement_id) REFERENCES fullprojectpython.achievements(achievement_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: active_accepted_challenges active_accepted_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT active_accepted_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: arcade_chat_messages arcade_chat_messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_chat_messages
    ADD CONSTRAINT arcade_chat_messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.arcade_rooms(room_id) ON DELETE CASCADE;


--
-- Name: arcade_effects arcade_effects_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_effects
    ADD CONSTRAINT arcade_effects_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.arcade_rooms(room_id) ON DELETE CASCADE;


--
-- Name: arcade_participants arcade_participants_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.arcade_participants
    ADD CONSTRAINT arcade_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.arcade_rooms(room_id) ON DELETE CASCADE;


--
-- Name: exercise_submissions exercise_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_submissions
    ADD CONSTRAINT exercise_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: exercises_pre_merge exercises_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_pre_merge
    ADD CONSTRAINT exercises_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- Name: active_accepted_challenges fk_active_accepted_challenges_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_accepted_challenges
    ADD CONSTRAINT fk_active_accepted_challenges_problem_modes FOREIGN KEY (problem_mode_competitive, challenge_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: exercise_submissions fk_exercise_submissions_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_submissions
    ADD CONSTRAINT fk_exercise_submissions_problem_modes FOREIGN KEY (problem_mode_lesson, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: exercises_files fk_exercises_files_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises_files
    ADD CONSTRAINT fk_exercises_files_problem_modes FOREIGN KEY (problem_mode_lesson, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: user_inventory fk_inventory_item; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES public.shop_items(item_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_inventory fk_inventory_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_inventory
    ADD CONSTRAINT fk_inventory_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: mini_game_dialogues fk_mgd_lesson; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_dialogues fk_mgd_location; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_location FOREIGN KEY (location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_dialogues fk_mgd_npc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mgd_npc FOREIGN KEY (npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_exercises_pre_merge fk_mge_lesson; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_pre_merge
    ADD CONSTRAINT fk_mge_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_exercise_submissions fk_mges_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT fk_mges_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_current_conversations fk_mini_game_current_conversations_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_conversations_problem_modes FOREIGN KEY (problem_mode_minigame, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: mini_game_current_conversations fk_mini_game_current_dialogue; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_dialogue FOREIGN KEY (dialogue_id) REFERENCES public.mini_game_dialogues(dialogue_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: mini_game_current_conversations fk_mini_game_current_location; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_location FOREIGN KEY (current_location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mini_game_current_conversations fk_mini_game_current_npc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_current_conversations
    ADD CONSTRAINT fk_mini_game_current_npc FOREIGN KEY (current_npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mini_game_dialogues fk_mini_game_dialogues_location; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_location FOREIGN KEY (location_id) REFERENCES public.mini_game_locations(location_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mini_game_dialogues fk_mini_game_dialogues_npc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_npc FOREIGN KEY (npc_id) REFERENCES public.mini_game_npcs(npc_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mini_game_dialogues fk_mini_game_dialogues_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_dialogues
    ADD CONSTRAINT fk_mini_game_dialogues_problem_modes FOREIGN KEY (problem_mode_minigame, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: mini_game_exercise_submissions fk_mini_game_exercise_submissions_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercise_submissions
    ADD CONSTRAINT fk_mini_game_exercise_submissions_problem_modes FOREIGN KEY (problem_mode_minigame, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: mini_game_exercises_files fk_mini_game_exercises_files_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_files
    ADD CONSTRAINT fk_mini_game_exercises_files_problem_modes FOREIGN KEY (problem_mode_minigame, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: mini_game_exercises_pre_merge fk_mini_game_exercises_main_lessons; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_exercises_pre_merge
    ADD CONSTRAINT fk_mini_game_exercises_main_lessons FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: mini_game_user_exercise_progress fk_mini_game_user_exercise_progress_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mini_game_user_exercise_progress
    ADD CONSTRAINT fk_mini_game_user_exercise_progress_problem_modes FOREIGN KEY (problem_mode_minigame, exercise_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: multiplayer_submissions fk_multiplayer_submissions_problem_modes; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT fk_multiplayer_submissions_problem_modes FOREIGN KEY (problem_mode_competitive, challenge_id) REFERENCES public.problem_modes(mode, entry_id) ON DELETE CASCADE NOT VALID;


--
-- Name: user_profile_showcase fk_showcase_achievement; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT fk_showcase_achievement FOREIGN KEY (achievement_id) REFERENCES public.achievements(achievement_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_profile_showcase fk_showcase_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profile_showcase
    ADD CONSTRAINT fk_showcase_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: user_xp_log fk_user_xp_log_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_xp_log
    ADD CONSTRAINT fk_user_xp_log_user FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: game_rooms game_rooms_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_rooms
    ADD CONSTRAINT game_rooms_ibfk_1 FOREIGN KEY (host_user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: lesson_quizzes lesson_quizzes_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_quizzes
    ADD CONSTRAINT lesson_quizzes_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- Name: lesson_slides lesson_slides_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_slides
    ADD CONSTRAINT lesson_slides_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(module_id) ON DELETE CASCADE;


--
-- Name: multiplayer_challenges_pre_merge multiplayer_challenges_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_challenges_pre_merge
    ADD CONSTRAINT multiplayer_challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: multiplayer_submissions multiplayer_submissions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.multiplayer_sessions(session_id) ON DELETE CASCADE;


--
-- Name: multiplayer_submissions multiplayer_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.multiplayer_submissions
    ADD CONSTRAINT multiplayer_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: problem_modes problem_modes_problem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.problem_modes
    ADD CONSTRAINT problem_modes_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.problems(problem_id) ON DELETE CASCADE;


--
-- Name: question_choices question_choices_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question_choices
    ADD CONSTRAINT question_choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(question_id) ON DELETE CASCADE;


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.lesson_quizzes(quiz_id) ON DELETE CASCADE;


--
-- Name: room_participants room_participants_ibfk_1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_ibfk_1 FOREIGN KEY (room_id) REFERENCES public.game_rooms(room_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: room_participants room_participants_ibfk_2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.room_participants
    ADD CONSTRAINT room_participants_ibfk_2 FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: session_players session_players_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.multiplayer_sessions(session_id) ON DELETE CASCADE;


--
-- Name: session_players session_players_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_players
    ADD CONSTRAINT session_players_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: survey_options survey_options_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_options
    ADD CONSTRAINT survey_options_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;


--
-- Name: user_cosmetics user_cosmetics_cosmetic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_cosmetic_id_fkey FOREIGN KEY (cosmetic_id) REFERENCES public.cosmetics(cosmetic_id) ON DELETE CASCADE;


--
-- Name: user_cosmetics user_cosmetics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_cosmetics
    ADD CONSTRAINT user_cosmetics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_mailbox user_mailbox_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_mailbox
    ADD CONSTRAINT user_mailbox_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_missions user_missions_email_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_email_id_fkey FOREIGN KEY (email_id) REFERENCES public.virtual_emails(email_id) ON DELETE CASCADE;


--
-- Name: user_missions user_missions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_quiz_attempts user_quiz_attempts_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(lesson_id) ON DELETE CASCADE;


--
-- Name: user_quiz_attempts user_quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_quiz_attempts
    ADD CONSTRAINT user_quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_survey_responses user_survey_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;


--
-- Name: user_survey_responses user_survey_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_survey_responses
    ADD CONSTRAINT user_survey_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


