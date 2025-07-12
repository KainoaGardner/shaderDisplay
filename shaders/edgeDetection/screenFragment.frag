#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform sampler2D uImage;

const float maxGradient = 2.0;

const float kernelX[9] = float[](
        -1.0, 0.0, 1.0,
        -2.0, 0.0, 2.0,
        -1.0, 0.0, 1.0
    );

const float kernelY[9] = float[](
        -1.0, -2.0, -1.0,
        0.0, 0.0, 0.0,
        1.0, 2.0, 1.0
    );

const float threshold = 0.1;

void main() {
    vec2 uv = vec2(vTexCoord.x, vTexCoord.y);
    vec3 color = texture(uImage, uv).xyz;

    vec2 texelSize = 1.0 / vec2(textureSize(uImage, 0));

    float gx = 0.0;
    float gy = 0.0;

    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            int index = (i + 1) * 3 + (j + 1);
            vec2 offset = vec2(float(j), float(i)) * texelSize;
            float gray = texture(uImage, uv + offset).x;
            gx += gray * kernelX[index];
            gy += gray * kernelY[index];
        }
    }

    float gradient = length(vec2(gx, gy)) / maxGradient;
    gradient *= step(threshold, gradient);

    outputColor = vec4(vec3(gradient), 1.0);
}
