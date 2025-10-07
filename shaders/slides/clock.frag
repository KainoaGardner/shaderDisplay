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
const vec3 bgColor = vec3(0.2);
const float borderLength = 0.15;

const float PI = 3.14159265359;

mat2 rotate2d(float a){
    return mat2(cos(a),-sin(a),
                sin(a),cos(a));
}

void main() {
    vec2 st = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 pos = vec2(0.5) - st;

    float time = smoothstep(0.1,0.9,uTime * uSpeed);
    float reverseTime = 1.0 - time;
    float reverse = step(0.0,uReverse);
    float t = mix(reverseTime,time,reverse);

    pos = rotate2d(PI / 2.0) * pos;
    float a = atan(pos.y,pos.x);
    float aNorm = (a + PI) / (2.0 * PI);


    float inBounds = step(0.0,st.x) * step(st.x,1.0) * step(borderLength,st.y) * step(st.y,1.0 - borderLength);

    st.y = (st.y - 0.5) * targetAspect + 0.5;
    st = (st - 0.5) * 0.8 + 0.5;
    st.x -= 0.125;

    vec3 slide1Tex = texture(uSlide1,st).rgb;
    vec3 slide2Tex = texture(uSlide2,st).rgb;

    float switchImage = step(aNorm,t);
    float switchImageReverse = 1.0 - switchImage;
    float slideResult = mix(switchImageReverse,switchImage,reverse);

    vec3 slide1Color = mix(bgColor,slide1Tex,inBounds);
    vec3 slide2Color = mix(bgColor,slide2Tex,inBounds);
    vec3 finalColor = mix(slide1Color,slide2Color,slideResult);
    outputColor = vec4(finalColor, 1.0);

}
