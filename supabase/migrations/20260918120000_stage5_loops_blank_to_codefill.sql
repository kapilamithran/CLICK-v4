-- Converts the 3 "Fill in the Blanks" (BLANK) questions in Stage 5 (Loops)
-- Chapter 1 (for loop), Chapter 3 (do-while loop), and Chapter 6 (nested
-- loops) into CODE_FILL questions, per the same conversion convention as
-- 20260907090100_update_codefill_questions.sql (TYPE_CODE -> CODE_FILL).
--
-- Preserves question_id, stage_id, chapter_id, xp, "order", and active for
-- all three rows -- only type/prompt/code/answer/explanation/hint change.
-- Educational intent is preserved:
--   Q000293 (CH0056, for loop)     -> the three parts of a for loop
--                                     (init / condition / update)
--   Q000308 (CH0058, do-while)     -> the condition is checked AFTER the
--                                     loop body runs
--   Q000324 (CH0061, nested loops) -> the outer loop controls the main
--                                     repetition; the inner loop repeats
--                                     completely inside it
--
-- Safe to re-apply: every UPDATE sets fixed final values by question_id.

select question_id, chapter_id, type, prompt, answer
from questions
where question_id in ('Q000293', 'Q000308', 'Q000324')
order by question_id;

update questions set
  type = 'CODE_FILL',
  prompt = 'Fill in the three parts of the for loop -- initialization, condition, and update -- so it prints numbers from 1 to 5.',
  code = '#include <stdio.h>

int main()
{

   for ({{1}}; {{2}}; {{3}})
   {

      printf("%d\n", i);
   }

   return 0;
}',
  answer = '["int i = 1", "i <= 5", "i++"]',
  explanation = 'Refers to: Slide 2.',
  hint = 'Think: Start → Check → Change.'
where question_id = 'Q000293';

update questions set
  type = 'CODE_FILL',
  prompt = 'In a do...while loop, the condition is checked after the loop body executes. Complete the loop so it prints numbers from 1 to 5.',
  code = 'int i = 1;
do
{

   printf("%d\n", i);
   i++;
}
{{1}}',
  answer = '["while (i <= 5);"]',
  explanation = 'Related: Slide 1 & 3',
  hint = 'do...while means Do → Check.'
where question_id = 'Q000308';

update questions set
  type = 'CODE_FILL',
  prompt = 'In a nested loop, the outer loop controls the main repetition while the inner loop repeats completely inside it. Complete the outer loop so this prints exactly 2 rows, each showing 3 columns.',
  code = '{{1}}
{

   for (int j = 1; j <= 3; j++)
   {

      printf("Row %d, Col %d\n", i, j);
   }
}',
  answer = '["for (int i = 1; i <= 2; i++)"]',
  explanation = 'Refers to: Slides 1 & 2.',
  hint = 'One loop surrounds the other.'
where question_id = 'Q000324';
