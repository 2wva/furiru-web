/* eslint-env es6 */

const stage = document.getElementById("stage");

const frillImages = {
  base: "img/herumetto.png",
  f1: "img/herumetoF1.png",
  f2: "img/herumettoF2.png",
};

let layers = {
  base: null,
  f1: null,
  f2: null
};

// 現在のスライダー値を保存（初期1）
let currentOpacity = 1;

// ----------------------
// レイヤー追加
// ----------------------
function addLayer(key, src) {
  if (layers[key]) return; 
  const img = document.createElement("img");
  img.src = src;
  img.className = "layer";

  // base 以外はスライダー値を反映
  img.style.opacity = (key === "base") ? 1 : currentOpacity;

  stage.appendChild(img);
  layers[key] = img;
}

// ----------------------
// レイヤー削除
// ----------------------
function removeLayer(key) {
  if (!layers[key]) return;
  const img = layers[key];
  img.style.opacity = 0;
  setTimeout(() => img.remove(), 300);
  layers[key] = null;
}

// ----------------------
// フリル切り替え
// ----------------------
function setFrill(level) {
  switch(level) {
    case 0:
      removeLayer("f1");
      removeLayer("f2");
      if (!layers.base) addLayer("base", frillImages.base);
      break;

    case 1:
      removeLayer("f2");
      addLayer("f1", frillImages.f1);
      break;

    case 2:
      if (!layers.f1) addLayer("f1", frillImages.f1);
      addLayer("f2", frillImages.f2);
      break;
  }
}

// ----------------------
// スライダーで透け感調整
// ----------------------
const opacitySlider = document.getElementById("opacitySlider");
opacitySlider.addEventListener("input", () => {
  currentOpacity = parseFloat(opacitySlider.value);

  Object.entries(layers).forEach(([key, layer]) => {
    if (layer && key !== "base") {
      layer.style.opacity = currentOpacity;
    }
  });
});

// ----------------------
// 初期表示
// ----------------------
addLayer("base", frillImages.base);

// ----------------------
// ボタン
// ----------------------
document.getElementById("btnNone").addEventListener("click", () => setFrill(0));
document.getElementById("btnF1").addEventListener("click", () => setFrill(1));
document.getElementById("btnF2").addEventListener("click", () => setFrill(2));

