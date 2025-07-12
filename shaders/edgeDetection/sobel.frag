#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform sampler2D uImage;

const float kernel[25] = float[](
        2.0, 4.0, 5.0, 4.0, 2.0,
        4.0, 9.0, 12.0, 9.0, 4.0,
        5.0, 12.0, 15.0, 12.0, 5.0,
        4.0, 9.0, 12.0, 9.0, 4.0,
        2.0, 4.0, 5.0, 4.0, 2.0
    );

const float kernelWeight = 159.0;

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

const vec3 luminance = vec3(0.299, 0.587, 0.144);

void main() {
    vec2 uv = vec2(vTexCoord.x, 1.0 - vTexCoord.y);
    vec3 color = texture(uImage, uv).xyz;

    vec2 texelSize = 1.0 / vec2(textureSize(uImage, 0));

    float gausResult = 0.0;

    float gx = 0.0;
    float gy = 0.0;
    for (int i = -2; i <= 2; i++) {
        for (int j = -2; j <= 2; j++) {
            int index = (i + 2) * 5 + (j + 2);
            vec2 offset = vec2(float(j), float(i)) * texelSize;
            vec3 textureColor = texture(uImage, uv + offset).xyz;
            float gray = dot(textureColor, luminance);
            gausResult += gray * kernel[index] / kernelWeight;
        }
    }

    outputColor = vec4(vec3(gausResult), 1.0);
}
