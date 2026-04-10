/**
 * 為 element 掛上 Pointer Events 拖曳邏輯。
 * 每次呼叫各自維護一個獨立的 active 旗標，不污染外部 state。
 *
 * @param {HTMLElement} element  - 接受拖曳的元素
 * @param {(e: PointerEvent) => void} onUpdate - 拖曳過程（含 pointerdown）持續觸發
 */
export function setupDrag(element, onUpdate) {
  if (!element) return;

  let active = false;

  const handleMove = (e) => {
    if (active) onUpdate(e);
  };

  const stopDrag = (e) => {
    if (!active) return;
    active = false;
    element.classList.remove("dragging");
    try {
      element.releasePointerCapture(e.pointerId);
    } catch {}
    element.removeEventListener("pointermove", handleMove);
    element.removeEventListener("pointerup", stopDrag);
    element.removeEventListener("pointercancel", stopDrag);
  };

  element.onpointerdown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    active = true;
    element.classList.add("dragging");
    try {
      element.setPointerCapture(e.pointerId);
    } catch {}
    onUpdate(e);
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerup", stopDrag);
    element.addEventListener("pointercancel", stopDrag);
  };
}
