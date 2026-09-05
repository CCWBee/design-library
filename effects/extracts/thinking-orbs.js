/*!
 * thinking-orbs by Jakub Antalik, https://github.com/Jakubantalik/thinking-orbs, MIT License.
 * Ported from TypeScript/React to vanilla JavaScript for the design library; engine code preserved.
 *
 * Copyright (c) 2026 Jakub Antalik. MIT. Keep this notice with the file.
 *
 * Nine dotted thought-orb loading states for AI and agent UIs, on a plain 2D
 * canvas: no WebGL, no ctx.filter, no SVG filters, so every mode renders the
 * same pixels in Chrome, Safari and Firefox.
 *
 * What the port changed, and it changed nothing else:
 *   1. TypeScript types, interfaces and the ES module wiring are gone. They
 *      carry no behaviour. Every function body below is the upstream body.
 *   2. The React component (src/ThinkingOrb.tsx) and the two theme hooks
 *      (src/theme.ts) collapse into ThinkingOrbs.mount(canvas, options), which
 *      runs the same shared-clock rAF loop, the same offscreen and hidden-tab
 *      pausing, and the same static reduced-motion frame.
 *   3. `a ** b` (ES2016) is written Math.pow(a, b), and `x ?? y` as an explicit
 *      dflt(x, y) helper, so a stored 0 still beats the fallback exactly as it
 *      does upstream. That distinction is load-bearing: the ribbon preset sets
 *      spin: 0 and the ring profile sets ghostN: 0.
 *   4. One addition: an optional ink colour. With the default ink the arithmetic
 *      is identical to the upstream greyscale line, see inkStyle().
 *   5. Comment punctuation follows this library's house style. No number, no
 *      expression and no drawing call was altered.
 *
 * Usage:
 *   <script src="thinking-orbs.js"></script>
 *   var orb = ThinkingOrbs.mount(canvas, { state: 'searching', size: 64 });
 *   orb.stop();
 */

(function (global) {
  'use strict';

  /* ------------------------------------------------------------------ *
   * Small translation helpers (port only, no upstream counterpart)
   * ------------------------------------------------------------------ */

  /** Upstream `value ?? fallback`: only undefined and null take the fallback. */
  function dflt(value, fallback) {
    return value === undefined || value === null ? fallback : value;
  }

  /* ------------------------------------------------------------------ *
   * engine/core.ts
   * Shared primitives for the dotted 3D thought-orbs. Ported from inkform
   * (PlotterLab's HalftoneSphere lineage): honestly 3D, rotated, depth-shaded,
   * z-sorted. Depth is carried by dot size and ink weight alone.
   * ------------------------------------------------------------------ */

  function lerp(a, b, f) {
    return a + (b - a) * f;
  }

  function frac(x) {
    return x - Math.floor(x);
  }

  /** Value noise on a 2D lattice: smooth, deterministic, cheap. */
  function vnoise(x, y) {
    var xi = Math.floor(x);
    var yi = Math.floor(y);
    var fx = x - xi;
    var fy = y - yi;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = hashD(xi, yi);
    var b = hashD(xi + 1, yi);
    var c = hashD(xi, yi + 1);
    var d = hashD(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }

  /** Deterministic hash in [0, 1). */
  function hashD(a, b) {
    var h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return h - Math.floor(h);
  }

  /** Stable directions on a unit sphere (Fibonacci lattice). */
  function fibDir(i, n) {
    var golden = Math.PI * (3 - Math.sqrt(5));
    var y = 1 - (2 * (i + 0.5)) / n;
    var rad = Math.sqrt(1 - y * y);
    var a = i * golden;
    return [rad * Math.cos(a), y, rad * Math.sin(a)];
  }

  /** Shortest signed angular distance, wrapped to (-pi, pi]. */
  function angleDelta(a, b) {
    return Math.atan2(Math.sin(a - b), Math.cos(a - b));
  }

  /** Shared spin plus tilt plus orthographic projection. */
  function makeProj(yaw, tilt, cx, cy, scale) {
    var st = Math.sin(tilt);
    var ct = Math.cos(tilt);
    var sy = Math.sin(yaw);
    var cyw = Math.cos(yaw);
    return function (x, y, z) {
      var x1 = x * cyw + z * sy;
      var z1 = -x * sy + z * cyw;
      var y1 = y * ct - z1 * st;
      var z2 = y * st + z1 * ct;
      return [cx + x1 * scale, cy - y1 * scale, z2];
    };
  }

  /**
   * Ink for one mark. `white` is the paper-theme ink value in [0, 1], where 0
   * is the darkest ink on paper; on a dark substrate it is mirrored (1 - white)
   * so near dots read bright, the same depth language on an inverted substrate.
   *
   * PORT ADDITION. The upstream line is the `!ink` branch, unchanged. The
   * coloured branch mixes the ink colour towards the substrate ground by mark
   * strength (1 - white); with the default ink for a substrate, white on dark
   * or black on light, it reduces to exactly the same channel value, so the
   * default rendering is bit-for-bit the upstream one.
   */
  function inkStyle(white, alpha, dark, ink) {
    var w = Math.min(1, Math.max(0, white));
    if (!ink) {
      var g = Math.round((dark ? 1 - w : w) * 255);
      return 'rgba(' + g + ',' + g + ',' + g + ',' + alpha + ')';
    }
    var s = 1 - w;
    var base = dark ? 0 : 255;
    var r = Math.round(base + (ink[0] - base) * s);
    var gg = Math.round(base + (ink[1] - base) * s);
    var b = Math.round(base + (ink[2] - base) * s);
    return 'rgba(' + r + ',' + gg + ',' + b + ',' + alpha + ')';
  }

  /** Painter: z-sorted far to near, matte dots. */
  function paint(ctx, dots, dark, ink) {
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var alpha = dflt(d.a, 1);
      ctx.fillStyle = inkStyle(d.white, alpha, dark, ink);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Stroke pass for edge-based modes. Runs before paint so nodes sit on top. */
  function paintLines(ctx, lines, dark, ink) {
    for (var i = 0; i < lines.length; i++) {
      var l = lines[i];
      var alpha = dflt(l.a, 1);
      ctx.strokeStyle = inkStyle(l.white, alpha, dark, ink);
      ctx.lineWidth = l.w;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
  }

  /**
   * Turn raw mode output into a finished frame: drop invisible marks, clamp
   * radii to the mode's floor, and z-sort far to near into draw order.
   *
   * This runs in the GEOMETRY step, not the painter, so a frame is a complete
   * set of draw instructions: every value is final and the array order is the
   * order to draw in. That is what lets the native ports share this output
   * verbatim, a port draws the list and never re-derives anything, and what
   * lets the golden-vector tests compare numbers instead of pixels.
   */
  function finalizeFrame(dots, lines, rMin) {
    if (rMin === undefined) rMin = 0.3;
    var visible = [];
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      if (dflt(d.a, 1) < 0.02) continue;
      d.r = Math.max(rMin, d.r);
      visible.push(d);
    }
    visible.sort(function (a, b) {
      return a.z - b.z;
    });
    var keptLines = [];
    for (var j = 0; j < lines.length; j++) {
      if (dflt(lines[j].a, 1) >= 0.02) keptLines.push(lines[j]);
    }
    return { dots: visible, lines: keptLines };
  }

  /** Paint a finished frame. Lines first, so nodes sit on top of their edges. */
  function paintFrame(ctx, frame, dark, ink) {
    if (frame.lines.length) paintLines(ctx, frame.lines, dark, ink);
    paint(ctx, frame.dots, dark, ink);
  }

  /**
   * Dot radii were tuned for a 300pt frame; sub-linear scaling keeps small
   * spinners legible. Lower pow means radii shrink less with size.
   */
  function radiusScale(size, pow) {
    return Math.pow(size / 300, pow);
  }

  /* ------------------------------------------------------------------ *
   * engine/profiles.ts
   * Density profiles plus the multiplier machinery that scales them. The base
   * rows are inkform's `fine` profiles; each shipped preset (state by size)
   * applies count and radius multipliers on top, resolved once per mount.
   * ------------------------------------------------------------------ */

  // 2D lattices (rings by dots-per-ring) come in pairs. Each side takes the
  // square root of scale so the TOTAL dot count scales by `scale`; flat lists
  // scale linearly. `iconD` sets the morph outline's sampling density.
  var COUNT_PAIRS = [
    ['latRings', 'lonDensity'],
    ['rings', 'lonDensity'],
    ['lanes', 'segs']
  ];
  var COUNT_KEYS = ['orbitN', 'ghostN', 'nodeN', 'strandN', 'signals'];
  var ICON_DENSITY_KEYS = ['iconD'];

  // Every key that sets a dot's rendered radius. Scaling all of them keeps a
  // dot's near/far falloff intact while shrinking or growing the mark.
  var RADIUS_KEYS = [
    'rBase',
    'rDepth',
    'rActive',
    'rDot',
    'ghostR',
    'partR',
    'partRDepth',
    'nodeR',
    'nodeRDepth'
  ];

  function copyOpts(opts) {
    var out = {};
    for (var k in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, k)) out[k] = opts[k];
    }
    return out;
  }

  function scaleCounts(opts, scale) {
    var out = copyOpts(opts);
    var done = {};
    var rt = Math.sqrt(scale);
    for (var p = 0; p < COUNT_PAIRS.length; p++) {
      var a = COUNT_PAIRS[p][0];
      var b = COUNT_PAIRS[p][1];
      var va = out[a];
      var vb = out[b];
      if (va !== undefined && va !== null && vb !== undefined && vb !== null && !done[a] && !done[b]) {
        out[a] = Math.max(2, Math.round(va * rt));
        out[b] = Math.max(2, Math.round(vb * rt));
        done[a] = true;
        done[b] = true;
      }
    }
    for (var i = 0; i < COUNT_KEYS.length; i++) {
      var k = COUNT_KEYS[i];
      var v = out[k];
      // 0 means the mode opted out of that layer entirely (ring has no ghost
      // sphere), so scaling must not resurrect it as a single stray dot
      if (v !== undefined && v !== null && v !== 0 && !done[k]) out[k] = Math.max(1, Math.round(v * scale));
    }
    for (var j = 0; j < ICON_DENSITY_KEYS.length; j++) {
      var ik = ICON_DENSITY_KEYS[j];
      var iv = out[ik];
      if (iv !== undefined && iv !== null) out[ik] = Math.max(0.02, iv * scale);
    }
    return out;
  }

  function scaleRadii(opts, scale) {
    var out = copyOpts(opts);
    for (var i = 0; i < RADIUS_KEYS.length; i++) {
      var k = RADIUS_KEYS[i];
      var v = out[k];
      if (v !== undefined && v !== null) out[k] = v * scale;
    }
    // remember the multiplier itself: spacing-derived radii (the morph outline)
    // use it, since they are not based on any single radius key
    out.rSizeMul = dflt(out.rSizeMul, 1) * scale;
    return out;
  }

  /** Base (fine) profiles per mode, before preset multipliers. */
  var BASE_PROFILES = {
    globe: {
      latRings: 17,
      lonDensity: 44,
      rBase: 0.6,
      rDepth: 1.7,
      rBoost: 1.0,
      inkFar: 0.62,
      inkSpan: 0.54,
      rsPow: 0.6,
      rMin: 0.3
    },
    orbits: {
      orbitN: 12,
      ghostN: 40,
      ghostR: 0.9,
      ghostA: 0.5,
      particles: 3,
      partR: 1.2,
      partRDepth: 1.6,
      rsPow: 0.6,
      rMin: 0.3
    },
    rubik: {
      latRings: 15,
      lonDensity: 40,
      moveCount: 14,
      rBase: 0.6,
      rDepth: 1.7,
      rActive: 0.3,
      inkFar: 0.62,
      inkSpan: 0.54,
      rsPow: 0.6,
      rMin: 0.3
    },
    wave: {
      rings: 15,
      lonDensity: 40,
      rBase: 0.6,
      rDepth: 1.7,
      rsPow: 0.6,
      rMin: 0.3
    },
    web: {
      nodeN: 30,
      thr: 0.72,
      signals: 5,
      nodeR: 1.4,
      nodeRDepth: 1.8,
      lineW: 0.8,
      rsPow: 0.6,
      rMin: 0.3
    },
    braid: {
      strandN: 52,
      turns: 3.0,
      ghostN: 150,
      rBase: 1.2,
      rDepth: 1.8,
      rsPow: 0.6,
      rMin: 0.3
    },
    ribbon: {
      lanes: 5,
      segs: 88,
      ghostN: 150,
      rBase: 1.1,
      rDepth: 1.7,
      rsPow: 0.6,
      rMin: 0.3
    },
    // ring shares ribbon's painter; faceOn cancels the camera tilt and moves
    // the undulation onto the radius, and there is no ghost sphere behind it
    ring: {
      lanes: 5,
      segs: 88,
      ghostN: 0,
      faceOn: 1,
      rBase: 1.1,
      rDepth: 1.7,
      rsPow: 0.6,
      rMin: 0.3
    },
    morph: {
      rDot: 0.021,
      iconD: 1,
      rMin: 0.25
    }
  };

  /* ------------------------------------------------------------------ *
   * engine/orbits.ts
   * Orbits: particles on tilted orbits, the "working" state. No nucleus (the
   * tuned preset runs coreless): just ghost paths and the particles doing the
   * work.
   * ------------------------------------------------------------------ */

  function frameOrbits(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    var R = (size / 2) * 0.82;
    var pt = makeProj(t * 0.12, 0.3, cx, cy, 1);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));

    var dots = [];
    var orbitN = dflt(o.orbitN, 12);
    var ghostN = dflt(o.ghostN, 40);
    var particles = dflt(o.particles, 3);

    // orbits: each a tilted circle, a ghost path plus running particles
    for (var orb = 0; orb < orbitN; orb++) {
      var h1 = hashD(orb, 1.7);
      var h2 = hashD(orb, 5.2);
      var h3 = hashD(orb, 8.9);
      var ro = R * (0.45 + 0.52 * h1);
      var th = h1 * 2 * Math.PI;
      var phi = Math.acos(2 * h2 - 1);
      // orbit plane basis (u, v perpendicular to normal n)
      var nx = Math.sin(phi) * Math.cos(th);
      var ny = Math.cos(phi);
      var nz = Math.sin(phi) * Math.sin(th);
      var ux = -ny;
      var uy = nx;
      var uz = 0;
      var ul = Math.max(1e-6, Math.sqrt(ux * ux + uy * uy));
      ux /= ul;
      uy /= ul;
      var vx = ny * uz - nz * uy;
      var vy = nz * ux - nx * uz;
      var vz = nx * uy - ny * ux;
      var speed = (0.25 + 0.55 * h3) * (h3 > 0.5 ? 1 : -1);

      // ghost path
      for (var k = 0; k < ghostN; k++) {
        var a = (k / ghostN) * 2 * Math.PI;
        var g = pt(
          (ux * Math.cos(a) + vx * Math.sin(a)) * ro,
          (uy * Math.cos(a) + vy * Math.sin(a)) * ro,
          (uz * Math.cos(a) + vz * Math.sin(a)) * ro
        );
        var gDepth = (g[2] / ro + 1) / 2;
        dots.push({
          x: g[0],
          y: g[1],
          z: g[2],
          r: dflt(o.ghostR, 0.9) * rs,
          white: 0.72,
          a: dflt(o.ghostA, 0.5) * (0.4 + 0.6 * gDepth)
        });
      }
      // the particles doing the work
      for (var m = 0; m < particles; m++) {
        var pa = t * speed + (m / particles) * 2 * Math.PI + h2 * 6;
        var p = pt(
          (ux * Math.cos(pa) + vx * Math.sin(pa)) * ro,
          (uy * Math.cos(pa) + vy * Math.sin(pa)) * ro,
          (uz * Math.cos(pa) + vz * Math.sin(pa)) * ro
        );
        var pDepth = (p[2] / ro + 1) / 2;
        dots.push({
          x: p[0],
          y: p[1],
          z: p[2],
          r: (dflt(o.partR, 1.2) + dflt(o.partRDepth, 1.6) * pDepth) * rs,
          white: 0.3 - 0.22 * pDepth
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/lattice.ts
   * The sphere-lattice modes: globe (searching), rubik (solving) and wave
   * (listening). All draw a lat/long dot field with mode-specific motion, then
   * hand off to the shared z-sorted painter.
   * ------------------------------------------------------------------ */

  // --- the shared solver heartbeat (rubik) ------------------------------
  // Rapid eased moves scramble, then replay in reverse (palindrome) so
  // everything clicks back to solved, rests, repeats.

  function solveCycle(time, count, slotDur, rest) {
    var cyc = 2 * count * slotDur + rest;
    var tc = time % cyc;
    var amount = new Array(count);
    for (var z = 0; z < count; z++) amount[z] = 0;
    var active = -1;
    if (tc < 2 * count * slotDur) {
      var slot = Math.floor(tc / slotDur);
      var p = (tc - slot * slotDur) / slotDur;
      var cl = Math.min(1, p / 0.7);
      var ep = 1 - Math.pow(1 - cl, 3); // machine ease-out
      if (slot < count) {
        for (var i = 0; i < slot; i++) amount[i] = 1;
        amount[slot] = ep;
        active = slot;
      } else {
        var u = 2 * count - 1 - slot;
        for (var j = 0; j < u; j++) amount[j] = 1;
        amount[u] = 1 - ep;
        active = u;
      }
    }
    return { amount: amount, active: active };
  }

  function applyMoves(pt3, moves, sc) {
    var x = pt3[0];
    var y = pt3[1];
    var z = pt3[2];
    var inActive = false;
    for (var i = 0; i < moves.length; i++) {
      if (sc.amount[i] <= 0) continue;
      var mv = moves[i];
      var coord = mv.axis === 0 ? x : mv.axis === 1 ? y : z;
      if (coord < mv.lo || coord >= mv.hi) continue;
      if (i === sc.active) inActive = true;
      var a = mv.ang * sc.amount[i];
      var ca = Math.cos(a);
      var sa = Math.sin(a);
      if (mv.axis === 0) {
        var y2 = y * ca - z * sa;
        z = y * sa + z * ca;
        y = y2;
      } else if (mv.axis === 1) {
        var x2 = x * ca + z * sa;
        z = -x * sa + z * ca;
        x = x2;
      } else {
        var x3 = x * ca - y * sa;
        y = x * sa + y * ca;
        x = x3;
      }
    }
    return [x, y, z, inActive];
  }

  function makeMoves(count) {
    var moves = [];
    for (var i = 0; i < count; i++) {
      var axis = Math.min(2, Math.floor(hashD(i, 2.3) * 3));
      var lo = -1.0 + 0.5 * Math.min(3, Math.floor(hashD(i, 5.9) * 4));
      var dir = hashD(i, 7.7) < 0.5 ? 1 : -1;
      moves.push({ axis: axis, lo: lo, hi: lo + 0.5, ang: (dir * Math.PI) / 2 });
    }
    return moves;
  }

  // --- Globe: lat/long field, a scan meridian sweeps, searching ---------

  function frameGlobe(size, t, o) {
    var spin = 0.5;
    var cx = size / 2;
    var cy = size / 2;
    var radius = (size / 2) * 0.82;
    var tilt = 0.4 + 0.06 * Math.sin(t * 0.35);
    var pt = makeProj(t * spin, tilt, cx, cy, radius);
    // scan sweeps relative to the spin; scanMul scales that relative rate
    var scan = t * (spin + (1.7 - spin) * dflt(o.scanMul, 1));
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));
    var dimBase = dflt(o.dimBase, 1);

    var dots = [];
    var latRings = dflt(o.latRings, 17);
    var lonDensity = dflt(o.lonDensity, 44);
    for (var li = 0; li <= latRings; li++) {
      var lat = -Math.PI / 2 + (li / latRings) * Math.PI;
      var cosLat = Math.cos(lat);
      var sinLat = Math.sin(lat);
      var lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));
      for (var lj = 0; lj < lonCount; lj++) {
        var lon = (lj / lonCount) * 2 * Math.PI;
        var q = pt(cosLat * Math.cos(lon), sinLat, cosLat * Math.sin(lon));
        var depth = (q[2] + 1) / 2;
        // the scan: a moving meridian read as a size ripple, not a shine
        var d = angleDelta(lon + t * spin, scan);
        var boost = Math.exp(-(d * d) / 0.18) * Math.max(0, q[2]);
        dots.push({
          x: q[0],
          y: q[1],
          z: q[2],
          r: (dflt(o.rBase, 0.6) + dflt(o.rDepth, 1.7) * depth + dflt(o.rBoost, 1) * boost) * rs,
          white: dflt(o.inkFar, 0.62) - dflt(o.inkSpan, 0.54) * depth,
          // dimBase below 1 fades un-scanned dots so the meridian reads clearly
          a: dimBase + (1 - dimBase) * Math.min(1, boost)
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  // --- Rubik: bands twist in quarter turns, scramble to solve, solving --

  function frameRubik(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    var R = (size / 2) * 0.82;
    var pt = makeProj(t * 0.55, 0.35 + 0.1 * Math.sin(t * 0.9), cx, cy, R);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));
    var moveCount = dflt(o.moveCount, 14);
    var moves = makeMoves(moveCount);
    var sc = solveCycle(t, moveCount, 0.42, 1.2);

    var dots = [];
    var latRings = dflt(o.latRings, 15);
    var lonDensity = dflt(o.lonDensity, 40);
    for (var li = 0; li <= latRings; li++) {
      var lat = -Math.PI / 2 + (li / latRings) * Math.PI;
      var cosLat = Math.cos(lat);
      var sinLat = Math.sin(lat);
      var lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));
      for (var lj = 0; lj < lonCount; lj++) {
        var lon = (lj / lonCount) * 2 * Math.PI;
        var mv = applyMoves([cosLat * Math.cos(lon), sinLat, cosLat * Math.sin(lon)], moves, sc);
        var inActive = mv[3];
        var q = pt(mv[0], mv[1], mv[2]);
        var depth = (q[2] + 1) / 2;
        // the band being turned inks a touch darker, the "hand"
        dots.push({
          x: q[0],
          y: q[1],
          z: q[2],
          r: (dflt(o.rBase, 0.6) + dflt(o.rDepth, 1.7) * depth + (inActive ? dflt(o.rActive, 0.3) : 0)) * rs,
          white: dflt(o.inkFar, 0.62) - dflt(o.inkSpan, 0.54) * depth - (inActive ? 0.14 : 0)
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  // --- Wave: a waveform rolls through the rings, listening --------------

  function frameWave(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    // 0.76 base times 1.15: the undulation pulls the sphere inward, so wave
    // read about 15% smaller than the other lattice modes; scaled up to match
    var R = (size / 2) * 0.874;
    var pt = makeProj(t * 0.18, 0.38, cx, cy, 1);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));

    var dots = [];
    var rings = dflt(o.rings, 15);
    var lonDensity = dflt(o.lonDensity, 40);
    for (var ri = 0; ri <= rings; ri++) {
      var lat = -Math.PI / 2 + (ri / rings) * Math.PI;
      var cosLat = Math.cos(lat);
      var sinLat = Math.sin(lat);
      // two waves, different tempi: organic, never quite repeating
      var w = 0.62 * Math.sin(t * 2.1 - ri * 0.52) + 0.38 * Math.sin(t * 1.27 + ri * 0.83);
      var rr = R * (0.88 + 0.105 * w);
      var lonCount = Math.max(1, Math.round(Math.abs(cosLat) * lonDensity));
      for (var lj = 0; lj < lonCount; lj++) {
        var lon = (lj / lonCount) * 2 * Math.PI;
        var q = pt(cosLat * Math.cos(lon) * rr, sinLat * rr, cosLat * Math.sin(lon) * rr);
        var depth = (q[2] / R + 1) / 2;
        var crest = Math.max(0, w);
        dots.push({
          x: q[0],
          y: q[1],
          z: q[2],
          r: (dflt(o.rBase, 0.6) + dflt(o.rDepth, 1.7) * depth) * (1 + 0.4 * crest) * rs,
          white: 0.66 - 0.56 * depth - 0.1 * crest
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/web.ts
   * Web: a constellation wires itself, the "connecting" state. Nodes drift on
   * the sphere under slow value noise; any pair closer than `thr` grows an
   * edge, and bright packets run along randomly re-picked node pairs.
   * ------------------------------------------------------------------ */

  function frameWeb(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    var R = (size / 2) * 0.8 * dflt(o.spread, 1);
    // note the projector carries the radius as its scale, so node vectors stay
    // unit-length and distances below are in unit-sphere space
    var pt = makeProj(t * 0.12, 0.32, cx, cy, R);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));

    var nodeN = dflt(o.nodeN, 30);
    var thr = dflt(o.thr, 0.72);
    var nodeR = dflt(o.nodeR, 1.4);
    var nodeRDepth = dflt(o.nodeRDepth, 1.8);

    // nodes: fib lattice plus slow noise wander, renormalised to the surface
    var nodes = [];
    for (var i = 0; i < nodeN; i++) {
      var dir = fibDir(i, nodeN);
      var x = dir[0] + 0.3 * (vnoise(i * 0.31 + 9, t * 0.24) - 0.5) * 2;
      var y = dir[1] + 0.3 * (vnoise(i * 0.53 + 27, t * 0.21) - 0.5) * 2;
      var z = dir[2] + 0.3 * (vnoise(i * 0.77 + 55, t * 0.27) - 0.5) * 2;
      var l = Math.sqrt(x * x + y * y + z * z);
      nodes.push([x / l, y / l, z / l]);
    }

    var lines = [];
    var dots = [];

    // edges between close neighbours, alpha by proximity plus depth
    for (var a1 = 0; a1 < nodeN; a1++) {
      for (var b1 = a1 + 1; b1 < nodeN; b1++) {
        var dx = nodes[a1][0] - nodes[b1][0];
        var dy = nodes[a1][1] - nodes[b1][1];
        var dz = nodes[a1][2] - nodes[b1][2];
        var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist >= thr) continue;
        var p1 = pt(nodes[a1][0], nodes[a1][1], nodes[a1][2]);
        var p2 = pt(nodes[b1][0], nodes[b1][1], nodes[b1][2]);
        var edgeDepth = ((p1[2] + p2[2]) / 2 + 1) / 2;
        lines.push({
          x1: p1[0],
          y1: p1[1],
          x2: p2[0],
          y2: p2[1],
          white: 0.42,
          a: (1 - dist / thr) * (0.3 + 0.55 * edgeDepth),
          w: Math.max(0.6, dflt(o.lineW, 0.8) * rs)
        });
      }
    }

    for (var n = 0; n < nodeN; n++) {
      var np = pt(nodes[n][0], nodes[n][1], nodes[n][2]);
      var nDepth = (np[2] + 1) / 2;
      var pulse = 1 + 0.25 * Math.sin(t * 1.4 + n * 2.7);
      dots.push({
        x: np[0],
        y: np[1],
        z: np[2],
        r: (nodeR + nodeRDepth * nDepth) * pulse * rs,
        white: 0.55 - 0.45 * nDepth
      });
    }

    // signals: bright packets running between paired nodes
    var signals = dflt(o.signals, 5);
    for (var s = 0; s < signals; s++) {
      var seg = Math.floor(t * 0.55 + s * 7.31);
      var a = Math.floor(hashD(seg, s * 3.1 + 1.7) * nodeN);
      var b = Math.floor(hashD(seg, s * 5.7 + 4.2) * nodeN);
      if (a === b) continue;
      var f = frac(t * 0.55 + s * 7.31);
      var sx = lerp(nodes[a][0], nodes[b][0], f);
      var sy = lerp(nodes[a][1], nodes[b][1], f);
      var sz = lerp(nodes[a][2], nodes[b][2], f);
      var sl = Math.max(1e-6, Math.sqrt(sx * sx + sy * sy + sz * sz));
      var sp = pt(sx / sl, sy / sl, sz / sl);
      var sDepth = (sp[2] + 1) / 2;
      dots.push({
        x: sp[0],
        y: sp[1],
        z: sp[2],
        r: (nodeR * 1.5 + nodeRDepth * sDepth) * rs,
        white: 0.05,
        a: 0.5 + 0.5 * sDepth
      });
    }

    return finalizeFrame(dots, lines, o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/braid.ts
   * Braid: three strands plait around the sphere, the "weaving" state. Each
   * strand runs pole to pole on a helix, and a radial breathing term makes
   * them trade places, reading as the over/under of a plait.
   * ------------------------------------------------------------------ */

  function frameBraid(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    var R = (size / 2) * 0.76;
    var pt = makeProj(t * 0.4, 0.3, cx, cy, 1);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));

    var dots = [];
    var ghostN = dflt(o.ghostN, 150);
    for (var i = 0; i < ghostN; i++) {
      var d = fibDir(i, ghostN);
      var g = pt(d[0] * R, d[1] * R, d[2] * R);
      var gDepth = (g[2] / R + 1) / 2;
      dots.push({ x: g[0], y: g[1], z: g[2], r: 0.8 * rs, white: 0.78, a: 0.1 + 0.22 * gDepth });
    }

    var strandN = dflt(o.strandN, 52);
    var turns = dflt(o.turns, 3);
    for (var s = 0; s < 3; s++) {
      var phase = (s / 3) * 2 * Math.PI;
      for (var k = 0; k < strandN; k++) {
        // u walks pole to pole; the frac() drift slides the whole strand along
        var u = (frac(k / strandN + t * 0.045) * 2 - 1) * 0.96;
        var surf = Math.sqrt(Math.max(0, 1 - u * u));
        var endFade = Math.min(1, (1 - Math.abs(u)) / 0.1);
        var a = u * Math.PI * turns + phase;
        // radial breathing: strands trade places, the over/under of a plait
        var weave = 1 + 0.075 * Math.sin(u * Math.PI * turns * 2 + phase * 2 + t * 0.8);
        var rr = surf * R * weave;
        var q = pt(Math.cos(a) * rr, u * R * weave, Math.sin(a) * rr);
        var depth = (q[2] / R + 1) / 2;
        dots.push({
          x: q[0],
          y: q[1],
          z: q[2],
          r: (dflt(o.rBase, 1.2) + dflt(o.rDepth, 1.8) * depth) * rs,
          white: 0.55 - 0.45 * depth,
          a: endFade * (0.45 + 0.55 * depth)
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/ribbon.ts
   * Ribbon: an undulating sash of parallel strands rides a great circle, the
   * "composing" state. The tuned preset freezes the 3D tumble (spin 0),
   * leaving the traveling undulation on a fixed band.
   *
   * The same painter also drives "breathing" (ring), via the `faceOn` flag: a
   * face-on circle whose radius, not its out-of-plane offset, undulates, so it
   * reads as a ring slowly morphing rather than a sash in orbit.
   * ------------------------------------------------------------------ */

  function frameRibbon(size, t, o) {
    var cx = size / 2;
    var cy = size / 2;
    var R = (size / 2) * 0.78;
    // spin scales the 3D tumble; spin=0 freezes the band's orientation,
    // leaving only the traveling undulation
    var spin = dflt(o.spin, 1);
    var camTilt = 0.3;
    var pt = makeProj(t * 0.1 * spin, camTilt, cx, cy, 1);
    var rs = radiusScale(size, dflt(o.rsPow, 0.6));

    var dots = [];
    var ghostN = dflt(o.ghostN, 150);
    for (var i = 0; i < ghostN; i++) {
      var d = fibDir(i, ghostN);
      var g = pt(d[0] * R, d[1] * R, d[2] * R);
      var gDepth = (g[2] / R + 1) / 2;
      dots.push({ x: g[0], y: g[1], z: g[2], r: 0.8 * rs, white: 0.78, a: 0.1 + 0.22 * gDepth });
    }

    // The band plane, precessing (frozen when spin=0). The projection squashes
    // the band's great circle vertically by cos(ta + camTilt); face-on sets
    // ta = -camTilt so that term is 1 and the band reads as a true circle
    // rather than ribbon's tilted ellipse.
    var ya = t * 0.24 * spin;
    var ta = o.faceOn ? -camTilt : 0.55 + 0.3 * Math.sin(t * 0.18) * spin;
    var ux = Math.cos(ya);
    var uy = 0;
    var uz = Math.sin(ya);
    var vx = -uz * Math.sin(ta);
    var vy = Math.cos(ta);
    var vz = ux * Math.sin(ta);
    // plane normal n = u cross v
    var nx = uy * vz - uz * vy;
    var ny = uz * vx - ux * vz;
    var nz = ux * vy - uy * vx;

    // Radial lobes swell past R, so pull the base radius in by (most of) the
    // wobble amplitude. The silhouette then stays inside the frame however far
    // the deformation is pushed, while lobes keep getting deeper relative to
    // the mean radius.
    var wobAmp = 0.23 * dflt(o.wobMul, 1);
    var baseR = o.faceOn ? R / (1 + 0.85 * wobAmp) : R;

    var baseLanes = dflt(o.lanes, 5);
    var segs = dflt(o.segs, 88);
    var lanes = Math.max(1, Math.round(baseLanes * dflt(o.bandMul, 1)));
    for (var w = 0; w < lanes; w++) {
      var laneOff = (w - (lanes - 1) / 2) * 0.075;
      var edge = Math.abs(w - (lanes - 1) / 2) / Math.max(1, (lanes - 1) / 2);
      for (var k = 0; k < segs; k++) {
        var a = (k / segs) * 2 * Math.PI;
        // the undulation: two traveling waves along the band; wobMul scales
        // the deformation, and 0 is a clean band
        var wob =
          (0.16 * Math.sin(a * 3 - t * 1.7 + w * 0.22) + 0.07 * Math.sin(a * 5 + t * 1.1)) * dflt(o.wobMul, 1);
        // A normal-direction wobble is cancelled by the re-normalisation below:
        // the point lands back on the sphere, so the silhouette is pinned at R
        // and the deformation can only ever pull dots inward. Face-on instead
        // modulates the in-plane RADIUS, so lobes genuinely swell outward and
        // pinch inward. Ribbon keeps the original out-of-plane sash wobble.
        var radial = o.faceOn ? 1 + wob : 1;
        var off = o.faceOn ? laneOff : laneOff + wob;
        var x = ux * Math.cos(a) + vx * Math.sin(a) + nx * off;
        var y = uy * Math.cos(a) + vy * Math.sin(a) + ny * off;
        var z = uz * Math.cos(a) + vz * Math.sin(a) + nz * off;
        var l = Math.sqrt(x * x + y * y + z * z);
        var rr = baseR * radial;
        var q = pt((x / l) * rr, (y / l) * rr, (z / l) * rr);
        var depth = (q[2] / R + 1) / 2;
        dots.push({
          x: q[0],
          y: q[1],
          z: q[2],
          r: (dflt(o.rBase, 1.1) + dflt(o.rDepth, 1.7) * depth) * (1 - 0.25 * edge) * rs,
          white: 0.52 - 0.44 * depth + 0.18 * edge,
          a: 0.4 + 0.6 * depth
        });
      }
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/morph.ts
   * Morph: a dotted outline cycling circle to triangle to square to circle,
   * the "shaping" state. Each shape is a continuous closed path parameterised
   * by arc length (top-centre start, clockwise). Every frame the engine blends
   * the two neighbouring paths, then lays the dots EVENLY along the blended
   * outline, so spacing stays uniform at every instant of the morph, holds and
   * transitions alike.
   * ------------------------------------------------------------------ */

  function smoothE(x) {
    return x * x * (3 - 2 * x);
  }

  function polyPath(verts) {
    var V = verts.length;
    var L = [];
    var total = 0;
    for (var i = 0; i < V; i++) {
      var a = verts[i];
      var b = verts[(i + 1) % V];
      var l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      L.push(l);
      total += l;
    }
    return function (f) {
      var target = f * total;
      var i2 = 0;
      while (target > L[i2] && i2 < V - 1) {
        target -= L[i2];
        i2++;
      }
      var a2 = verts[i2];
      var b2 = verts[(i2 + 1) % V];
      var ff = L[i2] ? Math.min(1, target / L[i2]) : 0;
      return [a2[0] + (b2[0] - a2[0]) * ff, a2[1] + (b2[1] - a2[1]) * ff];
    };
  }

  var CIRCLE = function (f) {
    var a = -Math.PI / 2 + f * 2 * Math.PI;
    return [Math.cos(a) * 0.24, Math.sin(a) * 0.24];
  };
  var TRIANGLE = polyPath([
    [0.0, -0.26],
    [0.24, 0.16],
    [-0.24, 0.16]
  ]);
  // 5-vertex walk so the path STARTS at top-centre like the other shapes
  var SQUARE = polyPath([
    [0, -0.2],
    [0.2, -0.2],
    [0.2, 0.2],
    [-0.2, 0.2],
    [-0.2, -0.2]
  ]);
  var CYCLE = [CIRCLE, TRIANGLE, SQUARE];

  // low floor keeps sparse outlines possible while never degenerating
  function morphN(d) {
    return Math.max(6, Math.round(34 * d));
  }

  var HOLD = 1.4;
  var MORPH = 0.9;
  var SEG = HOLD + MORPH;

  // This state was tuned in inkform, which paints it through a blur plus
  // threshold "goo" filter; we draw plain circles instead, since `ctx.filter`
  // and SVG filter refs are not safe to rely on across Chrome, Safari and
  // Firefox. The dot GEOMETRY is identical either way: the threshold just
  // yields a hard edge where a plain fill has an antialiased one, so these dots
  // read a touch softer than inkform's. Do not "correct" for that by shrinking
  // the radius, it makes the mark genuinely smaller than the tuning.

  function frameMorph(size, t, o) {
    var K = CYCLE.length;
    var tc = t % (SEG * K);
    var k = Math.floor(tc / SEG);
    var local = tc - k * SEG;
    var m = local > HOLD ? smoothE((local - HOLD) / MORPH) : 0;
    var sprd = dflt(o.spread, 1);

    // blend the two shape PATHS at m, then measure the blended outline
    var pA = CYCLE[k];
    var pB = CYCLE[(k + 1) % K];
    var M = 160;
    var pts = [];
    for (var i = 0; i < M; i++) {
      var f0 = i / M;
      var a0 = pA(f0);
      var b0 = pB(f0);
      pts.push([(a0[0] + (b0[0] - a0[0]) * m) * sprd, (a0[1] + (b0[1] - a0[1]) * m) * sprd]);
    }
    var L = [];
    var total = 0;
    for (var j = 0; j < M; j++) {
      var a1 = pts[j];
      var b1 = pts[(j + 1) % M];
      var l = Math.hypot(b1[0] - a1[0], b1[1] - a1[1]);
      L.push(l);
      total += l;
    }

    // dot radius depends ONLY on rDot (the size knob); the count sets the gaps.
    // Formed shapes breathe a little (uniform pulse).
    var n = morphN(dflt(o.iconD, 1));
    var re = dflt(o.rDot, 0.021) * 1.35 * sprd;
    var pulse = 1 + 0.02 * Math.sin(local * 3.1);

    var dots = [];
    var c2 = size / 2;
    var seg = 0;
    var acc = 0;
    for (var k2 = 0; k2 < n; k2++) {
      var target = (k2 / n) * total;
      while (acc + L[seg] < target && seg < M - 1) {
        acc += L[seg];
        seg++;
      }
      var a = pts[seg];
      var b = pts[(seg + 1) % M];
      var f = L[seg] ? Math.min(1, (target - acc) / L[seg]) : 0;
      var x = (a[0] + (b[0] - a[0]) * f) * pulse;
      var y = (a[1] + (b[1] - a[1]) * f) * pulse;
      dots.push({
        x: c2 + x * size,
        y: c2 + y * size,
        z: 0,
        r: Math.max(0.35, re * size),
        white: 0.1
      });
    }
    return finalizeFrame(dots, [], o.rMin);
  }

  /* ------------------------------------------------------------------ *
   * engine/registry.ts
   * Mode key to geometry builder. Kept separate from the presets so tree
   * shaking can in principle drop unused modes in custom builds.
   * ------------------------------------------------------------------ */

  var MODE_FRAMES = {
    orbits: frameOrbits,
    globe: frameGlobe,
    rubik: frameRubik,
    wave: frameWave,
    web: frameWeb,
    braid: frameBraid,
    ribbon: frameRibbon,
    // ring shares ribbon's geometry, the `faceOn` profile flag switches it
    ring: frameRibbon,
    morph: frameMorph
  };

  /** Canvas painters, derived from the geometry. The 2D-canvas binding. */
  function makeDraw(frameFn) {
    return function (ctx, size, t, dark, opts, ink) {
      paintFrame(ctx, frameFn(size, t, opts), dark, ink);
    };
  }

  var MODE_DRAWS = {};
  (function () {
    var keys = Object.keys(MODE_FRAMES);
    for (var i = 0; i < keys.length; i++) MODE_DRAWS[keys[i]] = makeDraw(MODE_FRAMES[keys[i]]);
  })();

  /* ------------------------------------------------------------------ *
   * presets.ts
   * The shipped tunings: nine states by two sizes, baked from the inkform
   * mini-page tuning session. `count` and `size` are multipliers over the base
   * fine profiles; `speed` multiplies the shared clock. Resolved once per
   * (state, size) pair and cached, so the render loop sees plain numbers.
   * ------------------------------------------------------------------ */

  var STATE_TO_MODE = {
    working: 'orbits',
    searching: 'globe',
    solving: 'rubik',
    listening: 'wave',
    connecting: 'web',
    weaving: 'braid',
    composing: 'ribbon',
    breathing: 'ring',
    shaping: 'morph'
  };

  var PRESETS = {
    orbits: {
      64: { speed: 1.885, count: 1, size: 1 },
      20: { speed: 3.9, count: 0.238, size: 2.4 }
    },
    globe: {
      64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
      20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } }
    },
    rubik: {
      64: { speed: 1.82, count: 0.35, size: 1.05 },
      20: { speed: 1.95, count: 0.088, size: 1.9 }
    },
    wave: {
      64: { speed: 4.388, count: 0.341, size: 1 },
      20: { speed: 3.998, count: 0.105, size: 1.6 }
    },
    web: {
      64: { speed: 3.315, count: 1.35, size: 0.95 },
      20: { speed: 6.63, count: 0.25, size: 1.52 }
    },
    braid: {
      64: { speed: 1.625, count: 0.5, size: 1 },
      20: { speed: 2.75, count: 0.1125, size: 1.36 }
    },
    ribbon: {
      64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
      20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } }
    },
    ring: {
      64: { speed: 3.24, count: 0.25, size: 0.956, extra: { spin: 0, bandMul: 3.627, wobMul: 0.368 } },
      20: { speed: 3.78, count: 0.028, size: 1.622, extra: { spin: 0, bandMul: 3.968, wobMul: 0.565 } }
    },
    morph: {
      64: { speed: 2.405, count: 0.702, size: 0.395, extra: { spread: 1.45 } },
      20: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } }
    }
  };

  var presetCache = {};

  /** Resolve a (state, size) pair to its mode plus fully-scaled draw options. */
  function resolvePreset(state, size) {
    var key = state + '-' + size;
    if (presetCache[key]) return presetCache[key];

    var mode = STATE_TO_MODE[state];
    var preset = PRESETS[mode][size];
    var opts = copyOpts(BASE_PROFILES[mode]);
    if (preset.count !== 1) opts = scaleCounts(opts, preset.count);
    if (preset.size !== 1) opts = scaleRadii(opts, preset.size);
    if (preset.extra) {
      var extra = preset.extra;
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) opts[k] = extra[k];
      }
    }

    var resolved = { mode: mode, speed: preset.speed, opts: opts };
    presetCache[key] = resolved;
    return resolved;
  }

  /* ------------------------------------------------------------------ *
   * ThinkingOrb.tsx plus theme.ts, as a plain mount()
   * One shared clock (performance.now) keeps every mounted orb in phase; each
   * instance runs its own rAF loop but pauses automatically while offscreen
   * (IntersectionObserver) or when the tab is hidden (visibilitychange).
   * Reduced-motion users get a static representative frame that still follows
   * the live theme.
   * ------------------------------------------------------------------ */

  var STATES = [
    'working',
    'searching',
    'solving',
    'listening',
    'connecting',
    'weaving',
    'composing',
    'breathing',
    'shaping'
  ];

  var LABELS = {
    working: 'Working…',
    searching: 'Searching…',
    solving: 'Solving…',
    listening: 'Listening…',
    connecting: 'Connecting…',
    weaving: 'Weaving…',
    composing: 'Composing…',
    breathing: 'Thinking…',
    shaping: 'Shaping…'
  };

  /** The two tuned designs. They are separate designs, not a scale factor. */
  var TUNED_SIZES = [64, 20];

  function nearestTuned(size) {
    return Math.abs(size - 20) < Math.abs(size - 64) ? 20 : 64;
  }

  function ancestorTheme(el) {
    var node = el;
    while (node) {
      var attr = node.getAttribute ? node.getAttribute('data-theme') : null;
      if (attr === 'dark') return true;
      if (attr === 'light') return false;
      if (node.classList && node.classList.contains('dark')) return true;
      if (node.classList && node.classList.contains('light')) return false;
      node = node.parentElement;
    }
    return null;
  }

  function systemDark() {
    return typeof matchMedia === 'undefined' || matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function prefersReducedMotion() {
    if (typeof matchMedia === 'undefined') return false;
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function now() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  // Colour parsing (port addition). Any CSS colour string, or an [r, g, b]
  // triple. Invalid strings resolve to null, which falls back to the
  // monochrome ink, rather than silently painting black on a black ground.
  var scratchCtx = null;

  function scratch() {
    if (!scratchCtx && typeof document !== 'undefined') {
      var c = document.createElement('canvas');
      c.width = 1;
      c.height = 1;
      scratchCtx = c.getContext('2d');
    }
    return scratchCtx;
  }

  function parseInk(value) {
    if (value === undefined || value === null || value === '') return null;
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return [clamp255(value[0]), clamp255(value[1]), clamp255(value[2])];
    }
    if (typeof value !== 'string') return null;
    var ctx = scratch();
    if (!ctx) return null;
    // two different starting values: an unparseable colour leaves each of them
    // in place, so the two readings disagree and the value is rejected
    ctx.fillStyle = '#000000';
    ctx.fillStyle = value;
    var first = ctx.fillStyle;
    ctx.fillStyle = '#ffffff';
    ctx.fillStyle = value;
    if (first !== ctx.fillStyle) return null;
    return hexOrRgbToTriple(first);
  }

  function clamp255(n) {
    return Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
  }

  function hexOrRgbToTriple(css) {
    if (css.charAt(0) === '#') {
      if (css.length === 4) {
        return [
          parseInt(css.charAt(1) + css.charAt(1), 16),
          parseInt(css.charAt(2) + css.charAt(2), 16),
          parseInt(css.charAt(3) + css.charAt(3), 16)
        ];
      }
      return [
        parseInt(css.slice(1, 3), 16),
        parseInt(css.slice(3, 5), 16),
        parseInt(css.slice(5, 7), 16)
      ];
    }
    var nums = css.match(/[\d.]+/g);
    if (nums && nums.length >= 3) return [clamp255(nums[0]), clamp255(nums[1]), clamp255(nums[2])];
    return null;
  }

  /**
   * Mount an orb on a canvas and start it.
   *
   * options:
   *   state   one of the nine states. Default 'working'.
   *   size    displayed size in CSS pixels. Default 64.
   *   preset  which tuned design to draw, 64 or 20. Default: whichever is
   *           nearer to `size`. The geometry is drawn at the tuned size and
   *           magnified by size/preset through the context transform, so a
   *           large orb is the tuned design enlarged, not a re-tuned one.
   *   theme   'auto' (default), 'dark' or 'light'. Auto reads an ancestor
   *           data-theme or .dark/.light class, then prefers-color-scheme,
   *           and follows live changes to either.
   *   colour  optional ink colour, any CSS colour or an [r, g, b] triple.
   *           Omitted, the orb is the upstream monochrome. `color` also works.
   *   speed   multiplier on the preset's baked speed. Default 1.
   *   paused  start frozen on the first frame. Default false.
   *   reducedMotion  force the static frame on or off. Default: follow
   *           prefers-reduced-motion, live.
   *   autoPause  pause offscreen and on hidden tabs. Default true.
   *   label   aria-label. Default: the per-state label.
   *
   * Returns a handle: stop(), pause(), resume(), setState(), setSpeed(),
   * setColour(), setTheme(), and the canvas.
   */
  function mount(canvas, options) {
    var o = options || {};
    if (!canvas || !canvas.getContext) throw new Error('ThinkingOrbs.mount: pass a <canvas> element');
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ThinkingOrbs.mount: no 2D context on this canvas');

    var state = STATE_TO_MODE[o.state] ? o.state : 'working';
    var cssSize = typeof o.size === 'number' && o.size > 0 ? o.size : 64;
    var tuned = o.preset === 64 || o.preset === 20 ? o.preset : nearestTuned(cssSize);
    var mag = cssSize / tuned;
    var speedMul = typeof o.speed === 'number' ? o.speed : 1;
    var themeMode = o.theme === 'dark' || o.theme === 'light' ? o.theme : 'auto';
    var ink = parseInk(o.colour !== undefined ? o.colour : o.color);
    var autoPause = o.autoPause !== false;
    var forcedReduced = o.reducedMotion === undefined ? null : !!o.reducedMotion;
    var reduced = forcedReduced === null ? prefersReducedMotion() : forcedReduced;

    var dpr = Math.min(2, (typeof devicePixelRatio !== 'undefined' && devicePixelRatio) || 1);
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    canvas.style.width = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    canvas.style.display = 'block';
    if (!canvas.getAttribute('role')) canvas.setAttribute('role', 'img');
    if (!canvas.getAttribute('aria-label')) canvas.setAttribute('aria-label', o.label || LABELS[state]);

    var resolved = resolvePreset(state, tuned);
    var dark = true;
    var lastT = 0.6;
    var raf = 0;
    var running = false;
    var paused = !!o.paused;
    var visible = true;
    var stopped = false;

    function effSpeed() {
      return resolved.speed * speedMul;
    }

    function clock() {
      return (now() / 1000) * effSpeed();
    }

    function frame(tSec) {
      lastT = tSec;
      ctx.setTransform(dpr * mag, 0, 0, dpr * mag, 0, 0);
      ctx.clearRect(0, 0, tuned, tuned);
      MODE_DRAWS[resolved.mode](ctx, tuned, tSec, dark, resolved.opts, ink);
    }

    function repaint() {
      frame(lastT);
    }

    function loop() {
      frame(clock());
      if (running) raf = requestAnimationFrame(loop);
    }

    function start() {
      if (stopped || running || paused || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }

    function halt() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function resolveDark() {
      if (themeMode === 'dark') return true;
      if (themeMode === 'light') return false;
      var fromTree = ancestorTheme(canvas);
      return fromTree === null ? systemDark() : fromTree;
    }

    function applyTheme() {
      var next = resolveDark();
      if (next === dark) return;
      dark = next;
      if (!running) repaint();
    }

    dark = resolveDark();

    // live OS or browser theme switches, and live app-level toggles: watch
    // class and data-theme flips anywhere in the tree
    var mqDark = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;
    var mqReduce =
      forcedReduced === null && typeof matchMedia !== 'undefined'
        ? matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    var mo = null;

    function onThemeChange() {
      applyTheme();
    }

    function onReduceChange(e) {
      reduced = e.matches;
      if (reduced) {
        halt();
        frame(0.6);
      } else {
        start();
      }
    }

    addMq(mqDark, onThemeChange);
    addMq(mqReduce, onReduceChange);

    if (themeMode === 'auto' && typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      mo = new MutationObserver(onThemeChange);
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
        subtree: true
      });
    }

    // reduced motion means one static, deterministic frame
    if (reduced) {
      frame(0.6);
    } else {
      // draw at least one frame even when paused or offscreen
      frame(clock());
    }

    var io = null;
    function onVis() {
      if (document.visibilityState === 'hidden') halt();
      else if (visible) start();
    }

    if (autoPause && typeof document !== 'undefined') {
      if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible && document.visibilityState !== 'hidden') start();
          else halt();
        });
        io.observe(canvas);
      }
      document.addEventListener('visibilitychange', onVis);
      if (!io) start();
    } else {
      start();
    }

    function addMq(mq, fn) {
      if (!mq) return;
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn);
    }

    function removeMq(mq, fn) {
      if (!mq) return;
      if (mq.removeEventListener) mq.removeEventListener('change', fn);
      else if (mq.removeListener) mq.removeListener(fn);
    }

    return {
      canvas: canvas,

      /** Halt the animation and release every listener. Idempotent. */
      stop: function () {
        if (stopped) return;
        stopped = true;
        halt();
        if (io) io.disconnect();
        if (mo) mo.disconnect();
        removeMq(mqDark, onThemeChange);
        removeMq(mqReduce, onReduceChange);
        if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
      },

      /** Freeze on the current frame, keeping the mount alive. */
      pause: function () {
        paused = true;
        halt();
      },

      resume: function () {
        paused = false;
        start();
      },

      setState: function (next) {
        if (!STATE_TO_MODE[next] || next === state) return;
        state = next;
        resolved = resolvePreset(state, tuned);
        canvas.setAttribute('aria-label', o.label || LABELS[state]);
        if (running) return;
        if (reduced) frame(0.6);
        else repaint();
      },

      setSpeed: function (next) {
        if (typeof next === 'number') speedMul = next;
      },

      setColour: function (next) {
        ink = parseInk(next);
        if (!running) repaint();
      },

      setTheme: function (next) {
        themeMode = next === 'dark' || next === 'light' ? next : 'auto';
        applyTheme();
      },

      /** The state currently mounted. */
      getState: function () {
        return state;
      }
    };
  }

  var ThinkingOrbs = {
    mount: mount,
    STATES: STATES,
    LABELS: LABELS,
    TUNED_SIZES: TUNED_SIZES,

    // the upstream engine entry point, for driving your own surface
    MODE_FRAMES: MODE_FRAMES,
    MODE_DRAWS: MODE_DRAWS,
    STATE_TO_MODE: STATE_TO_MODE,
    PRESETS: PRESETS,
    BASE_PROFILES: BASE_PROFILES,
    resolvePreset: resolvePreset,
    finalizeFrame: finalizeFrame,
    paintFrame: paintFrame,
    paint: paint,
    paintLines: paintLines,
    radiusScale: radiusScale,
    makeProj: makeProj
  };

  global.ThinkingOrbs = ThinkingOrbs;
})(typeof window !== 'undefined' ? window : this);
