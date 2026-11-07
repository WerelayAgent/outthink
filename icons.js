// ==========================================================================
// OutThink AI Custom SVG Icon System
// Consistent 24x24 viewport, stroke 1.8px, currentColor, zero emojis.
// ==========================================================================

const ICON_PATHS = {
  // Core Profession & UI Icons
  medicine: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  law: '<path d="M12 3v18M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0zM8 21h8"/>',
  software: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6M14 4l-4 16"/>',
  mechanics: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  diagnostics: '<path d="M3.5 16A8.5 8.5 0 1 1 20.5 16"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.5"/><path d="M6 12h2M12 5v2M18 12h-2"/><path d="M8.5 19.5L12 22l3.5-2.5"/>',
  trades: '<path d="M3.5 16A8.5 8.5 0 1 1 20.5 16"/><path d="M12 12l4-4"/><circle cx="12" cy="12" r="1.5"/><path d="M6 12h2M12 5v2M18 12h-2"/><path d="M8.5 19.5L12 22l3.5-2.5"/>',
  tax: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
  benchmark: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  typography: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  x: '<path fill="currentColor" stroke="none" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  twitter_x: '<path fill="currentColor" stroke="none" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  'twitter-x': '<path fill="currentColor" stroke="none" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  twitter: '<path fill="currentColor" stroke="none" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',

  // 1. Live Duel Arena (opposing blades / crossed swords versus motif)
  live_duel_arena: '<path d="M19 5L8.5 15.5M6 13l5 5M8.5 15.5L4 20M5 5l10.5 10.5M18 13l-5 5M15.5 15.5L20 20"/><circle cx="4" cy="20" r="0.8" fill="currentColor"/><circle cx="20" cy="20" r="0.8" fill="currentColor"/>',
  'live-duel-arena': '<path d="M19 5L8.5 15.5M6 13l5 5M8.5 15.5L4 20M5 5l10.5 10.5M18 13l-5 5M15.5 15.5L20 20"/><circle cx="4" cy="20" r="0.8" fill="currentColor"/><circle cx="20" cy="20" r="0.8" fill="currentColor"/>',
  duel: '<path d="M19 5L8.5 15.5M6 13l5 5M8.5 15.5L4 20M5 5l10.5 10.5M18 13l-5 5M15.5 15.5L20 20"/><circle cx="4" cy="20" r="0.8" fill="currentColor"/><circle cx="20" cy="20" r="0.8" fill="currentColor"/>',

  // 2. Cognitive Matrix (radar / spider vector failure chart)
  cognitive_matrix: '<polygon points="12 2.5 20 7 20 17 12 21.5 4 17 4 7"/><line x1="12" y1="2.5" x2="12" y2="21.5"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="4" y1="17" x2="20" y2="7"/><polygon points="12 6 17.5 9.7 16 15 12 18 8 15 8 9.7" fill="currentColor" fill-opacity="0.2"/>',
  'cognitive-matrix': '<polygon points="12 2.5 20 7 20 17 12 21.5 4 17 4 7"/><line x1="12" y1="2.5" x2="12" y2="21.5"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="4" y1="17" x2="20" y2="7"/><polygon points="12 6 17.5 9.7 16 15 12 18 8 15 8 9.7" fill="currentColor" fill-opacity="0.2"/>',
  radar: '<polygon points="12 2.5 20 7 20 17 12 21.5 4 17 4 7"/><line x1="12" y1="2.5" x2="12" y2="21.5"/><line x1="4" y1="7" x2="20" y2="17"/><line x1="4" y1="17" x2="20" y2="7"/><polygon points="12 6 17.5 9.7 16 15 12 18 8 15 8 9.7" fill="currentColor" fill-opacity="0.2"/>',

  // 3. Case Vault (safe door with wheel spokes, keyhole & locking bolts)
  case_vault: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><circle cx="12" cy="12" r="6"/><path d="M12 6V3.5M12 20.5V18M6 12H3.5M20.5 12H18"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="11" x2="12" y2="13"/>',
  'case-vault': '<rect x="3" y="3" width="18" height="18" rx="3.5"/><circle cx="12" cy="12" r="6"/><path d="M12 6V3.5M12 20.5V18M6 12H3.5M20.5 12H18"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="11" x2="12" y2="13"/>',
  vault: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><circle cx="12" cy="12" r="6"/><path d="M12 6V3.5M12 20.5V18M6 12H3.5M20.5 12H18"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="11" x2="12" y2="13"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',

  // 4. Human Edge Index (ranked bar chart with upward trend arrow)
  human_edge_index: '<line x1="3" y1="20" x2="21" y2="20"/><line x1="6.5" y1="20" x2="6.5" y2="15"/><line x1="12" y1="20" x2="12" y2="11"/><line x1="17.5" y1="20" x2="17.5" y2="7"/><path d="M4 14l5.5-5 5 4 6.5-7"/><polyline points="16.5 6 21 6 21 10.5"/>',
  'human-edge-index': '<line x1="3" y1="20" x2="21" y2="20"/><line x1="6.5" y1="20" x2="6.5" y2="15"/><line x1="12" y1="20" x2="12" y2="11"/><line x1="17.5" y1="20" x2="17.5" y2="7"/><path d="M4 14l5.5-5 5 4 6.5-7"/><polyline points="16.5 6 21 6 21 10.5"/>',
  edge_index: '<line x1="3" y1="20" x2="21" y2="20"/><line x1="6.5" y1="20" x2="6.5" y2="15"/><line x1="12" y1="20" x2="12" y2="11"/><line x1="17.5" y1="20" x2="17.5" y2="7"/><path d="M4 14l5.5-5 5 4 6.5-7"/><polyline points="16.5 6 21 6 21 10.5"/>',

  // 5. Viral Cards Studio (layered card stack with radiant spark badge)
  viral_cards_studio: '<path d="M8 4h10a2 2 0 0 1 2 2v10"/><rect x="3.5" y="7" width="13.5" height="13" rx="2.5"/><circle cx="7.5" cy="11.5" r="1.5"/><line x1="11.5" y1="11.5" x2="14.5" y2="11.5"/><line x1="6.5" y1="15.5" x2="14" y2="15.5"/><path d="M20 1.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  'viral-cards-studio': '<path d="M8 4h10a2 2 0 0 1 2 2v10"/><rect x="3.5" y="7" width="13.5" height="13" rx="2.5"/><circle cx="7.5" cy="11.5" r="1.5"/><line x1="11.5" y1="11.5" x2="14.5" y2="11.5"/><line x1="6.5" y1="15.5" x2="14" y2="15.5"/><path d="M20 1.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  share_studio: '<path d="M8 4h10a2 2 0 0 1 2 2v10"/><rect x="3.5" y="7" width="13.5" height="13" rx="2.5"/><circle cx="7.5" cy="11.5" r="1.5"/><line x1="11.5" y1="11.5" x2="14.5" y2="11.5"/><line x1="6.5" y1="15.5" x2="14" y2="15.5"/><path d="M20 1.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',

  // 6. $OUTTHINK Tokenomics (coin with epoch ring & tokenomics allocation pie slice)
  edge_tokenomics: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v9l6.36 6.36"/><circle cx="12" cy="12" r="2"/>',
  'edge-tokenomics': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v9l6.36 6.36"/><circle cx="12" cy="12" r="2"/>',
  tokenomics: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v9l6.36 6.36"/><circle cx="12" cy="12" r="2"/>',

  // 7. Review Queue (checklist with checkmark indicator)
  review_queue: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1.5"/><polyline points="8.5 12 11 14.5 16.5 9"/><line x1="8.5" y1="18" x2="15.5" y2="18"/>',
  'review-queue': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1.5"/><polyline points="8.5 12 11 14.5 16.5 9"/><line x1="8.5" y1="18" x2="15.5" y2="18"/>',
  review: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1.5"/><polyline points="8.5 12 11 14.5 16.5 9"/><line x1="8.5" y1="18" x2="15.5" y2="18"/>',

  // 8. Leaderboard (podium with champion star)
  leaderboard: '<path d="M3 21h18M5 21v-7h4v7M9 21V9h6v12M15 21v-5h4v5"/><polygon points="12 3.5 12.9 5.3 14.9 5.6 13.5 7 13.8 9 12 8 10.2 9 10.5 7 9.1 5.6 11.1 5.3"/>',

  // 9. Monthly Report (document with folded corner & mini line chart)
  monthly_report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="7 15 10 12 13 14 17 9"/><polyline points="15 9 17 9 17 11"/><line x1="7" y1="18" x2="17" y2="18"/>',
  'monthly-report': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="7 15 10 12 13 14 17 9"/><polyline points="15 9 17 9 17 11"/><line x1="7" y1="18" x2="17" y2="18"/>',
  report: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="7 15 10 12 13 14 17 9"/><polyline points="15 9 17 9 17 11"/><line x1="7" y1="18" x2="17" y2="18"/>',

  // 10. Bounty Sprints (bullseye target with champion sprint flag)
  bounty_sprints: '<circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="4"/><line x1="12" y1="13" x2="12" y2="2.5"/><path d="M12 2.5l7 3.5-7 3.5z" fill="currentColor" fill-opacity="0.25"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/>',
  'bounty-sprints': '<circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="4"/><line x1="12" y1="13" x2="12" y2="2.5"/><path d="M12 2.5l7 3.5-7 3.5z" fill="currentColor" fill-opacity="0.25"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/>',
  bounty: '<circle cx="12" cy="13" r="8"/><circle cx="12" cy="13" r="4"/><line x1="12" y1="13" x2="12" y2="2.5"/><path d="M12 2.5l7 3.5-7 3.5z" fill="currentColor" fill-opacity="0.25"/><circle cx="12" cy="13" r="1.5" fill="currentColor"/>',

  // Utility icons
  decay: '<path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  verify: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  copy: '<rect x="8" y="2" width="13" height="16" rx="2"/><path d="M4 8v12a2 2 0 0 0 2 2h12"/>',
  press: '<path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m4 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M7 8h6M7 12h6M7 16h4"/>',
  ai_labs: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>',
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  chevron_down: '<polyline points="6 9 12 15 18 9"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  attachment: '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><path d="M12 3v9l6.36 6.36"/><circle cx="12" cy="12" r="2"/>',
  radar: '<polygon points="12 2 19 8 16 18 8 18 5 8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="22"/>',
  sound_on: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
  sound_off: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  sparkles: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>',
  arrow_right: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  arrow_left: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  system_theme: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'system-theme': '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  submit_case: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  file_image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  file_audio: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="16" y1="10" x2="16" y2="14"/>',
  file_code: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="10 13 8 15 10 17"/><polyline points="14 13 16 15 14 17"/>',
  file_text: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>',
  'submit-case': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>'
};

function renderIcon(name, options = {}) {
  const size = options.size || 20;
  const className = options.className ? `outthink-icon ${options.className}` : 'outthink-icon';
  const ariaHidden = options.ariaLabel ? 'false' : 'true';
  const ariaAttr = options.ariaLabel ? `aria-label="${options.ariaLabel}" role="img"` : 'aria-hidden="true"';
  const cleanName = (name || '').trim();
  const path = ICON_PATHS[cleanName]
    || ICON_PATHS[cleanName.replace(/-/g, '_')]
    || ICON_PATHS[cleanName.replace(/_/g, '-')]
    || ICON_PATHS.benchmark;

  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${ariaAttr}>${path}</svg>`;
}

// Web component for declarative usage: <outthink-icon name="live_duel_arena" size="20"></outthink-icon>
class OutThinkIconElement extends (typeof HTMLElement !== 'undefined' ? HTMLElement : Object) {
  static get observedAttributes() {
    return ['name', 'size', 'aria-label', 'class'];
  }

  connectedCallback() {
    if (!this.querySelector('svg')) queueIcon(this);
  }

  attributeChangedCallback(name, oldValue, value) {
    if (value === oldValue) return;
    // Upgrading an element replays this callback once per observed attribute, so rendering here
    // would still paint all 88 icons inside a single blocking task. Only a real later change,
    // on an icon that already exists, is worth an immediate re-render.
    if (this.__iconRendered) this.render();
    else queueIcon(this);
  }

  render() {
    renderIconInto(this);
  }
}

// Rendering every icon in one synchronous pass blocks the main thread on mobile, so the
// first screenful is painted immediately and the remainder is spread across animation frames.
const ICON_QUEUE = [];
const ICON_SLICE_MS = 6;
let iconFlushScheduled = false;

function iconNow() {
  return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
}

// Parsing an SVG string is the expensive part, and the same glyph at the same size shows up
// over and over across the page, so the first build is kept and every later icon clones it.
const ICON_TEMPLATES = new Map();

function renderIconInto(el) {
  const name = el.getAttribute('name');
  const size = Number(el.getAttribute('size')) || 20;
  const label = el.getAttribute('aria-label');
  const key = name + '|' + size + '|' + (label || '');
  let tpl = ICON_TEMPLATES.get(key);
  if (!tpl) {
    tpl = document.createElement('template');
    tpl.innerHTML = renderIcon(name, { size, ariaLabel: label });
    ICON_TEMPLATES.set(key, tpl);
  }
  el.replaceChildren(tpl.content.cloneNode(true));
  el.__iconRendered = true;
  el.__iconQueued = false;
}

function flushIconQueue() {
  iconFlushScheduled = false;
  const deadline = iconNow() + ICON_SLICE_MS;
  while (ICON_QUEUE.length) {
    const el = ICON_QUEUE.shift();
    if (el && el.isConnected && !el.querySelector('svg') && !iconIsHidden(el)) renderIconInto(el);
    if (iconNow() > deadline) break;
  }
  if (ICON_QUEUE.length) scheduleIconFlush();
}

function scheduleIconFlush() {
  if (iconFlushScheduled) return;
  iconFlushScheduled = true;
  // A timeout keeps draining even when the page opens in a background tab, where animation
  // frames never fire and every queued glyph would stay invisible until the visitor looks.
  if (typeof setTimeout !== 'undefined') setTimeout(flushIconQueue, 0);
  else if (typeof requestAnimationFrame === 'function') requestAnimationFrame(flushIconQueue);
}

function queueIcon(el) {
  if (el.__iconQueued || iconIsHidden(el)) return;
  el.__iconQueued = true;
  ICON_QUEUE.push(el);
  scheduleIconFlush();
}

// Route views start hidden, and building their glyphs at boot buys nothing: the router calls
// upgrade() with the view it just revealed, which is when those icons actually get drawn.
function iconIsHidden(el) {
  if (!el || !el.closest) return false;
  const view = el.closest('.page-view');
  return !!view && !view.classList.contains('active');
}

// Fallback DOM scanner to ensure immediate rendering in any browser environment
function upgradeAllIcons(root) {
  if (typeof document === 'undefined') return;
  const elements = (root || document).querySelectorAll('outthink-icon');
  // The navbar and hero glyphs are worth building before the first frame is on screen
  const syncCount = Math.min(elements.length, 24);
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.querySelector('svg') || iconIsHidden(el)) continue;
    if (i < syncCount) renderIconInto(el);
    else queueIcon(el);
  }
}

// Register globally on window and customElements
if (typeof window !== 'undefined') {
  window.OutThinkIcons = {
    render: renderIcon,
    paths: ICON_PATHS,
    upgrade: upgradeAllIcons,
    queue: ICON_QUEUE
  };
  window.renderIcon = renderIcon;

  if (typeof customElements !== 'undefined' && !customElements.get('outthink-icon')) {
    customElements.define('outthink-icon', OutThinkIconElement);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', upgradeAllIcons);
  } else {
    upgradeAllIcons();
  }

  // A page opened in a background tab receives no animation frames and throttled timers, so the
  // queue would stall there. Nobody is looking at that tab, so the rest is just finished at once.
  window.addEventListener('load', function () {
    if (!document.hidden) return;
    while (ICON_QUEUE.length) {
      const el = ICON_QUEUE.shift();
      if (el && el.isConnected && !el.querySelector('svg')) renderIconInto(el);
    }
  });
}

// Support CommonJS / Node / Bun environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderIcon, OutThinkIconElement, ICON_PATHS, upgradeAllIcons };
}

