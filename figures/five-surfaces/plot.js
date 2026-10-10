/* Plotly.js viewer. Exact parametrizations live in geometry.js. */
(function () {
  'use strict';
  const G=window.FiveSurfaceGeometry;
  const plot=document.getElementById('plot');
  function showFallback() {
    plot.hidden=true; document.getElementById('fallback').hidden=false;
    document.querySelectorAll('button,input').forEach(el=>el.disabled=true);
  }
  if (!window.Plotly || !G) {
    showFallback();
    return;
  }
  const cameras={
    three:{eye:{x:3.0,y:-0.25,z:2.1},up:{x:0,y:0,z:1},projection:{type:'orthographic'}},
    x:{eye:{x:3.2,y:0,z:0},up:{x:0,y:0,z:1},projection:{type:'orthographic'}},
    z:{eye:{x:0,y:0,z:3.2},up:{x:0,y:1,z:0},projection:{type:'orthographic'}}
  };
  const state={r:0.4,limit:false,camera:cameras.three,faces:new Set(['S','Pplus','Pminus','Cplus','Cminus'])};
  let ready=false,timer;
  const niceName={S:'S · planar region',Pplus:'P₊ · half-plane',Pminus:'P₋ · half-plane',
    Cplus:'C₊ · catenoid piece',Cminus:'C₋ · catenoid piece',Piplus:'Π₊',Piminus:'Π₋'};
  function meshTrace(m) {
    return {type:'mesh3d',x:m.x,y:m.y,z:m.z,i:m.i,j:m.j,k:m.k,
      name:niceName[m.name],color:m.color,opacity:m.name==='S'?1:0.91,
      flatshading:m.name==='S',showlegend:false,
      lighting:{ambient:0.76,diffuse:0.65,specular:0.06,roughness:0.95,fresnel:0.04},
      lightposition:{x:100,y:-180,z:250},
      hovertemplate:niceName[m.name]+'<br>X=%{x:.3f}<br>Y=%{y:.3f}<br>Z=%{z:.3f}<extra></extra>'};
  }
  function lineTrace(points,name,color,width=4) {
    return {type:'scatter3d',mode:'lines',...points,name,line:{color,width},
      showlegend:false,hovertemplate:name+'<extra></extra>'};
  }
  function sceneAxis(title) {
    return {title:{text:title,font:{size:12,color:'#405563'}},range:[-1.08,1.08],
      tickvals:[-1,-0.5,0,0.5,1],tickfont:{size:10,color:'#82939c'},
      gridcolor:'#e8edef',zerolinecolor:'#c5d0d6',showbackground:false,
      showspikes:false,autorange:false};
  }
  function layout() {
    return {margin:{l:0,r:0,b:0,t:0},paper_bgcolor:'#fff',plot_bgcolor:'#fff',
      font:{family:'Arial, sans-serif',color:'#223a49'},showlegend:false,
      uirevision:'five-surface-camera',
      scene:{xaxis:sceneAxis('X = x/r'),yaxis:sceneAxis('Y = y/r'),zaxis:sceneAxis('Z = z/r'),
        aspectmode:'cube',camera:state.camera,dragmode:'orbit'}};
  }
  const config={responsive:true,scrollZoom:true,displayModeBar:false,displaylogo:false};
  async function render() {
    const r=state.limit?0:state.r;
    const meshes=state.limit?G.buildCone():G.buildMeshes(r).filter(m=>state.faces.has(m.name));
    const traces=meshes.map(meshTrace);
    if(document.getElementById('tangent').checked&&!state.limit) {
      traces.push(lineTrace(G.tangentWire(1),'Π₊ · tangent plane','#677b88',2));
      traces.push(lineTrace(G.tangentWire(-1),'Π₋ · tangent plane','#9ca8ad',2));
    }
    if(document.getElementById('junctions').checked) {
      traces.push(lineTrace(G.seam(r,'L'),'L · junction line',G.COLORS.L,5));
      if(r>0) traces.push(lineTrace(G.seam(r,'Gamma'),'Γ · circular junction',G.COLORS.Gamma,5));
    }
    traces.push({type:'scatter3d',mode:'markers',x:[0],y:[0],z:[0],name:'O',
      marker:{size:3.3,color:'#203b4b'},showlegend:false,hovertemplate:'O · density 2<extra></extra>'});
    if(!ready) {
      await Plotly.newPlot(plot,traces,layout(),config); ready=true;
      plot.on('plotly_relayout',d=>{if(d['scene.camera'])state.camera=d['scene.camera'];});
    } else await Plotly.react(plot,traces,layout(),config);
    document.getElementById('scale-value').textContent=state.limit?'r → 0':`r = ${r.toFixed(3)}`;
    document.getElementById('plot-title').textContent=state.limit?'The unique two-plane tangent cone':'Five exact local pieces';
    document.getElementById('limit').textContent=state.limit?'Return to the five surfaces':'Show the limiting cone';
    document.getElementById('scale').disabled=state.limit;
    document.getElementById('tangent').disabled=state.limit;
    document.querySelectorAll('[data-face]').forEach(el=>el.disabled=state.limit);
    const m=G.metrics(r);
    document.getElementById('film-width').textContent=m.filmWidth.toFixed(4);
    document.getElementById('cone-distance').textContent=m.maxConeDistance.toFixed(4);
  }
  function scheduleRender() {clearTimeout(timer);timer=setTimeout(render,70);}
  document.getElementById('scale').addEventListener('input',e=>{
    state.r=0.4*Math.pow(10,-Number(e.target.value));scheduleRender();
  });
  document.getElementById('limit').addEventListener('click',()=>{state.limit=!state.limit;render();});
  document.querySelectorAll('[data-face]').forEach(el=>el.addEventListener('change',()=>{
    if(el.checked)state.faces.add(el.dataset.face);else state.faces.delete(el.dataset.face);render();
  }));
  ['tangent','junctions'].forEach(id=>document.getElementById(id).addEventListener('change',render));
  document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>{
    state.camera=cameras[el.dataset.view];Plotly.relayout(plot,{'scene.camera':state.camera});
  }));
  document.getElementById('download').addEventListener('click',()=>Plotly.downloadImage(plot,
    {format:'png',filename:state.limit?'two-plane-tangent-cone':`five-surfaces-r-${state.r.toFixed(3)}`,
      width:1800,height:1400,scale:1}));
  render().catch(err=>{
    console.error(err);showFallback();
  });
}());
