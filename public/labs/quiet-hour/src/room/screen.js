// The picture tube (bible 4: CRT set; tv-look). The programme canvas is the picture; this is the glass it is seen
// through. OWNER: tv-look.
//
//   createScreenMaterial({ THREE, programmeTexture }) -> THREE.ShaderMaterial
//   uniforms: map (the programme texture, mipmapped by tv.js), uLines (scanlines over the picture's height),
//             uScan (0..1 scanline strength: tv.js fades it out when a line would be under 2.5 output pixels),
//             uWarp (barrel), uBulge (metres the glass stands proud at its centre), uCam (the camera in the screen's
//             own coordinates, for the glass's fresnel and the reflection's small parallax), uHalf (the tube's half
//             size in metres), uGlass (reflection strength)
//
// What it does, in order: a gentle barrel warp of the picture (a hair of underscan, so the clock bug in the corner
// stays on the glass), a little horizontal chroma bleed, the phosphor's own soft bloom (a mix with a
// blurred copy, so the average brightness and colour stay honest), anti-aliased scanlines (each line's contrast is
// box-filtered by its size on screen, so nothing beats against the pixel grid), the tube's rounded corners and
// darkening rim, a faint glow of the picture into the tube's black border, and the glass: a weak fixed reflection of
// the room (the window's soft rectangle and a broad sheen) that shows most where the picture is dark. It adds no
// glitches: the picture's condition is already in the canvas.

export function createScreenMaterial({ THREE, programmeTexture }) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: programmeTexture },
      uLines: { value: 240 }, uScan: { value: 0 }, uWarp: { value: 0.10 },
      uBulge: { value: 0.012 }, uCam: { value: new THREE.Vector3(0, 0, 3) },
      uHalf: { value: new THREE.Vector2(0.22, 0.165) }, uGlass: { value: 1 },
    },
    vertexShader: /* glsl */`
      uniform float uBulge; uniform vec2 uHalf;
      varying vec2 vUv; varying vec3 vPos; varying vec3 vN;
      void main() {
        vUv = uv;
        vec2 q = position.xy / uHalf;                       // -1..1 across the face
        vec2 e = 1.0 - q * q * 0.92;
        vec3 p = position; p.z += uBulge * e.x * e.y;      // the glass stands proud at its centre
        // analytic normal of the bulge (local space)
        float dzdx = uBulge * (-2.0 * 0.92 * q.x / uHalf.x) * e.y, dzdy = uBulge * e.x * (-2.0 * 0.92 * q.y / uHalf.y);
        vN = normalize(vec3(-dzdx, -dzdy, 1.0));
        vPos = p;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D map; uniform float uLines, uScan, uWarp, uGlass; uniform vec3 uCam; uniform vec2 uHalf;
      varying vec2 vUv; varying vec3 vPos; varying vec3 vN;
      float sdRR(vec2 p, vec2 b, float r) { vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
      float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
      void main() {
        vec2 c = vUv - 0.5;
        // barrel warp with a hair of underscan: edge midpoints land just inside the tube, corners just outside
        vec2 uv = 0.5 + c * (1.0 + uWarp * (dot(c, c) - 0.25)) * 0.988;
        vec2 dx = vec2(0.0013, 0.0);

        // the picture, one tap (each extra tap costs ~40 ms a frame in software GL). Chroma bleed from the screen-space
        // slope instead: red is pushed right and blue left by about dx of the picture, as a first-order shift
        vec3 col = texture2D(map, uv).rgb;
        float pxPerUv = 1.0 / max(abs(dFdx(uv.x)), 1e-5);
        float sh = min(dx.x * pxPerUv, 1.2);                             // the bleed in output pixels (<= 1.2)
        vec3 gx = dFdx(col);
        col.r = clamp(col.r - gx.r * sh * 0.45, 0.0, 1.0);
        col.b = clamp(col.b + gx.b * sh * 0.3, 0.0, 1.0);
        // the phosphor's soft bloom (an explicit coarse level: one cheap tap), mixed so the mean stays the mean
        vec3 bloom = textureLod(map, clamp(uv, 0.0, 1.0), 5.0).rgb;
        col = mix(col, max(col, bloom), 0.10);

        // the picture's own edge (raster edge, soft) inside the tube
        vec2 inb = smoothstep(vec2(0.0), vec2(0.006, 0.008), uv) * smoothstep(vec2(0.0), vec2(0.006, 0.008), 1.0 - uv);
        float inside = inb.x * inb.y;

        // scanlines: box-filtered by their size on screen (sinc of the footprint), then faded by the shot
        float ly = uv.y * uLines;
        float w = max(fwidth(ly), 1e-4);
        float att = clamp(sin(3.14159265 * min(w, 1.0)) / (3.14159265 * w), 0.0, 1.0) * step(w, 0.98);
        float s = 0.5 + 0.5 * cos(ly * 6.2831853) * att;
        col *= mix(1.0, (0.74 + 0.26 * s) / 0.90, uScan);       // mean kept close to the picture's

        col *= inside;
        // glow of the lit picture into the tube's black border
        col += bloom * 0.10 * (1.0 - inside);

        // the tube's face: rounded corners and a darkening rim (in metres, 4:3)
        vec2 p = c * 2.0 * uHalf;
        float d = sdRR(p, uHalf, 0.03);
        float face = 1.0 - smoothstep(-0.006, 0.0, d);
        float rim = smoothstep(-0.075, 0.0, d);
        col *= face * (1.0 - 0.38 * rim * rim);

        // the glass: fresnel and a weak, fixed, blurred reflection of the room, strongest where the picture is dark
        vec3 V = normalize(uCam - vPos), N = normalize(vN);
        float f1 = 1.0 - max(dot(N, V), 0.0), f2 = f1 * f1; float fres = 0.035 + 0.965 * f2 * f2 * f1;
        vec2 q = p / uHalf.y + (V.xy / max(V.z, 0.2)) * 0.12;    // reflection space, a small parallax with the view
        vec2 wq = (q - vec2(-0.62, 0.46)) * vec2(1.0, 0.92);       // the window: upper left (mirrored room)
        float win = (1.0 - smoothstep(0.10, 0.30, abs(wq.x) - 0.12)) * (1.0 - smoothstep(0.10, 0.30, abs(wq.y) - 0.20));
        win *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.05, abs(wq.x))) - 0.25 * (1.0 - smoothstep(0.0, 0.05, abs(wq.y + 0.02)));
        float sheen = smoothstep(0.35, 1.0, q.y * 0.9 - q.x * 0.25) * (1.0 - smoothstep(0.85, 1.25, q.y * 0.9 - q.x * 0.25));
        vec3 refl = vec3(0.50, 0.58, 0.72) * (win * 0.050 + sheen * 0.018) + vec3(0.6, 0.66, 0.75) * fres * 0.10;
        float dark = 1.0 - clamp(luma(col) * 1.6, 0.0, 1.0);
        col += refl * uGlass * (0.25 + 0.75 * dark * dark) * (0.55 + 0.45 * face);

        // the film's vignette and its dither or grain (src/post.js defines QH_GRADE when its grade is installed),
        // but not its curve: the picture's colours stay exact
        #ifdef QH_GRADE
        col = qhFilm(col);
        #endif
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}
