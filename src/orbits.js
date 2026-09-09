export const TAU = 2 * Math.PI;
const RAD = Math.PI / 180;
export function solveKepler(M,e){
  let E = e < .8 ? M : (M < 0 ? -Math.PI : Math.PI);
  for(let k=0;k<40;k++){const step=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));E-=step;if(Math.abs(step)<1e-13)break;}
  return E;
}
// J2000 ecliptic coordinates, AU. The Sun occupies the focus, not the ellipse center.
export function pointOnOrbit(b,E){
  const x=b.a*(Math.cos(E)-b.e),y=b.a*Math.sqrt(1-b.e*b.e)*Math.sin(E);
  const w=b.argPeri*RAD,o=b.node*RAD,i=b.i*RAD;
  const cw=Math.cos(w),sw=Math.sin(w),co=Math.cos(o),so=Math.sin(o),ci=Math.cos(i),si=Math.sin(i);
  return [(cw*co-sw*so*ci)*x+(-sw*co-cw*so*ci)*y,(cw*so+sw*co*ci)*x+(-sw*so+cw*co*ci)*y,sw*si*x+cw*si*y];
}
export function positionAt(b,jd){
 const raw=(b.M+b.n*(jd-b.epoch))*RAD;
 const M=((raw+Math.PI)%TAU+TAU)%TAU-Math.PI;
 return pointOnOrbit(b,solveKepler(M,b.e));
}
export const dateToJulian=d=>d.getTime()/86400000+2440587.5;
export const julianToDate=jd=>new Date((jd-2440587.5)*86400000);
export const spinAngle=(elapsedDays,periodHours)=>elapsedDays*24/periodHours*TAU;
export const daysPerSecond=(mode,earthPeriod=365.256363004)=>mode==='day'?.99726968/5:mode==='year'?earthPeriod/3:earthPeriod/30;
export const distance=(a,b=[0,0,0])=>Math.hypot(...a.map((v,i)=>v-b[i]));
