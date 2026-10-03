// Regression tests for the query output parser. SYNTHETIC data only -- no real student rows, no credentials.
// Run with: node --test migration/phase10c-query-parser.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseStreamJsonRows } = require('./phase10c-parse-query-output');

// Confirmed shape A: data is an object with a rows array.
const envObj = (rows) =>
  JSON.stringify({ type: 'result', data: { boundary: 'b', rows, warning: 'w' }, timestamp: '2026-01-01T00:00:00Z' });
// Confirmed shape B: data is the rows array itself (observed for the credential-bearing users query).
const envArr = (rows) => JSON.stringify({ type: 'result', data: rows, timestamp: '2026-01-01T00:00:00Z' });

const SYNTH_ROWS = [{ test_run_id: 'TR_SYNTH_1', n: 1 }, { test_run_id: 'TR_SYNTH_2', n: 2 }];

test('shape A (data.rows) parses to its rows', () => {
  assert.deepEqual(parseStreamJsonRows(envObj(SYNTH_ROWS) + '\n'), SYNTH_ROWS);
});

test('shape B (data is the rows array) parses to its rows', () => {
  assert.deepEqual(parseStreamJsonRows(envArr(SYNTH_ROWS) + '\n'), SYNTH_ROWS);
});

test('shape B with 352 synthetic rows returns exactly 352 rows', () => {
  const many = Array.from({ length: 352 }, (_, i) => ({ user_id: `SYNTH_U${i}`, total_xp: i }));
  assert.equal(parseStreamJsonRows(envArr(many) + '\n').length, 352);
});

test('zero rows parse for both shapes', () => {
  assert.deepEqual(parseStreamJsonRows(envObj([]) + '\n'), []);
  assert.deepEqual(parseStreamJsonRows(envArr([]) + '\n'), []);
});

test('tolerates CRLF line endings and blank lines around the envelope', () => {
  assert.deepEqual(parseStreamJsonRows('\r\n\r\n' + envArr(SYNTH_ROWS) + '\r\n'), SYNTH_ROWS);
});

test('malformed JSON fails without echoing the line', () => {
  const SYNTH_MARK = 'SYNTH_MALFORMED_MARK_4411';
  try {
    parseStreamJsonRows(`{"type":"result","data":[{"x":"${SYNTH_MARK}"}`);
    assert.fail('expected a throw');
  } catch (e) {
    assert.match(e.message, /is not a standalone JSON value/);
    assert.equal(e.message.includes(SYNTH_MARK), false);
  }
});

test('junk text before the envelope fails', () => {
  assert.throws(() => parseStreamJsonRows('junk-prefix ' + envArr(SYNTH_ROWS)), /is not a standalone JSON value/);
});

test('a second concatenated JSON value fails', () => {
  assert.throws(() => parseStreamJsonRows(envArr(SYNTH_ROWS) + '{"extra":true}'), /is not a standalone JSON value/);
});

test('missing data property fails with structure only', () => {
  const noData = JSON.stringify({ type: 'result', timestamp: 't' });
  assert.throws(() => parseStreamJsonRows(noData), /result envelope has no data property; structure: envelope keys=\[type,timestamp\]/);
});

test('unexpected data type (string) fails and does not echo the string', () => {
  const SYNTH_STR = 'SYNTH_STRING_DATA_8842';
  const strData = JSON.stringify({ type: 'result', data: SYNTH_STR, timestamp: 't' });
  try {
    parseStreamJsonRows(strData);
    assert.fail('expected a throw');
  } catch (e) {
    assert.match(e.message, /data has unexpected type string\(len \d+\)/);
    assert.equal(e.message.includes(SYNTH_STR), false);
  }
});

test('unexpected data type (number) fails', () => {
  assert.throws(() => parseStreamJsonRows(JSON.stringify({ type: 'result', data: 7, timestamp: 't' })), /unexpected type number/);
});

test('object data without rows fails and reports key names and types only', () => {
  const SYNTH_VALUE = 'SYNTH_DIAG_VALUE_987';
  const shaped = JSON.stringify({ type: 'result', data: { boundary: 'b', notRows: SYNTH_VALUE, count: 3 }, timestamp: 't' });
  try {
    parseStreamJsonRows(shaped);
    assert.fail('expected a throw');
  } catch (e) {
    assert.match(e.message, /data is an object without a rows array/);
    assert.match(e.message, /data is object with keys=\[boundary,notRows,count\]/);
    assert.match(e.message, /data\.notRows: string\(len \d+\)/);
    assert.match(e.message, /data\.count: number/);
    assert.equal(e.message.includes(SYNTH_VALUE), false);
  }
});

test('non-object row inside the rows array fails and reports the row index and type only', () => {
  const SYNTH_BAD = 'SYNTH_BAD_ROW_VALUE_55';
  try {
    parseStreamJsonRows(envArr([{ ok: 1 }, SYNTH_BAD]) + '\n');
    assert.fail('expected a throw');
  } catch (e) {
    assert.match(e.message, /result row 2 is not an object \(type string\(len \d+\)\)/);
    assert.equal(e.message.includes(SYNTH_BAD), false);
  }
});

test('unexpected envelope type fails', () => {
  assert.throws(() => parseStreamJsonRows(JSON.stringify({ type: 'error', data: [], timestamp: 't' }) + '\n'), /unexpected envelope type "error"/);
});

test('zero result envelopes fail', () => {
  assert.throws(() => parseStreamJsonRows(''), /expected exactly one result envelope, found 0/);
});

test('two result envelopes fail rather than merging them', () => {
  assert.throws(() => parseStreamJsonRows(envArr(SYNTH_ROWS) + '\n' + envArr(SYNTH_ROWS)), /found 2/);
});

test('error messages never echo credential-like fake values', () => {
  const FAKE_HASH = 'SYNTH_FAKE_HASH_0123456789abcdef';
  const FAKE_SALT = 'SYNTH_FAKE_SALT_fedcba9876543210';
  const bad = `{"type":"result","data":[{"password_hash":"${FAKE_HASH}","password_salt":"${FAKE_SALT}"}`;
  for (const input of [bad, JSON.stringify({ type: 'result', data: [{ password_hash: FAKE_HASH }, 5], timestamp: 't' })]) {
    try {
      parseStreamJsonRows(input);
      assert.fail('expected a throw');
    } catch (e) {
      assert.equal(e.message.includes(FAKE_HASH), false);
      assert.equal(e.message.includes(FAKE_SALT), false);
    }
  }
});
