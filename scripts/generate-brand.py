# Generates the tipmonk brand SVGs (chipmunk monk "Tip"):
#   public/brand/tipmonk-badge.svg  circular symbol (logo mark, favicon source)
#   public/brand/tipmonk-logo.svg   badge + "tipmonk" wordmark + slogan
#
#   pip install fonttools brotli
#   python3 scripts/generate-brand.py public/brand node_modules/@fontsource/fredoka/files
#
# The wordmark is Fredoka (SIL Open Font License) converted to paths, so the SVG
# renders identically everywhere. Edit colours (C), shapes or the slogan and re-run.
import sys
OUT = sys.argv[1]
import os
os.makedirs(OUT, exist_ok=True)
C = dict(line="#4A2C1A", fur="#DA7A3A", furShade="#B95F27", cream="#FCEBD3", creamShade="#F1D5B1",
         stripe="#5A3520", robe="#A23E2D", robeDark="#7C2C20", robeLight="#C0563F",
         cushion="#2457C5", cushionDark="#1B4297", cushionLight="#3C70DC",
         bulb="#FFCB3D", bulbShade="#F2A62A", metal="#9AA3AF", blush="#F29A86",
         bead="#7A4B27", acorn="#B9773A", cap="#5A3A22", paper="#FFF8EA", badge="#FFF4E3")
SW = 7
o = f'stroke="{C["line"]}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round"'
thin = f'stroke="{C["line"]}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"'

def chipmunk():
    return f'''
  <!-- cushion (zafu) -->
  <path d="M164 404 C164 384 220 374 286 374 C352 374 408 384 408 404 L408 418 C408 440 352 450 286 450 C220 450 164 440 164 418 Z" fill="{C["cushion"]}" {o}/>
  <path d="M164 404 C164 424 220 434 286 434 C352 434 408 424 408 404" fill="none" stroke="{C["cushionDark"]}" stroke-width="6"/>
  <path d="M196 392 C230 384 330 382 372 390" fill="none" stroke="{C["cushionLight"]}" stroke-width="6" stroke-linecap="round" opacity=".8"/>
  <!-- tail -->
  <path d="M236 384 C154 394 104 334 112 262 C120 194 178 148 236 164 C282 176 288 234 250 250 C226 260 204 246 208 226 C188 236 180 266 188 296 C198 330 226 348 254 350 Z" fill="{C["fur"]}" {o}/>
  <path d="M150 330 C128 296 130 240 160 204 C182 180 214 176 236 186" fill="none" stroke="{C["creamShade"]}" stroke-width="9" stroke-linecap="round" opacity=".9"/>
  <path d="M232 204 C248 208 254 226 242 234" fill="none" stroke="{C["furShade"]}" stroke-width="6" stroke-linecap="round"/>
  <!-- monk's cowl, lowered behind the head -->
  <path d="M288 196 C258 180 220 190 212 220 C208 244 224 262 250 258 C272 254 286 236 290 216 Z" fill="{C["robe"]}" {o}/>
  <path d="M282 198 C258 188 230 194 222 214 C242 222 268 216 282 198 Z" fill="{C["robeDark"]}"/>
  <!-- long robe covering the body, hem spreading over the cushion -->
  <path d="M264 214 C216 240 198 300 204 352 C206 382 214 400 226 408 C270 416 340 414 384 404 C390 380 386 350 378 316 C370 280 354 248 330 232 Z" fill="{C["robe"]}" {o}/>
  <path d="M240 262 C226 306 226 356 240 402 M286 352 C286 372 290 390 296 410" fill="none" stroke="{C["robeDark"]}" stroke-width="6" stroke-linecap="round"/>
  <path d="M252 246 C244 270 240 292 240 312" fill="none" stroke="{C["robeLight"]}" stroke-width="6" stroke-linecap="round" opacity=".8"/>
  <!-- fur at the neckline -->
  <path d="M316 236 C330 248 342 262 348 278 C334 272 322 258 312 244 Z" fill="{C["cream"]}"/>
  <!-- rope belt with a knot and hanging cords -->
  <path d="M208 330 C256 346 332 348 378 332" fill="none" stroke="{C["line"]}" stroke-width="15" stroke-linecap="round"/>
  <path d="M208 330 C256 346 332 348 378 332" fill="none" stroke="{C["cream"]}" stroke-width="8" stroke-linecap="round"/>
  <path d="M352 344 C350 358 352 370 346 384 M362 344 C364 358 364 370 370 382" fill="none" stroke="{C["line"]}" stroke-width="11" stroke-linecap="round"/>
  <path d="M352 344 C350 358 352 370 346 384 M362 344 C364 358 364 370 370 382" fill="none" stroke="{C["cream"]}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="357" cy="340" r="9" fill="{C["cream"]}" {thin}/>
  <!-- hind foot peeking from under the hem -->
  <path d="M330 404 C332 392 352 388 370 392 C386 396 392 406 384 412 C370 418 340 418 330 412 Z" fill="{C["fur"]}" {o}/>
  <path d="M370 400 L370 410 M379 400 L379 410" stroke="{C["line"]}" stroke-width="3.5" stroke-linecap="round"/>
  <!-- head -->
  <path d="M268 178 C266 140 296 116 330 118 C362 120 384 142 394 166 C402 180 410 188 408 198 C406 210 394 214 380 216 C362 220 350 230 330 238 C298 248 270 222 268 178 Z" fill="{C["fur"]}" {o}/>
  <!-- ear -->
  <path d="M286 132 C280 108 300 96 318 104 C326 108 328 118 326 124" fill="{C["fur"]}" {o}/>
  <path d="M294 126 C292 114 302 108 312 112" fill="none" stroke="{C["blush"]}" stroke-width="7" stroke-linecap="round"/>
  <!-- face: cream cheek, eye stripes, closed serene eye -->
  <path d="M314 196 C330 184 368 182 392 194 C402 200 404 208 396 212 C380 220 360 224 340 234 C322 236 308 214 314 196 Z" fill="{C["cream"]}"/>
  <path d="M300 150 C326 136 362 138 388 160 C368 154 334 152 306 162 Z" fill="{C["cream"]}"/>
  <path d="M298 166 C322 154 356 154 382 166 C358 163 330 164 302 174 Z" fill="{C["stripe"]}"/>
  <path d="M332 184 Q345 172 358 184" fill="none" stroke="{C["line"]}" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="348" cy="200" rx="13" ry="7" fill="{C["blush"]}" opacity=".9"/>
  <ellipse cx="404" cy="188" rx="7" ry="6" fill="{C["line"]}"/>
  <path d="M398 204 Q392 212 384 208" fill="none" stroke="{C["line"]}" stroke-width="4" stroke-linecap="round"/>
  <path d="M396 196 L428 190 M396 200 L428 204" stroke="{C["line"]}" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
  <!-- wide sleeve -->
  <path d="M292 246 C318 258 338 286 356 318 L338 340 C316 326 294 302 278 280 C272 266 278 250 292 246 Z" fill="{C["robe"]}" {o}/>
  <path d="M338 340 L356 318" stroke="{C["robeDark"]}" stroke-width="8" stroke-linecap="round"/>
  <!-- paws holding a scroll of tips -->
  <g transform="rotate(-14 372 292)">
    <rect x="336" y="262" width="62" height="58" rx="4" fill="{C["paper"]}" {thin}/>
    <path d="M346 278 l4 4 l8 -9 M346 292 l4 4 l8 -9 M346 306 l4 4 l8 -9" fill="none" stroke="#1F7A47" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M364 279 H388 M364 293 H384 M364 307 H388" stroke="#C7AE87" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="330" y="254" width="74" height="13" rx="6.5" fill="{C["creamShade"]}" {thin}/>
    <rect x="330" y="316" width="74" height="13" rx="6.5" fill="{C["creamShade"]}" {thin}/>
  </g>
  <ellipse cx="346" cy="328" rx="14" ry="11" fill="{C["fur"]}" {thin}/>
  <ellipse cx="398" cy="316" rx="13" ry="11" fill="{C["fur"]}" {thin}/>
  <!-- acorn prayer beads hanging from the paw -->
  {beads()}
  <!-- the tip: a lightbulb idea -->
  <g transform="translate(352 86) scale(.82)">
    <path d="M-18 2 A20 20 0 1 1 18 2 C14 9 9 13 9 20 L-9 20 C-9 13 -14 9 -18 2 Z" fill="{C["bulb"]}" {thin}/>
    <path d="M-6 -8 A9 9 0 0 1 4 -12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    <rect x="-10" y="20" width="20" height="12" rx="3" fill="{C["metal"]}" {thin}/>
    <path d="M-26 -24 L-33 -31 M26 -24 L33 -31 M-34 2 H-44 M34 2 H44" stroke="{C["bulbShade"]}" stroke-width="5" stroke-linecap="round"/>
  </g>'''

def beads():
    """A loop of beads hanging from the front paw, ending in an acorn."""
    out = []
    for p0, p1, p2 in (((392, 328), (386, 362), (404, 372)), ((408, 324), (422, 360), (404, 372))):
        for i in range(1, 7):
            t = i / 7
            x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t**2*p2[0]
            y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t**2*p2[1]
            out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="5.5" fill="{C["bead"]}" stroke="{C["line"]}" stroke-width="2.5"/>')
    out.append(f'''<ellipse cx="404" cy="390" rx="10" ry="12" fill="{C["acorn"]}" stroke="{C["line"]}" stroke-width="3"/>
  <path d="M392 383 Q392 372 404 372 Q416 372 416 383 Z" fill="{C["cap"]}" stroke="{C["line"]}" stroke-width="3" stroke-linejoin="round"/>''')
    return "\n  ".join(out)

def badge():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t">
  <title id="t">tipmonk</title>
  <defs><clipPath id="c"><circle cx="256" cy="256" r="232"/></clipPath></defs>
  <circle cx="256" cy="256" r="232" fill="{C["badge"]}"/>
  <g clip-path="url(#c)"><g transform="translate(-24 0)">{chipmunk()}
  </g></g>
  <circle cx="256" cy="256" r="232" fill="none" stroke="{C["line"]}" stroke-width="14"/>
</svg>
'''
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
  <path d="{tag}" fill="#8A5A36"/>
</svg>
'''
open(f"{OUT}/tipmonk-logo.svg", "w").write(logo())
