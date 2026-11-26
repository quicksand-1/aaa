import React from 'react';
import { Flex } from 'antd';

const ACCENTS = {
  sky: {
    topGlow: 'bg-sky-500/25',
    bottomGlow: 'bg-violet-500/15',
    iconBadge: 'bg-sky-400/15 text-sky-300',
    eyebrow: 'text-sky-300',
    highlight: 'text-sky-300',
  },
  violet: {
    topGlow: 'bg-violet-500/25',
    bottomGlow: 'bg-sky-500/15',
    iconBadge: 'bg-violet-400/15 text-violet-300',
    eyebrow: 'text-violet-300',
    highlight: 'text-violet-300',
  },
  amber: {
    topGlow: 'bg-amber-500/25',
    bottomGlow: 'bg-yellow-500/15',
    iconBadge: 'bg-amber-400/15 text-amber-300',
    eyebrow: 'text-amber-300',
    highlight: 'text-amber-300',
  },
  emerald: {
    topGlow: 'bg-emerald-500/25',
    bottomGlow: 'bg-cyan-500/15',
    iconBadge: 'bg-emerald-400/15 text-emerald-300',
    eyebrow: 'text-emerald-300',
    highlight: 'text-emerald-300',
  },
};

export default ({
  icon,
  eyebrow,
  title,
  titleAccent,
  description,
  accent = 'sky',
  actions,
  metrics,
  tags,
  variant = 'default',
  children,
  className = '',
}) => {
  const palette = ACCENTS[accent] || ACCENTS.sky;
  const isHero = variant === 'hero';
  const hasLead = Boolean(
    icon || eyebrow || title || titleAccent || description || tags
  );

  const lead = (
    <Flex
      align="center"
      gap={14}
      flex="1"
      className={`min-w-0 ${isHero ? 'max-w-2xl' : ''}`}
    >
      {icon ? (
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${palette.iconBadge}`}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        {eyebrow ? (
          <div
            className={`mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${palette.eyebrow}`}
          >
            {eyebrow}
          </div>
        ) : null}
        <h1
          className={`m-0 font-semibold leading-tight tracking-tight text-white ${
            isHero ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-[26px]'
          }`}
        >
          {title}
          {titleAccent ? (
            <>
              <br />
              <span className={palette.highlight}>{titleAccent}</span>
            </>
          ) : null}
        </h1>
        {description ? (
          <div
            className={`mt-2 text-sm leading-6 text-slate-400 ${
              isHero ? 'max-w-2xl' : 'max-w-xl'
            }`}
          >
            {description}
          </div>
        ) : null}
        {tags ? (
          <Flex gap={8} wrap className="mt-4">
            {tags}
          </Flex>
        ) : null}
      </div>
    </Flex>
  );

  const aside =
    actions || metrics ? (
      isHero ? (
        metrics ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {metrics}
          </div>
        ) : null
      ) : (
        <Flex align="center" gap={12} wrap className="w-full lg:w-auto">
          {actions}
          {metrics}
        </Flex>
      )
    ) : null;

  return (
    <header
      className={`relative overflow-hidden rounded-[26px] bg-[#0b1220] text-white shadow-[0_22px_55px_rgba(2,6,23,0.22)] ring-1 ring-white/10 ${className}`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={`absolute -right-24 -top-32 h-72 w-72 rounded-full blur-3xl ${palette.topGlow}`}
        />
        <div
          className={`absolute -bottom-36 left-1/3 h-72 w-72 rounded-full blur-3xl ${palette.bottomGlow}`}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className="relative px-5 py-5 sm:px-7 sm:py-6">
        {isHero ? (
          hasLead ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-center">
              {lead}
              {aside}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {metrics}
            </div>
          )
        ) : (
          <Flex align="center" justify="space-between" gap={24} wrap>
            {lead}
            {aside}
          </Flex>
        )}
        {children ? <div className="relative mt-5">{children}</div> : null}
      </div>
    </header>
  );
};
