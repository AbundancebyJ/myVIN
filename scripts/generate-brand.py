# Generates the tipmonk brand SVGs (chipmunk monk "Tip"):
#   public/brand/tipmonk-badge.svg  circular symbol (logo mark, favicon source)
#   public/brand/tipmonk-logo.svg   badge + "tipmonk" wordmark + slogan
#
#   pip install fonttools brotli
#   python3 scripts/generate-brand.py public/brand node_modules/@fontsource/fredoka/files
#
# The wordmark is Fredoka (SIL Open Font License) converted to paths, so the SVG
# renders identically everywhere. Edit colours (C), shapes or the slogan and re-run.
import sys, os
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

# Pastel palette
C = dict(line="#5E4838", fur="#F4B78E", furShade="#E49C70", cream="#FFF2E2", creamShade="#F3DFC6",
         stripe="#B98463", robe="#C996A3", robeDark="#AA7886", robeLight="#E0BAC3",
         cushion="#A9C4F0", cushionDark="#88A7DE", cushionLight="#C9DAF7",
         blush="#F6A9A0", iris="#6B4A36", pupil="#2E2019",
         book="#A8DCCB", bookDark="#86C6B2", page="#FFFDF7",
         steel="#D3DCE7", steelDark="#A7B4C6", steelLight="#F1F5FA", badge="#FFF7EE")
SW = 7
o = f'stroke="{C["line"]}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round"'
thin = f'stroke="{C["line"]}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'

def head():
    """3/4 view (~45 deg to the right), half-lidded side glance, raised brow, smirk."""
    sil = [
        '<ellipse cx="312" cy="168" rx="92" ry="80"/>',
        '<ellipse cx="370" cy="198" rx="46" ry="36"/>',   # muzzle pushes out on the facing side
        '<ellipse cx="264" cy="206" rx="46" ry="38"/>',   # near cheek
        '<path d="M290 98 L292 70 L304 90 L308 62 L318 90 L330 74 L334 100 Z"/>',  # hair tuft
    ]
    def eye(cx, cy, rx, ry, lid):
        # white, iris pushed toward the viewer (side glance), heavy upper lid (chic)
        return f"""
    <clipPath id="e{cx}"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/></clipPath>
    <ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#fff"/>
    <g clip-path="url(#e{cx})">
      <circle cx="{cx-rx*0.42:.1f}" cy="{cy+3}" r="{ry*0.62:.1f}" fill="{C["iris"]}"/>
      <circle cx="{cx-rx*0.46:.1f}" cy="{cy+3}" r="{ry*0.32:.1f}" fill="{C["pupil"]}"/>
      <circle cx="{cx-rx*0.22:.1f}" cy="{cy-1}" r="{ry*0.16:.1f}" fill="#fff"/>
      <rect x="{cx-rx-2}" y="{cy-ry-2}" width="{2*rx+4}" height="{ry*lid+2:.1f}" fill="{C["fur"]}"/>
    </g>
    <path d="M{cx-rx-3} {cy-ry+ry*lid:.1f} Q{cx} {cy-ry+ry*lid-5:.1f} {cx+rx+3} {cy-ry+ry*lid:.1f}" fill="none" stroke="{C["line"]}" stroke-width="5" stroke-linecap="round"/>"""
    return f"""<g>
    <!-- ears behind the head: near ear forward, far ear tucked behind -->
    <circle cx="352" cy="94" r="21" fill="{C["fur"]}" {o}/>
    <circle cx="352" cy="96" r="10" fill="{C["blush"]}"/>
    <circle cx="262" cy="102" r="27" fill="{C["fur"]}" {o}/>
    <circle cx="262" cy="104" r="14" fill="{C["blush"]}"/>
    <g fill="{C["line"]}" stroke="{C["line"]}" stroke-width="{SW*2}" stroke-linejoin="round">{"".join(sil)}</g>
    <g fill="{C["fur"]}">{"".join(sil)}</g>
    <!-- cream muzzle and near cheek -->
    <path d="M236 206 C238 178 268 168 300 178 C326 168 372 166 402 182 C420 194 418 224 390 234 C360 248 300 252 270 244 C246 236 234 224 236 206 Z" fill="{C["cream"]}"/>
    <!-- forehead stripe (follows the turn) -->
    <path d="M318 96 Q326 92 334 96 L331 118 Q327 123 323 118 Z" fill="{C["stripe"]}"/>
    {eye(306, 164, 22, 22, 0.36)}
    {eye(374, 162, 15, 21, 0.36)}
    <!-- brows: near one level, far one raised (clever) -->
    <path d="M280 134 Q304 126 328 134" fill="none" stroke="{C["stripe"]}" stroke-width="8" stroke-linecap="round"/>
    <path d="M358 124 Q374 112 392 122" fill="none" stroke="{C["stripe"]}" stroke-width="7" stroke-linecap="round"/>
    <!-- blush -->
    <ellipse cx="262" cy="214" rx="16" ry="8" fill="{C["blush"]}" opacity=".85"/>
    <ellipse cx="398" cy="206" rx="10" ry="6" fill="{C["blush"]}" opacity=".85"/>
    <!-- nose -->
    <path d="M396 186 Q406 182 414 188 Q410 198 402 199 Q396 196 396 186 Z" fill="#C98376" {thin}/>
    <!-- smirk with a peek of buck teeth -->
    <path d="M402 199 L400 208" stroke="{C["line"]}" stroke-width="3" stroke-linecap="round"/>
    <path d="M380 212 L382 220 L392 220 L392 211 Z" fill="#fff" stroke="{C["line"]}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M362 210 Q382 216 400 208 Q406 204 408 198" fill="none" stroke="{C["line"]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>"""

def wrench():
    """Adjustable ("monkey") wrench, handle down, jaw up."""
    return f"""<g transform="translate(442 196) rotate(15)">
    <rect x="-10" y="0" width="20" height="142" rx="10" fill="{C["steel"]}" {thin}/>
    <path d="M-4 14 V128" stroke="{C["steelLight"]}" stroke-width="4" stroke-linecap="round"/>
    <path d="M-12 8 C-32 2 -38 -24 -24 -42 L-14 -50 L-7 -30 Q0 -22 7 -30 L14 -50 L24 -42 C38 -24 32 2 12 8 Z" fill="{C["steel"]}" {thin}/>
    <path d="M-20 -8 C-24 -18 -22 -30 -16 -38" fill="none" stroke="{C["steelLight"]}" stroke-width="4" stroke-linecap="round"/>
    <rect x="-11" y="-12" width="22" height="9" rx="4.5" fill="{C["steelDark"]}" stroke="{C["line"]}" stroke-width="3"/>
    <path d="M-5 -12 V-3 M0 -12 V-3 M5 -12 V-3" stroke="{C["line"]}" stroke-width="1.8" opacity=".55"/>
    <circle cx="0" cy="128" r="4" fill="{C["steelDark"]}"/>
  </g>"""

def notebook():
    return f"""<g transform="rotate(-8 330 312)">
    <rect x="292" y="268" width="76" height="88" rx="7" fill="{C["book"]}" {thin}/>
    <rect x="292" y="268" width="14" height="88" rx="6" fill="{C["bookDark"]}" {thin}/>
    <rect x="318" y="286" width="38" height="24" rx="4" fill="{C["page"]}" stroke="{C["line"]}" stroke-width="3"/>
    <path d="M324 295 H350 M324 302 H344" stroke="{C["stripe"]}" stroke-width="3" stroke-linecap="round"/>
    <path d="M358 268 V356" stroke="{C["cream"]}" stroke-width="5"/>
    <path d="M358 268 V356" stroke="{C["line"]}" stroke-width="1.5" opacity=".4"/>
  </g>"""

def chipmunk():
    return f"""
  <!-- cushion (zafu) -->
  <path d="M164 404 C164 384 220 374 286 374 C352 374 408 384 408 404 L408 418 C408 440 352 450 286 450 C220 450 164 440 164 418 Z" fill="{C["cushion"]}" {o}/>
  <path d="M164 404 C164 424 220 434 286 434 C352 434 408 424 408 404" fill="none" stroke="{C["cushionDark"]}" stroke-width="6"/>
  <path d="M196 392 C230 384 330 382 372 390" fill="none" stroke="{C["cushionLight"]}" stroke-width="6" stroke-linecap="round" opacity=".9"/>
  <!-- tail -->
  <path d="M236 384 C154 394 104 334 112 262 C120 194 178 148 236 164 C282 176 288 234 250 250 C226 260 204 246 208 226 C188 236 180 266 188 296 C198 330 226 348 254 350 Z" fill="{C["fur"]}" {o}/>
  <path d="M150 330 C128 296 130 240 160 204 C182 180 214 176 236 186" fill="none" stroke="{C["cream"]}" stroke-width="10" stroke-linecap="round" opacity=".95"/>
  <path d="M170 336 C150 300 150 252 176 222" fill="none" stroke="{C["furShade"]}" stroke-width="7" stroke-linecap="round" opacity=".7"/>
  <!-- monk's cowl, lowered behind the head (peeks out on the left) -->
  <g transform="translate(-34 26)">
  <path d="M288 196 C258 180 220 190 212 220 C208 244 224 262 250 258 C272 254 286 236 290 216 Z" fill="{C["robe"]}" {o}/>
  <path d="M282 198 C258 188 230 194 222 214 C242 222 268 216 282 198 Z" fill="{C["robeDark"]}"/>
  </g>
  <!-- long robe, hem spreading over the cushion -->
  <path d="M264 214 C216 240 198 300 204 352 C206 382 214 400 226 408 C270 416 340 414 384 404 C390 380 386 350 378 316 C370 280 354 248 330 232 Z" fill="{C["robe"]}" {o}/>
  <path d="M240 262 C226 306 226 356 240 402 M286 360 C286 376 290 392 296 410" fill="none" stroke="{C["robeDark"]}" stroke-width="6" stroke-linecap="round"/>
  <path d="M252 246 C244 270 240 292 240 312" fill="none" stroke="{C["robeLight"]}" stroke-width="6" stroke-linecap="round" opacity=".9"/>
  <!-- rope belt, knot and cords -->
  <path d="M208 330 C256 346 332 348 378 332" fill="none" stroke="{C["line"]}" stroke-width="15" stroke-linecap="round"/>
  <path d="M208 330 C256 346 332 348 378 332" fill="none" stroke="{C["cream"]}" stroke-width="8" stroke-linecap="round"/>
  <path d="M262 348 C260 362 262 374 256 388 M272 348 C274 362 274 374 280 386" fill="none" stroke="{C["line"]}" stroke-width="11" stroke-linecap="round"/>
  <path d="M262 348 C260 362 262 374 256 388 M272 348 C274 362 274 374 280 386" fill="none" stroke="{C["cream"]}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="267" cy="343" r="9" fill="{C["cream"]}" {thin}/>
  <!-- hind foot -->
  <path d="M330 404 C332 392 352 388 370 392 C386 396 392 406 384 412 C370 418 340 418 330 412 Z" fill="{C["fur"]}" {o}/>
  <path d="M370 400 L370 410 M379 400 L379 410" stroke="{C["line"]}" stroke-width="3.5" stroke-linecap="round"/>
  <!-- near sleeve holding the notebook -->
  <path d="M292 246 C314 258 328 286 330 318 L310 336 C296 320 286 300 278 280 C272 266 278 250 292 246 Z" fill="{C["robe"]}" {o}/>
  {head()}
  {notebook()}
  <ellipse cx="312" cy="338" rx="14" ry="11" fill="{C["fur"]}" {thin}/>
  <!-- far arm holding the monkey wrench -->
  <path d="M362 282 C380 288 396 300 408 312 L396 332 C382 322 370 312 360 302 Z" fill="{C["robe"]}" {o}/>
  {wrench()}
  <ellipse cx="404" cy="322" rx="14" ry="12" fill="{C["fur"]}" {thin}/>"""

def badge():
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t">
  <title id="t">tipmonk</title>
  <defs><clipPath id="c"><circle cx="256" cy="256" r="232"/></clipPath></defs>
  <circle cx="256" cy="256" r="232" fill="{C["badge"]}"/>
  <g clip-path="url(#c)"><g transform="translate(-30 4)">{chipmunk()}
  </g></g>
  <circle cx="256" cy="256" r="232" fill="none" stroke="{C["line"]}" stroke-width="14"/>
</svg>
"""
open(f"{OUT}/tipmonk-badge.svg", "w").write(badge())
print("ok")

# ---------- wordmark (text converted to paths, so it renders identically everywhere) ----------
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT_DIR = sys.argv[2] if len(sys.argv) > 2 else "."

def text_path(text, font_file, size, cx, baseline, tracking=0.0):
    """Centred text at (cx, baseline) as one SVG path; tracking in em."""
    f = TTFont(font_file)
    gs = f.getGlyphSet(); cmap = f.getBestCmap(); upm = f["head"].unitsPerEm
    scale = size / upm
    names = [cmap[ord(ch)] for ch in text]
    adv = [gs[n].width for n in names]
    total = sum(adv) + tracking * upm * (len(names) - 1)
    x = cx / scale - total / 2
    pen = SVGPathPen(gs)
    for n, a in zip(names, adv):
        # font units are y-up: flip and move to the baseline
        gs[n].draw(TransformPen(pen, (scale, 0, 0, -scale, x * scale, baseline)))
        x += a + tracking * upm
    return pen.getCommands()

def logo(slogan="FREE VIN SAFETY REPORTS"):
    bold = f"{FONT_DIR}/fredoka-latin-700-normal.woff2"
    semi = f"{FONT_DIR}/fredoka-latin-600-normal.woff2"
    word = text_path("tipmonk", bold, 118, 300, 438, tracking=0.01)
    tag = text_path(slogan, semi, 25, 300, 488, tracking=0.16)
    inner = badge().split("\n", 1)[1].rsplit("</svg>", 1)[0]  # badge body without its <svg> wrapper
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520" role="img" aria-labelledby="t">
  <title id="t">tipmonk: {slogan.title()}</title>
  <svg x="150" y="6" width="300" height="300" viewBox="0 0 512 512">{inner}</svg>
  <path d="{word}" fill="{C["line"]}"/>
  <path d="{tag}" fill="#9A7560"/>
</svg>
'''
open(f"{OUT}/tipmonk-logo.svg", "w").write(logo())
