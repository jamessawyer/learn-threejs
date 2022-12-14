import './style.css'

// 📺 https://www.bilibili.com/video/BV1YF411K7pJ
// 📝 https://codepen.io/JamesSawyer/pen/YzvoKBp
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GUI } from 'dat.gui'

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight

// 渲染器，相机，场景
let renderer, camera, scene      // 3要素 - 渲染器，相机，场景
let axesHelper, spotLightHelper  // 辅助工具
let ambientLight, spotLight      // 灯光
let plane, cylinder              // 场景中的物体
let controls                     // 控制器
let gui                          // GUI控制器

initRenderer()
initCamera()
initScene()
initAxesHelper()
initControls()

initAmbientLight()
initSpotLight()
initSpotLightHelper()

initMeshes()

initShadow()

buildGUI()

render()

// 根据 `resize` 调整相机视角和renderer尺寸
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight
  // https://threejs.org/docs/#api/en/cameras/PerspectiveCamera.updateProjectionMatrix
  // 上面调整相机视角之后，更新投影矩阵
  // Updates the camera projection matrix. Must be called after any change of parameters.
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

/* 1️⃣ 渲染器 */
function initRenderer() {
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio) // 🚀更具屏幕dpr设置像素，使画面更加细腻
  renderer.setSize(WIDTH, HEIGHT)
  // renderer.domElement 就是一个 canvas，将其添加到DOM中
  document.querySelector('#app').appendChild(renderer.domElement)
}

/* 2️⃣ 相机 */
function initCamera() {
  /**
   * 使用透视相机
   * PerspectiveCamera(fov, aspect, near, far)
   * - fov (number)：相机的视场角度。
   * - aspect (number)：相机视场的宽高比。
   * - near (number)：相机视锥体近平面的距离。
   * - far (number)：相机视锥体远平面的距离。
  */ 
  camera = new THREE.PerspectiveCamera(40, WIDTH/HEIGHT, 1, 1000)
  camera.position.set(0, 120, 200) // 放置位置
  camera.lookAt(0, 0, 0) // 观察方向
}

/* 3️⃣ 场景 */
function initScene() {
  scene = new THREE.Scene()
}

/* 4️⃣ 坐标轴，用于辅助，RGB分别表示XYZ轴💡 */
function initAxesHelper() {
  axesHelper = new THREE.AxesHelper(50)
  scene.add(axesHelper)
}

/* 5️⃣ 添加背景光 */
function initAmbientLight() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.2) // 0.2 表示光的强度
  scene.add(ambientLight)
}
/*  添加聚光灯光 */
function initSpotLight() {
  spotLight = new THREE.SpotLight(0xffffff, 1.0)
  spotLight.position.set(-50, 60, 0) // 聚光灯放置位置 这里控制聚光灯摆放位置
  spotLight.angle = Math.PI / 6      // 聚光灯的角度
  // penumbra 的含义 `半影, 明暗交界部分, 边缘部分, 周围的气氛`
  spotLight.penumbra = 0.2
  scene.add(spotLight)
}
function initSpotLightHelper() {
  spotLightHelper = new THREE.SpotLightHelper(spotLight)
  scene.add(spotLightHelper)
}

/* 6️⃣ 添加物体到场景中 */
function initMeshes() {
  // 1.添加一个平面
  const geometryPlane = new THREE.PlaneGeometry(2000, 2000)
  const materialPlane = new THREE.MeshPhongMaterial({ color: 0x808080 })
  plane = new THREE.Mesh(geometryPlane, materialPlane)
  plane.rotation.x = -Math.PI / 2 // 沿着X轴反转90度，注意是负的，因为平面只有一个面能显示
  plane.position.set(0, -10, 0)
  scene.add(plane)

  // 2.添加一个圆柱体
  // CylinderGeometry中的24表示多少个面组成一个圆柱体
  const geometryCylinder = new THREE.CylinderGeometry(5, 5, 2, 24, 1, false)
  const materialCylinder = new THREE.MeshPhongMaterial({ color: 0x808080 })
  cylinder = new THREE.Mesh(geometryCylinder, materialCylinder)
  cylinder.position.set(0, 10, 0)
  scene.add(cylinder)
}

/* 7️⃣ 添加控制器 */
function initControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change', render) // 监听一下 `change` 事件
}

/* 8️⃣ 添加投影 */
function initShadow() {
  // 因为投影是需要大量计算的，因此下面选项默认都是关闭的
  cylinder.castShadow = true // 物体本身能够投影
  plane.receiveShadow = true // 接收投影的物体
  spotLight.castShadow = true // 聚光灯也能产生投影
  renderer.shadowMap.enabled = true // 渲染器也能支持投影
}

function buildGUI() {
  gui = new GUI()

  // 菜单1
  const spotLightFolder = gui.addFolder('Spot Light')
  // 调试spotLight颜色
  spotLightFolder.addColor(spotLight, 'color').onChange(function(val) {
    spotLight.color.set(val)
    render() // 设置颜色后，重新渲染一下
  })
  // 设置角度，0-Math.PI / 2 表示取值范围
  spotLightFolder.add(spotLight, 'angle', 0, Math.PI / 2).onChange(function(val) {
    // 上面的 `color` 是一个矢量，需要用 `set()` 方法，这里的 `angle` 是一个标量，直接赋值就可以了
    spotLight.angle = val
    render()                 // 设置颜色后，重新渲染一下
    spotLightHelper.update() // 辅助线条调用
  })
  // 设置 `penumbra`
  spotLightFolder.add(spotLight, 'penumbra', 0, 1).onChange(function(val) {
    spotLight.penumbra = val
    render()
  })
  spotLightFolder.close() // 可选设置，将文件夹设置为关闭状态

  // 菜单2
  const cameraFolder = gui.addFolder('Camera')
  // step() 表示调整的精度
  cameraFolder.add(camera.position, 'x', -1000, 1000).step(1).onChange(function(val) {
    camera.position.x = val
    render()
  })

  gui.close() // 将整个GUI默认设置为闭合状态
}

function render() {
  renderer.render(scene, camera)
}
