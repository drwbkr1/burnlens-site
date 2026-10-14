/* eslint-disable @next/next/no-html-link-for-pages -- Standalone prebuilt Data app, not a Next component: native same-origin anchors must work outside Next's router. */
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { barChartSpec, EvidenceChart, Icon, Section, useSectionFilters } from '../../data-app-public.jsx';
import './portfolio.css';

const checklist = barChartSpec({
  presentation: 'progress', category: 'title', value: 'completedTasks',
  track: { max: 'plannedTasks' }, format: { maximumFractionDigits: 0 },
});
const date = value => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date(value));
const nativeWorkAreaMedia = '(max-width: 900px) and (hover: none) and (pointer: coarse)';

// Authored fixed-section control; selection/evidence/current-view state stays in the public hook.
function WorkAreaFilter({ filterProps }) {
  const { filters, queries, values, onChange, ariaLabel } = filterProps;
  const definition = filters[0];
  const choices = ['all', ...new Set(definition.queryIds.flatMap(queryId =>
    (queries[queryId]?.rows ?? []).map(row => String(row[definition.field] ?? ''))
      .filter(value => value && value.toLowerCase() !== 'all')))];
  const value = values[definition.id];
  const display = choice => choice === 'all' ? 'All' : choice;
  const id = useId();
  const host = useRef(null), trigger = useRef(null), menu = useRef(null), native = useRef(null);
  const items = useRef([]), active = useRef(-1), intent = useRef('pointer');
  const touch = useRef(null), suppressedClick = useRef(null);
  const search = useRef({ text: '', at: 0 });
  const openRef = useRef(false);
  const [open, setOpen] = useState(false);

  const close = useCallback((restoreFocus = true) => {
    openRef.current = false;
    setOpen(false);
    search.current = { text: '', at: 0 };
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }, []);
  const show = mode => {
    active.current = -1;
    search.current = { text: '', at: 0 };
    intent.current = mode;
    openRef.current = true;
    setOpen(true);
  };
  const focusChoice = index => {
    const next = (index + choices.length) % choices.length;
    active.current = next;
    items.current.forEach((item, itemIndex) => {
      if (!item) return;
      item.tabIndex = itemIndex === next ? 0 : -1;
      item.toggleAttribute('data-highlighted', itemIndex === next);
    });
    items.current[next]?.focus({ preventScroll: true });
  };
  const choose = choice => {
    onChange(definition.id, choice);
    close();
  };

  // Only local-control event behavior: no body/root attributes, style, overlays or SDK observers.
  useEffect(() => {
    const onPointerDown = event => {
      suppressedClick.current = null;
      if (!openRef.current || host.current?.contains(event.target)) return;
      suppressedClick.current = { at: event.timeStamp, pointerId: event.pointerId };
      event.preventDefault();
      event.stopPropagation();
      close();
    };
    const onClick = event => {
      const dismissed = suppressedClick.current;
      suppressedClick.current = null;
      if (!dismissed || event.detail === 0 || event.timeStamp < dismissed.at
          || event.timeStamp - dismissed.at > 1000) return;
      if (typeof event.pointerId === 'number' && event.pointerId !== dismissed.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
    };
    const onPointerCancel = () => { suppressedClick.current = null; touch.current = null; };
    const onFocus = event => {
      if (!openRef.current || host.current?.contains(event.target)) return;
      (items.current[active.current] ?? menu.current)?.focus({ preventScroll: true });
    };
    const onBlur = () => close(false);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointercancel', onPointerCancel, true);
    document.addEventListener('focusin', onFocus, true);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointercancel', onPointerCancel, true);
      document.removeEventListener('focusin', onFocus, true);
      window.removeEventListener('blur', onBlur);
    };
  }, [close]);

  useLayoutEffect(() => {
    if (!open || !trigger.current || !menu.current) return undefined;
    const place = () => {
      if (window.matchMedia(nativeWorkAreaMedia).matches) {
        close(false);
        native.current?.focus({ preventScroll: true });
        return false;
      }
      const button = trigger.current, panel = menu.current;
      if (!button || !panel) return false;
      const rect = button.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewLeft = viewport?.offsetLeft ?? 0, viewTop = viewport?.offsetTop ?? 0;
      const viewWidth = Math.min(viewport?.width ?? innerWidth, document.documentElement.getBoundingClientRect().right - viewLeft), viewHeight = viewport?.height ?? innerHeight;
      const narrow = window.matchMedia('(max-width: 650px)').matches;
      const width = Math.min(narrow ? 320 : Math.max(188, rect.width), viewWidth - (narrow ? 32 : 24));
      panel.style.width = `${width}px`;
      panel.style.maxHeight = '320px';
      // Direct owned-node measurement only; no ancestor walks/computed-style/observation loop.
      const height = panel.getBoundingClientRect().height;
      const below = Math.max(0, viewTop + viewHeight - 12 - rect.bottom - 7);
      const above = Math.max(0, rect.top - viewTop - 12 - 7);
      const up = height > below && above > below;
      const available = up ? above : below;
      const shownHeight = Math.min(height, available);
      panel.style.left = `${Math.max(viewLeft + 12, Math.min(rect.left, viewLeft + viewWidth - 12 - width)) - rect.left}px`;
      panel.style.top = `${up ? -7 - shownHeight : rect.height + 7}px`;
      panel.style.maxHeight = `${Math.min(320, available)}px`;
      panel.dataset.side = up ? 'top' : 'bottom';
      return true;
    };
    if (!place()) return undefined;
    if (intent.current === 'keyboard') items.current[0]?.focus({ preventScroll: true });
    else menu.current?.focus({ preventScroll: true });
    const onScroll = event => { if (event.target !== menu.current) place(); };
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    window.visualViewport?.addEventListener('resize', place);
    window.visualViewport?.addEventListener('scroll', place);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onScroll, true);
      window.visualViewport?.removeEventListener('resize', place);
      window.visualViewport?.removeEventListener('scroll', place);
    };
  }, [open, close]);

  const typeAhead = (key, now) => {
    const letter = key.toLocaleLowerCase();
    const text = now - search.current.at > 1000 ? letter : search.current.text + letter;
    search.current = { text, at: now };
    const repeated = [...text].every(character => character === text[0]);
    const prefix = (repeated ? text[0] : text).toLocaleLowerCase();
    const start = repeated ? active.current + 1 : Math.max(0, active.current);
    for (let offset = 0; offset < choices.length; offset++) {
      const index = (start + offset + choices.length) % choices.length;
      if (display(choices[index]).toLocaleLowerCase().startsWith(prefix)) {
        focusChoice(index);
        break;
      }
    }
  };
  const onMenuKeyDown = event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
    // Matches the pinned menu's actual Tab prevention, rather than silently changing its model.
    if (event.key === 'Tab') { event.preventDefault(); event.stopPropagation(); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); event.stopPropagation();
      search.current = { text: '', at: 0 };
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1
        : event.key === 'ArrowDown' ? active.current + 1 : active.current < 0 ? choices.length - 1 : active.current - 1;
      focusChoice(index);
      return;
    }
    const searching = search.current.text && event.timeStamp - search.current.at <= 1000;
    if (event.key === 'Enter' || event.key === ' ' && !searching) {
      event.preventDefault(); event.stopPropagation();
      if (active.current >= 0) choose(choices[active.current]);
      return;
    }
    if (event.key.length === 1) { event.preventDefault(); event.stopPropagation(); typeAhead(event.key, event.timeStamp); }
  };

  return <section className="filters portfolio-workarea-filters" aria-label={ariaLabel}>
    <span className="filter-trigger select-trigger native-filter-shell">
      <span className="filter-label" aria-hidden="true">{definition.label}</span>
      <span className="select-value" aria-hidden="true">{display(value)}</span>
      <Icon name="chevronDown" className="chevron" />
      <select ref={native} className="native-filter-control" aria-label={definition.label} value={value}
        onChange={event => onChange(definition.id, event.currentTarget.value)}
        onPointerDown={event => { event.currentTarget.dataset.pointerFocus = 'true'; }}
        onBlur={event => { delete event.currentTarget.dataset.pointerFocus; }}
        onKeyDown={event => { delete event.currentTarget.dataset.pointerFocus; if (event.key === 'Escape') event.stopPropagation(); }}>
        {choices.map(choice => <option key={choice} value={choice}>{display(choice)}</option>)}
      </select>
    </span>
    <span ref={host} className="custom-select-host has-native-picker portfolio-workarea-host">
      <button ref={trigger} type="button" id={`${id}-trigger`} className="filter-trigger select-trigger"
        aria-label={definition.label} aria-haspopup="menu" aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined} data-state={open ? 'open' : 'closed'}
        onPointerEnter={event => {
          const text = event.currentTarget.querySelector('.select-value');
          event.currentTarget.title = text?.scrollWidth > text?.clientWidth ? text.textContent : '';
        }}
        onPointerDown={event => {
          if (event.pointerType === 'touch') {
            touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
            event.preventDefault(); event.stopPropagation();
          } else if (event.button === 0 && !event.ctrlKey) {
            event.preventDefault();
            if (openRef.current) close(); else show('pointer');
          }
        }}
        onPointerMove={event => {
          const start = touch.current;
          if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) start.moved = true;
        }}
        onPointerCancel={() => { touch.current = null; }}
        onPointerUp={event => {
          const start = touch.current;
          if (start?.id !== event.pointerId) return;
          touch.current = null;
          if (!start.moved) { if (openRef.current) close(); else show('pointer'); }
        }}
        onClick={event => { if (event.detail === 0 && !openRef.current) show('keyboard'); }}
        onKeyDown={event => {
          if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
            event.preventDefault();
            if (openRef.current && event.key !== 'ArrowDown') close(); else show('keyboard');
          }
        }}>
        <span className="filter-label">{definition.label}</span>
        <span className="select-value">{display(value)}</span>
        <Icon name="chevronDown" className="chevron" />
      </button>
      {open && <div ref={menu} id={`${id}-menu`} role="menu" aria-labelledby={`${id}-trigger`}
        tabIndex={-1} className="popover select-content portfolio-workarea-menu" data-state="open"
        onKeyDown={onMenuKeyDown} onPointerLeave={event => {
          if (event.pointerType === 'touch' || host.current?.contains(event.relatedTarget)) return;
          active.current = -1;
          items.current.forEach(item => { if (item) { item.tabIndex = -1; item.removeAttribute('data-highlighted'); } });
          menu.current?.focus({ preventScroll: true });
        }}>
        <div role="group">
          {choices.map((choice, index) => <button type="button" role="menuitemradio" key={choice}
            ref={element => { items.current[index] = element; }} tabIndex={-1}
            className="menu-item" aria-checked={value === choice} data-state={value === choice ? 'checked' : 'unchecked'}
            onFocus={() => {
              active.current = index;
              items.current.forEach((item, itemIndex) => {
                if (item) { item.tabIndex = itemIndex === index ? 0 : -1; item.toggleAttribute('data-highlighted', itemIndex === index); }
              });
            }}
            onPointerMove={event => { if (event.pointerType !== 'touch') focusChoice(index); }}
            onClick={() => choose(choice)}>
            <span className="menu-item-label">{display(choice)}</span>
            {value === choice && <span className="menu-check"><Icon name="check" /></span>}
          </button>)}
        </div>
      </div>}
    </span>
  </section>;
}

export function DashboardContent() {
  const scope = useSectionFilters([{ id: 'category', label: 'Work area', field: 'category', defaultValue: 'all', queryIds: ['portfolio_projects'] }], {}, { id: 'portfolio-dashboard' });
  const scoped = scope.componentProps('portfolio_projects', ['id', 'category']);
  const rows = scoped.displayRows;
  return <article className="portfolio-workbench" data-dashboard-layout="full-width">
    <h1 className="workbench-heading">Project dashboard</h1>
    <nav className="workbench-return" aria-label="Portfolio navigation"><a href="/">← Portfolio</a><span>Dated snapshot · Oct 7, 2026 · 5 PM Pacific</span></nav>
    <Section id="workbench-section-title" title="Selected project checklists" filters={<WorkAreaFilter filterProps={scope.filterProps} />} spacing="none">
      <p className="workbench-definition" data-editable-id="workbench-definition">Completed tasks out of listed tasks—not hours, effort shares or whole-project acceptance. These projects remained ongoing at the recorded cutoff.</p>
      <EvidenceChart id="portfolio-workbench" queryId="portfolio_projects" title="Listed tasks completed" spec={checklist} rows={rows} {...scoped} height={Math.max(160, rows.length * 100)} variant="plain" />
      <div className="workbench-records" data-reviewed-rows>
        {rows.map(row => <section className="workbench-record" key={row.id} data-dashboard-project={row.id}>
          <div><h2><a href={row.caseRoute}>{row.title} <span aria-hidden="true">→</span></a></h2><p>{row.category}</p></div>
          <div className="workbench-count"><strong>{row.completedTasks} <span>of {row.plannedTasks}</span></strong><span>listed tasks completed</span></div>
          <details><summary>Recorded state · source reviewed {date(row.sourceReviewedAt)} (Pacific)</summary><p>{row.state}</p><p>{row.completedModules} of {row.plannedModules} listed modules complete. Source title: {row.sourceTitle}.</p></details>
        </section>)}
        {!rows.length && <p>No selected project records match this work area.</p>}
      </div>
      <p className="workbench-freshness" data-editable-id="workbench-freshness">Selected records from Daily Project Recap. Quiet projects retain their older source-review dates. This is not live status; the portfolio record predates this design study.</p>
    </Section>
  </article>;
}
