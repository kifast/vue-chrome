// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

Vue.config.productionTip = false

var jimei = {
  count: 0,
  insertAfter(newElement, targetElement) {
    var parent = targetElement.parentNode
    if (parent.lastChild == targetElement) {
      parent.appendChild(newElement)
    } else {
      parent.insertBefore(newElement, targetElement.nextSibling)
    }
  },
  init() {
    let div = document.getElementsByClassName('data-board')[0]
    let newDiv = document.createElement('div')
    newDiv.setAttribute('id', 'app')
    if (div) {
      this.insertAfter(newDiv, div)
      /* eslint-disable no-new */
      new Vue({
        el: '#app',
        components: { App },
        template: '<App/>'
      })
    } else {
      this.count++
      // 1秒再执行
      setTimeout(() => {
        if (count < 11) {
          this.init()
        }
      }, 1000)
    }
  }
}
jimei.init()
