(function (root, factory) {
  const api = factory(root);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.filterLogic = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function isAnyValue(value) {
    const text = normalizeText(value);
    return !text || text === 'any' || text === 'either' || text === 'any / standard' ||
      text === 'standard' || text === 'all' || text === 'all brands';
  }

  function fieldText(camera, fields) {
    return fields.map(field => camera[field]).filter(value => value !== null && value !== undefined)
      .map(normalizeText).join(' ');
  }

  function matchesTextFilter(camera, value, fields) {
    if (isAnyValue(value)) return true;
    const requested = normalizeText(value);
    return fieldText(camera, fields).includes(requested);
  }

  function parseNumber(value) {
    const match = String(value ?? '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : NaN;
  }

  function matchesNumericFilter(camera, value, fields) {
    if (isAnyValue(value)) return true;
    const requested = parseNumber(value);
    if (!Number.isFinite(requested)) return matchesTextFilter(camera, value, fields);
    return fields.some(field => {
      const actual = parseNumber(camera[field]);
      return Number.isFinite(actual) && actual >= requested;
    });
  }

  function normalizeDim(value) {
    const text = normalizeText(value);
    if (text.includes('3d')) return '3D';
    if (text.includes('2d')) return '2D';
    return text;
  }

  function normalizedColor(value) {
    const text = normalizeText(value);
    if (text.includes('monochrome') || text === 'mono') return 'mono';
    if (text.includes('colour') || text.includes('color')) return 'color';
    return text;
  }

  function parseTolerance(value) {
    if (value === null || value === undefined || value === '') return 0;
    const cleaned = String(value).replace(/[^0-9.\-]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  function computeNeed(selection = {}) {
    const acc = parseTolerance(selection.acc === 'Other' ? selection.accOther : selection.acc);
    const length = Number(selection.length || selection.workLength || 0);
    const width = Number(selection.width || selection.workWidth || 0);
    if (!(acc > 0 && length > 0 && width > 0)) return 0;
    return ((length * 3.2 / acc) * (width * 3.2 / acc)) / 1e6;
  }

  function matchesApplication(camera, app, type) {
    const text = normalizeText(app);
    const requestedType = type && type !== 'Either' ? normalizeDim(type) : '';
    if (!text && !requestedType) return true;

    if (requestedType && normalizedColor(camera.color) !== 'mono' && requestedType === '3D') {
      // not used here; handled separately by strict dimension gate
    }

    const kindText = normalizeText(camera.kind);
    const modelText = normalizeText(camera.model);
    const ifaceText = normalizeText(camera.iface);

    if (requestedType && requestedType !== normalizeDim(camera.dim)) return false;

    if (text.includes('3d camera') || text.includes('profiling')) return normalizeDim(camera.dim) === '3D';
    if ((text.includes('micro-electronic') || text.includes('pcb') || text.includes('smt')) && normalizeDim(camera.dim) !== '2D') return false;
    if (text.includes('micro-electronic') || text.includes('pcb') || text.includes('smt')) return Number(camera.mp || 0) >= 5;

    if (text.includes('continuous web') || text.includes('web') || text.includes('sheet') || text.includes('roll') || text.includes('continuous')) return Number(camera.fps || 0) >= 60 && normalizeDim(camera.dim) === '2D';
    if (text.includes('packaging') || text.includes('bottling') || text.includes('blister')) return Number(camera.fps || 0) >= 60 && normalizeDim(camera.dim) === '2D';

    if (text.includes('multi-part') || text.includes('assembly') || text.includes('tray')) return Number(camera.mp || 0) >= 2 && normalizeDim(camera.dim) === '2D';
    if (text.includes('bulk') || text.includes('irregular') || text.includes('random')) return Number(camera.mp || 0) >= 2;

    if (text.includes('discrete') || text.includes('singulated') || text.includes('fixtured')) {
      return normalizeDim(camera.dim) === '2D' || kindText.includes('smart camera');
    }

    if (text.includes('web') || text.includes('sheet') || text.includes('roll')) return Number(camera.fps || 0) >= 60;
    if (text.includes('pick') || text.includes('alignment')) return normalizeDim(camera.dim) === '2D' || normalizeDim(camera.dim) === '3D';

    if (kindText.includes('barcode') || modelText.includes('barcode') || modelText.includes('reader')) {
      return kindText.includes('barcode') || modelText.includes('barcode') || modelText.includes('reader') || ifaceText.includes('ethernet');
    }

    return true;
  }

  function matchesReadability(camera, readability) {
    const text = normalizeText(readability);
    if (!text) return true;

    const mp = Number(camera.mp || 0);
    const color = normalizedColor(camera.color);
    const kind = normalizeText(camera.kind);
    const model = normalizeText(camera.model);

    if (text.includes('presence') || text.includes('absence')) return true;
    if (text.includes('counting') || text.includes('object detection')) return mp >= 1.6;
    if (text.includes('barcode') || text.includes('code128') || text.includes('qr') || text.includes('datamatrix')) {
      return kind.includes('barcode') || model.includes('barcode') || model.includes('reader') || kind.includes('reader');
    }
    if (text.includes('dpm') || text.includes('dot peen')) return mp >= 3 && color === 'mono';
    if (text.includes('laser etched') || text.includes('engraved')) return mp >= 2 && color === 'mono';
    if (text.includes('ocr') || text.includes('printed text') || text.includes('high contrast')) return mp >= 2;
    if (text.includes('low contrast') || text.includes('embossed') || text.includes('typography')) return mp >= 5;
    if (text.includes('micro-texture') || text.includes('grain')) return mp >= 5;

    return true;
  }

  function evaluateCameraMatch(camera, selection = {}) {
    if (!camera) return false;

    const requestedCompany = selection.company || selection.brand || '';
    if (!isAnyValue(requestedCompany)) {
      const normalizedRequested = normalizeText(requestedCompany);
      const normalizedBrand = normalizeText(camera.brand);
      if (!normalizedRequested || !normalizedBrand.includes(normalizedRequested)) return false;
    }

    const requestedType = !isAnyValue(selection.type) ? normalizeDim(selection.type) : '';
    if (requestedType && normalizeDim(camera.dim) !== requestedType) return false;

    const requestedColor = !isAnyValue(selection.color) ? normalizedColor(selection.color) : '';
    if (requestedColor) {
      const actualColor = normalizedColor(camera.color);
      if (!actualColor || actualColor !== requestedColor) return false;
    }

    if (!matchesNumericFilter(camera, selection.resolution || selection.mp, ['mp', 'resolution'])) return false;
    if (!matchesNumericFilter(camera, selection.fps || selection.frameRate, ['fps'])) return false;
    if (!matchesTextFilter(camera, selection.interface || selection.iface, ['iface', 'interface'])) return false;
    if (!matchesTextFilter(camera, selection.fov, ['note', 'fieldOfView', 'fov'])) return false;

    const need = computeNeed(selection);
    if (need > 0 && (Number(camera.mp || 0) < need * 0.9)) return false;

    if (selection.app && !matchesApplication(camera, selection.app, selection.type)) return false;
    if (selection.readability && !matchesReadability(camera, selection.readability)) return false;

    return true;
  }

  function filterMatchingCameras(selection = {}, cameraList) {
    const resolvedList = Array.isArray(cameraList) ? cameraList : ((typeof globalThis !== 'undefined' && globalThis.CAMERAS) ? globalThis.CAMERAS : []);
    return resolvedList.filter(camera => evaluateCameraMatch(camera, selection));
  }

  return { evaluateCameraMatch, filterMatchingCameras };
}));
