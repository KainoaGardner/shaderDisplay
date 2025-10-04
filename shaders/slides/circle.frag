#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;

uniform sampler2D uSlide1;
uniform sampler2D uSlide2;

uniform float uTime;
uniform float uReverse;
uniform float uSpeed;

const float targetAspect = 16.0 / 9.0;

const vec3 bgColor = vec3(0.0);
const float borderLength = 0.15;



#define PI 3.14159265358979323846

float random(float x){
  return fract(sin(x)*1e4);
}

float random(vec2 position){
  vec2 multvec = vec2(12.9898,78.233);
  float multfloat = 43758.5453123 ;
  return fract(sin(dot(position.xy,multvec)) * multfloat);
}

float noise (in vec2 position){
  vec2 iPos = floor(position);
  vec2 fPos = fract(position);

  float a = random(iPos);
  float b = random(iPos + vec2(1.0,0.0));
  float c = random(iPos + vec2(0.0,1.0));
  float d = random(iPos + vec2(1.0,1.0));

  vec2 u = fPos * fPos * (3.0 - 2.0 * fPos);
  
  float ab = mix(a,b,u.x);
  float cd = mix(c,d,u.x);
  return mix(ab,cd,u.y);
}

float circle(vec2 position,float radius,float strength,float time){
  float distance = distance(position,vec2(0.5));
  float distancePast = max(distance - radius,1e-5) * strength;
  float noise = noise((position + vec2(time)) * 10.0);
  float fadeOut = 1.0 - smoothstep(radius,radius + 0.3,distance);

  noise = noise / distancePast * fadeOut;
  
  float circleIn = step(distance,radius);
  float result = circleIn + noise;

  return result;
}

void main() {
  vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
  vec3 color = vec3(0.0);
  
  float time = smoothstep(0.0,1.0,uTime * uSpeed);
  float iTime = floor(time);
  float fTime = fract(time);
  
  float reverse = step(0.0,uReverse);
  float radius = time - 0.35;
  float radiusReverse = 0.75 - time;
  float r = mix(radiusReverse,radius,reverse);
  float s = 10.0;

  float noise1 = circle(uv,r,s,iTime);
  float noise2 = circle(uv,r,s,iTime + 1.0);

  float inBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(borderLength,uv.y) * step(uv.y,1.0 - borderLength);

  uv.y = (uv.y - 0.5) * targetAspect + 0.5;
  uv = (uv - 0.5) * 0.8 + 0.5;
  uv.x -= 0.125;

  vec3 slide1Tex = texture(uSlide1,uv).rgb;
  vec3 slide2Tex = texture(uSlide2,uv).rgb;

  float noiseColor = mix(noise1,noise2,fTime);
  float switchImage = step(0.5,noiseColor);
  float switchImageReverse = 1.0 - switchImage;
  float slideResult = mix(switchImageReverse,switchImage,reverse);

  vec3 slide1Color = mix(bgColor,slide1Tex,inBounds);
  vec3 slide2Color = mix(bgColor,slide2Tex,inBounds);
  vec3 finalColor = mix(slide1Color,slide2Color,slideResult);
  outputColor = vec4(finalColor, 1.0);
}
