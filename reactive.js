// 响应式系统模块
class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null
const watchEffect = (effect) => {
  activeEffect = effect
  effect()  //  vue3 中 watchEffect 就会默认执行一次
  activeEffect = null
}
const targetMap = new WeakMap()
const getDep = (target, key) => {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}
// vue2 数据劫持原理
// const reactive = (raw) => {
//   Object.keys(raw).forEach(key => {
//     const dep = getDep(raw, key)
//     let value = raw[key];
//
//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend()
//         return value
//       },
//       set(newValue) {
//         if (value !== newValue) {
//           value = newValue
//           dep.notify()
//         }
//       }
//     })
//   })
//   return raw
// }

// vue3 proxy 数据劫持
const reactive = (raw) => {
  return new Proxy(raw, {
    get(target, p, receiver) {
      const dep = getDep(target, p)
      dep.depend()
      return target[p]
    },
    set(target, p, newValue, receiver) {
      const dep = getDep(target, p)
      target[p] = newValue
      dep.notify()
    }
  })
}
const info = reactive({ counter: 100 })

watchEffect(() => {
  console.log(info.counter * 2)
})
watchEffect(() => {
  console.log(info.counter * info.counter)
})

info.counter++
info.counter--

