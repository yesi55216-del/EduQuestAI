#!/usr/bin/env python3
"""Generates the original SVG background illustrations in assets/backgrounds/ (no licensing needed).
Run: python3 tools/make_backgrounds.py"""
import random, math, os
W,H=1600,900
OUT=os.path.join(os.path.dirname(__file__),'..','assets','backgrounds')
def svg(body,defs=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice"><defs>{defs}</defs>{body}</svg>'
def lg(id,stops,x2=0,y2=1):
    s=''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o,c in stops)
    return f'<linearGradient id="{id}" x1="0" y1="0" x2="{x2}" y2="{y2}">{s}</linearGradient>'
def rg(id,stops,cx=.5,cy=.5,r=.5):
    s=''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o,c,a in stops)
    return f'<radialGradient id="{id}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'
def ridge(R,y,amp,col,steps=24,op=1,base=H):
    pts=[]
    for i in range(steps+1):
        x=W*i/steps; pts.append((x,y-R.random()*amp))
    d=f'M0,{base} L'+' L'.join(f'{x:.0f},{yy:.0f}' for x,yy in pts)+f' L{W},{base} Z'
    return f'<path d="{d}" fill="{col}" opacity="{op}"/>'
def hills(R,y,amp,col,op=1):
    d=f'M0,{H} L0,{y}'
    n=6
    for i in range(n):
        x1=W*(i+.5)/n; x2=W*(i+1)/n; d+=f' Q{x1:.0f},{y-amp*R.uniform(.4,1):.0f} {x2:.0f},{y-amp*R.uniform(0,.5):.0f}'
    d+=f' L{W},{H} Z'; return f'<path d="{d}" fill="{col}" opacity="{op}"/>'
def stars(R,n,ymax,col='#fff'):
    return ''.join(f'<circle cx="{R.uniform(0,W):.0f}" cy="{R.uniform(0,ymax):.0f}" r="{R.uniform(.6,2.2):.1f}" fill="{col}" opacity="{R.uniform(.4,1):.2f}"/>' for _ in range(n))
def pine(x,y,h,col):
    w=h*.38;s=''
    for i in range(4):
        yy=y-h*(i*.22); ww=w*(1-i*.2)
        s+=f'<path d="M{x-ww:.0f},{yy:.0f} L{x:.0f},{yy-h*.38:.0f} L{x+ww:.0f},{yy:.0f}Z" fill="{col}"/>'
    return s+f'<rect x="{x-4:.0f}" y="{y:.0f}" width="8" height="{h*.12:.0f}" fill="{col}"/>'
def round_tree(x,y,h,col,trunk):
    return f'<rect x="{x-h*.05:.0f}" y="{y-h*.5:.0f}" width="{h*.1:.0f}" height="{h*.5:.0f}" fill="{trunk}"/><ellipse cx="{x:.0f}" cy="{y-h*.62:.0f}" rx="{h*.34:.0f}" ry="{h*.38:.0f}" fill="{col}"/><ellipse cx="{x-h*.18:.0f}" cy="{y-h*.5:.0f}" rx="{h*.22:.0f}" ry="{h*.24:.0f}" fill="{col}"/><ellipse cx="{x+h*.2:.0f}" cy="{y-h*.52:.0f}" rx="{h*.22:.0f}" ry="{h*.24:.0f}" fill="{col}"/>'
def tower(x,y,w,h,body,roof,flag=None,win='#ffd88a'):
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{body}"/>'
    s+=f'<path d="M{x-w*.15:.0f},{y} L{x+w/2:.0f},{y-w*1.1:.0f} L{x+w*1.15:.0f},{y}Z" fill="{roof}"/>'
    s+=f'<rect x="{x+w*.38:.0f}" y="{y+h*.2:.0f}" width="{w*.24:.0f}" height="{w*.38:.0f}" rx="{w*.12:.0f}" fill="{win}"/>'
    if flag: s+=f'<line x1="{x+w/2:.0f}" y1="{y-w*1.1:.0f}" x2="{x+w/2:.0f}" y2="{y-w*1.6:.0f}" stroke="#3a2c20" stroke-width="3"/><path d="M{x+w/2:.0f},{y-w*1.6:.0f} l{w*.6:.0f},{w*.12:.0f} l-{w*.6:.0f},{w*.12:.0f}Z" fill="{flag}"/>'
    return s
def castle(cx,y,sc,body,roof,flag,win='#ffd88a'):
    s=f'<g>'
    s+=f'<rect x="{cx-170*sc}" y="{y-120*sc}" width="{340*sc}" height="{120*sc}" fill="{body}"/>'
    for i in range(9): s+=f'<rect x="{cx-170*sc+i*40*sc}" y="{y-135*sc}" width="{22*sc}" height="{16*sc}" fill="{body}"/>'
    s+=tower(cx-215*sc,y-210*sc,60*sc,210*sc,body,roof,flag,win)+tower(cx+155*sc,y-210*sc,60*sc,210*sc,body,roof,flag,win)
    s+=tower(cx-40*sc,y-300*sc,80*sc,300*sc,body,roof,flag,win)
    s+=f'<path d="M{cx-34*sc},{y} v-{60*sc} a{34*sc},{34*sc} 0 0 1 {68*sc},0 v{60*sc}Z" fill="#2a1f2a"/>'
    return s+'</g>'
def glow(id,cx,cy,r,col,a=.9):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{id})"/>'
def orbs(R,n,ymin,ymax,col,rmin=3,rmax=7,op=.8):
    s=''
    for _ in range(n):
        x,y=R.uniform(0,W),R.uniform(ymin,ymax);r=R.uniform(rmin,rmax)
        s+=f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r*3:.1f}" fill="{col}" opacity=".18"/><circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.1f}" fill="{col}" opacity="{op}"/>'
    return s
def cloud(x,y,s,col='#fff',op=.85):
    return f'<g opacity="{op}" fill="{col}"><ellipse cx="{x}" cy="{y}" rx="{70*s}" ry="{22*s}"/><ellipse cx="{x-40*s}" cy="{y+6*s}" rx="{45*s}" ry="{16*s}"/><ellipse cx="{x+45*s}" cy="{y+4*s}" rx="{50*s}" ry="{18*s}"/><ellipse cx="{x+5*s}" cy="{y-14*s}" rx="{40*s}" ry="{20*s}"/></g>'

# ---------- 1. FANTASY KINGDOM (sunset) ----------
def kingdom():
    R=random.Random(1)
    defs=lg('sky',[(0,'#2c2a5e'),(.45,'#8a4f8c'),(.75,'#f2a66b'),(1,'#ffd9a0')])+rg('sun',[(0,'#fff3c4',1),(.4,'#ffd27a',.55),(1,'#ffb35a',0)])
    b=f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'+stars(R,70,300)+glow('sun',1100,560,360,'')
    b+=f'<circle cx="1100" cy="560" r="62" fill="#fff3c4"/>'
    for x,y,s in [(220,170,1.4),(620,120,1),(1320,210,1.2),(900,260,.8)]: b+=cloud(x,y,s,'#ffd8c8',.7)
    b+=ridge(R,610,160,'#6b4a7a',18,.9)+ridge(R,660,110,'#4e3a66',22)
    b+=hills(R,690,70,'#3a3558')
    b+=castle(1090,690,1.55,'#52446e','#b04a5a','#ffd27a')
    # town
    for i in range(14):
        x=120+i*75+R.uniform(-10,10);h=R.uniform(50,95);w=R.uniform(48,64);y=800
        b+=f'<rect x="{x:.0f}" y="{y-h:.0f}" width="{w:.0f}" height="{h:.0f}" fill="#3a2f55"/><path d="M{x-6:.0f},{y-h:.0f} L{x+w/2:.0f},{y-h-38:.0f} L{x+w+6:.0f},{y-h:.0f}Z" fill="#8f3f58"/>'
        if R.random()>.3: b+=f'<rect x="{x+w*.35:.0f}" y="{y-h*.6:.0f}" width="{w*.28:.0f}" height="{w*.34:.0f}" fill="#ffd27a"/>'
    b+=f'<rect y="800" width="{W}" height="100" fill="#2a2145"/>'+orbs(R,26,150,700,'#ffe9a8',2,4,.9)
    return svg(b,defs)

# ---------- 2. ENCHANTED FOREST ----------
def forest():
    R=random.Random(2)
    defs=lg('sky',[(0,'#16352f'),(.5,'#2f6a52'),(1,'#a8d8a0')])+rg('ray',[(0,'#fff6c0',.55),(1,'#fff6c0',0)])
    b=f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
    b+=f'<ellipse cx="820" cy="120" rx="320" ry="260" fill="url(#ray)"/>'
    for i in range(6): b+=f'<polygon points="{760+i*25},0 {820+i*60},0 {500+i*230},{H}" fill="#fff6c0" opacity=".07"/>'
    for layer,(y,col,h,n) in enumerate([(560,'#2d5a47',300,16),(640,'#244a3b',380,14),(740,'#1a382e',470,11)]):
        for i in range(n):
            x=R.uniform(-20,W+20); b+=pine(x,y+R.uniform(0,60),h*R.uniform(.8,1.2),col) if i%3 else round_tree(x,y+60,h*R.uniform(.9,1.2),col,'#2a1f1a')
        b+=f'<rect y="{y+60}" width="{W}" height="{H}" fill="{col}" opacity=".6"/>'
        b+=f'<ellipse cx="{W/2}" cy="{y+40}" rx="{W*.7}" ry="40" fill="#cfeedd" opacity=".12"/>'
    b+=f'<path d="M0,{H} L0,780 Q800,700 {W},790 L{W},{H}Z" fill="#12281f"/>'
    b+=f'<path d="M640,{H} Q760,820 820,720 Q880,820 960,{H}Z" fill="#cfae7a" opacity=".55"/>'
    for x,y in [(220,820),(380,850),(1250,830),(1420,860)]:
        b+=f'<rect x="{x-5}" y="{y}" width="10" height="26" fill="#e9ddc8"/><ellipse cx="{x}" cy="{y}" rx="30" ry="18" fill="#c8463f"/><circle cx="{x-10}" cy="{y-4}" r="4" fill="#fff"/><circle cx="{x+12}" cy="{y}" r="3" fill="#fff"/>'
    b+=orbs(R,45,200,820,'#d7ff9a',2,5,.95)
    return svg(b,defs)

# ---------- 3. MAGICAL LIBRARY ----------
def library():
    R=random.Random(3)
    defs=lg('wall',[(0,'#4a2f20'),(1,'#2a1a12')])+rg('win',[(0,'#fff0b8',.9),(1,'#fff0b8',0)])+lg('floor',[(0,'#6b4630'),(1,'#2a1a12')])
    b=f'<rect width="{W}" height="{H}" fill="url(#wall)"/>'
    cols=['#8c2f39','#2f5d8c','#3d7a4f','#c9962f','#6b3a8c','#b5532a','#2a6b6b']
    def shelf(x,w,top,bot):
        s=f'<rect x="{x}" y="{top}" width="{w}" height="{bot-top}" fill="#3a2418"/>'
        rows=6;rh=(bot-top)/rows
        for r in range(rows):
            yy=top+r*rh+rh-6;cx=x+8
            while cx<x+w-14:
                bw=R.uniform(10,22);bh=R.uniform(rh*.55,rh*.88);s+=f'<rect x="{cx:.0f}" y="{yy-bh:.0f}" width="{bw:.0f}" height="{bh:.0f}" fill="{R.choice(cols)}"/>';cx+=bw+1
            s+=f'<rect x="{x}" y="{yy:.0f}" width="{w}" height="7" fill="#5a3a24"/>'
        return s
    b+=shelf(0,330,60,760)+shelf(1270,330,60,760)+shelf(350,230,150,760)+shelf(1020,230,150,760)
    b+=f'<path d="M620,760 V280 a180,180 0 0 1 360,0 V760Z" fill="#1a1020"/><path d="M640,760 V285 a160,160 0 0 1 320,0 V760Z" fill="#b8d8ff" opacity=".85"/>'
    b+=f'<ellipse cx="800" cy="330" rx="520" ry="360" fill="url(#win)"/>'
    for i in range(7): b+=f'<polygon points="{700+i*30},300 {900+i*20},300 {450+i*140},{H}" fill="#fff0b8" opacity=".06"/>'
    b+=f'<line x1="800" y1="130" x2="800" y2="760" stroke="#1a1020" stroke-width="8"/><line x1="640" y1="400" x2="960" y2="400" stroke="#1a1020" stroke-width="8"/>'
    b+=f'<rect y="760" width="{W}" height="140" fill="url(#floor)"/>'
    for i in range(10): b+=f'<line x1="{i*180}" y1="760" x2="{i*260-400}" y2="{H}" stroke="#2a1a12" stroke-width="3" opacity=".6"/>'
    # chandelier + floating books
    b+=f'<line x1="800" y1="0" x2="800" y2="70" stroke="#c9962f" stroke-width="4"/><ellipse cx="800" cy="80" rx="60" ry="14" fill="#c9962f"/>'
    for dx in (-45,-15,15,45): b+=f'<ellipse cx="{800+dx}" cy="60" rx="5" ry="10" fill="#ffd88a"/>'
    for _ in range(5):
        x,y=R.uniform(400,1200),R.uniform(430,700);a=R.uniform(-25,25)
        b+=f'<g transform="rotate({a:.0f} {x:.0f} {y:.0f})"><rect x="{x-24:.0f}" y="{y-16:.0f}" width="48" height="32" rx="3" fill="{R.choice(cols)}"/><rect x="{x-24:.0f}" y="{y-16:.0f}" width="6" height="32" fill="#00000033"/></g>'
    b+=orbs(R,40,100,760,'#ffe9a8',2,4,.9)
    return svg(b,defs)

# ---------- 4. CRYSTAL CAVE ----------
def cave():
    R=random.Random(4)
    defs=lg('bg',[(0,'#0d1030'),(.6,'#1b2a5e'),(1,'#0b1226')])+rg('g',[(0,'#7fe9ff',.55),(1,'#7fe9ff',0)])
    b=f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
    b+=ridge(R,520,140,'#141a44',26,1)+ridge(R,620,120,'#0f1438',20,1)
    # stalactites
    d='M0,0 '
    x=0
    while x<W:
        w=R.uniform(50,120);h=R.uniform(80,300);d+=f'L{x+w/2:.0f},{h:.0f} L{x+w:.0f},0 ';x+=w
    b+=f'<path d="{d}Z" fill="#0a0d26"/>'
    def crystal(cx,base,h,col,col2):
        w=h*.22;return f'<polygon points="{cx-w:.0f},{base} {cx-w*.7:.0f},{base-h*.75:.0f} {cx:.0f},{base-h:.0f} {cx+w*.7:.0f},{base-h*.75:.0f} {cx+w:.0f},{base}" fill="{col}"/><polygon points="{cx:.0f},{base-h:.0f} {cx+w*.7:.0f},{base-h*.75:.0f} {cx+w:.0f},{base} {cx:.0f},{base}" fill="{col2}"/>'
    b+=f'<ellipse cx="800" cy="650" rx="560" ry="260" fill="url(#g)"/>'
    for cx,base,h,c1,c2 in [(380,800,260,'#6fe3ff','#2fa4d8'),(450,820,170,'#a98bff','#6a4fd0'),(320,830,120,'#8ff0ff','#38b0e0'),(1180,800,300,'#a98bff','#6a4fd0'),(1260,830,190,'#6fe3ff','#2fa4d8'),(1110,830,130,'#ff9be0','#c24fa8'),(800,830,160,'#8ff0ff','#38b0e0'),(870,840,100,'#a98bff','#6a4fd0')]:
        b+=crystal(cx,base,h,c1,c2)
    b+=f'<path d="M0,{H} L0,810 Q800,770 {W},820 L{W},{H}Z" fill="#070a1c"/>'
    b+=f'<ellipse cx="800" cy="860" rx="300" ry="28" fill="#4fd0ff" opacity=".35"/>'
    b+=orbs(R,34,120,820,'#9ff1ff',2,4,.95)
    return svg(b,defs)

# ---------- 5. TEMPLE CHAMBER ----------
def temple():
    R=random.Random(5)
    defs=lg('bg',[(0,'#3a2c20'),(1,'#1a120c')])+rg('g',[(0,'#ffe08a',.8),(1,'#ffe08a',0)])+lg('fl',[(0,'#b89a62'),(1,'#4a3a26')])
    b=f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
    b+=f'<path d="M0,0 H{W} V240 Q800,140 0,240Z" fill="#2a1f16"/>'
    b+=f'<ellipse cx="800" cy="520" rx="620" ry="380" fill="url(#g)" opacity=".5"/>'
    for i in range(7): b+=f'<polygon points="{720+i*20},0 {880+i*10},0 {400+i*130},{H}" fill="#ffe9a8" opacity=".07"/>'
    def col(x,h=640):
        return f'<rect x="{x-46}" y="{760-h}" width="92" height="26" fill="#c9b080"/><rect x="{x-36}" y="{786-h}" width="72" height="{h-60}" fill="#a98f5e"/>'+''.join(f'<line x1="{x+k}" y1="{790-h}" x2="{x+k}" y2="730" stroke="#8a7248" stroke-width="3"/>' for k in (-22,-8,8,22))+f'<rect x="{x-46}" y="730" width="92" height="30" fill="#c9b080"/>'
    for x in (150,330,1270,1450): b+=col(x)
    b+=f'<rect x="520" y="250" width="560" height="500" fill="#14100c"/><path d="M540,750 V420 a260,260 0 0 1 520,0 V750Z" fill="#251b13"/>'
    # rune door
    b+=f'<circle cx="800" cy="520" r="150" fill="none" stroke="#ffd27a" stroke-width="5"/><circle cx="800" cy="520" r="118" fill="none" stroke="#ffd27a" stroke-width="2" stroke-dasharray="10 8"/>'
    for k in range(12):
        a=k*math.pi/6;b+=f'<circle cx="{800+math.cos(a)*134:.0f}" cy="{520+math.sin(a)*134:.0f}" r="6" fill="#ffe9a8"/>'
    b+=f'<polygon points="800,430 862,555 738,555" fill="none" stroke="#ffd27a" stroke-width="4"/><circle cx="800" cy="520" r="20" fill="#fff3c4"/>'+f'<circle cx="800" cy="520" r="120" fill="url(#g)"/>'
    b+=f'<rect y="740" width="{W}" height="160" fill="url(#fl)"/>'
    for i,y in enumerate((748,772,800)): b+=f'<rect x="{500-i*60}" y="{y}" width="{600+i*120}" height="{22+i*6}" fill="{["#d8bf86","#bfa26a","#a58a58"][i]}"/>'
    b+=f'<rect x="740" y="690" width="120" height="60" fill="#c9b080"/><circle cx="800" cy="680" r="26" fill="#fff3c4" opacity=".9"/>'
    b+=orbs(R,30,180,740,'#ffe9a8',2,4,.9)
    return svg(b,defs)

# ---------- 6. FROZEN MOUNTAINS ----------
def mountains():
    R=random.Random(6)
    defs=lg('sky',[(0,'#0e1d4a'),(.5,'#3f6fb0'),(1,'#cfe6f7')])+lg('au',[(0,'#7dffc8'),(1,'#b48bff')],1,0)
    b=f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'+stars(R,80,380)
    b+=f'<path d="M0,260 Q300,90 620,230 T1240,200 T{W},150 L{W},330 Q1000,250 700,330 T0,360Z" fill="url(#au)" opacity=".28"/>'
    b+=f'<path d="M0,200 Q400,40 800,170 T{W},110 L{W},230 Q1100,160 760,260 T0,290Z" fill="#8bffd0" opacity=".16"/>'
    b+=f'<circle cx="1280" cy="190" r="58" fill="#f4f8ff"/><circle cx="1262" cy="178" r="12" fill="#dbe6f4"/><circle cx="1300" cy="206" r="8" fill="#dbe6f4"/>'
    def peak(x,base,h,w,c1,c2):
        return f'<polygon points="{x-w},{base} {x},{base-h} {x+w},{base}" fill="{c1}"/><polygon points="{x},{base-h} {x+w},{base} {x+w*.25},{base} {x+w*.05},{base-h*.45}" fill="{c2}"/><polygon points="{x-w*.28},{base-h*.72} {x},{base-h} {x+w*.28},{base-h*.72} {x+w*.1},{base-h*.62} {x-w*.05},{base-h*.7} {x-w*.15},{base-h*.62}" fill="#fff"/>'
    b+=peak(300,640,360,320,'#6f8fb8','#4c6c98')+peak(800,660,470,400,'#7a9ac4','#5476a2')+peak(1300,650,400,340,'#6f8fb8','#4c6c98')+peak(40,700,280,260,'#5b7ba6','#3f5e8a')+peak(1560,700,300,260,'#5b7ba6','#3f5e8a')
    b+=f'<path d="M0,700 Q400,640 800,700 T{W},690 V{H} H0Z" fill="#e8f1fb"/>'
    for x in range(0,W,60): b+=pine(x+R.uniform(0,30),800+R.uniform(0,40),R.uniform(90,170),'#27455a')
    b+=f'<path d="M0,820 Q500,780 900,830 T{W},810 V{H} H0Z" fill="#f4f8ff"/><path d="M0,870 Q600,840 1100,880 T{W},860 V{H} H0Z" fill="#dce8f5"/>'
    b+=''.join(f'<circle cx="{R.uniform(0,W):.0f}" cy="{R.uniform(0,H):.0f}" r="{R.uniform(1.5,4):.1f}" fill="#fff" opacity="{R.uniform(.5,.95):.2f}"/>' for _ in range(120))
    return svg(b,defs)

# ---------- 7. ANCIENT BATTLEFIELD ----------
def battlefield():
    R=random.Random(7)
    defs=lg('sky',[(0,'#1a0f1e'),(.4,'#6b2a3a'),(.75,'#e0703f'),(1,'#ffb35a')])+rg('sun',[(0,'#ffe2a0',1),(.5,'#ff9a4a',.5),(1,'#ff6a3a',0)])
    b=f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'+glow('sun',800,580,420,'')+f'<circle cx="800" cy="580" r="70" fill="#ffe2a0"/>'
    for x,y,s in [(250,150,1.8),(700,90,1.5),(1250,170,1.9),(1050,300,1.1),(480,310,1.2)]: b+=cloud(x,y,s,'#3a1a2a',.8)
    b+=ridge(R,640,120,'#3a1a2e',30)+ridge(R,700,90,'#2a1224',26)
    # ruined tower
    b+=f'<path d="M170,780 L190,420 L220,450 L250,400 L275,440 L300,780Z" fill="#241020"/><path d="M1260,780 L1280,470 L1310,500 L1340,455 L1380,780Z" fill="#241020"/>'
    # banners & spears
    for x in range(120,1500,120):
        h=R.uniform(110,190);y=800+R.uniform(-10,30)
        b+=f'<line x1="{x}" y1="{y}" x2="{x+R.uniform(-14,14):.0f}" y2="{y-h:.0f}" stroke="#1a0c18" stroke-width="5"/><polygon points="{x},{y-h:.0f} {x+8},{y-h+22:.0f} {x-8},{y-h+22:.0f}" fill="#1a0c18"/>'
        if R.random()>.5: b+=f'<path d="M{x},{y-h+26:.0f} l50,10 l-50,26Z" fill="#8f2a3a"/>'
    # army silhouettes
    for x in range(40,1600,34):
        h=R.uniform(36,58);y=830+R.uniform(-4,6)
        b+=f'<rect x="{x}" y="{y-h:.0f}" width="12" height="{h:.0f}" fill="#12070f"/><circle cx="{x+6}" cy="{y-h-6:.0f}" r="7" fill="#12070f"/>'
    b+=f'<path d="M0,{H} V850 Q800,820 {W},855 V{H}Z" fill="#0c050b"/>'
    b+=f'<polygon points="760,850 800,760 830,850" fill="#ff8a3a" opacity=".35"/>'
    b+=''.join(f'<circle cx="{R.uniform(0,W):.0f}" cy="{R.uniform(300,850):.0f}" r="{R.uniform(1,3.2):.1f}" fill="#ffb35a" opacity="{R.uniform(.4,.9):.2f}"/>' for _ in range(70))
    return svg(b,defs)

# ---------- 8. PEACEFUL KINGDOM ----------
def peaceful():
    R=random.Random(8)
    defs=lg('sky',[(0,'#6fb7f0'),(.6,'#bfe3f5'),(1,'#fff3d0')])+rg('sun',[(0,'#fffbe0',1),(.5,'#fff0a8',.5),(1,'#fff0a8',0)])
    b=f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'+glow('sun',1250,170,300,'')+f'<circle cx="1250" cy="170" r="54" fill="#fffbe0"/>'
    for i,c in enumerate(['#ff9b9b','#ffd27a','#fff09a','#9be39b','#8bc8ff','#b79bff']):
        b+=f'<path d="M180,560 Q650,{110+i*14} 1120,560" fill="none" stroke="{c}" stroke-width="12" opacity=".38"/>'
    for x,y,s in [(220,150,1.6),(620,230,1.1),(980,110,1.3),(1400,300,1)]: b+=cloud(x,y,s)
    b+=ridge(R,560,120,'#9cc8b0',20,.9)+hills(R,640,80,'#79b873')
    b+=castle(800,690,1.25,'#efe6d6','#4a7bd0','#ff6b6b','#8bc8ff')
    b+=hills(R,730,60,'#5fa85a')+hills(R,810,50,'#4a9a4a')
    for i in range(10): b+=round_tree(70+i*165+R.uniform(-30,30),800+R.uniform(0,50),R.uniform(120,190),'#3e8a45','#6b4a2f')
    b+=f'<path d="M0,{H} V840 Q800,800 {W},845 V{H}Z" fill="#3a8a40"/>'
    b+=f'<path d="M720,{H} Q780,800 800,730 Q820,800 880,{H}Z" fill="#e8d9a8"/>'
    for _ in range(90):
        x,y=R.uniform(0,W),R.uniform(820,890);b+=f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{R.uniform(3,6):.1f}" fill="{R.choice(["#ff7aa8","#fff3a0","#ffffff","#ffb35a"])}"/>'
    for _ in range(7):
        x,y=R.uniform(100,1500),R.uniform(220,500);b+=f'<path d="M{x:.0f},{y:.0f} q8,-8 16,0 q8,-8 16,0" fill="none" stroke="#3a3a5a" stroke-width="2.5"/>'
    return svg(b,defs)

if __name__=='__main__':
    os.makedirs(OUT,exist_ok=True)
    for name,fn in [('kingdom',kingdom),('forest',forest),('library',library),('cave',cave),('temple',temple),('mountains',mountains),('battlefield',battlefield),('peaceful',peaceful)]:
        open(os.path.join(OUT,name+'.svg'),'w').write(fn());print('wrote',name+'.svg')
