自由に使ってくださいね!
利用方法(HTMLに組み込む):
<script type="module" src="https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs"></script>
もしくは
<script type="module" src=ファイルパス>
。(読み込み後はdecimalMath.addなどと普通に使えます。)

利用方法(ESM静的インポート):
<script type="module">
  import decimalMath from "https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs"
</script>
こちらもdecimalMath.addなどと普通に使えます。

利用方法(動的インポート):
<script>
const decimalMath={...(await import("https://ks-seed0310.github.io/decimalMathSolve/js-decimal/main/decimal1.0.mjs"))}.default
</script>
こちらも普通に使えます。

困ったらhttps://github.com/ks-seed0310/decimalMathSolve/issues/1から気軽に質問して下さい!

バグ報告フォーム:
https://github.com/ks-seed0310/decimalMathSolve/issues/2
