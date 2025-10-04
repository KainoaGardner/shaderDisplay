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

const float PI = 3.14159265359;

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 pos = vec2(0.5) - st;

    float time = smoothstep(0.1,0.9,uTime * uSpeed);
    float speed = time * uReverse * 10.0;
    float reverseSpeed = (1.0 - time) * uReverse * 10.0 * -1.0;

    float forward = step(0.5,uTime * uSpeed);
    float s = mix(speed,reverseSpeed,forward);

    float r = length(pos) * 2.0;
    float a = atan(pos.y,pos.x);

    a += r * s * 5.0;

    vec2 uv = vec2(r * cos(a) / -2.0,r * sin(a)) + vec2(0.5);
    uv.y = 1.0 - uv.y;


    uv.y = (uv.y - 0.5) * 0.8905  + 0.5;
    uv = (uv - 0.5) * 0.8 + 0.5;
    float slide1InBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(0.0,uv.y) * step(uv.y, 1.0);
    float slide2InBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(0.0,uv.y) * step(uv.y,1.0 - 0.0);

    uv.x -= 0.125;


    vec3 slide1Tex = texture(uSlide1,uv).rgb;
    vec3 slide2Tex = texture(uSlide2,uv).rgb;
    vec3 slide1Color = mix(bgColor,slide1Tex,slide1InBounds);
    vec3 slide2Color = mix(bgColor,slide2Tex,slide2InBounds);
    vec3 finalColor = mix(slide1Color,slide2Color,time);
    outputColor = vec4(finalColor, 1.0);
}
