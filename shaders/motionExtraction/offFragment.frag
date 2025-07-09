#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec3 color = texture(uImage, uv).xyz;
    outputColor = vec4(color, 1.0);
}
