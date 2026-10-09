// 03 — The mental model: the shop cross-section is built for the first time.
// Camera: close on the shop floor -> wide as the wall and door arrive -> into the back room -> wide to keep the picture.
SCENE('03', (t, S) => {
  K.bg();
  const C = K.C, L = M.layout;

  // ---- cue times (local seconds), with word-level anchors for the smaller beats
  const cFloor = S.cue('shop-floor', 0);
  const cPorter = S.cue('porter-tour', 8.11);
  const cDoor = S.cue('staff-door', 12.88);
  const cRoom = S.cue('back-room', 18.62);
  const cKeep = S.cue('keep-picture', 29.9);
  const wShop = S.find('shop', 0, cFloor + 1.46);          // "...as a shop." : the window opens on the word
  const wFloorWord = S.find('floor', 0, cFloor + 2.8);      // "The shop floor": its contents fill in
  const wWalks = S.find('walks', 0, cDoor + 1.6);
  const wDoorWord = S.find(/^door$/i, 0, cDoor + 2.8);
  const wSign = S.find('sign', 0, cDoor + 3.3);
  const wSettings = S.find('settings', 0, cRoom + 3.2);
  const wHistory = S.find('history', 0, cRoom + 4.2);
  const wSupplies = S.find('supplies', 0, cRoom + 5.2);
  const wKeys = S.find('keys', 0, cRoom + 6.3);

  // ---- builds
  const floorK = K.io(t, cFloor, 0.7);
  const explorerK = K.io(t, cFloor + 0.45, 0.6);           // the window settles right behind the card: no empty frame
  const itemsK = K.seg(t, wShop - 0.1, wFloorWord + 0.4);  // icons fill in on "shop" through "shop floor"
  const wallK = K.io(t, cDoor, 0.9);
  const doorK = K.io(t, wDoorWord - 0.1, 0.7);
  const signK = K.io(t, wSign - 0.05, 0.5, 'back');           // the scene's one overshoot
  const roomK = K.io(t, cRoom, 0.7);
  const shelvesK = K.seg(t, cRoom + 0.5, cRoom + 2.0);
  const glow = K.io(t, cKeep + 0.6, 0.4) * (1 - K.io(t, cKeep + 1.0, 0.4)); // 0 -> 1 -> 0 over 0.8 s, once wide

  // ---- porter: walks in on the tour, then on past the door to his idle spot by the wall
  const pIn = K.io(t, cPorter, M.motion.walk);
  const pOn = K.io(t, wWalks, M.motion.walk);
  const px = K.lerp(K.lerp(220, 760, pIn), L.porter.x, pOn);
  const walking = (t > cPorter && t < cPorter + M.motion.walk) || (t > wWalks && t < wWalks + M.motion.walk);
  const pAlpha = K.io(t, cPorter, 0.5);
  const capK = K.io(t, cPorter + 0.7, 0.5) * (1 - K.io(t, wWalks - 0.4, 0.5)); // the tour caption leaves before he walks on

  K.withCam(M.cam(t, [
    { at: -10, x: 600, y: 555, z: 1.15 },     // close on the shop floor
    { at: cDoor, view: 'wide' },              // pull back as the wall and door arrive
    { at: cRoom, x: 1465, y: 552, z: 1.2 },   // step into the back room: door + room centred; card tops stay at y ~118, below the badge
    { at: cKeep, view: 'wide' },              // the whole picture
  ]), () => {
    // While we look into the back room, the shop floor fades to ~0.06 BEFORE the push, so the part the camera
    // crops off the left edge is never legible. Drawn in three passes to keep shop()'s back-to-front order.
    const look = K.io(t, cRoom - 0.45, 0.6) * (1 - K.io(t, cKeep, 0.7));
    const porter = pAlpha > 0 ? { x: px, walking, face: t < wWalks + M.motion.walk ? 1 : -1, alpha: pAlpha * (1 - 0.5 * look) } : false;
    M.shop(t, { roomK, shelvesK, floorK: 0, wallK: 0, doorK: 0, signK: 0, porter: false });            // back room
    K.layer(1 - 0.94 * look, () => M.shop(t, { floorK, explorerK, itemsK, roomK: 0, wallK: 0, doorK: 0, signK: 0, porter: false })); // floor
    M.shop(t, { roomK: 0, floorK: 0, wallK, doorK, signK, door: { open: 0, glow }, porter });            // wall, door, sign, porter
    // the tour caption trails beside the porter (above his head it would touch the Explorer window)
    if (capK > 0) K.pill('File Explorer · Finder', px - 230, M.porterY() - 4, { size: 26, color: C.strong, alpha: capK * pAlpha });

    // what keeps the shop running, one per word
    const pop = (a) => K.io(t, a - 0.05, M.motion.pop);
    M.shelfIcon('gear', 'settings', 0, 0, { k: pop(wSettings) });
    M.shelfIcon('clock', 'history', 0, 1, { k: pop(wHistory) });
    M.shelfIcon('puzzle', 'supplies', 1, 0, { k: pop(wSupplies) });
    M.shelfIcon('key', 'keys', 1, 1, { k: pop(wKeys), color: M.palette.secret });
  });
});
