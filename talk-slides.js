// The PDF.js files are distributed under the license in pdfjs-LICENSE.txt.
let pdfLibrary;
function loadPdfLibrary() {
  if (!pdfLibrary) {
    pdfLibrary = import('./pdfjs.mjs').then((library) => {
      library.GlobalWorkerOptions.workerSrc = new URL('./pdfjs.worker.mjs', import.meta.url).href;
      return library;
    });
  }
  return pdfLibrary;
}

function setupViewer(viewer, topic) {
  const previous = viewer.querySelector('[data-prev]');
  const next = viewer.querySelector('[data-next]');
  const pageInput = viewer.querySelector('[data-page]');
  const count = viewer.querySelector('[data-page-count]');
  const status = viewer.querySelector('[data-status]');
  const stage = viewer.querySelector('[data-stage]');
  const canvas = viewer.querySelector('[data-canvas]');
  let documentPromise, pdf, requestedPage = 1, renderedPage = 0;
  let rendering = false, needsRender = false, resizeTimer;

  function controls(disabled = false) {
    previous.disabled = disabled || requestedPage <= 1;
    next.disabled = disabled || !pdf || requestedPage >= pdf.numPages;
    pageInput.disabled = disabled || !pdf;
  }

  async function render() {
    needsRender = true;
    if (rendering || !pdf || !topic.open) return;
    rendering = true;
    try {
      while (needsRender && topic.open) {
        needsRender = false;
        const number = requestedPage;
        const page = await pdf.getPage(number);
        const base = page.getViewport({scale:1});
        const width = Math.max(1, viewer.clientWidth - 2);
        const viewport = page.getViewport({scale:width / base.width});
        const density = Math.min(window.devicePixelRatio || 1, 2);
        // Render offscreen so a fast page change never clears the visible slide.
        const buffer = document.createElement('canvas');
        buffer.width = Math.ceil(viewport.width * density);
        buffer.height = Math.ceil(viewport.height * density);
        await page.render({canvasContext:buffer.getContext('2d'), viewport,
          transform:[density,0,0,density,0,0]}).promise;
        if (number !== requestedPage) { needsRender = true; continue; }
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.getContext('2d').drawImage(buffer, 0, 0);
        canvas.setAttribute('aria-label', `Slide ${number} of ${pdf.numPages}`);
        pageInput.value = number;
        renderedPage = number;
        stage.hidden = false;
        status.textContent = `Slide ${number} of ${pdf.numPages}`;
        status.classList.add('visually-hidden');
        controls();
      }
    } catch (error) {
      status.classList.remove('visually-hidden');
      status.textContent = 'This slide could not be displayed. Please use Open PDF to read the slides.';
      if (renderedPage) { requestedPage = renderedPage; pageInput.value = renderedPage; }
      controls();
      console.error('Slide rendering failed', error);
    } finally { rendering = false; }
  }

  async function open() {
    if (!topic.open) return;
    if (!documentPromise) {
      status.textContent = 'Loading slides…';
      controls(true);
      documentPromise = loadPdfLibrary().then(library => library.getDocument(viewer.dataset.pdf).promise);
    }
    try {
      pdf = await documentPromise;
      count.textContent = pdf.numPages;
      pageInput.max = pdf.numPages;
      await render();
    } catch (error) {
      documentPromise = undefined;
      status.classList.remove('visually-hidden');
      status.textContent = 'The slides could not load. Please use Open PDF, or reopen this topic to retry.';
      controls(true);
      console.error('Slide loading failed', error);
    }
  }

  function goTo(number) {
    if (!pdf) return;
    requestedPage = Math.min(pdf.numPages, Math.max(1, Math.trunc(number) || 1));
    pageInput.value = requestedPage;
    controls();
    render();
  }
  previous.addEventListener('click', () => goTo(requestedPage - 1));
  next.addEventListener('click', () => goTo(requestedPage + 1));
  pageInput.addEventListener('change', () => goTo(pageInput.valueAsNumber));
  pageInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); goTo(pageInput.valueAsNumber); }
  });
  viewer.addEventListener('keydown', event => {
    if (event.target.closest('input, button, a')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); goTo(requestedPage + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  const observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (pdf && topic.open) render(); }, 120);
  });
  observer.observe(viewer);
  topic.addEventListener('toggle', open);
  if (topic.open) open();
}

document.querySelectorAll('.talk-topic').forEach(topic => {
  const viewer = topic.querySelector('[data-pdf]');
  if (viewer) setupViewer(viewer, topic);
  topic.addEventListener('toggle', () => {
    if (topic.open) topic.querySelectorAll('iframe[data-src]').forEach(frame => {
      frame.src = frame.dataset.src;
      frame.removeAttribute('data-src');
    });
  });
});

function openLinkedTopic() {
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches('.talk-topic')) target.open = true;
}
window.addEventListener('hashchange', openLinkedTopic);
openLinkedTopic();
