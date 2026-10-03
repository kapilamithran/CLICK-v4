// Parses `supabase db query --output-format stream-json` stdout (NDJSON: one envelope per line).
// Two result shapes are confirmed on Supabase CLI 2.119.0:
//   A) {"type":"result","data":{"boundary":...,"rows":[...],"warning":...},"timestamp":...}
//   B) {"type":"result","data":[...rows...],"timestamp":...}   (observed for the credential-bearing users query)
// Every non-blank line must be a standalone JSON envelope. Unknown envelope types, zero or multiple
// result envelopes, non-object rows, and any unexpected data type all throw. Error messages carry only
// structure (line numbers, key names, JS types, lengths, counts), never values.

function parseStreamJsonRows(stdout) {
  const results = [];
  const lines = stdout.split(/\r?\n/);
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (line === '') return;
    let envelope;
    try {
      envelope = JSON.parse(line);
    } catch (e) {
      throw new Error(`stream-json line ${i + 1} is not a standalone JSON value (line length ${line.length})`);
    }
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope) || typeof envelope.type !== 'string') {
      throw new Error(`stream-json line ${i + 1} is not an envelope object with a string type`);
    }
    if (envelope.type !== 'result') {
      throw new Error(`stream-json line ${i + 1} has unexpected envelope type "${envelope.type.slice(0, 40)}"`);
    }
    results.push({ envelope, line: i + 1 });
  });
  if (results.length !== 1) {
    throw new Error(`expected exactly one result envelope, found ${results.length}`);
  }
  const { envelope } = results[0];
  if (!('data' in envelope)) {
    throw new Error(`result envelope has no data property; structure: ${describeStructure(envelope)}`);
  }
  const rows = rowsFromData(envelope.data, envelope);
  rows.forEach((row, idx) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error(`result row ${idx + 1} is not an object (type ${kindOf(row)})`);
    }
  });
  return rows;
}

// Shape A: data is the rows array. Shape B: data is an object whose rows property is the array.
function rowsFromData(data, envelope) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.rows)) return data.rows;
  if (data && typeof data === 'object') {
    throw new Error(`result envelope data is an object without a rows array; structure: ${describeStructure(envelope)}`);
  }
  throw new Error(`result envelope data has unexpected type ${kindOf(data)}; structure: ${describeStructure(envelope)}`);
}

function kindOf(v) {
  if (Array.isArray(v)) return `array(len ${v.length})`;
  if (v === null) return 'null';
  if (typeof v === 'string') return `string(len ${v.length})`;
  return typeof v;
}

// Structure only: key names (truncated) and JS types or lengths. Never values.
function describeStructure(envelope) {
  const keys = (o) => Object.keys(o).slice(0, 20).map((k) => k.slice(0, 40));
  const parts = [`envelope keys=[${keys(envelope).join(',')}]`];
  const d = envelope.data;
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    parts.push(`data is object with keys=[${keys(d).join(',')}]`);
    for (const k of Object.keys(d).slice(0, 20)) parts.push(`data.${k.slice(0, 40)}: ${kindOf(d[k])}`);
  } else {
    parts.push(`data: ${kindOf(d)}`);
  }
  return parts.join('; ');
}

module.exports = { parseStreamJsonRows };
