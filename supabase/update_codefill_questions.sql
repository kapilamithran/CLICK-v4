-- Updates the 10 questions converted from TYPE_CODE to CODE_FILL.
-- Run the SELECT first to see the current (pre-update) rows, then run the UPDATEs.

select question_id, type, prompt, code, answer
from questions
where question_id in ('Q000004', 'Q000009', 'Q000014', 'Q000019', 'Q000024', 'Q000029', 'Q000034', 'Q000039', 'Q000044', 'Q000049')
order by question_id;

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete the missing parts to form a valid C declaration using ordinary letters, digits, spaces, = and ; from the C character set.',
  code = 'int {{1}} = {{2}};',
  answer = '["age", "18"]',
  explanation = '`age` is a valid identifier and `18` is written with decimal digits. Together with `int`, `=`, and `;`, the line uses valid C source characters.',
  hint = 'Fill the variable name first, then the integer value.'
where question_id = 'Q000004';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete the missing tokens in this declaration. Each box represents one meaningful token.',
  code = 'int {{1}} = {{2}};',
  answer = '["count", "10"]',
  explanation = 'The statement is built from separate tokens: `int`, `count`, `=`, `10`, and `;`.',
  hint = 'The first blank is an identifier token; the second is a constant token.'
where question_id = 'Q000009';

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill the missing keyword and identifier to make a valid declaration.',
  code = '{{1}} {{2}} = 18;',
  answer = '["int", "age"]',
  explanation = '`int` is a C keyword with predefined meaning, while `age` is a programmer-chosen identifier.',
  hint = 'Use the integer-type keyword first, then a valid programmer-chosen name.'
where question_id = 'Q000014';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete the declaration with a valid identifier that follows the chapter rules.',
  code = 'int {{1}} = 18;',
  answer = '["student_age"]',
  explanation = '`student_age` begins with a letter, contains only letters and an underscore, has no spaces, and is not a C keyword.',
  hint = 'Use the meaningful identifier taught in the example: student_age.'
where question_id = 'Q000019';

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill the two constants so the first is an integer constant and the second is a real constant.',
  code = 'int count = {{1}};
double price = {{2}};',
  answer = '["25", "3.14"]',
  explanation = '`25` is an integer constant and `3.14` is a real constant. Both are fixed literal values written directly in the program.',
  hint = 'Use the chapter examples: one whole-number literal and one decimal real literal.'
where question_id = 'Q000024';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete the declaration with the decimal integer constant shown in Learn.',
  code = 'int count = {{1}};',
  answer = '["20000"]',
  explanation = '`20000` is a decimal integer constant: it contains only decimal digits and no decimal point.',
  hint = 'Enter only the whole-number literal, without commas or spaces.'
where question_id = 'Q000029';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete both integer constants: first an octal form, then a hexadecimal form.',
  code = 'int octalValue = {{1}};
int hexValue = {{2}};',
  answer = '["037", "0x9F"]',
  explanation = '`037` uses a leading 0 for octal notation. `0x9F` uses the 0x prefix and hexadecimal digits.',
  hint = 'Octal begins with `0`; hexadecimal begins with `0x` or `0X`.'
where question_id = 'Q000034';

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill the declaration so the integer literal carries both unsigned and long suffixes.',
  code = 'unsigned long n = {{1}};',
  answer = '["1234UL"]',
  explanation = '`1234UL` combines `U` for unsigned and `L` for long directly on the integer literal.',
  hint = 'Attach both suffix letters directly to 1234.'
where question_id = 'Q000039';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete the two real constants in decimal notation.',
  code = 'double price = {{1}};
double rate = {{2}};',
  answer = '["75.84", "0.0083"]',
  explanation = 'Both `75.84` and `0.0083` are valid real constants written in decimal notation with a decimal point.',
  hint = 'Enter decimal real literals; do not add quotes.'
where question_id = 'Q000044';

update questions set
  type = 'CODE_FILL',
  prompt = 'Complete both scientific-notation constants. Use the compact forms taught in Learn.',
  code = 'double small = {{1}};
double large = {{2}};',
  answer = '["1.5E-3", "1.2E6"]',
  explanation = '`1.5E-3` uses a negative exponent for a small value, while `1.2E6` uses a positive exponent written without an explicit plus sign.',
  hint = 'Use `E` between the mantissa and exponent; no spaces belong inside the literal.'
where question_id = 'Q000049';

