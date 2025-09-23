var p=Object.defineProperty;var R=(o,e,t)=>e in o?p(o,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):o[e]=t;var d=(o,e,t)=>R(o,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function t(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=t(r);fetch(r.href,n)}})();class T{constructor(e,t,s){d(this,"program");d(this,"valid",!1);const r=e.createShader(e.VERTEX_SHADER),n=e.createShader(e.FRAGMENT_SHADER);if(this.program=e.createProgram(),!r||!n||!this.program){console.error("could not create program");return}if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(r);console.error(`Vertex: ${c}`);return}if(e.shaderSource(n,s),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){const c=e.getShaderInfoLog(n);console.error(`Fragment: ${c}`);return}if(e.attachShader(this.program,r),e.attachShader(this.program,n),e.linkProgram(this.program),!e.getProgramParameter(this.program,e.LINK_STATUS)){const c=e.getProgramInfoLog(this.program);console.error(`Program Link: ${c}`);return}e.deleteShader(r),e.deleteShader(n),this.valid=!0}set1i(e,t,s){const r=e.getUniformLocation(this.program,t);if(r===null){console.error(`could not get ${t} uniform location`);return}e.uniform1i(r,s)}set1f(e,t,s){const r=e.getUniformLocation(this.program,t);if(r===null){console.error(`could not get ${t} uniform location`);return}e.uniform1f(r,s)}set2f(e,t,s,r){const n=e.getUniformLocation(this.program,t);if(n===null){console.error(`could not get ${t} uniform location`);return}e.uniform2f(n,s,r)}set3f(e,t,s,r,n){const c=e.getUniformLocation(this.program,t);if(c===null){console.error(`could not get ${t} uniform location`);return}e.uniform3f(c,s,r,n)}setVec3fv(e,t,s){const r=e.getUniformLocation(this.program,t);if(r===null){console.error(`could not get ${t} uniform location`);return}e.uniform3fv(r,s)}setMat4fv(e,t,s){const r=e.getUniformLocation(this.program,t);if(r===null){console.error(`could not get ${t} uniform location`);return}e.uniformMatrix4fv(r,!1,s)}}function v(o,e){const t=o.createBuffer();return t?(o.bindBuffer(o.ARRAY_BUFFER,t),o.bufferData(o.ARRAY_BUFFER,e,o.STATIC_DRAW),o.bindBuffer(o.ARRAY_BUFFER,null),t):(console.error("Falied to createbuffer"),null)}function S(o,e){const t=o.createBuffer();return t?(o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,t),o.bufferData(o.ELEMENT_ARRAY_BUFFER,e,o.STATIC_DRAW),o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,null),t):(console.error("Falied to createbuffer"),null)}const L=new Float32Array([-1,-1,1,-1,1,1,-1,1]),E=new Uint16Array([0,1,2,0,2,3]);function _(o,e,t,s,r){const n=o.createVertexArray();n||console.error("Falied to make vertex array");const c=v(o,e),f=S(o,t);return!c||!f?(console.error("could not make vbo/ebo"),null):(o.bindVertexArray(n),o.enableVertexAttribArray(r),o.bindBuffer(o.ARRAY_BUFFER,c),o.vertexAttribPointer(r,s,o.FLOAT,!1,0,0),o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,f),o.bindVertexArray(null),o.bindBuffer(o.ARRAY_BUFFER,null),o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,null),n)}const F=`#version 300 es
precision mediump float;

out vec4 outputColor;


uniform float uZoom;
uniform vec2 uMove;
uniform vec2 uResolution;

#define TWO_PI 6.28318530718

#define MAX_ITERATIONS 1000

const vec3 PALETTE_A = vec3(0.3,0.1,0.2);
const vec3 PALETTE_B = vec3(0.8,0.8,0.8);
const vec3 PALETTE_C = vec3(0.1,0.3,1.5);
const vec3 PALETTE_D = vec3(0.3,0.4,0.5);

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos( 6.28318*(c*t+d) );
}

int mandelSet(vec2 st){
  float x = 0.0;
  float y = 0.0;

  for (int i = 0;i < MAX_ITERATIONS;i++) {
    if (x*x + y*y > 4.0){
      return i;
    }

    float xTemp = x * x - y * y + st.x;
    y = 2.0 * x * y + st.y;

    x = xTemp;
  }

  
  return MAX_ITERATIONS;
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    vec2 uv = st * 2.0 - 1.0;
    
    uv *= uZoom;

    uv += vec2(-0.5,0.0);
    uv += uMove;

    int i = mandelSet(uv);
    vec3 color = palette(float(MAX_ITERATIONS - i) * 0.03,PALETTE_A,PALETTE_B,PALETTE_C,PALETTE_D);  
    outputColor = vec4(color, 1.0);
}
`,g=`#version 300 es
precision mediump float;

in vec2 aPosition;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;function P(){const o=window.parent.frames;for(let e=0;e<o.length;e++)try{o[e].postMessage({type:"RESET"},"*")}catch{}}function w(){if(location.hash==="#ui"){const o=document.getElementById("canvas");if(!o){console.error("cant find canvas");return}o.style.display="none",I()}else{const o=document.getElementById("ui");if(!o){console.error("cant find ui");return}o.style.display="none",b()}}const a=new Map;a.set("left",!1);a.set("right",!1);a.set("up",!1);a.set("down",!1);a.set("zoomIn",!1);a.set("zoomOut",!1);function b(){const o=document.getElementById("canvas");if(!o){console.error("cant find canvas");return}document.addEventListener("keydown",function(i){(i.key==="w"||i.key==="ArrowUp")&&a.set("up",!0),(i.key==="s"||i.key==="ArrowDown")&&a.set("down",!0),(i.key==="a"||i.key==="ArrowLeft")&&a.set("left",!0),(i.key==="d"||i.key==="ArrowRight")&&a.set("right",!0),(i.key==="q"||i.key==="-")&&a.set("zoomOut",!0),(i.key==="e"||i.key==="+")&&a.set("zoomIn",!0)}),document.addEventListener("keyup",function(i){(i.key==="w"||i.key==="ArrowUp")&&a.set("up",!1),(i.key==="s"||i.key==="ArrowDown")&&a.set("down",!1),(i.key==="a"||i.key==="ArrowLeft")&&a.set("left",!1),(i.key==="d"||i.key==="ArrowRight")&&a.set("right",!1),(i.key==="q"||i.key==="-")&&a.set("zoomOut",!1),(i.key==="e"||i.key==="+")&&a.set("zoomIn",!1)});const e=o.getContext("webgl2");if(!e){console.error("could not get webgl context");return}const t=new T(e,g,F);if(!t.valid){console.error("could not make shader");return}const s=e.getAttribLocation(t.program,"aPosition");if(s<0)return console.error("Could not find attribuites"),null;const r=_(e,L,E,E.length/3,s);if(!r)return console.error("could not make vao"),null;let n=1,c=0,f=0,A=performance.now(),y=1/60,l=0;window.addEventListener("message",i=>{var m;((m=i.data)==null?void 0:m.type)==="RESET"&&(n=1,c=0,f=0)});const h=function(){const i=performance.now(),m=(i-A)/1e3;if(A=i,l+=m,l>y){l=l%y;const u=.01*n;a.get("up")&&(f+=u),a.get("down")&&(f-=u),a.get("left")&&(c-=u),a.get("right")&&(c+=u),a.get("zoomIn")&&(n-=u),a.get("zoomOut")&&(n+=u)}o.height=o.clientHeight,o.width=o.clientWidth,e.viewport(0,0,o.width,o.height),e.clearColor(.2,.2,.2,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(t.program),t.set2f(e,"uResolution",o.width,o.height),t.set2f(e,"uMove",c,f),t.set1f(e,"uZoom",n),e.bindVertexArray(r),e.drawElements(e.TRIANGLES,E.length,e.UNSIGNED_SHORT,0),e.bindVertexArray(null),requestAnimationFrame(h)};requestAnimationFrame(h)}function I(){document.getElementById("reset").addEventListener("click",function(){P()})}w();
