// The picture tube's material: the programme canvas on the tube, with a little CRT.
// OWNER: tv-look (handed over by room-set). room-set never edits this file.
//
//   createScreenMaterial({ THREE, programmeTexture }) -> THREE.ShaderMaterial
//   uniforms: map (the programme texture), uLines (scanline count), uScan (0..1 scanline strength), uWarp (barrel)

export function createScreenMaterial({ THREE, programmeTexture }) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: programmeTexture }, uLines: { value: 240 }, uScan: { value: 0 }, uWarp: { value: 0.08 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D map; uniform float uLines, uScan, uWarp; varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5; vec2 uv = vUv + c * uWarp * dot(c, c) * 4.0;        // barrel warp
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
        vec3 col = texture2D(map, uv).rgb;
        float s = 0.5 + 0.5 * cos(uv.y * uLines * 6.2831853);                  // scanlines, faded by the shot
        col *= mix(1.0, 0.72 + 0.28 * s, uScan);
        vec2 e = uv - 0.5; col *= 1.0 - 0.55 * dot(e, e) * 2.2;                 // vignette
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
