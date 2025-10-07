#version 300 es
precision mediump float;


out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;

uniform sampler2D uSlide1;
uniform sampler2D uSlide2;

uniform float uSlide;

const float targetAspect = 16.0 / 9.0;
const vec3 bgColor = vec3(0.2);
const float borderLength = 0.15;

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    float inBounds = step(0.0,st.x) * step(st.x,1.0) * step(borderLength,st.y) * step(st.y,1.0 - borderLength);

    st.y = (st.y - 0.5) * targetAspect + 0.5;
    st = (st - 0.5) * 0.8 + 0.5;
    st.x -= 0.125;

    vec3 slide1Tex = texture(uSlide1,st).rgb;

    vec2 st2 = st;
    st2.x = 1.0 - st.x; 
    st2.x -= 0.25; 
    vec3 slide2Tex = texture(uSlide2,st2).rgb;
    vec3 slide1Color = mix(bgColor,slide1Tex,inBounds);
    vec3 slide2Color = mix(bgColor,slide2Tex,inBounds);

    vec3 finalColor = mix(slide1Color,slide2Color,uSlide);
    outputColor = vec4(finalColor, 1.0);
}
