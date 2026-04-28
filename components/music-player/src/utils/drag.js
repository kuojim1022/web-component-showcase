// 建立可重複使用的拖曳互動綁定（pointer 事件）。
export function setupDrag(element, onUpdate) {
  if (!element) return;

  let active = false;

  const handleMove = (event) => {
    if (active) onUpdate(event);
  };

  const stopDrag = (event) => {
    if (!active) return;
    active = false;
    element.classList.remove("dragging");
    try {
      element.releasePointerCapture(event.pointerId);
    } catch {}
    element.removeEventListener("pointermove", handleMove);
    element.removeEventListener("pointerup", stopDrag);
    element.removeEventListener("pointercancel", stopDrag);
  };

  element.onpointerdown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    active = true;
    element.classList.add("dragging");
    try {
      element.setPointerCapture(event.pointerId);
    } catch {}
    onUpdate(event);
    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerup", stopDrag);
    element.addEventListener("pointercancel", stopDrag);
  };
}
