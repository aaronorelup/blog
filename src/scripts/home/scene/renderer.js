// The renderer on the page's canvas, three's Scene and the camera, and fit(s), which sizes the drawing buffer to the
// window at the quality tier's pixel ratio (s.dpr, quality.js).
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { P } from './palette.js';

export function createView(s) {
  s.renderer = new WebGLRenderer({ canvas: s.canvas, antialias: true, powerPreference: 'high-performance' });
  s.renderer.setPixelRatio(pixelRatio(s));
  s.renderer.setClearColor(P.cream, 1);
  s.scene = new Scene();
  s.camera = new PerspectiveCamera(46, 1, 0.1, 400);
}

const pixelRatio = (s) => Math.min(devicePixelRatio || 1, s.dpr);

export function fit(s) {
  s.renderer.setPixelRatio(pixelRatio(s));
  s.renderer.setSize(innerWidth, innerHeight, false);
}
