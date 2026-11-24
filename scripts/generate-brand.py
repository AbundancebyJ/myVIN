# Generates the tipmonk mascot SVGs into the given directory:
#   python3 scripts/generate-brand.py public/brand
# Edit colours (C) or shapes here and re-run; both files share the same head().
import math, sys
OUT = sys.argv[1]

C = dict(
    line="#3B2618", fur="#C8782F", furShade="#A45F22", cream="#F8E7C9", creamShade="#E9CFA4",
    robe="#2457C5", robeDark="#1B4297", robeLight="#3C70DC", hoodIn="#15306A",
    blush="#F19A86", eye="#1D1612", paper="#FFF8EA", check="#1F7A47", ink="#C7AE87",
    bead="#7A4B27", acorn="#B97534", cap="#5A3A22",
)
SW = 6  # outline width at 512 scale
o = f'stroke="{C["line"]}" stroke-width="{SW}" stroke-linejoin="round" stroke-linecap="round"'

def head():
    """Hood + ears + face, centred on (256,188). Used by both the character and the mark."""
    return f'''
  <g id="head">
    <!-- hood -->
    <circle cx="256" cy="188" r="148" fill="{C["robe"]}" {o}/>
    <path d="M150 110 C175 75 215 58 256 58 C297 58 337 75 362 110" fill="none" stroke="{C["robeLight"]}" stroke-width="10" stroke-linecap="round" opacity=".55"/>
    <!-- ear holes in the hood, then ears poking through -->
    <ellipse cx="170" cy="76" rx="33" ry="30" fill="{C["hoodIn"]}"/>
    <ellipse cx="342" cy="76" rx="33" ry="30" fill="{C["hoodIn"]}"/>
    <circle cx="170" cy="70" r="27" fill="{C["fur"]}" {o}/>
    <circle cx="342" cy="70" r="27" fill="{C["fur"]}" {o}/>
    <circle cx="170" cy="72" r="13" fill="{C["blush"]}"/>
    <circle cx="342" cy="72" r="13" fill="{C["blush"]}"/>
    <!-- hood opening -->
    <ellipse cx="256" cy="204" rx="131" ry="121" fill="none" stroke="{C["robeLight"]}" stroke-width="9" opacity=".8"/>
    <ellipse cx="256" cy="204" rx="124" ry="114" fill="{C["hoodIn"]}"/>
    <!-- face -->
    <ellipse cx="256" cy="212" rx="110" ry="100" fill="{C["fur"]}" {o}/>
    <!-- forehead stripe, flanked by cream -->
    <path d="M228 118 Q256 110 284 118 L270 176 Q256 186 242 176 Z" fill="{C["cream"]}" opacity=".9"/>
    <path d="M247 114 Q256 111 265 114 L261 172 Q256 178 251 172 Z" fill="{C["line"]}"/>
    <!-- eye stripes: cream brow band above, dark band through the eye -->
    <path d="M238 182 C214 166 186 160 156 168 C160 158 182 146 212 150 C228 153 240 166 238 182 Z" fill="{C["cream"]}"/>
    <path d="M274 182 C298 166 326 160 356 168 C352 158 330 146 300 150 C284 153 272 166 274 182 Z" fill="{C["cream"]}"/>
    <path d="M236 200 C212 186 180 180 150 190 C152 200 176 212 236 214 Z" fill="{C["furShade"]}" opacity=".7"/>
    <path d="M276 200 C300 186 332 180 362 190 C360 200 336 212 276 214 Z" fill="{C["furShade"]}" opacity=".7"/>
    <!-- stuffed cheeks (chipmunk!) -->
    <circle cx="186" cy="252" r="44" fill="{C["cream"]}" {o}/>
    <circle cx="326" cy="252" r="44" fill="{C["cream"]}" {o}/>
    <ellipse cx="256" cy="256" rx="54" ry="40" fill="{C["cream"]}"/>
    <ellipse cx="178" cy="262" rx="19" ry="11" fill="{C["blush"]}" opacity=".85"/>
    <ellipse cx="334" cy="262" rx="19" ry="11" fill="{C["blush"]}" opacity=".85"/>
    <!-- eyes -->
    <ellipse cx="216" cy="204" rx="16" ry="20" fill="{C["eye"]}"/>
    <ellipse cx="296" cy="204" rx="16" ry="20" fill="{C["eye"]}"/>
    <circle cx="222" cy="196" r="6.5" fill="#fff"/>
    <circle cx="302" cy="196" r="6.5" fill="#fff"/>
    <circle cx="211" cy="213" r="3" fill="#fff" opacity=".85"/>
    <circle cx="291" cy="213" r="3" fill="#fff" opacity=".85"/>
    <!-- nose, smile, little buck teeth -->
    <path d="M245 236 Q256 229 267 236 Q263 248 256 250 Q249 248 245 236 Z" fill="{C["line"]}"/>
    <path d="M240 258 Q248 268 256 258 Q264 268 272 258" fill="none" stroke="{C["line"]}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M250 262 L250 271 Q256 274 262 271 L262 262" fill="#fff" stroke="{C["line"]}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M256 263 L256 272" stroke="{C["line"]}" stroke-width="2.5"/>
  </g>'''

def beads():
    p0, p1, p2 = (194, 300), (256, 382), (318, 300)
    out = []
    for i in range(1, 12):
        t = i / 12
        if 0.42 < t < 0.58:
            continue
        x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t**2*p2[0]
        y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t**2*p2[1]
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{C["bead"]}" stroke="{C["line"]}" stroke-width="3"/>')
    # acorn pendant
    out.append(f'''<path d="M256 334 L256 344" stroke="{C["line"]}" stroke-width="3"/>
    <ellipse cx="256" cy="366" rx="13" ry="15" fill="{C["acorn"]}" stroke="{C["line"]}" stroke-width="3.5"/>
    <path d="M240 356 Q240 342 256 342 Q272 342 272 356 Z" fill="{C["cap"]}" stroke="{C["line"]}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M256 342 Q258 336 263 335" fill="none" stroke="{C["line"]}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="251" cy="364" r="3" fill="#fff" opacity=".5"/>''')
    return "\n    ".join(out)

def character():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t">
  <title id="t">Tip, the tipmonk chipmunk monk</title>
  <!-- tail (behind everything): upright, curling at the tip -->
  <path d="M330 452 C420 452 456 384 446 304 C438 244 444 196 476 176" fill="none" stroke="{C["line"]}" stroke-width="66" stroke-linecap="round"/>
  <path d="M330 452 C420 452 456 384 446 304 C438 244 444 196 476 176" fill="none" stroke="{C["fur"]}" stroke-width="54" stroke-linecap="round"/>
  <path d="M352 444 C418 440 440 380 432 312 C426 262 430 220 452 198" fill="none" stroke="{C["line"]}" stroke-width="10" stroke-linecap="round"/>
  <!-- feet -->
  <ellipse cx="210" cy="482" rx="32" ry="17" fill="{C["fur"]}" {o}/>
  <ellipse cx="302" cy="482" rx="32" ry="17" fill="{C["fur"]}" {o}/>
  <!-- robe -->
  <path d="M168 290 C146 360 126 430 138 474 Q256 498 374 474 C386 430 366 360 344 290 Z" fill="{C["robe"]}" {o}/>
  <path d="M200 468 C204 440 204 420 198 400 M312 468 C308 440 308 420 314 400" fill="none" stroke="{C["robeDark"]}" stroke-width="6" stroke-linecap="round"/>
  <!-- chest fur in the robe's V -->
  <path d="M222 292 L256 352 L290 292 Z" fill="{C["cream"]}" {o}/>
  {head()}
  <!-- acorn prayer beads -->
  {beads()}
  <!-- sleeves -->
  <path d="M170 312 C140 352 140 404 172 430 L206 410 C190 384 192 350 206 326 Z" fill="{C["robe"]}" {o}/>
  <path d="M342 312 C372 352 372 404 340 430 L306 410 C322 384 320 350 306 326 Z" fill="{C["robe"]}" {o}/>
  <!-- scroll of tips -->
  <rect x="188" y="390" width="136" height="58" rx="4" fill="{C["paper"]}" {o}/>
  <path d="M200 406 l6 6 l11 -12 M200 421 l6 6 l11 -12 M200 436 l6 6 l11 -12" fill="none" stroke="{C["check"]}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M226 407 H306 M226 422 H296 M226 437 H302" stroke="{C["ink"]}" stroke-width="4.5" stroke-linecap="round"/>
  <rect x="172" y="382" width="22" height="74" rx="11" fill="{C["creamShade"]}" {o}/>
  <rect x="318" y="382" width="22" height="74" rx="11" fill="{C["creamShade"]}" {o}/>
  <!-- rope belt (behind the scroll): knot and hanging cords -->
  <path d="M234 462 C230 474 232 484 226 496 M244 462 C246 474 246 484 252 494" fill="none" stroke="{C["line"]}" stroke-width="12" stroke-linecap="round"/>
  <path d="M234 462 C230 474 232 484 226 496 M244 462 C246 474 246 484 252 494" fill="none" stroke="{C["cream"]}" stroke-width="5" stroke-linecap="round"/>
  <circle cx="239" cy="460" r="10" fill="{C["cream"]}" {o}/>
  <!-- paws holding it -->
  <ellipse cx="180" cy="422" rx="17" ry="15" fill="{C["fur"]}" {o}/>
  <ellipse cx="332" cy="422" rx="17" ry="15" fill="{C["fur"]}" {o}/>
</svg>
'''

def mark():
    # circular badge: paper disc, head scaled up and clipped by the disc
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t">
  <title id="t">tipmonk</title>
  <defs><clipPath id="disc"><circle cx="256" cy="256" r="244"/></clipPath></defs>
  <circle cx="256" cy="256" r="244" fill="#FFF3DC"/>
  <g clip-path="url(#disc)">
    <g transform="translate(256 286) scale(1.18) translate(-256 -200)">
      <path d="M128 250 C112 320 100 380 96 460 L416 460 C412 380 400 320 384 250 Z" fill="{C["robe"]}" {o}/>
      <path d="M226 300 L256 352 L286 300 Z" fill="{C["cream"]}" {o}/>{head()}
    </g>
  </g>
  <circle cx="256" cy="256" r="244" fill="none" stroke="{C["line"]}" stroke-width="14"/>
</svg>
'''

open(f"{OUT}/tipmonk-character.svg", "w").write(character())
open(f"{OUT}/tipmonk-mark.svg", "w").write(mark())
print("ok")
