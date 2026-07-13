import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore } from '../data/store';
import { RELATION_COLORS, getNodeColor } from '../utils/graphStyles';
import type { Word, Relationship } from '../types';

// ── Star texture ──
function mkStar(c:string,s:number):THREE.Texture{
  const w=128;const cv=document.createElement('canvas');cv.width=w;cv.height=w;
  const ctx=cv.getContext('2d')!;const cx=w/2,cy=w/2;
  const rgb=[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
  // Soft glow
  const g1=ctx.createRadialGradient(cx,cy,w*0.03,cx,cy,w*0.42);
  g1.addColorStop(0,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.6)`);
  g1.addColorStop(0.3,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.1)`);g1.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g1;ctx.fillRect(0,0,w,w);
  // Diffraction spikes
  const sl=w*0.4*s;
  for(let a=0;a<Math.PI*2;a+=Math.PI/2){
    const gr=ctx.createLinearGradient(cx,cy,cx+Math.cos(a)*sl,cy+Math.sin(a)*sl);
    gr.addColorStop(0,'rgba(255,255,255,0.9)');gr.addColorStop(0.12,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`);
    gr.addColorStop(0.7,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.04)`);gr.addColorStop(1,'rgba(0,0,0,0)');
    ctx.save();ctx.translate(cx,cy);ctx.rotate(a);
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,-w*0.005);ctx.lineTo(sl*0.8,0);ctx.lineTo(0,w*0.005);ctx.fill();ctx.restore();
  }
  // Bright core
  const core=ctx.createRadialGradient(cx,cy,0,cx,cy,w*0.04);
  core.addColorStop(0,'rgba(255,255,255,1)');core.addColorStop(0.3,`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.9)`);core.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=core;ctx.fillRect(0,0,w,w);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const tc:Record<string,THREE.Texture>={};
function getTex(c:string,s:number):THREE.Texture{const k=`${c}-${s}`;if(!tc[k])tc[k]=mkStar(c,s);return tc[k];}
function getColor(pos:string):string{return getNodeColor(pos);}

// ── 3D Galaxy layout ──
interface Orbiter{id:string;center:THREE.Vector3;angle:number;radius:number;tilt:THREE.Quaternion}
interface Pos{id:string;x:number;y:number;z:number}

function useGalaxyLayout(words:Word[],rels:Relationship[],focusId:string|null){
  const [posMap,setPosMap]=useState<Map<string,Pos>>(new Map());
  const orbitersRef=useRef<Map<string,Orbiter>>(new Map());
  const timeRef=useRef(0);

  // Build layout once
  useEffect(()=>{
    const roots=words.filter(w=>w.tags.includes('词根节点'));
    const pref=words.filter(w=>w.tags.includes('前缀节点'));
    const reg=words.filter(w=>!w.tags.includes('词根节点')&&!w.tags.includes('前缀节点'));
    const ri=new Set(reg.map(w=>w.id));
    const rw=new Map<string,string[]>();roots.forEach(r=>rw.set(r.id,[]));
    const at=new Set<string>();
    rels.filter(r=>r.type==='root-share').forEach(r=>{
      const rid=roots.find(x=>x.id===r.sourceId||x.id===r.targetId)?.id;
      const wid=ri.has(r.sourceId)?r.sourceId:ri.has(r.targetId)?r.targetId:null;
      if(rid&&wid){rw.get(rid)!.push(wid);at.add(wid);}
    });

    const orbiters=new Map<string,Orbiter>();
    const positions=new Map<string,Pos>();

    // Place roots in 3D golden-angle spiral
    roots.forEach((r,i)=>{
      const a=i*2.4, d=5+Math.sqrt(i)*2.5;
      const x=Math.cos(a)*d, y=Math.sin(a)*d*0.6, z=(Math.random()-0.5)*6;
      positions.set(r.id,{id:r.id,x,y,z});
    });

    // Place words in 3D tilted orbits around their roots
    roots.forEach(r=>{
      const ws=rw.get(r.id)||[];const rp=positions.get(r.id)!;
      const tilt=new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize(),
        (Math.random()-0.5)*Math.PI*0.7
      );
      ws.forEach((wid,j)=>{
        const orbR=2+ws.length*0.15, orbA=(j/ws.length)*Math.PI*2+Math.random()*0.3;
        orbiters.set(wid,{id:wid,center:new THREE.Vector3(rp.x,rp.y,rp.z),angle:orbA,radius:orbR,tilt:tilt.clone()});
        const lp=new THREE.Vector3(Math.cos(orbA)*orbR,Math.sin(orbA)*orbR,0).applyQuaternion(tilt).add(new THREE.Vector3(rp.x,rp.y,rp.z));
        positions.set(wid,{id:wid,x:lp.x,y:lp.y,z:lp.z});
      });
    });

    // Orphans in scattered back layer
    const orp=reg.filter(w=>!at.has(w.id));
    orp.forEach((w,i)=>{
      const a=Math.PI+i*0.45, d=9+i*0.6;
      positions.set(w.id,{id:w.id,x:Math.cos(a)*d,y:Math.sin(a)*d*0.4-2,z:(Math.random()-0.5)*8});
    });

    // Prefixes near their connected words
    pref.forEach(p=>{
      const cn=rels.filter(r=>r.type==='prefix-share'&&(r.sourceId===p.id||r.targetId===p.id));
      if(cn.length>0){
        const wid=cn[0].sourceId===p.id?cn[0].targetId:cn[0].sourceId;
        const wp=positions.get(wid);if(wp)positions.set(p.id,{id:p.id,x:wp.x+1.3,y:wp.y+0.5,z:wp.z});
      }else{positions.set(p.id,{id:p.id,x:(Math.random()-0.5)*4,y:(Math.random()-0.5)*4,z:(Math.random()-0.5)*3});}
    });

    orbitersRef.current=orbiters;
    setPosMap(positions);
  },[words.length, rels.length]);

  // Animate orbits
  useFrame((_,delta)=>{
    const orb=orbitersRef.current;
    if(orb.size===0)return;
    timeRef.current+=delta*0.03;
    setPosMap(prev=>{
      const next=new Map(prev);
      orb.forEach((o,id)=>{
        const a=o.angle+timeRef.current*(0.8+o.radius*0.1);
        const lp=new THREE.Vector3(Math.cos(a)*o.radius,Math.sin(a)*o.radius,0).applyQuaternion(o.tilt).add(o.center);
        next.set(id,{id,x:lp.x,y:lp.y,z:lp.z});
      });
      return next;
    });
  });

  // Focus: snap neighbors, remove from orbiters
  useEffect(()=>{
    if(!focusId||posMap.size===0)return;
    const orb=orbitersRef.current;
    // Remove focused word and its neighbors from orbiters so they stay put
    const nids=new Set<string>();rels.forEach(r=>{if(r.sourceId===focusId)nids.add(r.targetId);if(r.targetId===focusId)nids.add(r.sourceId);});
    orb.delete(focusId);
    nids.forEach(id=>orb.delete(id));
    setPosMap(prev=>{
      const next=new Map(prev);
      const c=next.get(focusId);if(!c)return next;
      const nb=Array.from(nids);
      nb.forEach((nid,i)=>{
        const a=(i/nb.length)*Math.PI*2;
        next.set(nid,{id:nid,x:c.x+Math.cos(a)*3.5,y:c.y+Math.sin(a)*3.5,z:c.z+(Math.random()-0.5)*1.5});
      });
      return next;
    });
  },[focusId]);

  return {posMap,orbitersRef};
}

// ── Star node ──
function StarNode({t,word,sel,ic,inn,hf,onTap}:{t:{x:number;y:number;z:number};word:Word;sel:boolean;ic:boolean;inn:boolean;hf:boolean;onTap:(id:string)=>void}){
  const sr=useRef<THREE.Sprite>(null!);const hr=useRef<THREE.Group>(null!);
  const cr=useRef(new THREE.Vector3(t.x,t.y,t.z));
  const ir=word.tags.includes('词根节点');const ip=word.tags.includes('前缀节点');
  const col=ir?'#c4923a':ip?'#7b5ea7':getColor(word.meanings[0]?.partOfSpeech||'');
  const out=hf&&!ic&&!inn;const big=sel||ic;
  const conns=useStore.getState().relationships.filter(r=>r.sourceId===word.id||r.targetId===word.id).length;
  const baseSize=ir?2.0:ip?1.6:0.9+Math.min(conns*0.15,1.0);
  const ss=big?baseSize*1.4:inn?baseSize*1.2:baseSize;
  const sc=big?1.5:inn?1.1:0.8;
  useFrame(()=>{cr.current.lerp(new THREE.Vector3(t.x,t.y,t.z),0.15);if(sr.current)sr.current.position.copy(cr.current);if(hr.current)hr.current.position.copy(cr.current);});
  return (<group>
    <sprite ref={sr} scale={[ss,ss,1]} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onTap(word.id);}}>
      <spriteMaterial map={getTex(col,sc)} transparent depthWrite={false} blending={THREE.NormalBlending} opacity={big?1:inn?0.85:out?0.35:0.65}/>
    </sprite>
    <group ref={hr}><Html position={[0,0,0]} center style={{pointerEvents:'none'}}>
      <div style={{color:big?'#1a1a2e':ir?'#8a5a20':ip?'#5a3e80':out?'#bbb':'#5a5048',fontSize:big?18:inn?15:ir?12:11,fontFamily:'Georgia,Noto Serif SC,PingFang SC,serif',fontWeight:big?700:inn?600:ir?500:400,textShadow:'0 0 4px rgba(255,255,255,0.6)',whiteSpace:'nowrap',letterSpacing:'0.02em',opacity:out?0.35:1}}>{word.word}</div>
    </Html></group>
  </group>);
}

// ── Vine: bezier arc ──
function EdgeBeam({a,b,color,focused}:{a:{x:number;y:number;z:number};b:{x:number;y:number;z:number};color:string;focused:boolean}){
  const ca=useRef(new THREE.Vector3(a.x,a.y,a.z));const cb=useRef(new THREE.Vector3(b.x,b.y,b.z));
  const go=useRef(new THREE.BufferGeometry());const gm=useRef(new THREE.BufferGeometry());const gc=useRef(new THREE.BufferGeometry());
  const mo=useMemo(()=>new THREE.LineBasicMaterial({color,transparent:true,opacity:focused?0.25:0.10,depthWrite:false,blending:THREE.NormalBlending}),[color,focused]);
  const mm=useMemo(()=>new THREE.LineBasicMaterial({color,transparent:true,opacity:focused?0.55:0.25,depthWrite:false,blending:THREE.NormalBlending}),[color,focused]);
  const mc=useMemo(()=>new THREE.LineBasicMaterial({color,transparent:true,opacity:focused?1.0:0.42,depthWrite:false,blending:THREE.NormalBlending}),[color,focused]);
  useFrame(()=>{ca.current.lerp(new THREE.Vector3(a.x,a.y,a.z),0.15);cb.current.lerp(new THREE.Vector3(b.x,b.y,b.z),0.15);const pa=ca.current,pb=cb.current;const pts=new THREE.QuadraticBezierCurve3(pa.clone(),new THREE.Vector3((pa.x+pb.x)/2,(pa.y+pb.y)/2+1.2,(pa.z+pb.z)/2),pb.clone()).getPoints(30);go.current.setFromPoints(pts);gm.current.setFromPoints(pts);gc.current.setFromPoints(pts);});
  return <group><primitive object={new THREE.Line(go.current,mo)}/><primitive object={new THREE.Line(gm.current,mm)}/><primitive object={new THREE.Line(gc.current,mc)}/></group>;
}

// ── Subtle dust motes ──
function DustMotes(){
  const g=useMemo(()=>{const b=new THREE.BufferGeometry();const n=800,p=new Float32Array(n*3);for(let i=0;i<n;i++){p[i*3]=(Math.random()-0.5)*70;p[i*3+1]=(Math.random()-0.5)*50;p[i*3+2]=(Math.random()-0.5)*30;}b.setAttribute('position',new THREE.BufferAttribute(p,3));return b;},[]);
  return <points geometry={g}><pointsMaterial size={0.04} color='#c8b898' transparent opacity={0.4} depthWrite={false}/></points>;
}

// ── Scene ──
function Scene(){
  const {words,relationships,selectedWordId,selectWord}=useStore();
  const [fid,setFid]=useState<string|null>(null);
  const {posMap:pm}=useGalaxyLayout(words,relationships,fid);
  const {camera}=useThree();
  useEffect(()=>{camera.position.set(8,5,18);camera.lookAt(0,0,0);},[]);
  useEffect(()=>{if(selectedWordId)setFid(selectedWordId);},[selectedWordId]);
  const tap=useCallback((id:string)=>{if(fid===id){selectWord(id);}else{setFid(id);selectWord(id);}},[fid,selectWord]);
  const bgTap=useCallback(()=>{setFid(null);selectWord(null);},[selectWord]);
  const fn=useMemo(()=>{if(!fid)return new Set<string>();const s=new Set<string>();relationships.forEach(r=>{if(r.sourceId===fid)s.add(r.targetId);if(r.targetId===fid)s.add(r.sourceId);});return s;},[fid]);
  const fe=useMemo(()=>{if(!fid)return new Set<string>();const s=new Set<string>();relationships.forEach(r=>{if(r.sourceId===fid||r.targetId===fid)s.add(r.id);});return s;},[fid,relationships]);
  const cr=useRef<any>(null);const ct=useRef(new THREE.Vector3(0,0,0));const cd=useRef(18);
  useEffect(()=>{cd.current=fid?12:18;if(fid&&pm.has(fid)){const p=pm.get(fid)!;const d=new THREE.Vector3();camera.getWorldDirection(d);const crv=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,1,0)).normalize();ct.current.set(p.x+crv.x*3.5,p.y,p.z);}else{ct.current.set(0,0,0);}},[fid]);
  useFrame(()=>{if(cr.current){const tgt=cr.current.target as THREE.Vector3;if(tgt.distanceTo(ct.current)>0.05){tgt.lerp(ct.current,0.12);const dd=cr.current.getDistance(),nd=dd+(cd.current-dd)*0.12;const d=new THREE.Vector3();camera.getWorldDirection(d);camera.position.copy(tgt.clone().addScaledVector(d,-nd));}}});
  return (<>
    <DustMotes/>
    {words.map(w=>{const p=pm.get(w.id);if(!p)return null;const hf=!!fid,ic=hf&&w.id===fid,inn=hf&&fn.has(w.id);return <StarNode key={w.id} t={p} word={w} sel={w.id===selectedWordId} ic={ic} inn={inn} hf={hf} onTap={tap}/>;})}
    {relationships.map(rel=>{const sa=pm.get(rel.sourceId),sb=pm.get(rel.targetId);if(!sa||!sb)return null;return <EdgeBeam key={rel.id} a={sa} b={sb} color={RELATION_COLORS[rel.type]||'#556677'} focused={fe.has(rel.id)}/>;})}
    <OrbitControls ref={cr} enableDamping dampingFactor={0.12} minDistance={3} maxDistance={70} zoomSpeed={1}/>
    <EffectComposer><Bloom luminanceThreshold={0.4} luminanceSmoothing={0.9} intensity={0.5} mipmapBlur radius={0.4}/></EffectComposer>
    <mesh onPointerDown={bgTap} position={[0,0,-40]}><planeGeometry args={[300,300]}/><meshBasicMaterial visible={false}/></mesh>
  </>);
}

export default function GraphCanvas(){
  return <div style={{width:'100vw',height:'100vh',position:'fixed',top:0,left:0,zIndex:1,background:'#f5f1e8'}}><Canvas camera={{position:[8,5,18],fov:55}} gl={{antialias:true}}><Scene/></Canvas></div>;
}
