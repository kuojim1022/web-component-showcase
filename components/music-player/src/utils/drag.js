// 建立可重複使用的拖曳互動綁定（pointer 事件）。
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
