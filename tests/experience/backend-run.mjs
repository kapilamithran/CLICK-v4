// Run the existing Deno harness under Node 24 when Deno is unavailable.
import {registerHooks} from 'node:module';
import {readFile} from 'node:fs/promises';
const tests=[];
globalThis.Deno={env:{get:k=>process.env[k],set:(k,v)=>process.env[k]=v},readTextFile:p=>readFile(p,'utf8'),test:(name,fn)=>tests.push({name,fn}),serve:()=>{}};
registerHooks({resolve(specifier,context,next){if(specifier==='https://esm.sh/@supabase/supabase-js@2')return{url:new URL('../backend/fake-supabase.ts',import.meta.url).href,shortCircuit:true};return next(specifier,context);}});
await import('../backend/unified.test.ts');
await import('./mastery.test.ts');
let failed=0;for(const {name,fn} of tests){try{await fn();console.log('PASS',name);}catch(e){failed++;console.error('FAIL',name,e);}}
console.log(`${tests.length-failed} passed; ${failed} failed`);if(failed)process.exitCode=1;
