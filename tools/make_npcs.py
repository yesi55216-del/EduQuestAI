#!/usr/bin/env python3
"""Generates original NPC bust portraits (400x520) into assets/npcs/*.svg + *.png.
Run:  pip install cairosvg && python3 tools/make_npcs.py
All art is original vector work (no licence needed). Replace any PNG with your own art using the same file name."""
import os, cairosvg
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'npcs'); os.makedirs(OUT, exist_ok=True)
OL = '#2b1d1a'

import re
def fix_alpha(t):
    return re.sub(r'(fill|stroke)="#([0-9a-fA-F]{6})([0-9a-fA-F]{2})"',lambda m:f'{m.group(1)}="#{m.group(2)}" {m.group(1)}-opacity="{int(m.group(3),16)/255:.2f}"',t)

def svg(accent, body, extra_defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
<defs><radialGradient id="aura" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="{accent}" stop-opacity=".55"/><stop offset=".6" stop-color="{accent}" stop-opacity=".18"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>{extra_defs}</defs>
<circle cx="200" cy="240" r="200" fill="url(#aura)"/>{body}</svg>'''

def S(w=3): return f'stroke="{OL}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'

def robe(c, c2, trim='#e0b95c'):
    return f'''<path d="M14 520 C24 425 92 392 158 382 L242 382 C308 392 376 425 386 520 Z" fill="{c}" {S()}/>
<path d="M14 520 C24 425 92 392 158 382 L242 382 C308 392 376 425 386 520 Z" fill="url(#shade)"/>
<path d="M158 382 L200 452 L242 382 Z" fill="{c2}" {S()}/>
<path d="M30 470 C45 425 100 398 158 388" fill="none" stroke="{trim}" stroke-width="5" opacity=".85" stroke-linecap="round"/>
<path d="M370 470 C355 425 300 398 242 388" fill="none" stroke="{trim}" stroke-width="5" opacity=".85" stroke-linecap="round"/>'''

def head(sk, rx=70, ry=82, cy=272, shade='#00000018'):
    return f'''<path d="M172 330 L172 394 Q200 424 228 394 L228 330 Z" fill="{sk}" {S()}/><path d="M172 340 L172 394 Q200 420 228 394 L228 340 Q200 372 172 340Z" fill="#00000026"/>
<ellipse cx="{200-rx-2}" cy="{cy+4}" rx="12" ry="17" fill="{sk}" {S()}/><ellipse cx="{200+rx+2}" cy="{cy+4}" rx="12" ry="17" fill="{sk}" {S()}/>
<ellipse cx="200" cy="{cy}" rx="{rx}" ry="{ry}" fill="{sk}" {S()}/><ellipse cx="{200+rx*.45}" cy="{cy+8}" rx="{rx*.55}" ry="{ry*.85}" fill="{shade}"/>'''

def eyes(iris='#4a2f1d', cy=278, dx=29, lash=False, r=1.0):
    o = ''
    for sx in (-1, 1):
        cx = 200 + sx * dx
        o += f'<ellipse cx="{cx}" cy="{cy}" rx="{10*r}" ry="{12*r}" fill="#fffdf8" {S(2)}/><circle cx="{cx}" cy="{cy+1}" r="{7*r}" fill="{iris}"/><circle cx="{cx}" cy="{cy+1}" r="{3.6*r}" fill="#120c0a"/><circle cx="{cx-2.5}" cy="{cy-3}" r="2.4" fill="#fff"/>'
        if lash: o += f'<path d="M{cx-12*r} {cy-4} Q{cx} {cy-17*r} {cx+12*r} {cy-4}" fill="none" stroke="{OL}" stroke-width="3.5" stroke-linecap="round"/>'
    return o

def brows(c='#4a3426', y=254, w=5, tilt=0, thick=1):
    return f'<path d="M{200-47} {y+tilt} Q{200-29} {y-9} {200-10} {y+3-tilt}" fill="none" stroke="{c}" stroke-width="{w*thick}" stroke-linecap="round"/><path d="M{200+47} {y+tilt} Q{200+29} {y-9} {200+10} {y+3-tilt}" fill="none" stroke="{c}" stroke-width="{w*thick}" stroke-linecap="round"/>'

def nose(y=288, c='#00000040'): return f'<path d="M200 {y} Q192 {y+20} 202 {y+24}" fill="none" stroke="{c}" stroke-width="3.5" stroke-linecap="round"/>'
def mouth(kind='smile', y=316, c='#9a4343'):
    if kind == 'smile': return f'<path d="M180 {y} Q200 {y+16} 220 {y}" fill="none" stroke="{c}" stroke-width="3.5" stroke-linecap="round"/>'
    if kind == 'grin': return f'<path d="M178 {y-2} Q200 {y+22} 222 {y-2} Z" fill="#7a2b2b" {S(2.5)}/><path d="M186 {y+2} Q200 {y+8} 214 {y+2}" fill="none" stroke="#fff" stroke-width="3"/>'
    if kind == 'flat': return f'<path d="M184 {y+3} L216 {y+3}" fill="none" stroke="{c}" stroke-width="3.5" stroke-linecap="round"/>'
    if kind == 'soft': return f'<path d="M186 {y} Q200 {y+8} 214 {y}" fill="none" stroke="{c}" stroke-width="3.5" stroke-linecap="round"/>'
    if kind == 'lips': return f'<path d="M184 {y} Q192 {y-5} 200 {y-1} Q208 {y-5} 216 {y} Q200 {y+13} 184 {y} Z" fill="#c4506a" {S(2)}/>'
def blush(c='#f4958a'): return f'<ellipse cx="156" cy="305" rx="13" ry="8" fill="{c}" opacity=".45"/><ellipse cx="244" cy="305" rx="13" ry="8" fill="{c}" opacity=".45"/>'
def star(x, y, r, c='#ffe27a'):
    import math
    pts = []
    for i in range(10):
        a = -math.pi/2 + i*math.pi/5; rr = r if i % 2 == 0 else r*.45
        pts.append(f'{x+rr*math.cos(a):.1f},{y+rr*math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{c}"/>'
def sparkles(items, c='#fff6c8'):
    return ''.join(star(x, y, r, c) for x, y, r in items)

C = {}  # name -> (accent, svg-body)

# 1 Sage Axiom — old number wizard (blue hat, long white beard, floating symbols)
C['sage-axiom'] = ('#5b8def', f'''
<g opacity=".9" font-family="DejaVu Serif,serif" font-weight="700" fill="#ffe9a3"><text x="40" y="170" font-size="42">π</text><text x="318" y="140" font-size="40">∑</text><text x="330" y="260" font-size="34">x²</text><text x="30" y="300" font-size="30">√</text></g>
{robe('#25458f', '#e8e2d0', '#f0cb6b')}
<path d="M300 440 a26 26 0 1 0 0.1 0" fill="none"/>
<circle cx="332" cy="452" r="26" fill="#ffe08a" {S()}/><circle cx="332" cy="452" r="26" fill="#ffd05a" filter="url(#glow)" opacity=".6"/><text x="332" y="462" text-anchor="middle" font-size="28" font-weight="700" font-family="DejaVu Serif,serif" fill="#3a2a10">π</text>
{head('#eac09a')}{eyes('#3f6fb5')}{blush('#e99a86')}{nose()}
<path d="M135 292 C128 366 150 436 200 462 C250 436 272 366 265 292 C252 326 226 338 200 338 C174 338 148 326 135 292 Z" fill="#f6f3ec" {S()}/>
<path d="M200 338 L200 452 M176 346 Q172 400 190 440 M224 346 Q228 400 210 440" fill="none" stroke="#cfc8b8" stroke-width="2.5"/>
<path d="M200 310 C182 296 160 302 146 326 C166 330 186 326 200 318 C214 326 234 330 254 326 C240 302 218 296 200 310 Z" fill="#fbf9f4" {S()}/>
<path d="M150 250 Q172 232 192 250 Q172 262 150 250Z M208 250 Q228 232 250 250 Q228 262 208 250Z" fill="#f6f3ec" {S(2.5)}/>
<path d="M126 214 C150 140 190 96 222 52 C232 38 262 40 276 66 C252 60 240 80 254 128 C262 160 268 190 272 214 Z" fill="#2a4cab" {S()}/>
<path d="M126 214 C150 140 190 96 222 52 C232 38 262 40 276 66" fill="none" stroke="#6b8fe6" stroke-width="5" opacity=".5"/>
<ellipse cx="200" cy="214" rx="128" ry="26" fill="#1f3a85" {S()}/><path d="M138 206 Q200 236 262 206" fill="none" stroke="#f0cb6b" stroke-width="7"/>
{sparkles([(190,150,10),(232,110,8),(215,185,7),(160,198,6)])}
''')

# 2 Archivist Fenwick — young scholar, ginger hair, round glasses, scroll
C['archivist-fenwick'] = ('#f0933a', f'''
<path d="M118 250 C96 150 160 96 206 100 C262 104 300 160 284 262 C300 300 290 340 270 352 L130 352 C108 340 100 300 118 250Z" fill="#b8481f" {S()}/>
{robe('#8d4a2b', '#f1e3c8', '#e8b25a')}
<rect x="296" y="418" width="26" height="84" rx="13" transform="rotate(18 309 460)" fill="#f2e2b8" {S()}/><rect x="292" y="412" width="34" height="14" rx="7" transform="rotate(18 309 419)" fill="#b0763a" {S()}/><rect x="298" y="494" width="34" height="14" rx="7" transform="rotate(18 315 501)" fill="#b0763a" {S()}/>
<path d="M150 392 L250 392 L240 430 L160 430Z" fill="#c9722f" {S()}/>
{head('#f4d2b2')}
<path d="M130 268 C118 190 160 140 206 142 C250 142 284 188 270 266 C262 224 236 196 206 196 C170 196 140 224 130 268 Z" fill="#c9582a" {S()}/>
<path d="M142 208 C170 166 230 150 262 200 C238 176 190 178 142 208Z" fill="#e57a3c"/>
{eyes('#4f7a45')}{brows('#9a431f')}{nose()}{mouth('smile')}{blush()}
<g fill="#c98a5a" opacity=".6"><circle cx="170" cy="300" r="2.4"/><circle cx="182" cy="306" r="2.4"/><circle cx="218" cy="306" r="2.4"/><circle cx="230" cy="300" r="2.4"/></g>
<circle cx="171" cy="278" r="21" fill="#fff" fill-opacity=".18" stroke="#d29a35" stroke-width="4"/><circle cx="229" cy="278" r="21" fill="#fff" fill-opacity=".18" stroke="#d29a35" stroke-width="4"/><path d="M192 276 Q200 270 208 276" fill="none" stroke="#d29a35" stroke-width="4"/><path d="M150 274 L130 268 M250 274 L270 268" stroke="#d29a35" stroke-width="3.5"/>
''')

# 3 Queen Vera
C['queen-vera'] = ('#c04a7a', f'''
<path d="M104 250 C86 330 90 420 70 500 L160 440 L140 330Z" fill="#3a2230" {S()}/><path d="M296 250 C314 330 310 420 330 500 L240 440 L260 330Z" fill="#3a2230" {S()}/>
<path d="M118 240 C110 150 160 110 200 110 C240 110 292 150 282 240 L282 340 L118 340Z" fill="#3a2230" {S()}/>
{robe('#7d1f45', '#f3d9a6', '#f0cb6b')}
<path d="M150 392 Q200 440 250 392" fill="none" stroke="#f0cb6b" stroke-width="6"/><circle cx="200" cy="436" r="10" fill="#e23b66" {S(2.5)}/><circle cx="170" cy="418" r="5" fill="#fff6d6"/><circle cx="230" cy="418" r="5" fill="#fff6d6"/>
{head('#f6d9c1')}
<path d="M132 262 C124 200 150 160 200 158 C250 160 276 200 268 262 C258 214 236 190 200 190 C164 190 142 214 132 262Z" fill="#3a2230" {S()}/>
{eyes('#6a3d8a', lash=True)}{brows('#2f1c27', y=252, w=4)}{nose()}{mouth('lips')}{blush('#f08aa0')}
<path d="M136 176 L146 126 L170 156 L186 108 L200 150 L214 108 L230 156 L254 126 L264 176 Q200 190 136 176Z" fill="#f2c94c" {S()}/>
<circle cx="186" cy="118" r="7" fill="#e23b66" {S(2)}/><circle cx="214" cy="118" r="7" fill="#3c8dde" {S(2)}/><circle cx="200" cy="162" r="8" fill="#e23b66" {S(2)}/>
{sparkles([(100,200,8),(300,190,9),(80,300,6)])}
''')

# 4 The Null Wraith
C['null-wraith'] = ('#8a5cff', f'''
<g font-family="DejaVu Sans Mono,monospace" font-weight="700" fill="#b9a2ff" opacity=".55"><text x="40" y="130" font-size="46">0</text><text x="318" y="110" font-size="34">0</text><text x="330" y="280" font-size="52">0</text><text x="26" y="300" font-size="30">0</text><text x="60" y="400" font-size="36">∅</text></g>
<path d="M200 36 C106 46 74 160 86 262 C92 336 110 410 56 520 L344 520 C290 410 308 336 314 262 C326 160 294 46 200 36Z" fill="#241a45" {S()}/>
<path d="M200 36 C130 50 104 150 112 250" fill="none" stroke="#6a4ad8" stroke-width="6" opacity=".5"/>
<path d="M56 520 L80 488 L98 520 L124 484 L146 520 L176 490 L200 520 L226 488 L252 520 L280 484 L302 520 L322 490 L344 520Z" fill="#150f2c"/>
<path d="M200 96 C140 100 124 170 130 262 C134 320 160 350 200 352 C240 350 266 320 270 262 C276 170 260 100 200 96Z" fill="#07050f" {S()}/>
<ellipse cx="170" cy="250" rx="19" ry="11" fill="#7ef3ff" filter="url(#glow)"/><ellipse cx="230" cy="250" rx="19" ry="11" fill="#7ef3ff" filter="url(#glow)"/>
<ellipse cx="170" cy="250" rx="13" ry="7" fill="#e8ffff"/><ellipse cx="230" cy="250" rx="13" ry="7" fill="#e8ffff"/>
<path d="M170 312 Q200 330 230 312" fill="none" stroke="#3a2a66" stroke-width="4" stroke-linecap="round"/>
<path d="M100 420 C80 440 70 480 74 520 M300 420 C320 440 330 480 326 520" fill="none" stroke="#6a4ad8" stroke-width="4" opacity=".5"/>
''')

# 5 Keeper Ember — fire keeper
C['keeper-ember'] = ('#ff7a2a', f'''
<path d="M120 270 C84 200 120 140 138 90 C146 130 160 140 168 104 C176 80 186 66 190 30 C206 76 222 90 232 122 C244 100 252 86 262 66 C270 110 316 160 286 214 C296 244 284 270 282 300 L120 300Z" fill="#e0481c" {S()}/>
<path d="M150 200 C160 150 180 130 196 80 C212 130 240 150 252 200Z" fill="#ffb02e" opacity=".9"/><path d="M174 200 C182 164 196 148 204 120 C214 150 228 168 230 200Z" fill="#ffe27a"/>
{robe('#7a2a14', '#f2c27a', '#ff9a3c')}
<circle cx="200" cy="452" r="22" fill="#ff7a2a" filter="url(#glow)"/><path d="M200 432 C214 450 220 460 200 474 C182 460 188 448 200 432Z" fill="#ffd25a" {S(2.5)}/>
{head('#cf935f')}
<path d="M132 258 C128 200 160 168 200 166 C240 168 272 200 268 258 C256 214 234 196 200 196 C166 196 144 214 132 258Z" fill="#c43a14" {S()}/>
{eyes('#e4801a')}{brows('#5a2412', tilt=-2)}{nose()}{mouth('grin')}{blush('#ff8f6a')}
<g fill="#ffcf5a">{''.join(f'<circle cx="{x}" cy="{y}" r="{r}" opacity=".85"/>' for x,y,r in [(70,200,5),(330,230,6),(96,330,4),(310,360,5),(60,420,4),(345,150,4)])}</g>
''')

# 6 Dr. Lumen the Golem — stone + brass construct with lightbulb
C['dr-lumen'] = ('#ffcc3d', f'''
<rect x="195" y="56" width="10" height="60" fill="#8b7a58" {S(2.5)}/><circle cx="200" cy="46" r="26" fill="#fff0a8" {S()}/><circle cx="200" cy="46" r="34" fill="#ffd84a" filter="url(#glow)" opacity=".8"/><path d="M190 52 L196 38 L200 50 L204 38 L210 52" fill="none" stroke="#c98a15" stroke-width="2.5"/>
<path d="M20 520 L40 410 L120 380 L280 380 L360 410 L380 520Z" fill="#7a7468" {S()}/><path d="M20 520 L40 410 L120 380 L120 520Z" fill="#00000022"/>
<rect x="28" y="388" width="92" height="56" rx="14" fill="#9a9488" {S()}/><rect x="280" y="388" width="92" height="56" rx="14" fill="#9a9488" {S()}/>
<rect x="150" y="410" width="100" height="90" rx="14" fill="#5d574f" {S()}/><circle cx="200" cy="455" r="24" fill="#ffd84a" {S()}/><circle cx="200" cy="455" r="30" fill="#ffd84a" filter="url(#glow)" opacity=".7"/><circle cx="200" cy="455" r="10" fill="#fff6c8"/>
<rect x="168" y="336" width="64" height="56" rx="8" fill="#6b6559" {S()}/><path d="M168 350 H232 M168 364 H232 M168 378 H232" stroke="#00000044" stroke-width="3"/>
<rect x="124" y="170" width="152" height="176" rx="34" fill="#b9ab8e" {S()}/><rect x="124" y="170" width="152" height="176" rx="34" fill="url(#shade)"/>
<path d="M136 196 Q200 176 264 196" fill="none" stroke="#e7dcc2" stroke-width="5" opacity=".6"/>
<path d="M250 180 L238 214 L252 236 M142 300 L160 288 L150 320" fill="none" stroke="#5d5444" stroke-width="3.5"/>
<rect x="144" y="232" width="46" height="34" rx="10" fill="#1d1608" {S(2.5)}/><rect x="210" y="232" width="46" height="34" rx="10" fill="#1d1608" {S(2.5)}/>
<rect x="150" y="238" width="34" height="22" rx="7" fill="#ffd84a"/><rect x="216" y="238" width="34" height="22" rx="7" fill="#ffd84a"/><rect x="150" y="238" width="34" height="22" rx="7" fill="#ffd84a" filter="url(#glow)" opacity=".8"/><rect x="216" y="238" width="34" height="22" rx="7" fill="#ffd84a" filter="url(#glow)" opacity=".8"/>
<rect x="172" y="300" width="56" height="26" rx="6" fill="#3f392f" {S(2.5)}/><path d="M184 300 V326 M196 300 V326 M208 300 V326 M220 300 V326" stroke="#b9ab8e" stroke-width="3"/>
<g fill="#8b7a58" {S(2)}><circle cx="140" cy="186" r="5"/><circle cx="260" cy="186" r="5"/><circle cx="140" cy="330" r="5"/><circle cx="260" cy="330" r="5"/></g>
''')

# 7 Tide Spirit Nyra
C['tide-nyra'] = ('#3cc6e8', f'''
<path d="M104 250 C70 330 96 430 40 504 C120 480 150 440 150 400 L140 300Z" fill="#2a8fd0" {S()}/><path d="M296 250 C330 330 304 430 360 504 C280 480 250 440 250 400 L260 300Z" fill="#2a8fd0" {S()}/>
<path d="M116 250 C100 150 150 100 200 100 C250 100 300 150 284 250 L284 330 L116 330Z" fill="#37a6e0" {S()}/>
<path d="M14 520 C24 425 92 392 158 382 L242 382 C308 392 376 425 386 520 Z" fill="#1d7aa8" {S()}/><path d="M14 520 C24 425 92 392 158 382 L242 382 C308 392 376 425 386 520Z" fill="url(#shade)"/>
<path d="M158 382 L200 440 L242 382 Z" fill="#c9f3f7" {S()}/>
<path d="M30 478 Q60 454 90 478 T150 478 T210 478 T270 478 T330 478 T380 478" fill="none" stroke="#bff3ff" stroke-width="5" opacity=".8"/>
{head('#c9eef2')}
<path d="M132 258 C124 200 150 160 200 158 C250 160 276 200 268 258 C256 214 236 192 200 192 C164 192 144 214 132 258Z" fill="#37a6e0" {S()}/>
{eyes('#16a0c8', lash=True)}{brows('#1d7aa8', y=253, w=4)}{nose()}{mouth('soft',316,'#5a8aa0')}{blush('#8fd8ee')}
<path d="M150 188 Q200 150 250 188" fill="none" stroke="#fff" stroke-width="6" opacity=".9"/><circle cx="200" cy="168" r="12" fill="#fff8f0" {S(2.5)}/><circle cx="160" cy="180" r="7" fill="#fff8f0" {S(2)}/><circle cx="240" cy="180" r="7" fill="#fff8f0" {S(2)}/>
<g fill="#d8fbff" opacity=".9">{''.join(f'<path d="M{x} {y-9} Q{x+8} {y+3} {x} {y+8} Q{x-8} {y+3} {x} {y-9}Z"/>' for x,y in [(68,190),(334,200),(86,350),(322,360),(52,300),(352,290)])}</g>
''')

# 8 Chronicler Maren
C['chronicler-maren'] = ('#6fae6a', f'''
{robe('#3f6a4a', '#f1e8d3', '#d9b45f')}
<path d="M110 246 C98 150 150 98 200 98 C250 98 302 150 290 246 C292 280 280 300 268 306 L132 306 C120 300 108 280 110 246Z" fill="#5a3a26" {S()}/>
<circle cx="200" cy="96" r="34" fill="#5a3a26" {S()}/><path d="M174 90 Q200 70 226 90" fill="none" stroke="#7d5638" stroke-width="5"/>
{head('#ecc7a2')}
<path d="M132 262 C122 196 158 154 200 154 C242 154 278 196 268 262 C262 214 238 188 200 188 C162 188 138 214 132 262Z" fill="#5a3a26" {S()}/><path d="M150 200 C176 176 224 176 250 200 C226 190 176 190 150 200Z" fill="#7d5638"/>
{eyes('#5a7a3a')}{brows('#4a2f1d')}{nose()}{mouth('smile')}{blush()}
<g transform="rotate(24 330 450)"><path d="M330 330 C372 360 372 430 330 520 C300 440 300 370 330 330Z" fill="#f4f0e4" {S()}/><path d="M330 340 L330 520" stroke="#b8a888" stroke-width="3"/><path d="M330 330 C346 342 356 356 362 372" fill="none" stroke="#b8a888" stroke-width="2.5"/></g>
<path d="M92 400 H150 V470 H92Z" fill="#e8d6a8" {S()} transform="rotate(-6 120 435)"/><path d="M100 416 h42 M100 428 h42 M100 440 h30" stroke="#8a6a3a" stroke-width="2.5" transform="rotate(-6 120 435)"/>
''')

# 9 General Tiberan (ghost)
C['general-tiberan'] = ('#7fb4d6', f'''
<g opacity=".92">
<path d="M10 520 C22 430 90 392 158 382 L242 382 C310 392 378 430 390 520Z" fill="#6f8191" {S()}/>
<ellipse cx="82" cy="418" rx="62" ry="36" fill="#8aa0b2" {S()}/><ellipse cx="318" cy="418" rx="62" ry="36" fill="#8aa0b2" {S()}/>
<path d="M30 410 H134 M266 410 H370" stroke="#c9d8e4" stroke-width="4" opacity=".7"/>
<path d="M158 382 L200 440 L242 382Z" fill="#aebfcc" {S()}/><circle cx="200" cy="470" r="14" fill="#c0392b" {S()}/>
{head('#c9d8e0')}
<path d="M200 190 L200 130 C210 80 260 60 290 80 C270 84 256 100 258 130 L200 190Z" fill="#c0392b" {S()}/>
<path d="M128 262 C124 196 150 160 200 158 C250 160 276 196 272 262 L258 262 L258 214 C230 196 170 196 142 214 L142 262Z" fill="#8aa0b2" {S()}/>
<path d="M122 250 L148 360 L170 330 L150 262Z" fill="#8aa0b2" {S()}/><path d="M278 250 L252 360 L230 330 L250 262Z" fill="#8aa0b2" {S()}/>
<path d="M148 214 C180 196 220 196 252 214 L252 228 C220 214 180 214 148 228Z" fill="#aebfcc" {S(2.5)}/>
{brows('#d8e4ec', y=258, w=6, tilt=3, thick=1)}
<ellipse cx="171" cy="280" rx="11" ry="9" fill="#bff4ff" filter="url(#glow)"/><ellipse cx="229" cy="280" rx="11" ry="9" fill="#bff4ff" filter="url(#glow)"/><ellipse cx="171" cy="280" rx="7" ry="5" fill="#fff"/><ellipse cx="229" cy="280" rx="7" ry="5" fill="#fff"/>
{nose()}
<path d="M200 312 C180 300 158 308 150 328 C170 330 188 324 200 320 C212 324 230 330 250 328 C242 308 220 300 200 312Z" fill="#e8f0f4" {S()}/>
<path d="M182 340 Q200 334 218 340" fill="none" stroke="#6a7e8e" stroke-width="3.5" stroke-linecap="round"/>
<path d="M166 238 L150 296" stroke="#8aa0b2" stroke-width="3" opacity=".7"/>
</g>
<g fill="#cfeaff" opacity=".6"><circle cx="60" cy="250" r="6"/><circle cx="340" cy="230" r="7"/><circle cx="90" cy="150" r="4"/><circle cx="320" cy="140" r="5"/></g>
''')

# 10 Archivist Corvin — thin man, dark cap, goatee, candle
C['archivist-corvin'] = ('#b07cff', f'''
{robe('#3a2c54', '#cdbfe0', '#b07cff')}
{head('#e6cbb2', rx=62, ry=86, cy=272)}
<path d="M138 232 C140 180 170 156 200 156 C230 156 260 180 262 232 C240 206 160 206 138 232Z" fill="#2f2540" {S()}/>
<path d="M120 214 C140 120 260 120 280 214 C250 196 150 196 120 214Z" fill="#2f2540" {S()}/><ellipse cx="200" cy="208" rx="96" ry="16" fill="#241b36" {S()}/>
{eyes('#6b4aa8', dx=26, cy=280, r=.9)}
<path d="M154 258 L186 262 M246 258 L214 262" stroke="#5a5a64" stroke-width="4.5" stroke-linecap="round"/>
{nose()}<path d="M184 320 Q200 328 216 320" fill="none" stroke="#8a4a4a" stroke-width="3.5" stroke-linecap="round"/>
<path d="M178 330 C180 372 190 396 200 410 C210 396 220 372 222 330 C212 342 188 342 178 330Z" fill="#9a9aa6" {S()}/>
<path d="M200 312 C186 304 172 308 164 318 C178 320 190 318 200 316 C210 318 222 320 236 318 C228 308 214 304 200 312Z" fill="#9a9aa6" {S(2.5)}/>
<rect x="326" y="400" width="26" height="86" rx="6" fill="#efe6cf" {S()}/><path d="M339 398 L339 388" stroke="#2b1d1a" stroke-width="3"/>
<path d="M339 330 C358 358 360 380 339 392 C318 380 320 358 339 330Z" fill="#ffb02e" {S()}/><path d="M339 352 C348 366 349 376 339 384 C329 376 330 366 339 352Z" fill="#fff2a8"/><circle cx="339" cy="365" r="46" fill="#ffb02e" filter="url(#glow)" opacity=".35"/>
''')

# 11 Scribe Lyra
C['scribe-lyra'] = ('#38b6a8', f'''
<path d="M296 250 C330 320 320 400 296 470 C276 440 268 380 276 320Z" fill="#1f2c48" {S()}/>
{robe('#2f8a8a', '#f4ecd8', '#f0cb6b')}
<path d="M118 244 C108 150 154 104 200 104 C246 104 292 150 282 244 L282 300 L118 300Z" fill="#1f2c48" {S()}/>
{head('#efc8a6')}
<path d="M132 262 C122 196 154 156 200 156 C246 156 278 196 268 262 C264 214 238 188 200 188 C162 188 136 214 132 262Z" fill="#1f2c48" {S()}/><path d="M146 206 C176 180 224 180 254 206 C226 192 176 192 146 206Z" fill="#3b4f7a"/>
{eyes('#2c8a7a', lash=True)}{brows('#1f2c48', w=4)}{nose()}{mouth('smile')}{blush()}
<path d="M258 168 C300 120 346 70 372 30 C360 80 340 140 300 190Z" fill="#fdfbf4" {S()}/><path d="M258 168 L372 30" stroke="#c9bfa4" stroke-width="3"/><path d="M290 150 L330 140 M304 126 L340 112 M318 104 L350 86" stroke="#d8d0b8" stroke-width="2.5"/>
<path d="M140 176 C160 150 240 150 262 176 C240 164 160 164 140 176Z" fill="#2f8a8a" {S()}/>
<rect x="84" y="430" width="46" height="52" rx="10" fill="#27303f" {S()}/><rect x="96" y="418" width="22" height="16" rx="4" fill="#8a5a2a" {S(2.5)}/><circle cx="107" cy="458" r="9" fill="#5a7fd8" opacity=".8"/>
''')

# 12 The Silent Dragon
C['silent-dragon'] = ('#46c9a8', f'''
<path d="M10 520 C16 430 80 380 150 366 L250 366 C320 380 384 430 390 520Z" fill="#2f8f7a" {S()}/><path d="M10 520 C16 430 80 380 150 366 L250 366 C320 380 384 430 390 520Z" fill="url(#shade)"/>
<g fill="#4ab89c" {S(2)} opacity=".9">{''.join(f'<path d="M{x} {y} q14 -8 28 0 q-6 14 -14 20 q-8 -6 -14 -20Z"/>' for x,y in [(70,448),(110,470),(150,446),(200,470),(250,446),(290,470),(330,448),(40,490),(360,492)])}</g>
<path d="M170 366 L200 400 L230 366 Z" fill="#e7e29a" {S()}/>
<path d="M156 160 L140 98 L172 136Z M196 150 L200 82 L212 148Z M244 160 L260 98 L228 136Z" fill="#d9e8a0" {S()}/>
<path d="M128 200 C96 160 76 104 92 50 C116 98 142 130 166 160Z" fill="#e8d28a" {S()}/><path d="M272 200 C304 160 324 104 308 50 C284 98 258 130 234 160Z" fill="#e8d28a" {S()}/>
<path d="M118 258 C116 188 158 150 200 150 C242 150 284 188 282 258 C288 308 256 352 236 372 C216 386 184 386 164 372 C144 352 112 308 118 258Z" fill="#3aa58f" {S()}/>
<path d="M118 258 C116 188 158 150 200 150" fill="none" stroke="#7ce6c8" stroke-width="5" opacity=".5"/>
<ellipse cx="200" cy="330" rx="56" ry="44" fill="#6cd1b0" {S()}/><path d="M176 312 Q182 324 190 326 Q184 316 176 312Z M224 312 Q218 324 210 326 Q216 316 224 312Z" fill="#1f5a4c"/>
<path d="M158 350 Q200 376 242 350" fill="none" stroke="#1f5a4c" stroke-width="4" stroke-linecap="round"/><path d="M172 362 L178 376 L184 365 M228 362 L222 376 L216 365" fill="#fffbe8" stroke="#1f5a4c" stroke-width="2.5" stroke-linejoin="round"/><path d="M150 224 Q172 206 194 226 M250 224 Q228 206 206 226" fill="none" stroke="#1f5a4c" stroke-width="7" stroke-linecap="round"/>
<path d="M142 236 Q168 214 192 240 Q166 252 142 236Z" fill="#256e5e" {S(2.5)}/><path d="M258 236 Q232 214 208 240 Q234 252 258 236Z" fill="#256e5e" {S(2.5)}/>
<ellipse cx="168" cy="244" rx="15" ry="14" fill="#ffd84a" {S(2.5)}/><ellipse cx="232" cy="244" rx="15" ry="14" fill="#ffd84a" {S(2.5)}/><ellipse cx="168" cy="244" rx="4.5" ry="12" fill="#1a1208"/><ellipse cx="232" cy="244" rx="4.5" ry="12" fill="#1a1208"/><circle cx="163" cy="238" r="3" fill="#fff"/><circle cx="227" cy="238" r="3" fill="#fff"/>
<g fill="#d8fff0" opacity=".7"><circle cx="150" cy="406" r="5"/><circle cx="140" cy="392" r="3.5"/><circle cx="250" cy="406" r="5"/><circle cx="262" cy="392" r="3.5"/></g>
''')

# 13 Lorekeeper Quill
C['lorekeeper-quill'] = ('#c4546a', f'''
{robe('#6a2535', '#eadfc6', '#e0b95c')}
<path d="M120 270 C100 250 108 214 130 210 C128 236 128 252 134 266Z" fill="#f4f0e6" {S()}/><path d="M280 270 C300 250 292 214 270 210 C272 236 272 252 266 266Z" fill="#f4f0e6" {S()}/>
{head('#e8c4a2')}
<path d="M128 240 C112 190 134 160 150 176 C142 204 140 224 140 244Z" fill="#f4f0e6" {S()}/><path d="M272 240 C288 190 266 160 250 176 C258 204 260 224 260 244Z" fill="#f4f0e6" {S()}/>
<path d="M146 190 Q200 156 254 190" fill="none" stroke="#f4f0e6" stroke-width="8" stroke-linecap="round"/>
{eyes('#6b4a2a')}
<path d="M150 252 Q172 236 190 254 Q172 262 150 252Z M210 254 Q228 236 250 252 Q228 262 210 254Z" fill="#f4f0e6" {S(2.5)}/>
{nose()}
<path d="M200 312 C176 296 150 306 140 330 C164 334 186 326 200 320 C214 326 236 334 260 330 C250 306 224 296 200 312Z" fill="#f8f5ee" {S()}/><path d="M188 340 Q200 350 212 340" fill="none" stroke="#8a4a4a" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="229" cy="278" r="22" fill="#fff" fill-opacity=".2" stroke="#d9a62e" stroke-width="4"/><path d="M243 292 Q262 340 250 392" fill="none" stroke="#d9a62e" stroke-width="2.5"/>
<path d="M92 436 L200 462 L308 436 L308 502 L200 520 L92 502Z" fill="#7a4a24" {S()}/><path d="M104 442 L200 464 L196 514 L104 496Z" fill="#f6efd8" {S(2.5)}/><path d="M296 442 L200 464 L204 514 L296 496Z" fill="#fbf5e2" {S(2.5)}/>
<path d="M118 456 L180 470 M118 470 L180 484 M220 470 L282 456 M220 484 L282 470" stroke="#a88a58" stroke-width="2.5"/><path d="M200 464 L200 516" stroke="#7a4a24" stroke-width="3"/>
''')

# fallback traveller
C['unknown'] = ('#b89a62', f'''
{robe('#4a3d5c', '#cdbfe0', '#b89a62')}
<path d="M200 70 C130 76 104 160 112 250 C118 320 150 346 200 348 C250 346 282 320 288 250 C296 160 270 76 200 70Z" fill="#4a3d5c" {S()}/>
<path d="M200 118 C158 122 146 180 150 250 C154 304 174 326 200 328 C226 326 246 304 250 250 C254 180 242 122 200 118Z" fill="#14101c" {S()}/>
<ellipse cx="176" cy="250" rx="9" ry="7" fill="#ffe27a"/><ellipse cx="224" cy="250" rx="9" ry="7" fill="#ffe27a"/>
''')

if __name__ == '__main__':
    for k, (acc, body) in C.items():
        s = fix_alpha(svg(acc, body))
        open(f'{OUT}/{k}.svg', 'w').write(s)
        cairosvg.svg2png(bytestring=s.encode(), write_to=f'{OUT}/{k}.png', output_width=400, output_height=520)
    print('wrote', len(C), 'portraits to', os.path.abspath(OUT))
