import urllib.request, urllib.parse, json, pathlib, re, datetime
root=pathlib.Path(__file__).resolve().parents[1]
raw=root/'public/data/raw';raw.mkdir(exist_ok=True)
bodies=[('mercury','199'),('venus','299'),('earth','399'),('mars','499'),('jupiter','599'),('saturn','699'),('uranus','799'),('neptune','899'),('gartenberg','147704;')]
result={'epochJD':2461292.5,'epochDate':'2026-09-09','retrieved':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':'NASA/JPL Horizons','bodies':[]}
for name,cmd in bodies:
 params={'format':'json','COMMAND':f"'{cmd}'",'EPHEM_TYPE':"'ELEMENTS'",'CENTER':"'500@10'",'START_TIME':"'2026-09-09'",'STOP_TIME':"'2026-09-10'",'STEP_SIZE':"'1 d'",'OUT_UNITS':"'AU-D'",'REF_PLANE':"'ECLIPTIC'",'REF_SYSTEM':"'J2000'",'CSV_FORMAT':"'YES'"}
 url='https://ssd.jpl.nasa.gov/api/horizons.api?'+urllib.parse.urlencode(params)
 data=json.load(urllib.request.urlopen(url));s=data.get('result','')
 if '$$SOE' not in s: raise RuntimeError(str(data)[:400])
 (raw/(name+'-elements.txt')).write_text(s)
 line=s.split('$$SOE')[1].split('$$EOE')[0].strip().splitlines()[0];v=[x.strip() for x in line.split(',')]
 body={'id':name,'name':'147704 Gartenberg' if name=='gartenberg' else name.title(),'epoch':float(v[0]),'e':float(v[2]),'q':float(v[3]),'i':float(v[4]),'node':float(v[5]),'argPeri':float(v[6]),'tp':float(v[7]),'n':float(v[8]),'M':float(v[9]),'trueAnomaly':float(v[10]),'a':float(v[11]),'Q':float(v[12]),'period':float(v[13]),'sourceUrl':url}
 params['EPHEM_TYPE']="'VECTORS'";params['VEC_TABLE']="'2'"
 vec=json.load(urllib.request.urlopen('https://ssd.jpl.nasa.gov/api/horizons.api?'+urllib.parse.urlencode(params)))['result'];(raw/(name+'-vectors.txt')).write_text(vec)
 vl=vec.split('$$SOE')[1].split('$$EOE')[0].strip().splitlines()[0];vals=[x.strip() for x in vl.split(',')];body['referencePosition']=[float(x) for x in vals[2:5]]
 result['bodies'].append(body)
 print(name,body['a'],body['period'],body['i'],flush=True)
result['epochJD']=result['bodies'][0]['epoch']
(root/'public/data/orbits.json').write_text(json.dumps(result,indent=2))
sb=json.load(urllib.request.urlopen('https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=147704&phys-par=true&discovery=true&full-prec=true'))
(root/'public/data/sbdb.json').write_text(json.dumps(sb,indent=2))
