import test from 'node:test';
import assert from 'node:assert/strict';
import {asteroidSurface} from '../src/asteroid.js';
test('illustrative surface is deterministic, finite and irregular',()=>{
 const points=Array.from({length:100},(_,k)=>{const a=k*Math.PI*2/100;return asteroidSurface(Math.cos(a),Math.sin(a),0)});
 assert.deepEqual(asteroidSurface(1,0,0),asteroidSurface(1,0,0));
 assert.ok(points.flat().every(Number.isFinite));
 const radii=points.map(p=>Math.hypot(...p));
 assert.ok(Math.min(...radii)>.5 && Math.max(...radii)<1.6);
 assert.ok(Math.max(...radii)-Math.min(...radii)>.2);
});
