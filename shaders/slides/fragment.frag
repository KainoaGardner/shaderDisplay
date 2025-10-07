#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;

uniform sampler2D uSlide1;
uniform sampler2D uSlide2;

uniform float uTime;

const float targetAspect = 16.0 / 9.0;

const vec3 bgColor = vec3(0.2);
const float borderLength = 0.15;

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    float slide1InBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(borderLength,st.y) * step(st.y,1.0 - borderLength);

    uv.y = (uv.y - 0.5) * targetAspect + 0.5;
    uv = (uv - 0.5) * 0.8 + 0.5;
    uv.x -= 0.125;
    
    vec3 slide1Tex = texture(uSlide1,uv).rgb;
    vec3 slide1Color = mix(bgColor,slide1Tex,slide1InBounds);

    outputColor = vec4(slide1Color, 1.0);
}

