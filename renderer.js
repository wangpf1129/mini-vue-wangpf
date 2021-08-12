const h = (tag, props, children) => {

  return {
    tag,
    props,
    children
  }
}


const mount = (vnode, container) => {
  // 1. 创建 html 元素
  const el = vnode.el = document.createElement(vnode.tag)

  // 2. 处理 props属性
  if (vnode.props) {
    for (const key in vnode.props) {
      if (!vnode.props.hasOwnProperty(key)) {return}
      const value = vnode.props[key]

      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3. 处理子节点
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(item => {
        mount(item, el)
      })
    }
  }

  // 4. 挂载
  container.appendChild(el)
}


const patch = (n1, n2) => {
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {
    // 1.取出 element对象，并且在 n2中进行保存
    const el = n2.el = n1.el

    // 2. 处理 props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    // 2.1 获取所有的 newProps 添加到 el
    for (const key in newProps) {
      if (!newProps.hasOwnProperty(key)) {return}
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (oldValue !== newValue) {
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }

    // 2.2 删除旧的props
    for (const key in oldProps) {
      if (!newProps.hasOwnProperty(key)) {return}
      if (key.startsWith('on')) {
        const value = oldProps[key]
        el.removeEventListener(key.slice(2).toLowerCase(), value)
      }
      if (!(key in newProps)) {
        el.removeAttribute(key)
      }
    }

    // 3. 处理 children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []
    if (typeof newChildren === 'string') { // 情况一
      if (typeof oldChildren === 'string') {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        }
      } else {
        el.innerHTML = newChildren
      }
    } else {  // 情况二：newChildren是个数组
      if (typeof oldChildren === 'string') {
        el.innerHTML = ''
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // 如果都是数组
        // oldChildren : [v1,v2,v3]
        // newChildren : [v1,v5,v7,v8,v9]
        const commonLength = Math.min(newChildren.length, oldChildren.length)
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        if (oldChildren.length > newChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }
  }
}

