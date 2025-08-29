#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform sampler2D uImage;
uniform sampler2D uFrameImage;

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);

    vec4 frameColor = texture(uFrameImage, uv);
    vec4 color = texture(uImage, uv);
    color = mix(vec4(0.5,0.8,0.5,1.0),color,color.a);

    float green = step(color.g,0.95);
    vec4 finalColor = mix(frameColor,color,green);

    finalColor = mix(vec4(0.0),finalColor,color.a);
    outputColor = vec4(finalColor);
}
