// An artistic surface, not an inversion of observed photometry.
export function asteroidSurface(x,y,z){
 const n=Math.hypot(x,y,z);x/=n;y/=n;z/=n;
 let r=1+.09*Math.sin(x*7+y*3)*Math.cos(z*6-y*2)+.045*Math.sin(x*23+y*17+z*19);
 for(const [cx,cy,cz,size,depth] of [[.3,.5,.812,.22,.12],[-.8,.2,.566,.3,.15],[.5,-.8,.332,.17,.09]]){
  const d=Math.hypot(x-cx,y-cy,z-cz)/size;
  r-=depth*Math.exp(-d*d*2);r+=.025*Math.exp(-(((d-1)*5)**2));
 }
 return [x*r*1.18,y*r*.83,z*r*.94];
}
