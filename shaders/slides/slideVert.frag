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

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 uv2 = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    uv2.y -= 1.0 * uReverse;
    
    float moveAmount = min(uTime * uSpeed,1.0) * uReverse;

    uv += vec2(0.0,moveAmount);
    uv2 += vec2(0.0,moveAmount);

    float slide1InBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(borderLength,uv.y) * step(uv.y,1.0 - borderLength);
    float slide2InBounds = step(0.0,uv2.x) * step(uv2.x,1.0) * step(borderLength,uv2.y) * step(uv2.y,1.0 - borderLength);

    uv.y = (uv.y - 0.5) * targetAspect + 0.5;
    uv = (uv - 0.5) * 0.8 + 0.5;
    uv.x -= 0.125;

    uv2.y = (uv2.y - 0.5) * targetAspect + 0.5;
    uv2 = (uv2 - 0.5) * 0.8 + 0.5;
    uv2.x -= 0.125;

    vec3 slide1Tex = texture(uSlide1,uv).rgb;
    vec3 slide2Tex = texture(uSlide2,uv2).rgb;
    
    vec3 slide1Color = mix(bgColor,slide1Tex,slide1InBounds);
    vec3 slide2Color = mix(bgColor,slide2Tex,slide2InBounds);
    vec3 finalColor = mix(slide2Color,slide1Color,slide1InBounds);
    outputColor = vec4(finalColor, 1.0);
}
