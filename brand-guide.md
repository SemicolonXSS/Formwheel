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
