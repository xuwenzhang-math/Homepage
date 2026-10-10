/*
 * Exact geometry of the five-surface stationary varifold in R^3.
 * No plotting library is needed to use this file.
 * Browser: window.FiveSurfaceGeometry. Node: require('./geometry.js').
 *
 * a = sqrt(3)/2, h = (sqrt(3)/4) log(3), rho^2 = x^2+(y-1)^2.
 * S: z=0, y>=0, rho>=1.
 * P_±: y<=0, z=±sqrt(3)y.
 * C_+: z>=0, rho=a cosh((z-h)/a); C_- is its reflection.
 *
 * We display V_r=(x -> x/r)_#V inside the cube [-1,1]^3.
 * For 0<r<=0.4<h, only the lower catenoid branch is in the cube.
 * All coordinates below are the scaled coordinates (X,Y,Z)=(x,y,z)/r.
 * The film has zero thickness. Zero-area triangles are omitted.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FiveSurfaceGeometry = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const SQRT3 = Math.sqrt(3);
  const A = SQRT3 / 2;
  const H = SQRT3 * Math.log(3) / 4;
  const MAX_R = 0.4;
  const COLORS = {
    S: '#dda348', Pplus: '#c5656e', Pminus: '#8a78ac',
    Cplus: '#448b75', Cminus: '#527fa8',
    Piplus: '#b95d68', Piminus: '#447f96', L: '#283e50', Gamma: '#ae7529'
  };

  function checkScale(r) {
    if (!Number.isFinite(r) || r < 0 || r > MAX_R) {
      throw new RangeError('Scale must lie in [0, 0.4].');
    }
  }

  // g(rX)/r, rationalized to avoid cancellation at small r.
  function filmBoundary(X, r) {
    checkScale(r);
    if (r === 0) return 0;
    const u = r * X;
    return r * X * X / (1 + Math.sqrt(1 - u * u));
  }

  // Positive-z catenoid patch: Y(rX,rT)/r, T in [0,1].
  // R(s)=cosh(s/a)-(1/2)sinh(s/a). d=R-1 is computed stably.
  function catenoidY(X, T, r) {
    checkScale(r);
    if (r === 0) return T / SQRT3;
    if (T === 0) return filmBoundary(X, r); // exact common boundary
    const t = r * T / A;
    const d = 2 * Math.sinh(t / 2) ** 2 - 0.5 * Math.sinh(t);
    const radicand = (1 + d) ** 2 - (r * X) ** 2;
    if (!(radicand > 0)) throw new RangeError('Invalid catenoid chart.');
    return ((r * X) ** 2 - d * (2 + d)) /
      (r * (1 + Math.sqrt(radicand)));
  }

  function gridMesh(name, color, point, nx = 91, nt = 45, omitDegenerate = false) {
    const x = [], y = [], z = [], i = [], j = [], k = [];
    for (let b = 0; b < nt; b++) {
      const T = b / (nt - 1);
      for (let a = 0; a < nx; a++) {
        const X = -1 + 2 * a / (nx - 1);
        const p = point(X, T);
        x.push(p[0]); y.push(p[1]); z.push(p[2]);
      }
    }
    function triangle(u, v, w) {
      if (omitDegenerate) {
        const ab = [x[v]-x[u], y[v]-y[u], z[v]-z[u]];
        const ac = [x[w]-x[u], y[w]-y[u], z[w]-z[u]];
        const cross = [ab[1]*ac[2]-ab[2]*ac[1],
          ab[2]*ac[0]-ab[0]*ac[2], ab[0]*ac[1]-ab[1]*ac[0]];
        if (cross.every(v => v === 0)) return;
      }
      i.push(u); j.push(v); k.push(w);
    }
    for (let b = 0; b < nt-1; b++) {
      for (let a = 0; a < nx-1; a++) {
        const u = b*nx+a, v = u+1, w = u+nx, q = w+1;
        triangle(u,v,q); triangle(u,q,w);
      }
    }
    return {name, color, x,y,z,i,j,k};
  }

  function buildMeshes(r, nx = 91, nt = 45) {
    checkScale(r);
    const meshes = [
      gridMesh('Pplus', COLORS.Pplus, (X,T) => [X,-T/SQRT3,-T],nx,nt),
      gridMesh('Pminus', COLORS.Pminus, (X,T) => [X,-T/SQRT3,T],nx,nt),
      gridMesh('Cplus', COLORS.Cplus, (X,T) => [X,catenoidY(X,T,r),T],nx,nt),
      gridMesh('Cminus', COLORS.Cminus, (X,T) => [X,catenoidY(X,T,r),-T],nx,nt)
    ];
    if (r > 0) meshes.push(gridMesh('S',COLORS.S,
      (X,T) => [X,T*filmBoundary(X,r),0],nx,25,true));
    return meshes;
  }

  function buildCone(nx = 45, nt = 35) {
    return [1,-1].map(sign => gridMesh(sign>0?'Piplus':'Piminus',
      sign>0?COLORS.Piplus:COLORS.Piminus,
      (X,T) => {const Z = 2*T-1; return [X,sign*Z/SQRT3,Z];},nx,nt));
  }

  function seam(r, kind, n=241) {
    const x=[],y=[],z=[];
    for (let a=0;a<n;a++) {
      const X = -1+2*a/(n-1);
      x.push(X); y.push(kind==='Gamma'?filmBoundary(X,r):0); z.push(0);
    }
    return {x,y,z};
  }

  function tangentWire(sign) {
    const x=[],y=[],z=[];
    function line(points) {
      for (const p of points) {x.push(p[0]);y.push(p[1]);z.push(p[2]);}
      x.push(null);y.push(null);z.push(null);
    }
    for (const X of [-1,-0.5,0,0.5,1])
      line([[X,-sign/SQRT3,-1],[X,sign/SQRT3,1]]);
    for (const Z of [-1,-0.5,0,0.5,1])
      line([[-1,sign*Z/SQRT3,Z],[1,sign*Z/SQRT3,Z]]);
    return {x,y,z};
  }

  function metrics(r) {
    let maxConeDistance=0;
    for (const m of buildMeshes(r,45,23)) {
      for (let n=0;n<m.x.length;n++) {
        const d = Math.min(Math.abs(m.z[n]-SQRT3*m.y[n]),
          Math.abs(m.z[n]+SQRT3*m.y[n]))/2;
        maxConeDistance=Math.max(maxConeDistance,d);
      }
    }
    return {filmWidth:filmBoundary(1,r), maxConeDistance};
  }
  return {A,H,MAX_R,SQRT3,COLORS,filmBoundary,catenoidY,buildMeshes,
    buildCone,seam,tangentWire,metrics};
}));
