console.log("yo");

var app = new Vue({
  el: '#app',
  data: {
    widgets: [],
    number : 0
  },
  methods: {
    add_dg: function () {
      this.widgets.push({ title: 'Widget ' + this.number.toString() });
      this.number += 1;
    }
  }
})
