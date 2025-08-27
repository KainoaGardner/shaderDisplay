#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

#define MAX_ITERATIONS 80
#define ORB_AMOUNT 10

const float MIN_DIST = 0.001;
const float MAX_DIST = 100.0;

const float VISCOSITY = 1.25;

const float TIME_SPEED = 0.5;
const float SMALL_ORB_SIZE = 0.05;
const float SMALL_ORB_POS = 0.2;
const float SMALL_ORB_SPEED = 0.6;
const float SMALL_ORB_NOISE_SPEED = 0.2;
const float BIG_NOISE_SPEED = 0.5;
const float BIG_SPEED = 0.75;

const vec3[ORB_AMOUNT] ORB_POS = vec3[ORB_AMOUNT](
  vec3( 0.41, -0.76,  0.53),
  vec3(-0.92,  0.28, -0.35),
  vec3( 0.67,  0.12, -0.89),
  vec3(-0.58, -0.44,  0.79),
  vec3( 0.25,  0.95, -0.17),
  vec3(-0.34, -0.63, -0.69),
  vec3( 0.88, -0.52,  0.06),
  vec3(-0.47,  0.81,  0.36),
  vec3( 0.14, -0.99, -0.22),
  vec3( 0.73,  0.54, -0.31)
);

const float[ORB_AMOUNT] ORB_SIZES = float[ORB_AMOUNT](
  0.13,
  0.72,
  0.45,
  0.88,
  0.06,
  0.59,
  0.34,
  0.97,
  0.21,
  0.81
);


const vec3[ORB_AMOUNT] ORB_SPEED = vec3[ORB_AMOUNT](
  vec3(-0.63,  0.21,  0.77),
  vec3( 0.94, -0.48, -0.15),
  vec3(-0.29,  0.88, -0.52),
  vec3( 0.57, -0.73,  0.42),
  vec3(-0.81, -0.36,  0.46),
  vec3( 0.18,  0.64,  0.93),
  vec3(-0.55,  0.99, -0.07),
  vec3( 0.33, -0.26, -0.91),
  vec3(-0.97,  0.12,  0.25),
  vec3( 0.48, -0.85, -0.39)
);


float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float random(float x) {
    return fract(sin(x) * 43758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
  vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(random(b), random(b + d.yx), f.x), mix(random(b + d.xy), random(b + d.yy), f.x), f.y);
}

float smoothMin(float a, float b, float k){
  float h = max(k - abs(a-b),0.0) / k;
  return min(a,b) - h * h * h * k * (1.0/6.0);
}

float sdSphere(vec3 pos, float r) {
    return length(pos) - r;
}

float map(vec3 pos, vec3 rayDir) {
    float result = MAX_DIST;
    float time = uTime * TIME_SPEED;

    float rand = random(vec2(123.5123));
    vec3 r = vec3(
      random(rand * 12.9898),
      random(rand * 78.234), 
      random(rand * 56.123));

    pos.x += noise(vec2(time * 0.3,r.x)) * BIG_NOISE_SPEED - 0.2;
    pos.y += noise(vec2(time * 0.4,r.y)) * BIG_NOISE_SPEED - 0.2;
    pos.z += noise(vec2(time * 0.5,r.z)) * BIG_NOISE_SPEED - 0.2;
    // q.x += sin(r.x + time * orbSpeed.x) * SMALL_ORB_SPEED;
    pos.y += cos(r.y + time * 0.5) * BIG_SPEED;
    // q.z += sin(r.z + time * orbSpeed.z) * SMALL_ORB_SPEED;


    for (int i = 0; i < ORB_AMOUNT; i++) {
        vec3 q = pos;
        vec3 orbPos = ORB_POS[i] * SMALL_ORB_POS;
        vec3 orbSpeed = ORB_SPEED[i];
        float orbSize = ORB_SIZES[i] * SMALL_ORB_SIZE;
        
        float rand = random(vec2(float(i)));
        vec3 r = vec3(
          random(rand * 12.9898),
          random(rand * 78.234), 
          random(rand * 56.123));
        

        q.x += sin(r.x + time * orbSpeed.x) * SMALL_ORB_SPEED;
        q.y += cos(r.y + time * orbSpeed.y) * SMALL_ORB_SPEED;
        q.z += sin(r.z + time * orbSpeed.z) * SMALL_ORB_SPEED; 
        q.x += noise(vec2(time * orbSpeed.z,r.x)) * SMALL_ORB_NOISE_SPEED - 0.2;
        q.y += noise(vec2(time * orbSpeed.x,r.y)) * SMALL_ORB_NOISE_SPEED - 0.2;
        q.z += noise(vec2(time * orbSpeed.y,r.z)) * SMALL_ORB_NOISE_SPEED - 0.2;

        float sphere = sdSphere(q - orbPos, orbSize);
        result = smoothMin(result,sphere,VISCOSITY);
    }

    return result;
}

vec3 cosPalette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);

    vec3 d = vec3(0.0, 0.10,0.20);
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 lavaPalette(float t) {
    t = clamp(t, 0.0, 1.0);

    vec3 dark   = vec3(0.05, 0.0, 0.1);   // deep purple
    vec3 hot    = vec3(1.0, 0.2, 0.0);    // glowing red/orange
    vec3 bright = vec3(1.0, 1.0, 0.2);    // yellow/white

    if (t < 0.5) {
        return mix(dark, hot, t * 2.0);
    } else {
        return mix(hot, bright, (t - 0.5) * 2.0);
    }
}



void main() {
    vec2 st = gl_FragCoord.xy / uResolution;
    vec2 uv = st * 2.0 - 1.0;


    vec3 rayOrigin = vec3(0.0, 0.0, -1.7);

    vec3 rayDir = normalize(vec3(uv * 1.0, 1.0));
    vec3 color = vec3(0.0);

    float dist = 0.0;

    int i = 0;
    for (i = 0; i < MAX_ITERATIONS; i++) {
        vec3 pos = rayOrigin + rayDir * dist;
        float currDist = map(pos, rayDir);

        dist += currDist;
        // color = vec3(i) / float(MAX_ITERATIONS);

        if (currDist < MIN_DIST || dist > MAX_DIST) break;
    }

    
    float value = step(dist,100.0);
    float t = dist * dist * 0.1;
    color = lavaPalette(t) * value;
    outputColor = vec4(color, 1.0);
}
