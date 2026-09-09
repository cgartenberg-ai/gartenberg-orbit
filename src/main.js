import './style.css';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {positionAt,pointOnOrbit,spinAngle,daysPerSecond,julianToDate,distance,TAU} from './orbits.js';
const $=id=>document.getElementById(id);
const GOLD=new THREE.Color('#e3be7d');
const vec=(v)=>new THREE.Vector3(v[0],v[2],-v[1]);
const physical={
 mercury:{color:'#aba5a0',r:.72,spin:1407.5094,tilt:.034,kind:'TERRESTRIAL PLANET'},
 venus:{color:'#d5b991',r:1.0,spin:-5832.4436,tilt:2.7,kind:'TERRESTRIAL PLANET'},
 earth:{color:'#70a8ce',r:1.05,spin:23.93447232,tilt:23.439,kind:'OUR HOME PLANET'},
 mars:{color:'#c78667',r:.88,spin:24.622962,tilt:25.19,kind:'TERRESTRIAL PLANET'},
 jupiter:{color:'#d6b693',r:1.9,spin:9.9249197,tilt:3.13,kind:'GAS GIANT'},
 saturn:{color:'#d4c299',r:1.6,spin:10.65622,tilt:26.73,kind:'GAS GIANT'},
 uranus:{color:'#9ccbd2',r:1.35,spin:-17.24,tilt:82.77,kind:'ICE GIANT'},
 neptune:{color:'#668bbe',r:1.3,spin:16.11,tilt:28.32,kind:'ICE GIANT'},
 gartenberg:{color:'#edc98a',r:.8,spin:null,tilt:0,kind:'MAIN-BELT ASTEROID'}
};
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,247,225,1)');g.addColorStop(.06,'rgba(255,221,169,.85)');g.addColorStop(.17,'rgba(241,164,86,.2)');g.addColorStop(.4,'rgba(212,125,62,.04)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
function planetMaterial(color,bands=false){
 return new THREE.ShaderMaterial({uniforms:{base:{value:new THREE.Color(color)},bands:{value:bands?1:0},sunDirection:{value:new THREE.Vector3(1,0,0)}},vertexShader:`varying vec3 normalWorld;varying vec2 tex;void main(){tex=uv;normalWorld=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform vec3 base;uniform float bands;uniform vec3 sunDirection;varying vec3 normalWorld;varying vec2 tex;void main(){float noise=sin(tex.x*61.+sin(tex.y*33.)*3.)*sin(tex.y*51.);float stripe=sin(tex.y*95.+sin(tex.x*18.)*.5);float surface=mix(.94+noise*.06,.82+stripe*.14+noise*.05,bands);float light=.17+.83*max(0.,dot(normalize(normalWorld),sunDirection));gl_FragColor=vec4(base*surface*light,1.);}`});
}
async function boot(){
 const response=await fetch('./data/orbits.json');if(!response.ok)throw Error('Could not load orbital data');const data=await response.json();
 const bodies=data.bodies;const asteroid=bodies.find(b=>b.id==='gartenberg'),earth=bodies.find(b=>b.id==='earth');
 let jd=data.epochJD,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,mode='day',direction=1,selected=asteroid,following=false,view='inner';
 const stage=$('universe'),labels=$('labels');let width=stage.clientWidth,height=stage.clientHeight;
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(width,height);renderer.setClearColor(0x080c11,1);renderer.outputColorSpace=THREE.SRGBColorSpace;stage.append(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(43,width/height,.01,1500);camera.position.set(4.0,6.6,8.9);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.065;controls.minDistance=2;controls.maxDistance=150;controls.enablePan=false;controls.maxPolarAngle=Math.PI*.94;controls.rotateSpeed=.5;controls.zoomSpeed=.75;
 const world=new THREE.Group();scene.add(world);
 // Ecliptic reference: understated 1-AU rings, separate from actual eccentric paths.
 const grid=new THREE.Group();world.add(grid);
 for(let r=1;r<=6;r++){const points=[];for(let k=0;k<=180;k++){const t=k/180*TAU;points.push(new THREE.Vector3(r*Math.cos(t),-.016,r*Math.sin(t)))}const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x647287,transparent:true,opacity:.07}));grid.add(ring)}
 let seed=147704;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const starsPos=[],starsColor=[];for(let k=0;k<3400;k++){const a=rand()*TAU,z=rand()*2-1,r=Math.sqrt(1-z*z),rad=140+rand()*160;starsPos.push(rad*r*Math.cos(a),rad*z,rad*r*Math.sin(a));const v=.22+rand()*.55;starsColor.push(v*.86,v*.92,v)}
 const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starsPos,3));starGeo.setAttribute('color',new THREE.Float32BufferAttribute(starsColor,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({size:.12,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));scene.add(stars);
 const glow=glowTexture();const sun=new THREE.Mesh(new THREE.SphereGeometry(.07,40,24),new THREE.MeshBasicMaterial({color:0xffe8b7}));world.add(sun);const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:0xffc77e,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));halo.scale.setScalar(1.75);world.add(halo);
 const sunlight=new THREE.PointLight(0xfff0d9,2.6,0,0);world.add(sunlight);scene.add(new THREE.AmbientLight(0xa4b6d0,.35));
 const texture=await new THREE.TextureLoader().loadAsync('./textures/earth.png').catch(()=>null);if(texture){texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;}
 const objects=new Map();const sphere=new THREE.SphereGeometry(1,40,28);
 for(const b of bodies){const ph=physical[b.id];const pts=[];for(let k=0;k<=512;k++)pts.push(vec(pointOnOrbit(b,k/512*TAU)));const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:ph.color,transparent:true,opacity:b.id==='gartenberg'?.75:.22}));world.add(line);
  const group=new THREE.Group();world.add(group);const tilt=new THREE.Group();tilt.rotation.z=ph.tilt*Math.PI/180;group.add(tilt);
  let mesh;if(b.id==='gartenberg'){mesh=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),new THREE.MeshBasicMaterial({color:ph.color}));}else if(b.id==='earth'){mesh=new THREE.Mesh(sphere,new THREE.MeshPhongMaterial({map:texture,color:texture?0xffffff:0x548cbf,shininess:12,specular:0x284763}));}else{mesh=new THREE.Mesh(sphere,planetMaterial(ph.color,['jupiter','saturn','uranus','neptune'].includes(b.id)));}
  tilt.add(mesh);
  if(b.id==='saturn'){const ring=new THREE.Mesh(new THREE.RingGeometry(1.35,2.25,80),new THREE.MeshBasicMaterial({color:0xcabb96,side:THREE.DoubleSide,transparent:true,opacity:.55}));ring.rotation.x=Math.PI/2;tilt.add(ring);}
  const label=document.createElement('button');label.className='body-label'+(b.id==='gartenberg'?' asteroid selected':'');label.textContent=b.name;label.setAttribute('aria-label',`Inspect ${b.name}`);label.addEventListener('click',()=>select(b));labels.append(label);
  objects.set(b.id,{b,group,mesh,tilt,line,label,ph});
 }
 const sunLabel=document.createElement('span');sunLabel.className='body-label';sunLabel.textContent='Sun';labels.append(sunLabel);
 const targetRing=new THREE.Mesh(new THREE.RingGeometry(.065,.069,60),new THREE.MeshBasicMaterial({color:GOLD,transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));world.add(targetRing);
 const targetGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:GOLD,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.55}));world.add(targetGlow);
 const trailCount=110;const trailGeo=new THREE.BufferGeometry();trailGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(trailCount*3),3));const trailColor=[];for(let k=0;k<trailCount;k++){const a=(k/(trailCount-1))**1.8;trailColor.push(GOLD.r*a,GOLD.g*a,GOLD.b*a)}trailGeo.setAttribute('color',new THREE.Float32BufferAttribute(trailColor,3));const trail=new THREE.Line(trailGeo,new THREE.LineBasicMaterial({vertexColors:true,blending:THREE.AdditiveBlending,transparent:true,opacity:.95}));trail.frustumCulled=false;world.add(trail);
 // A separate enlarged Earth makes the shared spin/orbit clock readable at system scale.
 const earthRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});earthRenderer.setPixelRatio(Math.min(devicePixelRatio,2));earthRenderer.setSize(100,100);$('earth-globe').append(earthRenderer.domElement);
 const earthScene=new THREE.Scene(),earthCamera=new THREE.PerspectiveCamera(32,1,.1,20);earthCamera.position.set(0,.3,4.8);earthCamera.lookAt(0,0,0);
 const earthTilt=new THREE.Group();earthTilt.rotation.z=-23.439*Math.PI/180;earthScene.add(earthTilt);const earthMesh=new THREE.Mesh(sphere,new THREE.MeshPhongMaterial({map:texture,color:texture?0xffffff:0x548cbf,shininess:20}));earthTilt.add(earthMesh);earthScene.add(new THREE.AmbientLight(0x779cce,.8));const insetLight=new THREE.DirectionalLight(0xffefdb,2.5);insetLight.position.set(-3,2,4);earthScene.add(insetLight);
 const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.035,36,24),new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying vec3 n;varying vec3 v;void main(){float f=pow(1.-max(dot(n,v),0.),3.);gl_FragColor=vec4(.25,.52,.9,f*.45);}`}));earthScene.add(atmosphere);
 const ndc=new THREE.Vector3();let transition=null,last=performance.now(),lastInfo=0;const DAY_RANGE=7305;
 function resize(){width=stage.clientWidth;height=stage.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}
 new ResizeObserver(resize).observe(stage);
 function stopFollow(){following=false;$('follow').setAttribute('aria-pressed','false');$('follow').textContent='Follow ↗';}
 function setView(next){view=next;stopFollow();document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});const mobile=width<600;const p=next==='solar'?new THREE.Vector3(16,44,55):next==='top'?new THREE.Vector3(0, mobile?12.5:9.8,.001):new THREE.Vector3(mobile?3:4,mobile?8.5:6.6,mobile?11.5:8.9);transition={start:performance.now(),from:camera.position.clone(),to:p,fromTarget:controls.target.clone(),toTarget:new THREE.Vector3()};}
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
 controls.addEventListener('start',()=>{transition=null});
 function select(b){selected=b;objects.forEach(o=>o.label.classList.toggle('selected',o.b.id===b.id));$('focus-name').textContent=b.name;$('focus-kind').textContent=physical[b.id].kind;$('inclination').textContent=b.i.toFixed(2)+'°';$('focus-period').textContent=b.period<365?b.period.toFixed(1)+' days':(b.period/365.25).toFixed(2)+' years';$('elements-open').textContent=b.id==='gartenberg'?'Explore the orbital data ↗':'Gartenberg’s orbital data ↗';updateInfo();}
 $('follow').addEventListener('click',()=>{following=!following;$('follow').setAttribute('aria-pressed',String(following));$('follow').textContent=following?'Following ✓':'Follow ↗';if(following){const target=objects.get(selected.id).group.position.clone();const delta=camera.position.clone().sub(controls.target);transition={start:performance.now(),from:camera.position.clone(),to:target.clone().add(delta),fromTarget:controls.target.clone(),toTarget:target};}});
 function syncPlay(){ $('play').textContent=playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',playing?'Pause simulation':'Play simulation'); }
 function togglePlay(){playing=!playing;syncPlay();}
 $('play').addEventListener('click',togglePlay);syncPlay();
 $('reverse').addEventListener('click',()=>{direction*=-1;$('reverse').setAttribute('aria-pressed',String(direction<0));});
 $('speed').addEventListener('change',()=>{mode=$('speed').value;updateSpeed();});
 function updateSpeed(){const rate=daysPerSecond(mode,earth.period);$('speed-description').textContent=Math.round(rate*86400).toLocaleString()+'× real time';$('clock-caption').textContent=mode==='day'?'One spin. Five seconds.':mode==='year'?'One orbit. Five seconds.':'One orbit. Thirty seconds.';}
 $('timeline').addEventListener('input',()=>{jd=data.epochJD+Number($('timeline').value);updateInfo()});
 $('reset').addEventListener('click',()=>{jd=data.epochJD;direction=1;$('reverse').setAttribute('aria-pressed','false');updateInfo();});
 document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON','A'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();togglePlay();}if(e.key==='Escape')stopFollow();});
 const dateFormat=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'});
 function updateInfo(){const ap=positionAt(asteroid,jd),ep=positionAt(earth,jd);$('distance-stat').textContent=distance(ap).toFixed(2);$('earth-distance').textContent=distance(positionAt(selected,jd),ep).toFixed(2)+' AU';$('date').textContent=dateFormat.format(julianToDate(jd)).toUpperCase();$('timeline').value=jd-data.epochJD;}
 $('period-stat').textContent=(asteroid.period/365.25).toFixed(2);
 const elements=[['Semimajor axis · a',asteroid.a.toFixed(8)+' AU'],['Eccentricity · e',asteroid.e.toFixed(8)],['Inclination · i',asteroid.i.toFixed(6)+'°'],['Ascending node · Ω',asteroid.node.toFixed(6)+'°'],['Argument of perihelion · ω',asteroid.argPeri.toFixed(6)+'°'],['Mean anomaly at epoch · M',asteroid.M.toFixed(6)+'°'],['Perihelion · nearest the Sun',asteroid.q.toFixed(6)+' AU'],['Aphelion · farthest from the Sun',asteroid.Q.toFixed(6)+' AU'],['Orbital period',asteroid.period.toFixed(4)+' days'],['Mean motion',asteroid.n.toFixed(8)+'° / day'],['Perihelion passage · JD',asteroid.tp.toFixed(6)],['Reference epoch · JD',asteroid.epoch.toFixed(1)]];
 for(const [key,val] of elements){const row=document.createElement('div');const dt=document.createElement('dt');dt.textContent=key;const dd=document.createElement('dd');dd.textContent=val;row.append(dt,dd);$('orbital-elements').append(row)}
 for(const [button,id] of [['about-open','about-dialog'],['elements-open','elements-dialog']]){$(button).addEventListener('click',()=>$(id).showModal());const d=$(id);d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});}
 function positionLabel(label,position,radius,occupied,priority=false){ndc.copy(position).project(camera);let x=(ndc.x*.5+.5)*width+radius+5,y=(-ndc.y*.5+.5)*height-10;const w=label.offsetWidth||100,h=25;let visible=ndc.z>-1&&ndc.z<1&&x>-w&&x<width-20&&y>65&&y<height-204;
 if(priority&&ndc.z>-1&&ndc.z<1){visible=true;x=THREE.MathUtils.clamp(x,12,width-w-12);y=THREE.MathUtils.clamp(y,70,height-214)}
 if(visible){for(let tries=0;tries<4;tries++){if(occupied.some(r=>x<r.x+r.w&&x+w>r.x&&y<r.y+r.h&&y+h>r.y)){y+=22}else break;}occupied.push({x,y,w,h});label.style.transform=`translate(${x}px,${y}px)`;}
 label.hidden=!visible;
 }
 function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.08);last=now;if(document.hidden)return;
  if(playing&&!document.querySelector('dialog[open]')){jd+=dt*daysPerSecond(mode,earth.period)*direction;if(jd>data.epochJD+DAY_RANGE)jd=data.epochJD;if(jd<data.epochJD)jd=data.epochJD+DAY_RANGE;}
  if(transition){const t=THREE.MathUtils.clamp((now-transition.start)/1300,0,1),a=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,a);controls.target.lerpVectors(transition.fromTarget,transition.toTarget,a);if(t===1)transition=null;}
  const elapsed=jd-data.epochJD;for(const o of objects.values()){o.group.position.copy(vec(positionAt(o.b,jd)));const worldPerPixel=2*Math.tan(camera.fov*Math.PI/360)*camera.position.distanceTo(o.group.position)/height;const r=Math.max(.008,worldPerPixel*(o.ph.r*4.0));o.group.scale.setScalar(r);if(o.ph.spin)o.mesh.rotation.y=spinAngle(elapsed,o.ph.spin)%TAU;if(o.mesh.material.uniforms?.sunDirection)o.mesh.material.uniforms.sunDirection.value.copy(o.group.position).negate().normalize();o.line.material.opacity=o.b.id===selected.id?.7:o.b.id==='gartenberg'?.55:view==='solar'?.27:.2;}
  if(following&&!transition){const target=objects.get(selected.id).group.position;const delta=target.clone().sub(controls.target);camera.position.add(delta);controls.target.copy(target);}
  controls.update();
  const aobj=objects.get('gartenberg');targetRing.position.copy(aobj.group.position);targetRing.quaternion.copy(camera.quaternion);const targetScale=camera.position.distanceTo(aobj.group.position)/10;targetRing.scale.setScalar(targetScale);targetGlow.position.copy(aobj.group.position);targetGlow.scale.setScalar(.3*targetScale);
  for(let k=0;k<trailCount;k++){const p=vec(positionAt(asteroid,jd-(1-k/(trailCount-1))*asteroid.period*.14*direction));trailGeo.attributes.position.setXYZ(k,p.x,p.y,p.z)}trailGeo.attributes.position.needsUpdate=true;
  earthMesh.rotation.y=spinAngle(elapsed,physical.earth.spin)%TAU;renderer.render(scene,camera);earthRenderer.render(earthScene,earthCamera);
  const occupied=[];positionLabel(aobj.label,aobj.group.position,7,occupied,true);for(const o of [...objects.values()].sort((a,b)=>(a.b.id==='earth'?-1:b.b.id==='earth'?1:0))){if(o===aobj)continue;positionLabel(o.label,o.group.position,6,occupied)}positionLabel(sunLabel,new THREE.Vector3(),10,occupied);
  if(now-lastInfo>160){updateInfo();lastInfo=now;}
 }
 updateSpeed();updateInfo();if(width<600)camera.position.set(3,8.5,11.5);controls.update();requestAnimationFrame(frame);$('loading').classList.add('done');setTimeout(()=>$('loading').hidden=true,600);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('render-error').hidden=false;});
}
boot().catch(error=>{console.error(error);$('loading').hidden=true;$('render-error').hidden=false;});
