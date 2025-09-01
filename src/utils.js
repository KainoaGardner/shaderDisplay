export class Shader {
    program;
    valid = false;
    constructor(gl, vertexSource, fragmentSource) {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        if (!vertexShader || !fragmentShader || !this.program) {
            console.error("could not create program");
            return;
        }
        gl.shaderSource(vertexShader, vertexSource);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            const compileError = gl.getShaderInfoLog(vertexShader);
            console.error(`Vertex: ${compileError}`);
            return;
        }
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            const compileError = gl.getShaderInfoLog(fragmentShader);
            console.error(`Fragment: ${compileError}`);
            return;
        }
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            const compileError = gl.getProgramInfoLog(this.program);
            console.error(`Program Link: ${compileError}`);
            return;
        }
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        this.valid = true;
    }
    set1i(gl, name, data) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniform1i(uniformLocation, data);
    }
    set1f(gl, name, data) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniform1f(uniformLocation, data);
    }
    set2f(gl, name, x, y) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniform2f(uniformLocation, x, y);
    }
    set3f(gl, name, x, y, z) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniform3f(uniformLocation, x, y, z);
    }
    setVec3fv(gl, name, data) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniform3fv(uniformLocation, data);
    }
    setMat4fv(gl, name, data) {
        const uniformLocation = gl.getUniformLocation(this.program, name);
        if (uniformLocation === null) {
            console.error(`could not get ${name} uniform location`);
            return;
        }
        gl.uniformMatrix4fv(uniformLocation, false, data);
    }
}
export function createVBO(gl, data) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        console.error("Falied to createbuffer");
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
}
export function createEBO(gl, data) {
    const buffer = gl.createBuffer();
    if (!buffer) {
        console.error("Falied to createbuffer");
        return null;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buffer;
}
export function createScreenFrameBuffer(gl, width, height, data = null) {
    const screenFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer);
    const screenTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, screenTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { screenFramebuffer, screenTexture };
}
export function createScreenFrameBufferAlpha(gl, width, height, data = null) {
    const screenFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer);
    const screenTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, screenTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { screenFramebuffer, screenTexture };
}
export function createScreenFrameBufferRed(gl, width, height, data = null) {
    const screenFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFramebuffer);
    const screenTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, screenTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, screenTexture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.error("Framebuffer incomplete:", status.toString(16), width, height);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { screenFramebuffer, screenTexture };
}
export * as Utils from "./utils";
