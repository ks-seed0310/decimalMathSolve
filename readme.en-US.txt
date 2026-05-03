This README is a direct translation of readme.ja-JP.txt. Please understand any awkward phrasing.

Feel free to use it!
Usage (Embedding in HTML):
<script type="module" src="https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs"></script>
or
<script type="module" src=filepath>
(After loading, you can use it normally with decimalMath.add, etc.)

Usage (ESM static import):
<script type="module">
import decimalMath from "https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs"
</script>
This can also be used normally with decimalMath.add, etc.

How to use (dynamic import):
<script>
const decimalMath=(await import("https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs").default)
</script>
This can also be used normally.

If you have any problems, please feel free to ask questions at https://github.com/ks-seed0310/decimalMathSolve/issues/1!

Bug report form:
https://github.com/ks-seed0310/decimalMathSolve/issues/2
