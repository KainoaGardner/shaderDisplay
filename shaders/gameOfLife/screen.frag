#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;

void main() {
    vec2 uv = vec2(vTexCoord.x, vTexCoord.y);

    float alive = texture(uImage, uv).a;
    outputColor = vec4(vec3(1.0),alive);
}
