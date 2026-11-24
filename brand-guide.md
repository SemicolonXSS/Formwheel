# Formwheel Brand System 1.0

## Positioning
Formwheel is a free, installation-free hub for experimental web games and creative tools.
It emphasizes discovery, play, creation and freedom of choice. No forced tutorials or purchases.
The positioning is a strategic direction, not a validated competitor study.

## Identity
- Name: Formwheel
- Korean slogan: 재미의 형태는 무한하다.
- English slogan: Fun Has No Fixed Form.
- Korean description: 설치 없이 즐기는 무료 웹게임과 창작 도구. 혼자 또는 친구와 새로운 재미를 발견하세요.
- Mood: playful, experimental, futuristic, geometric, restrained glass accents.
- Preserve the existing official blue wheel logo and favicon. Do not recolor or replace them casually.

## Palette
| Token | Hex | Use |
|---|---|---|
| Form Orange | #FF8A00 | Brand accents; dark text on orange |
| Orbit Purple | #8B5CF6 | Experimental accents; dark text on purple |
| Deep Space | #10121E | Dark brand surfaces and ink |
| Crystal White | #F8FAFC | Light brand surfaces |
| Legacy Blue | #2867E8 | Existing official logo |

Use Deep Space text on orange or purple, and Crystal White text on Deep Space. Do not use orange or purple as small text on white without checking contrast. Check WCAG AA (4.5:1 normal, 3:1 large text) for every actual foreground/background pair, including themed states.

## Typography
| Role | Preferred font | Size | Line height |
|---|---|---|---|
| Display | Space Grotesk / Pretendard | 28–48px responsive | 1.3 |
| Heading | Pretendard | 24px | 1.3 |
| Body | Pretendard | 16px | 1.65 |
| Caption | Pretendard | 13px | 1.5 |

Use system fallbacks when fonts are unavailable. Both preferred families are available under SIL Open Font License; verify and retain license files when bundling. Do not introduce mandatory third-party font requests. Korean text falls back to Pretendard or system Korean fonts.

## Design tokens
Load assets/brand-tokens.css using the appropriate relative path. Tokens are namespaced --fw-brand-* and opt-in. Use them in new brand components; never globally reset game backgrounds, controls, or theme values. Spacing scale: 4, 8, 12, 16, 24px. Standard brand radius: 16px. Preserve focus indicators and reduced-motion preferences.

## Key visual and OG
Use a wheel motif with geometric orbit elements, Deep Space background and orange/purple accents. Use assets/brand-key-visual.svg for brand artwork; it is not a replacement for the official logo.
OG images: 1200 × 630 PNG, keep copy and marks within a 60px safe margin; render legible text and avoid collisions. Existing og-image.png remains the active social image until a new PNG is rendered and visually verified. Keep og:image, secure_url, dimensions, MIME type, alt and twitter:image synchronized. Use absolute HTTPS URLs and update cache version after replacing PNG. For square social assets use 1080 × 1080 with independent layout rather than cropping text. Keep existing page-specific metadata where relevant.

## Implementation rules
Read this guide before adding pages or brand components. Preserve game-specific themes (glass, neon, classic, etc.), user preferences, Firebase rules, authentication, gameplay and accessibility. Migrate existing pages incrementally only when tested. Brand colors are not mandatory for game content.

## POSITIONING 1.0
Promise: 자유로운 디지털 놀이터 — 게임하고, 만들고, 실험하고, 발견하세요.
Audience: curious browser players, casual creators, friends and learners. Prioritize fast discovery, optional onboarding and user choice; never imply all online features work without accounts.
- **PLAY:** Play original browser games (Polyrhythm, Afterbeat).
- **CREATE:** Make music and your own content (LOOP, Maker).
- **EXPERIMENT:** Try unusual mechanics and ideas (Optical Chaos, Beta Lab).
- **CONNECT:** Explore ways to play together (Party, Board).
- **LEARN:** Learn through interactive challenges (History, Code).
- **DISCOVER:** Find new projects and daily challenges (Daily Challenge, Explore).

### Differentiation and distribution
- Lead with distinctive projects and mechanics, not catalogue size or unsupported competitor superiority.
- Hub: six discovery paths, first-visit links, new project links and existing daily discovery. Preserve existing search and filters.
- SEO: descriptive localized titles, unique descriptions, canonical links, sitemap, reciprocal language links between equivalent intro pages. Avoid keyword stuffing.
- Share: consistent slogan, official link, existing user-initiated actions; never imply a manually entered score is verified. Preserve existing theme and result APIs.
- Threads: alternate short gameplay discoveries, creator stories, experiments, collaborative experiences, learning and daily discoveries. Use official link https://semicolonxss.github.io/Formwheel/threads; no unsolicited outreach or fake testimonials.
- Measurement: review existing aggregate traffic, project opens, return visits where available and share referrals weekly. Distinguish opens from actual play; avoid collecting new personal data. Record hypotheses before comparing periods; do not infer causation from raw changes.
- New projects: identify target user, unique mechanic or value, primary pillar, optional onboarding, accessible controls, safe sharing, and compatibility tests. Do not publish unsupported claims.
- Competitor map is a hypothesis, not measured market data; validate with actual user feedback.
