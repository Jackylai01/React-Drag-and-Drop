import { useEffect, useRef, useState } from 'react';

export function useDragAndDrop(available) {
  const [data, setData] = useState(available);
  const [isDragging, setIsDragging] = useState();

  const containerRef = useRef();

  useEffect(() => {
    const storedData = localStorage.getItem('item_order');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      setData(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //檢測在鼠標事件（如點擊、移動等）中，是否按下了鼠標左鍵，如果是buttons 就是 true
  function detectLeftButton(e) {
    e = e || window.event;
    if ('buttons' in e) {
      return e.buttons === 1;
    }

    let button = e.which || e.button;
    return button === 1;
  }

  function dragStart(e, index) {
    if (!detectLeftButton()) return; // only use left mouse click;

    setIsDragging(index);

    // 從 ref 中讀取 container 元素
    const container = containerRef.current;

    // 從 container 中讀取子元素，並以陣列形式存儲
    const items = [...container.childNodes];

    // 從 items 中獲取要拖曳的元素(陣列順序)
    const dragItem = items[index];

    // 從 items 中獲取拖曳元素以下的所有元素
    const itemsBelowDragItem = items.slice(index + 1);

    // 從 items 中過濾掉拖曳元素，獲取不參與拖曳的其他元素
    const notDragItems = items.filter((_, i) => i !== index);

    // 從 data 中獲取要拖曳元素的資料
    const dragData = data[index];

    // 深拷貝 data 陣列，用來修改元素順序並更新資料
    let newData = [...data];

    // 獲取拖曳元素的邊界矩形
    const dragBoundingRect = dragItem.getBoundingClientRect();

    // 獲取兩個相鄰元素之間的距離
    const space =
      items[1].getBoundingClientRect().top -
      items[0].getBoundingClientRect().bottom;

    // 設置拖曳元素的樣式
    dragItem.style.position = 'fixed';
    dragItem.style.zIndex = 5000;
    dragItem.style.width = dragBoundingRect.width + 'px';
    dragItem.style.height = dragBoundingRect.height + 'px';
    dragItem.style.top = dragBoundingRect.top + 'px';
    dragItem.style.left = dragBoundingRect.left + 'px';
    dragItem.style.cursor = 'grabbing';

    // 創建一個空的 div 元素，並設置其樣式為和拖曳元素相同
    const div = document.createElement('div');
    div.id = 'div-temp';
    div.style.width = dragBoundingRect.width + 'px';
    div.style.height = dragBoundingRect.height + 'px';
    div.style.pointerEvents = 'none';
    container.appendChild(div);

    // 計算拖曳元素和其下方元素之間的距離
    const distance = dragBoundingRect.height + space;

    // 將拖曳元素下方的元素往下平移，創造出被拖曳元素推開的效果
    itemsBelowDragItem.forEach((item) => {
      item.style.transform = `translateY(${distance}px)`;
    });
    // get the original coordinates of the mouse pointer
    let x = e.clientX;
    let y = e.clientY;

    // 設置 document 的 onpointermove 事件處理函數
    document.onpointermove = dragMove;

    function dragMove(e) {
      //滑鼠點擊時記錄了起始點座標，然後當滑鼠移動時，計算當前滑鼠指針的座標與起始點座標之間的距離，用來決定被拖曳的元素應該移動的距離
      // 計算滑鼠指針移動的距離
      const posX = e.clientX - x;
      const posY = e.clientY - y;

      // 移動被拖曳的元素到新的位置
      dragItem.style.transform = `translate(${posX}px, ${posY}px)`;

      // 對每個不參與拖曳的元素進行處理
      notDragItems.forEach((item) => {
        // 檢查被拖曳元素和其他元素是否重疊
        const rect1 = dragItem.getBoundingClientRect();
        const rect2 = item.getBoundingClientRect();

        let isOverlapping =
          rect1.y < rect2.y + rect2.height / 2 &&
          rect1.y + rect1.height / 2 > rect2.y;

        if (isOverlapping) {
          // 如果重疊，則交換它們的位置和資料
          if (item.getAttribute('style')) {
            // 如果該元素已經被移動，則將其往下移動一個間距
            item.style.transform = '';
            index++;
          } else {
            // 否則將其往上移動一個間距
            item.style.transform = `translateY(${distance}px)`;
            index--;
          }

          // 交換資料
          newData = data.filter((item) => item.id !== dragData.id);
          newData.splice(index, 0, dragData);
        }
      });
    }

    document.onpointerup = dragEnd;
    function dragEnd() {
      // 取消事件處理函數
      document.onpointerup = '';
      document.onpointermove = '';
      // 恢復被拖曳元素的樣式
      dragItem.style = '';
      container.removeChild(div);
      // 刪除創建的空的 div 元素
      items.forEach((item) => (item.style = ''));
      // 更新狀態變量，以便組件重新渲染
      setIsDragging(undefined);
      setData(newData);
      // 將新的順序儲存到localStorage
      localStorage.setItem('item_order', JSON.stringify(newData));
    }
  }
  return {
    isDragging,
    setIsDragging,
    containerRef,
    dragStart,
  };
}
