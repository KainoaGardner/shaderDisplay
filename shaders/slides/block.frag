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

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    st *= 15.0;
    vec2 iPos = floor(st); 
    float noiseValue = random(iPos);
    float reverse = step(0.0,uReverse);
    float noiseVal = mix(1.0 - noiseValue,noiseValue,reverse);

    float time = uTime * uSpeed;
    float inBounds = step(0.0,uv.x) * step(uv.x,1.0) * step(borderLength,uv.y) * step(uv.y,1.0 - borderLength);

    uv.y = (uv.y - 0.5) * targetAspect + 0.5;
    uv = (uv - 0.5) * 0.8 + 0.5;
    uv.x -= 0.125;

    vec3 slide1Tex = texture(uSlide1,uv).rgb;
    vec3 slide2Tex = texture(uSlide2,uv).rgb;

    float switchImage = step(noiseVal,time);
    vec3 slide1Color = mix(bgColor,slide1Tex,inBounds);
    vec3 slide2Color = mix(bgColor,slide2Tex,inBounds);
    vec3 finalColor = mix(slide1Color,slide2Color,switchImage);
    outputColor = vec4(finalColor, 1.0);
}
