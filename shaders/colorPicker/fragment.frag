#version 300 es
precision mediump float;

#define TWO_PI 6.28318530718

out vec4 outputColor;

uniform vec2 uResolution;
uniform vec2 uMouse;

vec3 rgb2hsb(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
            vec4(c.gb, K.xy),
            step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
            vec4(c.r, p.yzx),
            step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
        d / (q.x + e),
        q.x);
}

vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
                    6.0) - 3.0) - 1.0,
            0.0,
            1.0);
    rgb = rgb * rgb * (3.0 - 2.0 * rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
    vec2 position = gl_FragCoord.xy / uResolution;
    vec2 mousePos = uMouse / uResolution;

    float pickerSize = 0.15;
    float pickerBorderSize = 0.005;

    vec2 toCenter = vec2(0.5) - position;
    float angleToCenter = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;
    float normalizedAngle = (angleToCenter / TWO_PI) + 0.5;

    vec2 mouseToCenter = vec2(0.5) - mousePos;
    float mouseAngleToCenter = atan(mouseToCenter.y, mouseToCenter.x);
    float mouseRadius = length(mouseToCenter) * 2.0;
    float mouseNormalizedAngle = (mouseAngleToCenter / TWO_PI) + 0.5;
    vec3 mouseColor = hsb2rgb(vec3(mouseNormalizedAngle, mouseRadius, 1.0));

    float distanceToMouse = distance(position, mousePos);
    float closePercent = step(pickerSize, distanceToMouse);
    float edgePercent = step(pickerSize, distanceToMouse) - step(pickerSize + pickerBorderSize, distanceToMouse);

    vec3 color = hsb2rgb(vec3(normalizedAngle, radius, 1.0));

    vec3 finalColor = mix(mouseColor, color, closePercent);
    finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), edgePercent);

    outputColor = vec4(finalColor, 1.0);
}
