#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;
uniform sampler2D uNextImage;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec3 color = texture(uImage, uv).xyz;
    vec3 nextColor = texture(uNextImage, uv).xyz;

    vec3 diff = abs(nextColor - color);
    diff *= 2.0;
    float avg = (diff.x + diff.y + diff.z) / 3.0;
    vec3 finalColor = vec3(avg);

    outputColor = vec4(finalColor, 1.0);
}
