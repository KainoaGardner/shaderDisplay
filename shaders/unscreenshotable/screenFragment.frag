#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;
uniform float uTime;

float random(vec2 st) {
    return fract(sin(dot(st.xy,
                vec2(12.9898, 78.233))) *
            43758.5453123);
}

float near = 1.0;
float far = 10.0;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec2 ipos = floor(uv * 100.0);
    vec3 color = texture(uImage, ipos / 100.0).xyz;

    float fallSpeed = mod(uTime * 50.0 + 1.0, 500.0);

    float box = step(0.5, color.x);
    ipos.y -= box * floor(fallSpeed);
    float random = random(ipos);
    vec3 finalColor = vec3(random);

    outputColor = vec4(finalColor, 1.0);
}
