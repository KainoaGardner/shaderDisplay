#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform sampler2D uImage;
uniform sampler2D uMask;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec3 color = texture(uImage,uv).rgb;
    // float mask = texture(uImage,uv).a;
    // outputColor = vec4(vec3(1.0),mask);
    // outputColor = vec4(vec3(1.0),mask);
    // outputColor = vec4(color, mask);
    outputColor = vec4(color, 1.0);
}
