import { useCallback, useEffect, useState } from 'react';
import { friendshipSlides } from '../../fixtures/friendshipSlides.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import styles from './FriendshipDeck.module.css';

const TOTAL = friendshipSlides.length;

function ThemeGlyph({ isDark }) {
  if (isDark) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.2 13.4A6.2 6.2 0 1110.6 7.8 4.8 4.8 0 0016.2 13.4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TitleSlide({ slide }) {
  return (
    <div className={`${styles.stage} ${styles.stageTitle}`}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h1 className={styles.display}>{slide.title}</h1>
      <p className={styles.lede}>{slide.subtitle}</p>
      <p className={styles.footnote}>{slide.footnote}</p>
    </div>
  );
}

function AgendaSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ol className={styles.agenda}>
        {slide.items.map((item) => (
          <li key={item.index}>
            <span className={styles.agendaIndex}>{item.index}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SplitSlide({ slide }) {
  return (
    <div className={`${styles.stage} ${styles.stageSplit}`}>
      <div>
        <p className={styles.kicker}>{slide.kicker}</p>
        <h2 className={styles.heading}>{slide.title}</h2>
        <p className={styles.lede}>{slide.lead}</p>
      </div>
      <ul className={styles.pointList}>
        {slide.points.map((point) => (
          <li key={point.title}>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PillarsSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ul className={styles.pillars}>
        {slide.pillars.map((pillar, i) => (
          <li key={pillar.id} className={styles.pillar}>
            <span className={styles.pillarNum}>0{i + 1}</span>
            <h3>{pillar.name}</h3>
            <p>{pillar.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PortraitsSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ul className={styles.portraits}>
        {slide.portraits.map((person) => (
          <li key={person.id} className={`${styles.portrait} ${styles[`tone-${person.tone}`]}`}>
            <div className={styles.portraitTop}>
              <span className={styles.initials} aria-hidden>
                {person.initials}
              </span>
              <div>
                <h3>{person.name}</h3>
                <p className={styles.role}>
                  {person.role}
                  <span className={styles.dot} aria-hidden>
                    ·
                  </span>
                  {person.years}
                </p>
              </div>
            </div>
            <blockquote>“{person.quote}”</blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ol className={styles.timeline}>
        {slide.steps.map((step) => (
          <li key={step.id}>
            <span className={styles.phase}>{step.phase}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function QuotesSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ul className={styles.quotes}>
        {slide.quotes.map((quote) => (
          <li key={quote.id}>
            <blockquote>“{quote.text}”</blockquote>
            <cite>
              {quote.attribution}
              <span className={styles.quoteNote}>{quote.note}</span>
            </cite>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PracticeSlide({ slide }) {
  return (
    <div className={styles.stage}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.heading}>{slide.title}</h2>
      <ul className={styles.actions}>
        {slide.actions.map((action, i) => (
          <li key={action.id}>
            <span className={styles.actionIndex}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3>{action.title}</h3>
              <p>{action.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CloseSlide({ slide }) {
  return (
    <div className={`${styles.stage} ${styles.stageClose}`}>
      <p className={styles.kicker}>{slide.kicker}</p>
      <h2 className={styles.displayClose}>{slide.title}</h2>
      <p className={styles.lede}>{slide.body}</p>
      <p className={styles.blessing}>{slide.blessing}</p>
      <p className={styles.signoff}>{slide.signoff}</p>
    </div>
  );
}

const RENDERERS = {
  title: TitleSlide,
  agenda: AgendaSlide,
  split: SplitSlide,
  pillars: PillarsSlide,
  portraits: PortraitsSlide,
  timeline: TimelineSlide,
  quotes: QuotesSlide,
  practice: PracticeSlide,
  close: CloseSlide,
};

export function FriendshipDeck() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = friendshipSlides[index];
  const SlideView = RENDERERS[slide.kind];

  const goTo = useCallback((target) => {
    setIndex(Math.min(TOTAL - 1, Math.max(0, target)));
  }, []);

  const goBy = useCallback((delta) => {
    setIndex((current) => Math.min(TOTAL - 1, Math.max(0, current + delta)));
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        goBy(1);
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goBy(-1);
      }
      if (event.key === 'Home') goTo(0);
      if (event.key === 'End') goTo(TOTAL - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBy, goTo]);

  return (
    <div className={styles.deck} data-slide={slide.id}>
      <header className={styles.chrome}>
        <p className={styles.brand}>On Friendship</p>
        <div className={styles.chromeActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Light theme' : 'Dark theme'}
          >
            <ThemeGlyph isDark={isDark} />
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </header>

      <div key={slide.id} className={styles.frame} role="group" aria-roledescription="slide">
        <SlideView slide={slide} />
      </div>

      <nav className={styles.nav} aria-label="Presentation">
        <button type="button" className={styles.navBtn} onClick={() => goBy(-1)} disabled={index === 0}>
          Previous
        </button>
        <ol className={styles.dots}>
          {friendshipSlides.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                className={i === index ? styles.dotActive : styles.dot}
                aria-label={`Go to slide ${i + 1}: ${item.title}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => goTo(i)}
              />
            </li>
          ))}
        </ol>
        <p className={styles.counter}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.counterSep}>/</span>
          <span>{String(TOTAL).padStart(2, '0')}</span>
        </p>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goBy(1)}
          disabled={index === TOTAL - 1}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
