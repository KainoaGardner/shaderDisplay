#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uFrame;
uniform sampler2D uMask;
uniform sampler2D uSim;

vec3 lavaPalette(float t) {
    t = clamp(t, 0.0, 1.0);

    vec3 dark   = vec3(0.05, 0.0, 0.2);   // deep purple
    vec3 hot    = vec3(0.7, 0.2, 0.0);    // glowing red/orange
    vec3 bright = vec3(1.0, 1.0, 0.2);    // yellow/white

    if (t < 0.5) {
        return mix(dark, hot, t * 2.0);
    } else {
        return mix(hot, bright, (t - 0.5) * 2.0);
    }
}

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    float mask = texture(uMask, uv).a;

    vec4 simColor = texture(uSim, uv);
    vec4 frameColor = texture(uFrame, uv);

    vec4 bgColor = vec4(lavaPalette((uv.y) * 1.0),1.0);

    vec4 maskedBg = bgColor * mask;
    vec4 maskedSim = simColor * mask;

    vec4 simWithBg = mix(maskedBg,maskedSim,simColor.a);

    vec4 finalColor = mix(simWithBg,frameColor,frameColor.a);
    
    float distFromCenter = distance(uv,vec2(0.5)) * 0.25;
    vec4 testColor = vec4(vec3(distFromCenter),1.);
    float lavaMask = (1. - (1.-mask) * (1.-frameColor.a));
    finalColor = mix(testColor,finalColor,lavaMask);

    outputColor = vec4(finalColor);
}
