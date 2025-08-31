#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform sampler2D uImage;

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    
    vec2 texelSize = 1.0 / uResolution;
    int neighbors = 0;

    for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
            if (i == 0 && j == 0) continue;

            vec2 offset = vec2(float(j), float(i)) * texelSize;

            vec2 neighborUV = uv + offset;
            neighborUV = mod(neighborUV,1.0);
            int neighborAlive = int(texture(uImage, neighborUV).a);
            neighbors += int(neighborAlive);
        }
    }

    int state = int(texture(uImage,uv).a);
    if (state == 1){
      if (neighbors < 2 || neighbors > 3) state = 0;
    }else{
      if (neighbors == 3) state = 1;
    }

    outputColor = vec4(vec3(0.0), float(state));
}
