const createApp = (rootComponent) => {
  return {
    mount(selector) {
      let isMounted = false
      let preVnode = null

      watchEffect(() => {
        // 首次需要挂载， 后边就 patch
        if (!isMounted) {
          preVnode = rootComponent.render()
          mount(preVnode, document.querySelector(selector))
          isMounted = true
        } else {
          const newVnode = rootComponent.render()
          patch(preVnode, newVnode)
          preVnode = newVnode
        }
      })
    }
  }
}
