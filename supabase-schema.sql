-- Mediflow-AI 회원(병원 계정) 테이블
-- Supabase 대시보드 > SQL Editor 에서 이 파일 내용을 그대로 붙여넣고 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists mediflow_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,           -- bcrypt로 암호화된 비밀번호 (평문 저장 안 함)
  name text not null,
  hospital_name text not null,      -- 화면에 보여줄 병원 이름
  hospital_code text not null,      -- 병원을 구분하는 고유 코드 (같은 코드 = 같은 병원 소속)
  role text not null default 'member', -- 'admin' | 'member'
  created_at timestamptz not null default now()
);

-- 같은 병원 소속 회원을 빠르게 조회하기 위한 인덱스
create index if not exists idx_mediflow_users_hospital_code on mediflow_users (hospital_code);
