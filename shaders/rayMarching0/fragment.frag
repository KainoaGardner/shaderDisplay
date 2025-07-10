#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

uniform float uSpeed;

float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

mat2 rotation2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

mat4 rotation3d(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
        oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
        oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0,
        oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

float smin0(float a, float b, float k)
{
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 pos, float r) {
    return length(pos) - r;
}

float sdCube(vec3 pos, vec3 b) {
    vec3 q = abs(pos) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float map(vec3 pos, vec3 rayDir) {
    pos.z += uTime * uSpeed;

    vec3 q = pos;
    q = fract(pos) - 0.5;

    vec3 rotAxis = rayDir;
    float rotAngle = uTime * 10.0;
    mat4 rot = rotation3d(rotAxis, rotAngle);
    vec3 rotPos = (inverse(rot) * vec4(q, 1.0)).xyz;

    float cube = sdCube(rotPos, vec3(0.15));

    return cube;
}

vec3 cosPalette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);

    vec3 d = vec3(0.3, 0.2, 0.1);
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    vec2 uv = st * 2.0 - 1.0;

    vec2 mousePos = uMouse / uResolution;
    mousePos = mousePos * 2.0 - 1.0;

    vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
    vec3 rayDir = normalize(vec3(uv, 1.0));
    vec3 color = vec3(0.0);

    float dist = 0.0;

    // rayOrigin.yz *= rotation2D(-mousePos.y);
    // rayDir.yz *= rotation2D(-mousePos.y);
    //
    // rayOrigin.xz *= rotation2D(-mousePos.x);
    // rayDir.xz *= rotation2D(-mousePos.x);

    for (int i = 0; i < 80; i++) {
        vec3 pos = rayOrigin + rayDir * dist;
        float currDist = map(pos, rayDir);

        dist += currDist;

        color = vec3(i) / 80.;

        if (currDist < 0.001 || dist > 100.) break;
    }

    color = cosPalette(dist * 0.075);
    outputColor = vec4(color, 1.0);
}
