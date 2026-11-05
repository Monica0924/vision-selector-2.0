const test = require('node:test');
const assert = require('node:assert/strict');
const { filterMatchingCameras, evaluateCameraMatch } = require('../js/filterLogic.js');

const cam2dMono = {
  brand: 'Basler',
  model: 'a2A2448-75umBAS',
  dim: '2D',
  kind: 'Area scan',
  mp: 5,
  fps: 75,
  sensor: 'Sony IMX547',
  iface: 'USB 3.0',
  color: 'Mono'
};

const cam3d = {
  brand: 'LMI Technologies',
  model: 'Gocator 3D Smart Sensor',
  dim: '3D',
  kind: '3D laser / snapshot sensor',
  mp: 3.2,
  fps: 5000,
  sensor: 'Custom 3D Imager',
  iface: 'Ethernet',
  color: 'Mono'
};

test('strictly enforces 2D/3D camera dimension', () => {
  assert.equal(evaluateCameraMatch(cam2dMono, { type: '3D Camera' }), false);
  assert.equal(evaluateCameraMatch(cam3d, { type: '3D Camera' }), true);
});

test('strictly enforces monochrome requirement when selected', () => {
  assert.equal(evaluateCameraMatch(cam2dMono, { color: 'Monochrome' }), true);
  assert.equal(evaluateCameraMatch({ ...cam2dMono, color: 'Color' }, { color: 'Monochrome' }), false);
});

test('filters by application and readability gates instead of soft scoring', () => {
  const matches = filterMatchingCameras({
    app: 'Micro-Electronic / PCB / SMT Inspection',
    readability: 'High Contrast Printed Text / OCR',
    type: '2D Camera',
    color: 'Monochrome'
  }, [cam2dMono, cam3d, { ...cam2dMono, mp: 1.6, color: 'Mono' }]);

  assert.deepEqual(matches.map(c => c.model), ['a2A2448-75umBAS']);
});

test('strictly enforces the selected company or brand filter', () => {
  const matches = filterMatchingCameras({ company: 'Basler' }, [
    cam2dMono,
    { ...cam3d, brand: 'Basler', model: 'a2A2590-60umBAS' },
    { ...cam3d, brand: 'Cognex', model: 'In-Sight 2000' }
  ]);

  assert.deepEqual(matches.map(c => c.model), ['a2A2448-75umBAS', 'a2A2590-60umBAS']);
  assert.equal(evaluateCameraMatch({ ...cam3d, brand: 'Cognex' }, { company: 'Basler' }), false);
});

test('does not let default selections filter out cameras', () => {
  assert.equal(evaluateCameraMatch(cam2dMono, {
    company: 'Any / Standard',
    type: 'Either',
    color: 'Either',
    interface: '',
    resolution: ''
  }), true);
});

test('matches numeric and interface specifications against camera fields', () => {
  assert.equal(evaluateCameraMatch(cam2dMono, {
    resolution: '4 MP',
    frameRate: '60 FPS',
    interface: 'usb'
  }), true);
  assert.equal(evaluateCameraMatch(cam2dMono, { frameRate: '120' }), false);
});
