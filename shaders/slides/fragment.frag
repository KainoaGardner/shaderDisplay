#version 300 es
precision mediump float;

#define MAX_ITERATIONS 100

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;

uniform sampler2D uSlide1;
uniform sampler2D uSlide2;

uniform float uTime;

const float targetAspect = 16.0 / 9.0;

const vec3 bgColor = vec3(0.0);
const float borderLength = 0.15;

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    uv.y = (uv.y - 0.5) * targetAspect + 0.5;
    uv = (uv - 0.5) * 0.8 + 0.5;
    uv.x -= 0.125;
    
    float inBounds = step(borderLength,st.y) * step(st.y,1.0 - borderLength);

    vec3 slide1Color = texture(uSlide1,uv).rgb;
    vec3 slide2Color = texture(uSlide2,uv).rgb;
    
    vec3 slideColor = mix(slide1Color,slide2Color,fract(uTime * 0.1));
    
    vec3 finalColor = mix(bgColor,slideColor,inBounds);
    outputColor = vec4(finalColor, 1.0);
}

