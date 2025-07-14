#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform sampler2D uImage;
uniform float uTime;

float random(vec2 st) {
    return fract(sin(dot(st.xy,
                vec2(12.9898, 78.233))) *
            43758.5453123);
}

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    float iTime = floor(uTime * 10.0);
    float glitchChance = step(0.5, random(vec2(iTime, 0.0)));

    float band = floor(uv.y * 30.0);
    float rBandRand = random(vec2(band, iTime));
    float bBandRand = random(vec2(band, iTime + 2.0));

    float rShift = (rBandRand - 0.5) * 0.15 * glitchChance;
    float bShift = (bBandRand - 0.5) * 0.15 * glitchChance;

    float yShift = step(0.95, random(vec2(band, iTime + 1.0))) * 0.05;

    float wave = sin(uv.y * 80.0 + uTime * 10.0) * 0.001;
    uv.x += wave * glitchChance;

    vec2 newUV = vec2(uv.x, uv.y + yShift * glitchChance);

    float flicker = step(0.98, random(vec2(iTime, band)));

    rShift += (flicker * glitchChance) * 3.0;
    bShift += (flicker * glitchChance) * 3.0;
    float r = texture(uImage, vec2(newUV.x + rShift * 1.0, newUV.y)).r;
    float g = texture(uImage, vec2(newUV.x, newUV.y)).g;
    float b = texture(uImage, vec2(newUV.x - bShift * 1.0, newUV.y)).b;

    vec3 color = vec3(r, g, b);

    vec2 box = floor((uv + iTime) * 10.0);
    float boxRand = random(box);
    float flickerBox = step(0.99, boxRand);
    float boxColor = random(uv);
    color = mix(color, vec3(boxColor), flickerBox * glitchChance);

    color *= 1.0 + (random(vec2(iTime, 53.0)) - 0.5) * 0.2 * glitchChance;

    outputColor = vec4(color, 1.0);
}
