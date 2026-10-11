const valueEl = document.getElementById("value");
const exprEl = document.getElementById("expr");
const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

let current = "0";
let stored = null;
let op = null;
let fresh = false; // next digit starts a new number

function format(n) {
  if (!isFinite(n)) return "Error";
  return String(parseFloat(n.toPrecision(12)));
}

function compute(a, b, o) {
  switch (o) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
}

function render() {
  valueEl.textContent = current;
  exprEl.textContent = op ? `${stored} ${symbols[op]}` : "";
  document.querySelectorAll(".op").forEach(b =>
    b.classList.toggle("active", b.dataset.op === op && fresh));
}

function inputDigit(d) {
  if (current === "Error" || fresh) { current = "0"; fresh = false; }
  if (current.replace(/[-.]/g, "").length >= 12) return;
  current = current === "0" ? d : current + d;
}

function inputDot() {
  if (current === "Error" || fresh) { current = "0"; fresh = false; }
  if (!current.includes(".")) current += ".";
}

function setOp(o) {
  if (current === "Error") return;
  if (op && !fresh) {
    current = format(compute(parseFloat(stored), parseFloat(current), op));
    if (current === "Error") { op = null; stored = null; return; }
  }
  stored = current;
  op = o;
  fresh = true;
}

function equals() {
  if (!op || current === "Error") return;
  const expr = `${stored} ${symbols[op]} ${current} =`;
  current = format(compute(parseFloat(stored), parseFloat(current), op));
  op = null;
  stored = null;
  fresh = true;
  render();
  exprEl.textContent = expr;
}

function action(a) {
  switch (a) {
    case "clear": current = "0"; stored = null; op = null; fresh = false; break;
    case "sign": if (current !== "0" && current !== "Error") current = format(-parseFloat(current)); break;
    case "percent": if (current !== "Error") current = format(parseFloat(current) / 100); break;
    case "dot": inputDot(); break;
    case "equals": equals(); return;
    case "back":
      if (fresh || current === "Error") break;
      current = current.length > 1 && current !== "-0" ? current.slice(0, -1) : "0";
      if (current === "-") current = "0";
      break;
  }
  render();
}

document.querySelector(".keys").addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.digit) { inputDigit(b.dataset.digit); render(); }
  else if (b.dataset.op) { setOp(b.dataset.op); render(); }
  else action(b.dataset.action);
});

const keyMap = { Enter: "equals", "=": "equals", Escape: "clear", Backspace: "back", ".": "dot", "%": "percent" };

document.addEventListener("keydown", e => {
  let btn;
  if (/^[0-9]$/.test(e.key)) { inputDigit(e.key); render(); btn = `[data-digit="${e.key}"]`; }
  else if (symbols[e.key]) { setOp(e.key); render(); btn = `[data-op="${e.key}"]`; }
  else if (keyMap[e.key]) { e.preventDefault(); action(keyMap[e.key]); btn = `[data-action="${keyMap[e.key]}"]`; }
  if (btn) {
    const el = document.querySelector(btn);
    if (el) { el.classList.add("pressed"); setTimeout(() => el.classList.remove("pressed"), 120); }
  }
});

render();
