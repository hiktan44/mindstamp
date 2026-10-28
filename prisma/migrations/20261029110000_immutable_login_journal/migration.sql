-- Additive journal; existing login_events and product activity are unchanged.
-- No backfill: old login_events records retain their partial historical contract.
BEGIN;
SET LOCAL lock_timeout = '3s';
CREATE TABLE public.abone_login_events (
  event_id text PRIMARY KEY CHECK(event_id ~ '^login:[0-9a-f]{64}$'),
  actor_id text NOT NULL CHECK(length(actor_id) BETWEEN 1 AND 200),
  at timestamptz NOT NULL DEFAULT clock_timestamp(),
  excluded boolean NOT NULL
);
CREATE INDEX abone_login_events_at_idx ON public.abone_login_events(at);
CREATE FUNCTION public.abone_login_journal_guard() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN RAISE EXCEPTION 'LOGIN_JOURNAL_IMMUTABLE'; END IF;
  NEW.at := clock_timestamp();
  RETURN NEW;
END;
$$;
CREATE TRIGGER abone_login_journal_write BEFORE INSERT OR UPDATE OR DELETE
ON public.abone_login_events FOR EACH ROW EXECUTE FUNCTION public.abone_login_journal_guard();
CREATE TRIGGER abone_login_journal_truncate BEFORE TRUNCATE
ON public.abone_login_events FOR EACH STATEMENT EXECUTE FUNCTION public.abone_login_journal_guard();
ALTER TABLE public.abone_login_events ENABLE ALWAYS TRIGGER abone_login_journal_write;
ALTER TABLE public.abone_login_events ENABLE ALWAYS TRIGGER abone_login_journal_truncate;
REVOKE ALL ON public.abone_login_events FROM PUBLIC;
CREATE TABLE public.abone_login_coverage (
  id integer PRIMARY KEY CHECK(id=1),
  installed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  auth_source_sha256 text NOT NULL,
  baseline_revision text NOT NULL,
  guard_md5 text NOT NULL,
  write_trigger_md5 text NOT NULL,
  truncate_trigger_md5 text NOT NULL,
  evidence_kind text NOT NULL DEFAULT 'authjs-session-response-issued',
  audit_window_days integer NOT NULL DEFAULT 32
);
REVOKE ALL ON public.abone_login_coverage FROM PUBLIC;
INSERT INTO public.abone_login_coverage(id,auth_source_sha256,baseline_revision,guard_md5,write_trigger_md5,truncate_trigger_md5)
SELECT 1,'d9334454a333c418fb9ac5eb3e4996628ec7b3dfcdb5f848cfb45cebfc7cd7d1','c764346cee2bbd33d121617ff7ab86e775cbea68',
  md5(pg_get_functiondef('public.abone_login_journal_guard()'::regprocedure)),
  (SELECT md5(pg_get_triggerdef(oid)) FROM pg_trigger WHERE tgrelid='public.abone_login_events'::regclass AND tgname='abone_login_journal_write'),
  (SELECT md5(pg_get_triggerdef(oid)) FROM pg_trigger WHERE tgrelid='public.abone_login_events'::regclass AND tgname='abone_login_journal_truncate');
-- Advance installed_at after this exact new release is confirmed as the sole
-- running writer. Never use migration time to certify the old/new overlap.
COMMIT;
