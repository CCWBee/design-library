// Harmonic tide engine with astronomical arguments (V0 + u) and nodal factors (f).
// h(t) = MSL + sum f_i * A_i * cos(V_i(t) + u_i - g_i), t in UT, g = Greenwich phase lag (deg).
// Fundamental arguments from Meeus, T in Julian centuries from J2000.0 (2000-01-01 12:00 UT).

const D2R = Math.PI / 180;
const norm = (x) => ((x % 360) + 360) % 360;

function fundamentals(dateUT) {
  const T = (dateUT.getTime() / 86400000 - 10957.5) / 36525; // days since J2000.0 / 36525
  const s = norm(218.3164477 + 481267.88123421 * T);  // moon mean longitude
  const h = norm(280.46646 + 36000.76983 * T);        // sun mean longitude
  const p = norm(83.3532465 + 4069.0137287 * T);      // lunar perigee
  const N = norm(125.0445479 - 1934.1362891 * T);     // lunar node
  const p1 = norm(282.93735 + 1.71946 * T);           // solar perigee
  const ut = (dateUT.getUTCHours() + dateUT.getUTCMinutes() / 60 + dateUT.getUTCSeconds() / 3600);
  const theta = norm(15 * ut);                        // hour angle of mean sun from Greenwich lower transit
  const tau = norm(theta - s + h);                    // lunar time
  return { s, h, p, N, p1, theta, tau };
}

// Doodson-style equilibrium argument builders and Schureman nodal corrections
const CONSTITUENTS = {
  M2:  { V: (a) => 2 * a.tau,                    f: (N) => 1.0004 - 0.0373 * Math.cos(N) + 0.0002 * Math.cos(2 * N), u: (N) => -2.14 * Math.sin(N) },
  S2:  { V: (a) => 2 * a.theta,                  f: () => 1, u: () => 0 },
  N2:  { V: (a) => 2 * a.tau - a.s + a.p,        f: (N) => 1.0004 - 0.0373 * Math.cos(N) + 0.0002 * Math.cos(2 * N), u: (N) => -2.14 * Math.sin(N) },
  K2:  { V: (a) => 2 * a.theta + 2 * a.h,        f: (N) => 1.0241 + 0.2863 * Math.cos(N) + 0.0083 * Math.cos(2 * N), u: (N) => -17.74 * Math.sin(N) + 0.68 * Math.sin(2 * N) },
  L2:  { V: (a) => 2 * a.tau + a.s - a.p + 180,  f: (N) => 1.0004 - 0.0373 * Math.cos(N) + 0.0002 * Math.cos(2 * N), u: (N) => -2.14 * Math.sin(N) },
  K1:  { V: (a) => a.theta + a.h + 90,           f: (N) => 1.0060 + 0.1150 * Math.cos(N) - 0.0088 * Math.cos(2 * N), u: (N) => -8.86 * Math.sin(N) + 0.68 * Math.sin(2 * N) },
  O1:  { V: (a) => a.tau - a.s - 90,             f: (N) => 1.0089 + 0.1871 * Math.cos(N) - 0.0147 * Math.cos(2 * N), u: (N) => 10.80 * Math.sin(N) - 1.34 * Math.sin(2 * N) },
  Q1:  { V: (a) => a.tau - 2 * a.s + a.p - 90,   f: (N) => 1.0089 + 0.1871 * Math.cos(N) - 0.0147 * Math.cos(2 * N), u: (N) => 10.80 * Math.sin(N) - 1.34 * Math.sin(2 * N) },
  P1:  { V: (a) => a.theta - a.h - 90,           f: () => 1, u: () => 0 },
  MSf: { V: (a) => 2 * a.s - 2 * a.h,            f: () => 1, u: () => 0 },
};

function heightAt(dateUT, table, msl) {
  const a = fundamentals(dateUT);
  const N = a.N * D2R;
  let h = msl;
  for (const [name, A, g] of table) {
    const c = CONSTITUENTS[name];
    const V = c.V(a);
    h += c.f(N) * A * Math.cos((V + c.u(N) - g) * D2R);
  }
  return h;
}

function extremes(startUT, hours, table, msl, stepMin = 2) {
  const out = [];
  let prev = null, prevprev = null;
  for (let t = startUT.getTime(); t <= startUT.getTime() + hours * 3600000; t += stepMin * 60000) {
    const h = heightAt(new Date(t), table, msl);
    if (prev && prevprev) {
      if (prev.h > prevprev.h && prev.h > h) out.push({ kind: 'HW', t: prev.t, h: prev.h });
      if (prev.h < prevprev.h && prev.h < h) out.push({ kind: 'LW', t: prev.t, h: prev.h });
    }
    prevprev = prev; prev = { t, h };
  }
  return out;
}

module.exports = { heightAt, extremes, fundamentals, CONSTITUENTS };

if (require.main === module) {
  // The tide page's table as shipped (A in m, g in deg), MSL 6.75. Expect: wrong, but see how wrong once V0+u is added.
  const shipped = [['MSf', 0.091, 149], ['Q1', 0.059, 111], ['O1', 0.197, 129], ['K1', 0.072, 168], ['N2', 0.373, 33], ['M2', 2.021, 57], ['S2', 0.691, 93], ['K2', 0.194, 94], ['L2', 0.109, 66]];
  // Published St Helier extremes for 6 Sep 2026 (BST = UT+1), from the review: LW 08:20 4.3, HW 14:24 8.0, LW 21:25 4.1
  const pub = [['LW', Date.UTC(2026, 8, 6, 7, 20), 4.3], ['HW', Date.UTC(2026, 8, 6, 13, 24), 8.0], ['LW', Date.UTC(2026, 8, 6, 20, 25), 4.1]];
  const day = new Date(Date.UTC(2026, 8, 5, 22, 0));
  const fmt = (t) => new Date(t).toISOString().slice(11, 16) + 'Z';
  const report = (label, table, msl) => {
    const ex = extremes(day, 26, table, msl);
    console.log('\n' + label);
    for (const e of ex) console.log(' ', e.kind, fmt(e.t), e.h.toFixed(2));
    let err = 0, n = 0;
    for (const [k, t, h] of pub) {
      const near = ex.filter(e => e.kind === k).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
      if (!near) continue;
      const dt = (near.t - t) / 60000, dh = near.h - h;
      console.log('  vs published', k, fmt(t), h, '->', 'dt', dt.toFixed(0), 'min', 'dh', dh.toFixed(2), 'm');
      err += (dt / 30) ** 2 + (dh / 0.3) ** 2; n++;
    }
    return Math.sqrt(err / Math.max(n, 1));
  };
  report('shipped table + V0+u, MSL 6.75', shipped, 6.75);

  // Fit: amplitudes from the known St Helier ranges (springs ~9.6 m, neaps ~4.1 m => M2 ~3.43, S2 ~1.38), MSL from the published day
  // (mean of HW and LWs today ~ 5.5 m at neaps is not MSL; use 6.0 m, the usual St Helier MSL above chart datum), then grid-search
  // g_M2 and the S2 offset relative to M2 against the published extremes.
  const A = { M2: 3.43, S2: 1.38, N2: 0.70, K2: 0.39, L2: 0.10, K1: 0.07, O1: 0.20, Q1: 0.06, P1: 0.02, MSf: 0.05 };
  let best = null;
  for (let msl = 5.6; msl <= 6.4; msl += 0.1) {
    for (let gM2 = 0; gM2 < 360; gM2 += 2) {
      for (let dS2 = -60; dS2 <= 90; dS2 += 5) {
        const table = [['M2', A.M2, gM2], ['S2', A.S2, norm(gM2 + dS2)], ['N2', A.N2, norm(gM2 - 25)], ['K2', A.K2, norm(gM2 + dS2)], ['L2', A.L2, norm(gM2 + 25)],
                       ['K1', A.K1, 90], ['O1', A.O1, 20], ['Q1', A.Q1, 350], ['P1', A.P1, 90], ['MSf', A.MSf, 0]];
        const ex = extremes(day, 26, table, msl, 4);
        let err = 0;
        for (const [k, t, h] of pub) {
          const near = ex.filter(e => e.kind === k).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
          if (!near) { err += 1e6; continue; }
          err += ((near.t - t) / 60000 / 30) ** 2 + ((near.h - h) / 0.3) ** 2;
        }
        if (!best || err < best.err) best = { err, msl, gM2, dS2, table };
      }
    }
  }
  console.log('\nbest fit: MSL', best.msl.toFixed(1), 'g_M2', best.gM2, 'S2 offset', best.dS2, 'err', best.err.toFixed(3));
  report('fitted table', best.table, best.msl);
  console.log('\nfitted table JSON:', JSON.stringify({ msl: +best.msl.toFixed(1), table: best.table }));
}
